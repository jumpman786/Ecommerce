// App.js
import React, { useEffect, useState, useCallback } from 'react';
import Navigator from './navigation';
import RegisterProvider from './register/core/RegisterProvider';
import useRegister from "./register/hooks/useRegister";
import { MainBanner as bannerSchema } from './schemas/MainBanner'
import { schema as headerShcema } from './schemas/Header';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity, StyleSheet } from 'react-native'
import { StatusBar } from 'react-native';

// Analytics
import { posthog, initPostHog } from './lib/posthog';

// AI Agent imports
import AgentPanel from './components/AgentPanel';
import { useAgentCustomization } from './agent/hooks/useAgentCustomization';
import { UITreeProvider, useUITree } from './agent/UITreeContext';
import Icon from './components/Icon';

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

function AppInner() {
  const register = useRegister();
  const { tree: currentUITree, applyPatch } = useUITree();
  const [initialized, setInitialized] = useState(false);
  const [agentPanelVisible, setAgentPanelVisible] = useState(false);

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
    onPatch: (patch) => {
      console.log('📨 RECEIVED PATCH FROM AGENT:', JSON.stringify(patch, null, 2));
      if (patch) {
        console.log('📦 Calling applyPatch...');
        applyPatch(patch);
        console.log('✅ applyPatch called');
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
  });

  const handleCustomize = useCallback((prompt) => {
    console.log('Sending UI tree with', Object.keys(currentUITree.elements).length, 'elements');
    customize(prompt, currentUITree);
    posthog.capture('agent_customization_started', { prompt });
  }, [customize, currentUITree]);

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
