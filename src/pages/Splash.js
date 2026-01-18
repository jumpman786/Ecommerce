import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Image } from 'react-native';

const Splash = () => {
  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require('../images/logo.png')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    resizeMode: 'cover',
    height: "100%"
  }
});

export default Splash;