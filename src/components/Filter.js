import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Button from "./Button"
const FilterBar = ({ selectedFilter, setSelectedFilter }) => {
  const filters = ['ALL', 'UNDER C$ 30', 'COTTON', 'MADE IN INDIA'];

  return (
    <View style={styles.container}>
      {filters.map((filter) => (
        // <TouchableOpacity
        //   key={filter}
        //   style={[
        //     styles.filterButton,
        //     selectedFilter === filter && styles.activeFilter,
        //   ]}
        //   onPress={() => setSelectedFilter(filter)}
        // >
        //   <Text style={selectedFilter === filter ? styles.activeText : styles.text}>
        //     {filter}
        //   </Text>
        // </TouchableOpacity>
        //so here we need to know what states the 
        //button is in to toggle
        //we can pass an object in teh call bacj that use can ise to access the states
        //making it much easier to toggle 
         <Button
          style="outline"
          title={filter}
          buttonStyle={styles.button}
          contentStyle={styles.content}
         ></Button>
       
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderWidth:1,
  },
  content:{fontSize:10,},
  container: {
    flexDirection: 'row',
    columnGap:10,
    marginBottom: 10,
    paddingHorizontal: 10,
    flexWrap: 'wrap',
  },
  filterButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  activeFilter: {
    backgroundColor: '#333',
  },
  text: {
    fontSize: 12,
    color: '#333',
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default FilterBar;
