// pages/Home.js
import React, { useEffect, useMemo } from 'react'; // 🎯 ADD useEffect
import Button from '../components/Button';
import BottomNavigation from '../components/BottomNavigation'
import { View, Text, StyleSheet } from 'react-native';
import { Header, Lottie } from '../components'
import { Dimensions } from 'react-native';
import { ScrollView } from 'react-native';
import ProductSlider from '../components/ProductSlider';
import Slider from '../components/ProductCaraousal'
import Renderer from '../register/core/Renderer';

// 🎯 ADD THESE IMPORTS
import { posthog } from '../lib/posthog';

const { width } = Dimensions.get('window');

import useRegister from '../register/hooks/useRegister';

const HomeScreen = () => {
  const register = useRegister(); 
  const MainBanner = useMemo(() => (register.getComponent('MainBanner')));
  const Header = useMemo(() => (register.getComponent('Header')));

  // 🎯 ADD THIS - Track home page view
  useEffect(() => {
    posthog.capture('home_page_viewed', {
      section: 'home',
      has_banner: !!MainBanner,
    });
  }, []);

  // 🎯 ADD THIS - Track CTA clicks
  const handleShopNewInClick = (section) => {
    posthog.capture('cta_click', {
      cta_text: 'SHOP NEW IN',
      section: section,
      page: 'home',
    });
    
    // Add your navigation logic here if needed
    // navigation.navigate('Shop', { category: 'new-arrivals' });
  };

  return (
    <>
      <Header label='HELLO' />
      <ScrollView style={{ backgroundColor: 'white' }}>
        <MainBanner/>      
        <View style={{ marginTop: -50 }}>
          <ProductSlider />
        </View>
        <View style={{
          paddingHorizontal: 15,
          paddingTop: 25,
        }}>
          <Text style={{
            fontSize: 16,
            paddingVertical: 10,
            fontWeight: 'bold',
            color: 'black',
            letterSpacing: 1.5,
          }}>
            NEW ARRIVALS
          </Text>
          <Button
            iconAlign="left"
            style="outline"
            iconName="arrow-forward"
            title='SHOP NEW IN'
            contentStyle={{
              fontWeight: 'bold',
              color: 'black',
              letterSpacing: 1.5,
            }}
            // 🎯 ADD THIS
            onPress={() => handleShopNewInClick('new_arrivals')}
          />   
          <Slider/>
        </View>

        <View style={{
          paddingHorizontal: 15,
          paddingTop: 25,
          marginBottom: 100,
        }}>
          <Text style={{
            fontSize: 16,
            paddingTop: 10,
            fontWeight: 'bold',
            color: 'black',
            letterSpacing: 1.5,
          }}>
            SHOP SUGGESTED LOOKS
          </Text>
          <Text style={{
            fontSize: 12,
            paddingVertical: 10,
            color: '#808080',
            letterSpacing: 1.5,
          }}>
            Select your favorite for more details
          </Text>
          <Button
            iconAlign="left"
            style="outline"
            iconName="arrow-forward"
            title='SHOP NEW IN'
            contentStyle={{
              fontWeight: 'bold',
              color: 'black',
              letterSpacing: 1.5,
            }}
            // 🎯 ADD THIS
            onPress={() => handleShopNewInClick('suggested_looks')}
          />   
          <Slider/>
        </View>
      </ScrollView>
      <BottomNavigation/>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  baseText: {
    fontWeight: 'bold',
  },
  innerText: {
    color: 'red',
  },
});

export default HomeScreen;

const bgStyles = StyleSheet.create({
  backgroundImage: {
    width: width,
    height: 300,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 40,
  },
  buttonContainer: {
    alignSelf: 'flex-start',
    paddingBottom: 20,
  },
});