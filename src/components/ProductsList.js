import React, { useState, useMemo, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import Product from './Product';
import SearchBar from './SearchBar';
import FilterBar from './Filter';
import { trackProductImpression, trackSearch } from '../lib/analytics';
import { posthog } from '../lib/posthog';

import shoes1 from '../assets/images/1.png';
import shoes2 from '../assets/images/2.png';
import shoes3 from '../assets/images/3.png';
import shoes4 from '../assets/images/4.png';
import shoes5 from '../assets/images/5.png';
import shoes6 from '../assets/images/6.png';
import shoes7 from '../assets/images/7.png';
import shoes8 from '../assets/images/8.png';
import shoes9 from '../assets/images/9.png';

// Sample data with enhanced tracking fields
const products = [
  {
    id: '1',
    name: 'Premium Leather Handcrafted Shoes',
    imageUrl: shoes6,
    price: 'C$ 29.99',
    priceValue: 29.99,
    description1: 'PREMIUM LEATHER',
    description2: 'HANDCRAFTED IN ITALY',
    bannerTitle: 'NEW ARRIVAL',
  },
  {
    id: '2',
    name: 'Vegan Water Resistant Shoes',
    imageUrl: shoes6,
    price: 'C$ 34.99',
    priceValue: 34.99,
    description1: 'VEGAN MATERIAL',
    description2: 'WATER RESISTANT',
  },
  {
    id: '3',
    name: 'Sustainable Recycled Fabric',
    imageUrl: shoes5,
    price: 'C$ 59.99',
    priceValue: 59.99,
    description1: 'SUSTAINABLE FABRIC',
    description2: '100% RECYCLED',
  },
  {
    id: '4',
    name: 'Lightweight Breathable Mesh',
    imageUrl: shoes4,
    price: 'C$ 44.99',
    priceValue: 44.99,
    description1: 'LIGHTWEIGHT DESIGN',
    description2: 'BREATHABLE MESH',
    bannerTitle: '25% DISCOUNT',
    bannerType: 'discount',
  },
  {
    id: '5',
    name: 'All-Terrain Hiking Shoes',
    imageUrl: shoes6,
    price: 'C$ 49.99',
    priceValue: 49.99,
    description1: 'ALL-TERRAIN GRIP',
    description2: 'PERFECT FOR HIKING',
  },
  {
    id: '6',
    name: 'Cotton Lined Ultra Comfort',
    imageUrl: shoes1,
    price: 'C$ 24.99',
    priceValue: 24.99,
    description1: 'COTTON LINED',
    description2: 'ULTRA COMFORT',
  },
  {
    id: '7',
    name: 'Modern Urban Style',
    imageUrl: shoes3,
    price: 'C$ 69.99',
    priceValue: 69.99,
    description1: 'MODERN DESIGN',
    description2: 'URBAN STYLE',
  },
  {
    id: '8',
    name: 'Natural Dyes Chemical Free',
    imageUrl: shoes4,
    price: 'C$ 39.99',
    priceValue: 39.99,
    description1: 'NATURAL DYES',
    description2: 'CHEMICAL FREE',
  },
  {
    id: '9',
    name: 'Cushioned Shock Absorbent',
    imageUrl: shoes1,
    price: 'C$ 54.99',
    priceValue: 54.99,
    description1: 'CUSHIONED SOLE',
    description2: 'SHOCK ABSORBENT',
  },
  {
    id: '10',
    name: 'Stylish Everyday Use',
    imageUrl: shoes4,
    price: 'C$ 64.99',
    priceValue: 64.99,
    description1: 'STYLISH AND STRONG',
    description2: 'EVERYDAY USE',
  },
  {
    id: '11',
    name: 'High Quality Canadian Cotton',
    imageUrl: shoes4,
    price: 'C$ 32.99',
    priceValue: 32.99,
    description1: 'HIGH QUALITY COTTON',
    description2: 'MADE IN CANADA',
  },
  {
    id: '12',
    name: 'Recycled Earth Friendly',
    imageUrl: shoes3,
    price: 'C$ 38.99',
    priceValue: 38.99,
    description1: 'RECYCLED MATERIALS',
    description2: 'EARTH FRIENDLY',
  },
  {
    id: '13',
    name: 'Ergonomic Long Walks Ready',
    imageUrl: shoes4,
    price: 'C$ 42.99',
    priceValue: 42.99,
    description1: 'ERGONOMIC FIT',
    description2: 'LONG WALKS READY',
  },
  {
    id: '14',
    name: 'Organic Canvas Eco Stitching',
    imageUrl: shoes4,
    price: 'C$ 59.99',
    priceValue: 59.99,
    description1: 'ORGANIC CANVAS',
    description2: 'ECO STITCHING',
  },
  {
    id: '15',
    name: 'Cotton Base Casual Wear',
    imageUrl: shoes4,
    price: 'C$ 27.99',
    priceValue: 27.99,
    description1: 'COTTON BASE',
    description2: 'CASUAL WEAR',
  },
  {
    id: '16',
    name: 'Eco Rubber Sole Durable',
    imageUrl: shoes1,
    price: 'C$ 45.99',
    priceValue: 45.99,
    description1: 'ECO RUBBER SOLE',
    description2: 'MADE TO LAST',
  },
  {
    id: '17',
    name: 'Handmade Canadian Craft',
    imageUrl: shoes4,
    price: 'C$ 33.99',
    priceValue: 33.99,
    description1: 'HANDMADE TOUCH',
    description2: 'CANADIAN CRAFT',
  },
  {
    id: '18',
    name: 'Everyday Quick Drying Slip-Ons',
    imageUrl: shoes3,
    price: 'C$ 41.99',
    priceValue: 41.99,
    description1: 'EVERYDAY SLIP-ONS',
    description2: 'QUICK DRYING',
  },
  {
    id: '19',
    name: 'Soft Non-Slip Grip',
    imageUrl: shoes4,
    price: 'C$ 36.99',
    priceValue: 36.99,
    description1: 'SOFT INNER LINING',
    description2: 'NON-SLIP GRIP',
  },
  {
    id: '20',
    name: 'Elegant Seasonless Style',
    imageUrl: shoes4,
    price: 'C$ 50.00',
    priceValue: 50.0,
    description1: 'ELEGANT LOOK',
    description2: 'SEASONLESS STYLE',
  },
];

const ProductList = ({ blockId = 'shop_grid' }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchSearch =
        product.description1.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description2.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchFilter =
        selectedFilter === 'All' ||
        (selectedFilter === 'Under C$30' &&
          parseFloat(product.price.replace(/[^0-9.]/g, '')) < 30) ||
        product.description1.includes(selectedFilter) ||
        product.description2.includes(selectedFilter);

      return matchSearch && matchFilter;
    });
  }, [searchQuery, selectedFilter]);

  // Track search when query changes
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const timeoutId = setTimeout(() => {
        trackSearch(searchQuery, filteredProducts.length);
      }, 500); // Debounce for 500ms

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, filteredProducts.length]);

  // Track filter changes
  useEffect(() => {
    if (selectedFilter !== 'All') {
      posthog.capture('filter_applied', {
        filter_type: selectedFilter,
        result_count: filteredProducts.length,
        page: 'shop',
        timestamp: new Date().toISOString(),
      });
    }
  }, [selectedFilter, filteredProducts.length]);

  // Track product impressions when filtered products change
  useEffect(() => {
    if (filteredProducts.length > 0) {
      // Track impressions for visible products (first 10)
      const visibleProducts = filteredProducts.slice(0, 10);
      visibleProducts.forEach((product, index) => {
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
    }
  }, [filteredProducts, blockId]);

  const handleProductPress = (item, index) => {
    console.log('Product pressed:', item);
    // TODO: Navigate to product detail page
    // navigation.navigate('ProductDetail', { productId: item.id });
  };

  return (
    <View style={styles.container}>
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <FilterBar
        selectedFilter={selectedFilter}
        setSelectedFilter={setSelectedFilter}
      />

      <FlashList
        data={filteredProducts}
        renderItem={({ item, index }) => (
          <View style={styles.itemWrapper}>
            <Product
              type="column"
              // Existing props
              imageUrl={item.imageUrl}
              price={item.price}
              description1={item.description1}
              description2={item.description2}
              width={190}
              height={250}
              bannerTitle={item.bannerTitle}
              bannerType={item.bannerType}
              // Tracking props
              id={item.id}
              name={item.name}
              priceValue={item.priceValue}
              rank={index + 1}
              blockId={blockId}
              onPress={() => handleProductPress(item, index)}
            />
          </View>
        )}
        estimatedItemSize={180}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.rowStyle}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 10,
  },
  listContent: {
    margin: 2,
  },
  rowStyle: {
    justifyContent: 'space-between',
  },
  itemWrapper: {
    margin: 2,
    marginBottom: 5,
  },
});

export default ProductList;