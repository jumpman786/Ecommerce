import React, { useEffect } from 'react';
import Button from '../components/Button';
import BottomNavigation from '../components/BottomNavigation';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Header from '../components/Header';
import ProductList from '../components/ProductsList';
import { posthog } from '../lib/posthog';

const { width } = Dimensions.get('window');

const Shop = () => {
  // Track page view when component mounts
  useEffect(() => {
    posthog.capture('shop_page_viewed', {
      page_name: 'Shop',
      timestamp: new Date().toISOString(),
    });
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Header label='SHOP' />
        <ScrollView>
          {/* Constrain FlashList height so it scrolls within ScrollView */}
          <View style={{ marginTop: 50, height: 1000 }}>
            {/* You can fine-tune this height */}
            <ProductList blockId="shop_grid" />
          </View>
        </ScrollView>
        <BottomNavigation cartCount={2} wishListCount={2} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  baseText: {
    fontWeight: 'bold',
  },
  innerText: {
    color: 'red',
  },
});

export default Shop;

const bgStyles = StyleSheet.create({
  backgroundImage: {
    width: width,
    height: 250, // Adjust as needed
    justifyContent: 'flex-end',
    padding: 20,
  },
  buttonContainer: {
    alignSelf: 'flex-start',
  },
});