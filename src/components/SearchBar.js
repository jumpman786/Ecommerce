import React from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <View style={styles.container}>
      <MaterialIcons name="search" size={20} color="#888" />
      <TextInput
        style={styles.input}
        placeholder="Search products..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#aaa"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    marginHorizontal: 10,
    marginBottom: 10,
    height: 40,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
  },
});

export default SearchBar;
