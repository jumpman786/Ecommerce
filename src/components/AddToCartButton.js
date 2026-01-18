import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';

const AddToCartButton = ({
  initialQuantity = 0,
  onAdd,
  onIncrement,
  onDecrement,
  maxQuantity = 10,
  minQuantity = 0,
}) => {
  const [quantity, setQuantity] = useState(initialQuantity);

  const handleAdd = () => {
    const newQty = 1;
    setQuantity(newQty);
    onAdd?.(newQty);
  };

  const handleIncrement = () => {
    if (quantity < maxQuantity) {
      const newQty = quantity + 1;
      setQuantity(newQty);
      onIncrement?.(newQty);
    }
  };

  const handleDecrement = () => {
    const newQty = quantity - 1;
    if (newQty <= 0) {
      setQuantity(0);
      onDecrement?.(0);
    } else {
      setQuantity(newQty);
      onDecrement?.(newQty);
    }
  };

  if (quantity === 0) {
    return (
      <Button
        title="ADD TO CART"
        iconName="add"
        iconAlign="left"
        onPress={handleAdd}
        fullWidth={false}
        style="outline"
       
    
      />
    );
  }

  return (
    <View style={styles.container}>
      <Button
        iconName="remove"
        onPress={handleDecrement}
        style="outline"
        color="black"
        height={30}
        width={30}
        buttonStyle={styles.iconButton}
      />
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityText}>{quantity}</Text>
      </View>
      <Button
        iconName="add"
        onPress={handleIncrement}
        style="outline"
        color="black"
        height={30}
        width={30}
        buttonStyle={styles.iconButton}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    
  },
  quantityContainer: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderColor: '#666666',
    borderWidth: 1,
    minWidth: 40,
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 13,
    fontWeight: '500',
  },
  iconButton: {
    paddingHorizontal: 5,
    paddingVertical: 0,
  },
});

export default AddToCartButton;
