import Button from '../components/Button';
import BottomNavigation from '../components/BottomNavigation'
import { View, Text, StyleSheet } from 'react-native';

import Header from '../components/Header'
import NetInfo from '@react-native-community/netinfo';
import main from "../assets/images/main.jpg"
import { ImageBackground, Dimensions } from 'react-native';

import { ScrollView } from 'react-native';
import { useState, useEffect } from 'react'

import ProductSlider from '../components/ProductSlider';

import { useCart } from '../hooks/cart/useCart'
import CustomOverlay from '../components/Message';
import Slider from '../components/ProductCaraousal'

const { width } = Dimensions.get('window');

const HomeScreen = () => {

  const [isConnected, setIsConnected] = useState(true);
  const [showNetworkError, setShowNetworkError] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const _ = state.isConnected && state.isInternetReachable !== false;
      setIsConnected(_);
      setShowNetworkError(_)
    });

    // Fetch the initial state
    NetInfo.fetch().then(state => {
      const _ = state.isConnected && state.isInternetReachable !== false;
      setIsConnected(_);
      setShowNetworkError(_);
    });

    return () => {
      unsubscribe();
    };
  }, []);



  const { getCart, useGetCart, useAddToCart, useRemoveFromCart } = useCart();

  //if this is placed in the cart page and products use getCart to
  //get there initial count, then it would always be null as it is not fetched yet.
  // but we would like to use this hook to get loading states in the cart
  //meaning for everything to properly  work we can either change 
  // getCart to fetch whent there is no data or pre-fetch to populate the cache
  // const [{loading, error, data}, fetchCart] = useGetCart();

  const [{ updating: adding, error: addingError }, addToCart] = useAddToCart();
  const [{ updating: removing, error: removingError }, removeFromCart] = useRemoveFromCart();
  const data = getCart();

  const getCartTotalCount = () => {

    if (data) {
      return data.length;
    }
  }

  const [showModal, setShowModal] = useState(false);
  const [showMessage, setShowMessage] = useState(false);


  return (
<>
<Header label='HELLO' />
            <ScrollView>
                <ImageBackground
                    source={main}
                    style={bgStyles.backgroundImage}
                    resizeMode="cover"
                >
                <View style={{
                    backgroundColor: 'white',
                    alignSelf: 'flex-start',
                    padding: 5,
                    marginBottom: 7,
                }
            }>
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: 'black',
                letterSpacing: 1,

              }}>JUST FOR YOU</Text>

            </View>
            <View style={bgStyles.buttonContainer}>
                <Button
                  iconAlign="left"
                  type='link'
                  href='\shop'
                  style="clear"
                  iconName="arrow-forward"
                  color='black'
                  title='SHOP ALL'
                  buttonStyle={{ backgroundColor: 'white' }}
                  contentStyle={{
                    fontSize: 12,
                    padding: 12,
                    fontWeight: 'bold',
                    color: 'black',
                    letterSpacing: 1.5,
                  }}
                  elevated
                  borderColor='white'
                  height={40}

                />
          
            </View>
          </ImageBackground>

          <View style={{ marginTop: -50 }}>
            <ProductSlider />
          </View>

        <View style={{
          paddingHorizontal:15,
          paddingTop: 25,
        }}>
            <Text style={{
                    fontSize: 16,
                    paddingVertical:10,
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
                />   
              <Slider/>
        </View>

        <View style={{
          paddingHorizontal:15,
          paddingTop: 25,
          marginBottom:100,
        }}>
            <Text style={{
                    fontSize: 16,
                    paddingTop:10,
                    fontWeight: 'bold',
                    color: 'black',
                    letterSpacing: 1.5,
                  }}>
                    SHOP SUGGESTED LOOKS
              </Text>
              <Text style={{
                    fontSize: 12,
                    paddingVertical:10,
                    color: '#808080',
                    letterSpacing: 1.5,
                  }}>
                   Select your faviorite for more details
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
              
                />   
              <Slider/>
        </View>
        </ScrollView>
        <BottomNavigation cartCount={2} wishListCount={2} />
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
    height: 300, // Adjust as needed
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 40,

  },
  buttonContainer: {
    alignSelf: 'flex-start',
    paddingBottom: 20,
  },
});



// <CustomOverlay
// type="modal"
// visible={showModal}
// onClick={() => setShowModal(false)}
// heading={<Text style={{ fontSize: 14, fontWeight: 'bold', padding: 8, }}>Oops, something went wrong!</Text>}
// description={<Text style={{ color: 'grey', fontSize: 12, padding: 8 }}>
//   You have exceeded the number of items that can be
//   purcahsed for this product per customer.
// </Text>}

// />

// <CustomOverlay
// type="message"
// visible={showMessage}
// onClick={() => setShowMessage(false)}
// description={
//   <Text style={{ color: 'white', fontSize: 12, padding: 8 }}>
//     You have exceeded the number of items that can be
//     purcahsed for this product per customer.
//   </Text>
// }
// />
// <View>
// {showNetworkError ? (
//   <></>
// ) : (
//   <CustomOverlay
//     type="message"
//     visible={showMessage}
//     onClick={() => setShowNetworkError(false)}
//     description={
//       <Text style={{ color: 'red', zIndex: 100, height: 100, backgroundColor: 'black' }}>No internet connection</Text>
//     }
//   />
// )}
// </View>