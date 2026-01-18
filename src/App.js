// App.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import Navigator from './navigation';
import RegisterProvider from './register/core/RegisterProvider';
import useRegister from "./register/hooks/useRegister";
import { MainBanner as bannerSchema } from './schemas/MainBanner'
import { schema as headerShcema } from './schemas/Header';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity, StyleSheet, View } from 'react-native'
import { StatusBar } from 'react-native';

// Analytics
import { posthog, initPostHog } from './lib/posthog';

// AI Agent imports
import AgentPanel from './components/AgentPanel';
import { useAgentCustomization } from './agent/hooks/useAgentCustomization';
import { UITreeProvider, useUITree } from './agent/UITreeContext';
import Icon from './components/Icon';

// Screenshot capture using html2canvas with dynamic import (Metro-safe)
const captureScreenshotWeb = async () => {
  if (typeof document === 'undefined') {
    console.warn('📸 No document available');
    return '';
  }
  
  try {
    console.log('📸 Capturing screenshot with html2canvas...');
    
    // Dynamic import to avoid Metro bundling issues
    const html2canvas = (await import('html2canvas')).default;
    
    // Get root element
    const root = document.getElementById('root');
    if (!root) {
      console.error('❌ Root element not found');
      return '';
    }
    
    // Capture with html2canvas - full viewport
    const startTime = Date.now();
    const canvas = await html2canvas(root, {
      backgroundColor: '#ffffff',
      scale: 1,
      useCORS: true,
      allowTaint: true,
      logging: false,
      // Capture full viewport, not cropped
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
    });
    
    const duration = Date.now() - startTime;
    console.log(`✅ Screenshot captured in ${duration}ms: ${canvas.width}x${canvas.height}`);
    
    // Convert to base64
    const dataUrl = canvas.toDataURL('image/png');
    console.log(`📸 Base64 size: ${Math.round(dataUrl.length / 1024)}KB`);
    
    return dataUrl;
  } catch (err) {
    console.error('📸 Screenshot failed:', err);
    return '';
  }
};

// Backend API endpoint
const API_ENDPOINT = __DEV__
  ? 'http://localhost:8000'
  : 'https://your-production-api.com';

require('./assets/images/main-banner.jpg');
require('./assets/images/christmas2.jpg');
import { PreLoader as PreLoaderComponent } from './components';
import {
  Cart,
  Home,
  Shop,
  WishList
} from './pages';

const pages = {
  Cart,
  Home,
  Shop,
  WishList
};

async function fetch() {
  return Promise.resolve([
    {
      name: 'Headerv2',
      schema: headerShcema,
      type: 'component', 
      properties: {}
    }
  ]);
}

async function loadRemoteComponents(register) {
  const data = await fetch();
  data.forEach(({ name, schema, type, properties }) => {
    register.registerRemoteComponent({
      name,
      schema,
      type,
      properties
    });
  });
}

async function init(register) {
  Object.entries(pages).forEach(([name, Component]) => {
    register.registerComponent({
      name,
      type: 'page',
      component: Component,
      properties: {}
    });
  });
  await loadRemoteComponents(register);
}

// Generate a unique session ID (stable across re-renders, reset on refresh)
const generateSessionId = () => `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

function AppInner() {
  const register = useRegister();
  const { tree: currentUITree, applyPatch } = useUITree();
  const [initialized, setInitialized] = useState(false);
  const [agentPanelVisible, setAgentPanelVisible] = useState(false);
  const appContainerRef = useRef(null);
  
  // Stable session ID - generated once on mount, persists until page refresh
  const [sessionId] = useState(generateSessionId);

  // Screenshot capture function using native Canvas API
  const captureScreenshot = useCallback(async () => {
    if (Platform.OS === 'web') {
      return captureScreenshotWeb();
    }
    console.warn('📸 Screenshot not available on native');
    return '';
  }, []);

  // AI Agent customization hook
  const {
    todos,
    isCustomizing,
    error,
    statusMessage,
    customize,
    cancel,
  } = useAgentCustomization({
    apiEndpoint: API_ENDPOINT,
    sessionId,  // Persist conversation across requests until page refresh
    onPatch: (patch) => {
      if (patch) {
        applyPatch(patch);
      }
    },
    onThemeChange: (newTheme) => {
      console.log('Theme changed:', newTheme);
      posthog.capture('theme_changed', { theme_name: newTheme?.name });
    },
    onError: (err) => {
      console.error('Agent error:', err);
      posthog.capture('agent_error', { error: err });
    },
    onComplete: () => {
      posthog.capture('agent_customization_complete');
    },
    onScreenshotRequest: captureScreenshot,
  });

  const handleCustomize = useCallback((prompt) => {
    console.log(`🌳 Customizing with ${Object.keys(currentUITree.elements).length} elements (session: ${sessionId})`);
    customize(prompt, currentUITree);
    posthog.capture('agent_customization_started', { prompt, session_id: sessionId });
  }, [customize, currentUITree, sessionId]);

  useEffect(() => {
    (async () => {
      await initPostHog();
      await init(register);
      setInitialized(true);
      posthog.capture('app_opened');
    })();
  }, [register]);


  if (!initialized) {
    return <></>;
  }

  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="white"
      />
      <PreLoaderComponent />
      <Navigator
        pages={register.getComponentsByType('page')}
        initialRouteName={'Home'}
      />

      {/* AI Agent Floating Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setAgentPanelVisible(true)}
        activeOpacity={0.8}
      >
        <Icon name="star" size={24} color="#fff" />
      </TouchableOpacity>

      {/* AI Agent Panel */}
      <AgentPanel
        visible={agentPanelVisible}
        onClose={() => setAgentPanelVisible(false)}
        onCustomize={handleCustomize}
        todos={todos}
        isLoading={isCustomizing}
        statusMessage={statusMessage}
        error={error}
      />
    </>
  );
}

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

export function App() {
  return (
    <SafeAreaProvider>
      <UITreeProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <RegisterProvider>
            <AppInner />
          </RegisterProvider>
        </SafeAreaView>
      </UITreeProvider>
    </SafeAreaProvider>
  );
}
