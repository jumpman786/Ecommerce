import React, { useEffect } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import Product from './Product';
import { trackProductImpression, trackRemoveFromCart } from '../lib/analytics';
import { posthog } from '../lib/posthog';

const PRODUCTS = [
  {
    id: '1',
    name: 'High Quality Cotton New Arrivals',
    price: 'C$99',
    priceValue: 99,
    imageUrl: require('../assets/images/4.png'),
    bannerTitle: '60% DISCOUNT',
    bannerType: 'discount',
    description1: 'HIGH QUALITY COTTON',
    description2: 'NEW ARRIVALS',
    width: 350,
    height: 150,
    quantity: 1, // Cart quantity
  },
  {
    id: '2',
    name: 'Premium Leather Limited Edition',
    price: 'C$79',
    priceValue: 79,
    imageUrl: require('../assets/images/5.png'),
    bannerTitle: 'NEW DROP',
    bannerType: 'info',
    description1: 'PREMIUM LEATHER',
    description2: 'LIMITED EDITION',
    width: 350,
    height: 150,
    quantity: 2, // Cart quantity
  },
  {
    id: '3',
    name: 'Soft Comfy Trending Style',
    price: 'C$49',
    priceValue: 49,
    imageUrl: require('../assets/images/6.png'),
    bannerTitle: 'BEST VALUE',
    bannerType: 'highlight',
    description1: 'SOFT & COMFY',
    description2: 'TRENDING STYLE',
    width: 350,
    height: 150,
    quantity: 1, // Cart quantity
  },
];

const ProductList = ({ blockId = 'cart_items' }) => {
  // Track cart items impressions when component mounts
  useEffect(() => {
    if (PRODUCTS && PRODUCTS.length > 0) {
      PRODUCTS.forEach((product, index) => {
        trackProductImpression(
          {
            id: product.id,
            name: product.name,
            price: product.priceValue,
          },
          index + 1,
          blockId
        );
      });

      // Track overall cart composition
      posthog.capture('cart_items_viewed', {
        item_count: PRODUCTS.length,
        total_quantity: PRODUCTS.reduce((sum, p) => sum + (p.quantity || 1), 0),
        cart_value: PRODUCTS.reduce((sum, p) => sum + p.priceValue * (p.quantity || 1), 0),
        product_ids: PRODUCTS.map(p => p.id),
        timestamp: new Date().toISOString(),
      });
    }
  }, [blockId]);

  const handleProductPress = (item, index) => {
    console.log('Cart product pressed:', item);
    // TODO: Navigate to product detail page from cart
    // navigation.navigate('ProductDetail', { productId: item.id });
  };

  const handleRemoveFromCart = (item) => {
    trackRemoveFromCart({
      id: item.id,
      name: item.name,
      price: item.priceValue,
    });

    // TODO: Implement actual remove logic
    console.log('Remove from cart:', item.id);
  };

  const handleQuantityChange = (item, newQuantity, oldQuantity) => {
    posthog.capture('cart_quantity_changed', {
      product_id: item.id,
      product_name: item.name,
      old_quantity: oldQuantity,
      new_quantity: newQuantity,
      quantity_change: newQuantity - oldQuantity,
      item_price: item.priceValue,
      timestamp: new Date().toISOString(),
    });

    // TODO: Update cart state
    console.log(`Quantity changed: ${oldQuantity} -> ${newQuantity}`);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <Product
            type="row"
            // Existing props
            price={item.price}
            imageUrl={item.imageUrl}
            bannerTitle={item.bannerTitle}
            bannerType={item.bannerType}
            description1={item.description1}
            description2={item.description2}
            width={item.width}
            height={item.height}
            cart
            // Tracking props
            id={item.id}
            name={item.name}
            priceValue={item.priceValue}
            rank={index + 1}
            blockId={blockId}
            onPress={() => handleProductPress(item, index)}
            // Cart-specific props
            quantity={item.quantity}
            onRemove={() => handleRemoveFromCart(item)}
            onQuantityChange={(newQty, oldQty) =>
              handleQuantityChange(item, newQty, oldQty)
            }
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 1000,
    paddingVertical: 10,
  },
  separator: {
    height: 2,
  },
});

export default ProductList;