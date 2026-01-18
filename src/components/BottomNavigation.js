import { View, StyleSheet, Platform, TouchableOpacity, Text } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useCart } from '../hooks/cart/useCart';
import { Image } from 'expo-image';
import { useNavigation, useRoute } from '@react-navigation/native';

const navItems = [
  { name: 'Search', icon: 'search1', route: 'Shop' },
  { name: 'Cart', icon: 'shoppingcart', route: 'Cart' },
  { name: 'WishList', icon: 'hearto', route: 'WishList' },
];

const BottomNav = ({ 
  cartCount, 
  wishListCount,
  backgroundColor = '#fff',
  activeColor = '#000',
  inactiveColor = '#666',
  iconColor,
  activeIndicatorColor = '#000',
  borderColor = '#e5e5e5',
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { getCart } = useCart();

  const getCartTotalCount = () => {
    const data = getCart();
    return data ? data.length : 0;
  };

  // Use iconColor if provided, otherwise use inactiveColor
  const defaultIconColor = iconColor || inactiveColor;

  return (
    <View style={[styles.container, { backgroundColor, borderTopColor: borderColor }]}>
      <TouchableOpacity onPress={() => navigation.navigate('Home')}>
        <Image
          style={{ width: 40, height: 40 }}
          source={require('../assets/images/logo.jpeg')}
          contentFit="cover"
        />
      </TouchableOpacity>

      {navItems.map((item) => {
        const isActive = route.name === item.route;

        return (
          <TouchableOpacity
            key={item.route}
            onPress={() => navigation.navigate(item.route)}
            activeOpacity={0.7}
            style={styles.navItem}
          >
            <AntDesign
              name={item.icon}
              size={22}
              color={isActive ? activeColor : defaultIconColor}
              style={[
                styles.icon, 
                isActive && [styles.activeIcon, { borderBottomColor: activeIndicatorColor }]
              ]}
            />

            {item.name === 'Cart' && (
              <Text style={[styles.countBox, { backgroundColor: activeIndicatorColor }]}>
                {getCartTotalCount()}
              </Text>
            )}
            {item.name === 'WishList' && (
              <Text style={[styles.countBox, { backgroundColor: activeIndicatorColor }]}>
                {wishListCount ?? 0}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}

      <Text style={[styles.text, { color: activeColor }]}>adiClub</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  icon: {
    paddingBottom: 10,
    paddingRight: 2,
  },
  activeIcon: {
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 11,
  },
  countBox: {
    position: 'absolute',
    bottom: 10,
    right: 0,
    fontSize: 12,
    paddingVertical: 1,
    paddingHorizontal: 3,
    alignContent: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  text: {
    paddingTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontStyle: 'italic',
  },
});

export default BottomNav;
