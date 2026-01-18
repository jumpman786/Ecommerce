// App.js
import React, { useEffect, useState } from 'react';
import Navigator from './navigation';
import RegisterProvider from './register/core/RegisterProvider';
import useRegister from "./register/hooks/useRegister";
import Renderer from "./register/core/Renderer";
import { MainBanner as bannerSchema } from './schemas/MainBanner'
import {Banner} from './schemas/Banner'
import { schema as headerShcema } from './schemas/Header';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text, ImageBackground } from 'react-native'
import c from './register/core/constants'
import { StatusBar } from 'react-native';

// 🎯 ADD THESE IMPORTS
import { posthog, initPostHog } from './lib/posthog';

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
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    (async () => {
      // 🎯 INITIALIZE POSTHOG FIRST
      await initPostHog();
      
      await init(register);
      setInitialized(true);
      
      // 🎯 TRACK APP OPENED
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
    </>
  );
}

export function App() {
  return (
    <SafeAreaProvider>
      <SafeAreaView style={{
        flex: 1,
        backgroundColor: 'white'
      }}>
        <RegisterProvider>
          <AppInner />
        </RegisterProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}