import React, { useEffect, useState } from 'react';
import BottomNavigation from '../components/BottomNavigation';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import Header from '../components/Header';
import Button from '../components/Button';
import AntDesign from '@expo/vector-icons/AntDesign';
import ProductList from '../components/ProductList';
import Octicons from '@expo/vector-icons/Octicons';
import { trackCheckoutStarted } from '../lib/analytics';
import { posthog } from '../lib/posthog';

const Cart = () => {
  // Cart data (replace with actual cart state management)
  const [itemCount] = useState(3);
  const [cartTotal] = useState(1010.5);
  const [originalTotal] = useState(1200);

  // Track cart page view when component mounts
  useEffect(() => {
    posthog.capture('cart_page_viewed', {
      page_name: 'Cart',
      item_count: itemCount,
      cart_total: cartTotal,
      discount_amount: originalTotal - cartTotal,
      timestamp: new Date().toISOString(),
    });
  }, []);

  const handleCheckout = () => {
    // Track checkout started event
    trackCheckoutStarted(cartTotal, itemCount);

    // TODO: Navigate to checkout page
    console.log('Navigating to checkout...');
    // navigation.navigate('Checkout');
  };

  const handleSwap = () => {
    posthog.capture('cart_swap_clicked', {
      item_count: itemCount,
      timestamp: new Date().toISOString(),
    });
    // TODO: Implement swap functionality
  };

  const handleShare = () => {
    posthog.capture('cart_share_clicked', {
      item_count: itemCount,
      cart_total: cartTotal,
      timestamp: new Date().toISOString(),
    });
    // TODO: Implement share functionality
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <Header label="SHOPPING BAG" />
        <View style={styles.CartInfoContainer}>
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
          <ProductList blockId="cart_items" />
        </View>
        <View style={styles.checkoutContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text>
              <Text style={styles.totalText}>TOTAL </Text>
              <Text>(enc. tax)</Text>
            </Text>
            <View style={{ flexDirection: 'row' }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: 'red',
                  letterSpacing: 3,
                }}
              >
                {' '}
                C$ {cartTotal.toFixed(2)}{' '}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: 'grey',
                  letterSpacing: 3,
                  textDecorationLine: 'line-through',
                }}
              >
                C$ {originalTotal.toFixed(2)}
              </Text>
            </View>
          </View>
          <Button
            iconAlign="left"
            style="solid"
            fullWidth
            height={50}
            iconName="arrow-forward"
            title="CHECKOUT"
            contentStyle={{
              fontWeight: 'bold',
              letterSpacing: 2,
            }}
            onPressIn={handleCheckout}
          />
        </View>
        <BottomNavigation cartCount={2} />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  checkoutContainer: {
    position: 'absolute',
    width: '100%',
    bottom: 80,
    backgroundColor: '#fff',
    rowGap: 20,
    padding: 16,
    flexDirection: 'column',
  },
  totalText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 2,
  },
  baseText: {
    fontWeight: 'bold',
  },
  innerText: {
    color: 'red',
  },
  CartInfoContainer: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 70,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
  },
});

export default Cart;