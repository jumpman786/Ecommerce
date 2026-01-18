// navigation/index.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { posthog } from '../lib/posthog'; // 🎯 ADD THIS

const Stack = createNativeStackNavigator();

/**
 * Dynamically create navigator for screens. 
 */
export default function Navigator({pages, initialRouteName}) {
  return (
    <NavigationContainer
      // 🎯 ADD THIS - Track screen changes
      onStateChange={(state) => {
        if (!state) return;
        
        const currentRoute = state.routes[state.index];
        if (currentRoute) {
          posthog.screen(currentRoute.name, {
            params: currentRoute.params,
          });
        }
      }}
    >
      <Stack.Navigator 
        initialRouteName={initialRouteName}
        screenOptions={{
          headerShown: false
        }}
      >
        {pages && pages.map((page) => {
          if (!page.component) {
            console.warn(`⚠️ Page "${page.name}" has no valid component`);
          }
          return (
            <Stack.Screen 
              key={page.name} 
              name={page.name}
              component={page.component}
              options={page.options ?? {}}
            />
          );
        })}
      </Stack.Navigator>
    </NavigationContainer>
  );
}