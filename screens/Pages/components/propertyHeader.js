import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { HStack } from 'native-base';
import Ionicons from '@expo/vector-icons/Ionicons';

const PropertyHeader = ({ navigation, title, isInterested, handleIntrests, handleShare }) => {
  return (
    <HStack style={styles.header} justifyContent="space-between" alignItems="center">
      {/* Back Button */}
      <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </Pressable>

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Heart and Share Icons */}
      <HStack space={4}>
        <Pressable
          onPress={() => handleIntrests && handleIntrests('Interested in property')}
          style={styles.iconButton}
        >
          <Ionicons
            name={isInterested ? 'heart' : 'heart-outline'}
            size={24}
            color={isInterested ? 'red' : '#000'}
          />
        </Pressable>
        <Pressable onPress={() => handleShare && handleShare()} style={styles.iconButton}>
          <Ionicons name="share-social-outline" size={24} color="#000" />
        </Pressable>
      </HStack>
    </HStack>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 10,
    backgroundColor: '#f5f5f5',
  
  },
  iconButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontFamily: 'PoppinsSemiBold',
    color: '#000',
  },
});

export default PropertyHeader;