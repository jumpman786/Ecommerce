import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import Product from './Product';
import { trackProductImpression } from '../lib/analytics';
import shoes1 from '../assets/images/1.png';
import shoes2 from '../assets/images/2.png';
import shoes3 from '../assets/images/3.png';
import shoes4 from '../assets/images/4.png';
import shoes5 from '../assets/images/5.png';
import shoes6 from '../assets/images/6.png';
import shoes7 from '../assets/images/7.png';
import shoes8 from '../assets/images/8.png';
import shoes9 from '../assets/images/9.png';

const featuredProducts = [
  {
    id: '1',
    name: 'Nike Air Max',
    price: 'C $120',
    priceValue: 120,
    description1: 'RUNNING',
    description2: 'NIKE AIR MAX',
    imageUrl: shoes1,
    width: 250,
    height: 300,
  },
  {
    id: '2',
    name: 'Adidas Stan Smith',
    price: 'C $85',
    priceValue: 85,
    description1: 'CASUAL SNEAKER',
    description2: 'ADIDAS STAN SMITH',
    imageUrl: shoes2,
    width: 250,
    height: 300,
  },
  {
    id: '3',
    name: 'Salomon Quest 4D',
    price: 'C $250',
    priceValue: 250,
    description1: 'HIKING BOOT',
    description2: 'SALOMON QUEST 4D',
    imageUrl: shoes3,
    width: 250,
    height: 300,
  },
  {
    id: '4',
    name: 'Chuck Taylor',
    price: 'C $95',
    priceValue: 95,
    description1: 'CLASSIC CONVERSE',
    description2: 'CHUCK TAYLOR',
    imageUrl: shoes4,
    width: 250,
    height: 300,
  },
];

const ProductSlider = ({ title, products, onProductPress, blockId = 'product_carousel' }) => {
  // Track impressions when component mounts
  useEffect(() => {
    if (products && products.length > 0) {
      products.forEach((product, index) => {
        // Only track if we have the required fields
        if (product.id && product.name && product.priceValue !== undefined) {
          trackProductImpression(
            {
              id: product.id,
              name: product.name,
              price: product.priceValue,
            },
            index + 1, // rank is 1-indexed
            blockId
          );
        }
      });
    }
  }, [products, blockId]);

  // This function tells the FlatList how to render each individual product
  const renderProduct = ({ item, index }) => (
    <View style={styles.productItem}>
      <Product
        // Pass all properties from the product item directly to the Product component
        {...item}
        // Add tracking props
        rank={index + 1}
        blockId={blockId}
        // Handle the press event for each product
        onPress={() => onProductPress?.(item)}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={renderProduct}
        // Use a unique key for each item, assuming each product has a unique 'id'
        keyExtractor={(item) => item.id.toString()}
        // This is the essential prop to make the list horizontal
        horizontal={true}
        // Hides the horizontal scroll bar for a cleaner look
        showsHorizontalScrollIndicator={false}
        // Style for the content container, useful for adding padding
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    marginTop: 20, // Space below the entire slider component
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12, // Space between the title and the products
    marginLeft: 16, // Align title with the start of the first product
  },
  listContent: {
    paddingHorizontal: 16, // Adds padding on the left of the first item and right of the last item
  },
  productItem: {
    marginRight: 5, // Adds space between the products in the list
  },
});

const Slider = () => {
  const handleProductPress = (product) => {
    console.log('Product pressed:', product);
    // TODO: Navigate to product detail page
    // navigation.navigate('ProductDetail', { productId: product.id });
  };

  return (
    <ProductSlider
      title="Featured Products"
      products={featuredProducts}
      onProductPress={handleProductPress}
      blockId="featured_carousel_home"
    />
  );
};

export default Slider;