// import React from 'react';
// import LottieView from 'lottie-react-native';
// import { View, StyleSheet } from 'react-native';

// export default function Lottie({ style, children }) {
//   return (
//     <View style={StyleSheet.flatten([styles.container, style])}>
//       <LottieView
//         source={require('../assets/christmas.json')}
//         autoPlay
//         loop
//         style={styles.lottie}
//       />
//       <View style={styles.overlay}>
//         {children}
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     position: 'relative',
//     width: '100%',
//     height: 300,
//     overflow: 'hidden'
//   },
//   lottie: {
//     position: 'absolute',
//     top: 50,
//     right: 10 ,
//     width: '80%',
//     height: '80%',
//     zIndex: -1
//   },
//   overlay: {
//     flex: 1,
//     padding: 20,
//     justifyContent: 'center',
//     zIndex: 1
//   }
// });
