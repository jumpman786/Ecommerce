import React, { useCallback, useEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from './Icon'
import useNavigation  from '../navigation/hooks/useNavigation';


// Need to implement simple metrics
// Notification: suppose addToCart button failed, or for other reasons if 

const Button = ({
  title = '',
  color = 'primary', // 'secondary'
  href = '',
  onPress = () => { },
  style , // solid, "outline" , "clear", 
  variant,
  type = 'normal', // 'link', 'external'
  loading = false,
  icon,
  iconName,
  iconAlign = 'right',
  disabled = false,
  loadingStyle,
  width = undefined,
  height = undefined,
  fullWidth = false,
  elevated = false,
  borderColor,
  fontSize, // Accept fontSize as top-level prop (for AI customization)
  padding, // Accept padding as top-level prop (for AI customization)
  radius, // Accept radius for border-radius (e.g., "full", "lg", "md", "sm", "none", or number)
  contentStyle,
  buttonStyle,
  ...props // Accept any other props for flexibility
}) => {
  
  // Map radius tokens to numeric values
  const mapRadius = (r) => {
    if (r === undefined || r === null) return undefined;
    if (typeof r === 'number') return r;
    if (typeof r === 'string') {
      const radiusMap = {
        'none': 0,
        'sm': 4,
        'md': 8,
        'lg': 12,
        'xl': 16,
        '2xl': 24,
        'full': 9999,
      };
      return radiusMap[r.toLowerCase()] || parseInt(r) || undefined;
    }
    return undefined;
  };
  
  const borderRadius = mapRadius(radius);

  const navigation = useNavigation();

  const handleOnPress = useCallback(
    (evt) => {
      if(!disabled && type ==='link')
      {
        navigation.navigate(href)
      }
      if (!loading && !disabled) {
        onPress(evt)
      }

    },
    []
  );

  const NativeTouchable = Platform.OS === 'android' ? TouchableNativeFeedback : TouchableOpacity;

  const displayTitle = typeof title === 'string' ? title : '';
  
  
  if(!style){style = variant;}
  const button = (
    <NativeTouchable
      onPress={handleOnPress}
      delayPressIn={0}
      disabled={disabled}
    >
      <View
        style={StyleSheet.flatten([
          styles.button,
          {
            zIndex: 10,
            // Flex direction based on iconPosition
            // If iconRight is true, default to right
            flexDirection: positionStyle[iconAlign] || 'row',
            backgroundColor: style === 'solid' ? 'black' : 'transparent',
            borderColor: color && color || 'black',
            borderWidth: style === 'outline' ? 1 : 0,
          },
          width && { width: width },
          height && { height: height },
          borderRadius !== undefined && { borderRadius: borderRadius },
          disabled && style === 'solid' && { backgroundColor: 'grey' },
          disabled && style === 'outline' && { borderColor: 'grey' },
          buttonStyle,
        ])}
      >
        {/* Activity Indicator on loading */}
        {loading && (
          <ActivityIndicator
            style={StyleSheet.flatten([styles.loading, loadingStyle])}
            color={style === 'solid' ? 'white' : 'black'}
            size='small'
          />
        )}

        <Text style={StyleSheet.flatten([
          styles.title,
          {
            color: style === 'solid' ? 'white' : (color && color || 'black'),
          },
          disabled && { color: 'grey' },
          // Merge fontSize and padding from props into contentStyle
          fontSize && { 
            fontSize: typeof fontSize === 'string' ? 
              ({ xs: 10, sm: 12, md: 14, lg: 16, xl: 18, '2xl': 20 }[fontSize.toLowerCase()] || parseInt(fontSize) || 12) :
              fontSize 
          },
          padding && { padding },
          contentStyle,
        ])}>{displayTitle}</Text>

        {iconName ? (
          <View>
            <Icon
              name={iconName}
              size={22}
              color={style === 'solid' ? 'white' : (color && color || 'black')}
            />
          </View>
        ) : (
          icon && icon
        )}

        {elevated && (
          <View
            style={[
              StyleSheet.absoluteFillObject, // Match size of parent
              {
                zIndex: 0,
                position: 'absolute',
                top: 3,
                left: 4,
                bottom: -3,
                right: -3,
                borderColor: borderColor || 'black',
                borderWidth: 1,
                backgroundColor: 'transparent',
              },
            ]}
          />
        )}
      </View>
    </NativeTouchable>
  );

  // Extract positioning styles from props.style (passed from tree)
  // These include: position, top, left, right, bottom, margin*, transform, etc.
  const positioningStyle = typeof props.style === 'object' ? props.style : {};
  
  // Map alignment values (support "right", "left", "center" as shortcuts)
  const mapAlignment = (align) => {
    if (!align) return null;
    const alignMap = {
      'right': 'flex-end',
      'left': 'flex-start', 
      'center': 'center',
      'start': 'flex-start',
      'end': 'flex-end',
    };
    return alignMap[align.toLowerCase?.()] || align;
  };
  
  // Check direct props first, then nested style, then default
  const computedAlignSelf = mapAlignment(props.alignSelf) || 
                           mapAlignment(props.alignment) ||
                           mapAlignment(props.position) ||
                           mapAlignment(positioningStyle.alignSelf) ||
                           (fullWidth ? 'stretch' : 'flex-start');
  
  
  return (
    <View style={StyleSheet.flatten([
      {
        position: positioningStyle.position || 'relative',
        alignSelf: computedAlignSelf,
      },
      width && { width },
      height && { height },
      // Apply all positioning styles from tree
      positioningStyle.position === 'absolute' && {
        top: positioningStyle.top,
        left: positioningStyle.left,
        right: positioningStyle.right,
        bottom: positioningStyle.bottom,
      },
      // Apply margins
      positioningStyle.margin !== undefined && { margin: positioningStyle.margin },
      positioningStyle.marginTop !== undefined && { marginTop: positioningStyle.marginTop },
      positioningStyle.marginBottom !== undefined && { marginBottom: positioningStyle.marginBottom },
      positioningStyle.marginLeft !== undefined && { marginLeft: positioningStyle.marginLeft },
      positioningStyle.marginRight !== undefined && { marginRight: positioningStyle.marginRight },
      positioningStyle.marginHorizontal !== undefined && { marginHorizontal: positioningStyle.marginHorizontal },
      positioningStyle.marginVertical !== undefined && { marginVertical: positioningStyle.marginVertical },
      // Apply transform
      positioningStyle.transform && { transform: positioningStyle.transform },
      // Apply zIndex
      positioningStyle.zIndex !== undefined && { zIndex: positioningStyle.zIndex },
    ])}>
      {button}
    </View>
  );
};

export default Button;


const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 7,
    columnGap: 8
  },
  title: {
    fontSize: 12,
    textAlign: 'center',
    paddingVertical: 1,
  },
  iconContainer: {
    marginHorizontal: 5,
  }
});

const positionStyle = {
  top: 'column',
  bottom: 'column-reverse',
  left: 'row',
  right: 'row-reverse',
};


// import React, { useCallback, useEffect, useMemo } from 'react';
// import {
//   ActivityIndicator,
//   Platform,
//   StyleSheet,
//   Text,
//   TouchableNativeFeedback,
//   TouchableOpacity,
//   View,

// } from 'react-native';


// import { MaterialIcons } from '@expo/vector-icons';
// import { Link } from 'expo-router';

// //need to implement simple metrics
// //notification: suppose addToCart button failed, or for other reasons if 
// //query failed on button

// //lot of buttons usually makes a http request based on this request 
// //loading states of button are managed externally
// //following compoenent is an implementaion that incorporates querying and mansging states it
// //self. with proper notifications if there was a network issue, or operation failed.
// //needs a nptification context, query must be tagged before hand
// const styles = StyleSheet.create({
//   button: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 7,
//     columnGap: 8
//   },
//   title: {
//     fontSize: 12,
//     textAlign: 'center',
//     paddingVertical: 1,
//     ...Platform.select({
//       android: {
//         fontFamily: 'sans-serif-medium',
//       },
//       default: {
//         fontFamily: 'sans-serif-medium',
//         fontSize: 12,
//       },
//     }),
//   },
//   iconContainer: {
//     marginHorizontal: 5,
//   }
// });


// const positionStyle = {
//   top: 'column',
//   bottom: 'column-reverse',
//   left: 'row',
//   right: 'row-reverse',
// };


// const Button = ({
//   title = '',
//   color = 'primary', //'secondary'
//   href = '',
//   onPress = () => { },
//   style = 'solid', // "outline" , "clear", 
//   type = 'normal',// 'link', 'external'
//   loading = false,
//   icon,
//   iconName,
//   iconAlign = 'right',
//   disabled = false,
//   loadingStyle,
//   width = undefined,
//   height = undefined,
//   fullWidth = false,
//   elevated = false,
//   borderColor,
//   alignTitle = 'center',
//   contentStyle,
//   buttonStyle,
// }) => {



//   const handleOnPress = useCallback(
//     (evt) => {
//       if (!loading && !disabled) {
//         onPress(evt)
//       }
//     },
//     []
//   );


//   const NativeTouchable =
//     Platform.OS === 'android' ?
//       TouchableNativeFeedback : TouchableOpacity;



//   // const titleAlignStyle = useMemo(() => {
//   //   switch (alignTitle) {
//   //     case 'left':
//   //       return {
//   //         textAlign: 'left',
//   //         alignSelf: 'flex-start',
//   //       };
//   //     case 'right':
//   //       return {
//   //         textAlign: 'right',
//   //         alignSelf: 'flex-end',
//   //       };
//   //     default: // 'center'
//   //       return {
//   //         textAlign: 'center',
//   //         alignSelf: 'center',

//   //       };
//   //   }
//   // }, [alignTitle]);

//   const displayTitle = typeof title === 'string' ? title : '';


//   const button = 
//     <NativeTouchable
//       onPress={handleOnPress}
//       delayPressIn={0}
//       disabled={disabled}
//     >
//       <View
//         style={StyleSheet.flatten([
//           styles.button,

//           {
//             zIndex: 10,

//             // use a theme provider for that gives these based on the screen size
//             // flex direction based on iconPosition
//             // if iconRight is true, default to right
//             flexDirection:
//               positionStyle[iconAlign] || 'row',
//             backgroundColor:
//               style === 'solid'
//                 ? 'black'
//                 : 'transparent',
//             borderColor: color && color || 'black',
//             borderWidth: style === 'outline' ? 1 : 0,
//           },
//           width && {
//             width: width,

//           },
//           height && {
//             height: height
//           },
//           disabled &&
//           style === 'solid' && {
//             backgroundColor: 'grey',
//           },
//           disabled &&
//           style === 'outline' && {
//             borderColor: 'grey'
//           },
//           buttonStyle,
//         ])}
//       >
//         {/* Activity Indicator on loading */}
//         {loading && (
//           <ActivityIndicator
//             style={StyleSheet.flatten([styles.loading, loadingStyle])}
//             color={style === 'solid' ? 'white' : 'black'}
//             size='small'
//           />
//         )}

//         {/* Title for Button, hide while loading */}
//         <Text style={StyleSheet.flatten([
//           styles.title,
//           {
//             color: style === 'solid' ? 'white' : (color && color || 'black'),
//           },
//           disabled && {
//             color: 'grey',
//           },
//           contentStyle,

//         ])}>{displayTitle}</Text>

//         {iconName ? <View>   <MaterialIcons
//           name={iconName}
//           size={16}
//           color={style === 'solid' ? 'white' : (color && color || 'black')}
//         /></View> :
//           icon && icon
//         }
//           {
//       elevated && (
//         <View
//           style={[
//             StyleSheet.absoluteFillObject, // Match size of parent
//             {
//               zIndex: 0,
//               position: 'absolute',

//               top: 3,
//               left: 4,
//               bottom: -3,
//               right: -3,
//               borderColor: borderColor || 'black',
//               borderWidth: 1,
//               backgroundColor: 'transparent',
//             },
//           ]}
//         />
//       )
//     }

//       </View>
//     </NativeTouchable>
  
  
//   return (
//     <View style={StyleSheet.flatten([
//       {
//         position: 'relative',
//         alignSelf: fullWidth ? 'stretch' : 'flex-start',
//       },
//       width && { width },
//       height && { height },
//     ])}>

//       {type === "link" ? <Link href={href} asChild>
//         {button}
//       </Link> : button}
//     </View>
//   );
// };

// export default Button;