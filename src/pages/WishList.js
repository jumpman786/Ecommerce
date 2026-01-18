import React, { useEffect, useState } from 'react';
import BottomNavigation from '../components/BottomNavigation';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Button from '../components/Button';
import AntDesign from '@expo/vector-icons/AntDesign';
import ProductList from '../components/ProductList';
import Octicons from '@expo/vector-icons/Octicons';
import { posthog } from '../lib/posthog';

const WishList = () => {
  // Wishlist data (replace with actual wishlist state management)
  const [itemCount] = useState(3);

  // Track wishlist page view when component mounts
  useEffect(() => {
    posthog.capture('wishlist_page_viewed', {
      page_name: 'WishList',
      item_count: itemCount,
      timestamp: new Date().toISOString(),
    });
  }, [itemCount]);

  const handleSwap = () => {
    posthog.capture('wishlist_swap_clicked', {
      item_count: itemCount,
      timestamp: new Date().toISOString(),
    });
    // TODO: Implement swap functionality
    console.log('Wishlist swap clicked');
  };

  const handleShare = () => {
    posthog.capture('wishlist_share_clicked', {
      item_count: itemCount,
      timestamp: new Date().toISOString(),
    });
    // TODO: Implement share functionality
    console.log('Wishlist share clicked');
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Header label="WISHLIST" />
        <View style={styles.wishListInfoContainer}>
          <Text
            style={{
              fontSize: 14,
              letterSpacing: 1,
              padding: 10,
            }}
          >
            {itemCount} ITEMS
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <Button
              style="clear"
              icon={<AntDesign name="swap" size={20} color="#666666" />}
              onPressIn={handleSwap}
            />
            <Button
              style="clear"
              icon={<Octicons name="link-external" size={20} color="#666666" />}
              onPressIn={handleShare}
            />
          </View>
        </View>
        <View style={{ height: '100%' }}>
          <ProductList blockId="wishlist_items" />
        </View>
        <BottomNavigation cartCount={2} wishListCount={2} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  baseText: {
    fontWeight: 'bold',
  },
  innerText: {
    color: 'red',
  },
  wishListInfoContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 70,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
});

export default WishList;