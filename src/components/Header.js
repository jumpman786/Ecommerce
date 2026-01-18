import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Button from './Button';

const Header = ({ 
  label, 
  backgroundColor = '#fff',
  textColor = '#000',
  borderColor = '#e5e5e5',
  iconColor,
}) => {
  return (
    <View style={[styles.header, { backgroundColor, borderBottomColor: borderColor }]}>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      <Button
        variant='clear'
        type='link'
        href='/profile'
        iconName='user'
        color={iconColor || textColor}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 99,
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
    padding: 8,
  }
});

export default Header;
