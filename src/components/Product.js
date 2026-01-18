import Button from './Button';
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import AntDesign from '@expo/vector-icons/AntDesign';
import AddToCartButton from './AddToCartButton';
import { trackProductClick } from '../lib/analytics';

const ProductCard = ({
  // Existing props
  type = 'display', //'row', 'column', 'cart'
  width,
  height,
  imageUrl,
  price,
  description1,
  description2,
  bannerTitle,
  bannerType = 'default', // 'default' or 'discount'
  onLikePress,
  cart,
  
  // New props for tracking
  id,
  name,
  priceValue, // numeric price for analytics
  rank,
  blockId,
  onPress, // navigation handler from parent
}) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLikePress = () => {
    setIsLiked(!isLiked);
    if (onLikePress) {
      onLikePress(!isLiked);
    }
  };

  const handleProductPress = () => {
    // Track the product click
    if (id && name && priceValue !== undefined) {
      trackProductClick(
        { id, name, price: priceValue },
        rank,
        blockId
      );
    }
    
    // Call parent's onPress handler (for navigation)
    if (onPress) {
      onPress();
    }
  };

  const getBannerStyle = () => {
    return bannerType === 'discount' 
      ? { backgroundColor: '#FF0000' }
      : { backgroundColor: '#000000' };
  };

  if (type === 'column') {
    return (
      <TouchableOpacity 
        style={[styles.container, { width, height }]}
        onPress={handleProductPress}
        activeOpacity={0.8}
      >
        <Image
          style={styles.backgroundImage}
          source={imageUrl}
          contentFit="cover"
        />

        {/* Banner */}
        {bannerTitle && (
          <View style={[styles.bannerContainer, getBannerStyle()]}>
            <Text style={styles.bannerText}>{bannerTitle}</Text>
          </View>
        )}

        {/* Heart */}
        <View style={styles.heartContainer}>
          <Button
            icon={
              <Icon
                name={isLiked ? 'favorite' : 'favorite-border'}
                size={24}
                color='#595959'
              />
            }
            style='clear'
            onPressIn={handleLikePress}
          />
        </View>
        
        <View>
          {price && (
            <View style={styles.priceContainer}>
              <Text style={styles.priceText}>{price}</Text>
            </View>
          )}
          {description1 && <Text style={styles.descriptionText}>{description1}</Text>}
          {description2 && <Text style={styles.descriptionText}>{description2}</Text>}
        </View>
        
        <AddToCartButton
          initialQuantity={0}
          onAdd={(qty) => console.log('Added', qty)}
          onIncrement={(qty) => console.log('Increased to', qty)}
          onDecrement={(qty) => console.log('Decreased to', qty)}
        />
      </TouchableOpacity>
    );
  }

  return (
    <>
      {type === 'row' ? (
        <TouchableOpacity 
          style={[styles.container, rowStyles.container]}
          onPress={handleProductPress}
          activeOpacity={0.8}
        >
          <Image
            style={[rowStyles.image, { width: width * 0.4, height: height }]}
            source={imageUrl}
            contentFit="cover"
          />

          <View style={styles.heartContainer}>
            <Button
              icon={
                <Icon
                  name={isLiked ? 'favorite' : 'favorite-border'}
                  size={24}
                  color='#595959'
                />
              }
              style='clear'
              onPressIn={handleLikePress}
            />
          </View>
          
          <View style={rowStyles.infoContainer}>
            {/* Banner */}
            {bannerTitle && (
              <View style={[rowStyles.bannerContainer, getBannerStyle()]}>
                <Text style={styles.bannerText}>{bannerTitle}</Text>
              </View>
            )}

            {/* Price and Descriptions */}
            <View style={rowStyles.textContainer}>
              {price && (
                <View style={rowStyles.priceContainer}>
                  <Text style={rowStyles.priceText}>{price}</Text>
                </View>
              )}
              {description1 && <Text style={styles.descriptionText}>{description1}</Text>}
              {description2 && <Text style={styles.descriptionText}>{description2}</Text>}
            </View>

            {!cart && (
              <Button
                title='ADD TO CART'
                icon={
                  <AntDesign
                    name='shoppingcart'
                    size={22}
                    color={'#595959'}
                  />
                }
                iconAlign='left'
                style='outline'
              />
            )}
          </View>
        </TouchableOpacity>
      ) : (
        // Default vertical layout
        <TouchableOpacity 
          style={[styles.container, { width, height }]}
          onPress={handleProductPress}
          activeOpacity={0.8}
        >
          <Image
            style={styles.backgroundImage}
            source={imageUrl}
            contentFit="cover"
          />

          {/* Price and Description - Bottom Left */}
          <View style={styles.bottomContainer}>
            {price && (
              <View style={styles.priceContainer}>
                <Text style={styles.priceText}>{price}</Text>
              </View>
            )}
            {description1 && <Text style={styles.descriptionText}>{description1}</Text>}
            {description2 && <Text style={styles.descriptionText}>{description2}</Text>}
          </View>

          {/* Banner */}
          {bannerTitle && (
            <View style={[styles.bannerContainer, getBannerStyle()]}>
              <Text style={styles.bannerText}>{bannerTitle}</Text>
            </View>
          )}

          {/* Heart */}
          <View style={styles.heartContainer}>
            <Button
              icon={
                <Icon
                  name={isLiked ? 'favorite' : 'favorite-border'}
                  size={24}
                  color='#595959'
                />
              }
              style='clear'
              onPressIn={handleLikePress}
            />
          </View>
        </TouchableOpacity>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundImage: {
    flex: 1,
    justifyContent: 'space-between',
    zIndex: 10,
  },
  bannerContainer: {
    position: 'absolute',
    top: 5,
    left: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 100,
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
    zIndex: 100,
  },
  heartContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 100,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    maxWidth: '70%',
    zIndex: 100,
  },
  priceContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
    alignSelf: 'flex-start',
    zIndex: 100,
  },
  priceText: {
    color: '#000000',
    fontSize: 14,
    letterSpacing: 2,
  },
  descriptionText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginVertical: 2,
    letterSpacing: 1.2,
  },
});

const rowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  image: {
    height: '100%',
    resizeMode: 'cover',
  },
  bannerContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  bannerText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: 'bold',
  },
  infoContainer: {
    flex: 1,
    paddingLeft: 10,
    rowGap: 5,
  },
  textContainer: {
    flexDirection: 'column',
  },
  priceContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'orange',
    alignSelf: 'flex-start',
  },
  priceText: {
    color: 'white',
    fontSize: 14,
  },
});

export default ProductCard;