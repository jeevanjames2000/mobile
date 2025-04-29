import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, Image } from "react-native";
import BuyImage from '../../../../assets/propertyicons/buy.png';
import CommercialImage from '../../../../assets/propertyicons/commercial.png';
import HouseImage from '../../../../assets/propertyicons/house.png'; // Assuming corrected path
import PLotImage from '../../../../assets/propertyicons/plot.png'; // Assuming corrected path

export const PropertyTypeIcon = ({ type, icon, selected = false, onPress }) => {
  const renderIcon = () => {
    const imageStyle = { width: 32, height: 32, tintColor: selected ? "#fff" : "#000" };

    switch (icon) {
      case "home":
        return <Image source={BuyImage} style={imageStyle} alt="home" />;
      case "key":
        return <Image source={HouseImage} style={imageStyle} alt="key"/>;
      case "map":
        return <Image source={PLotImage} style={imageStyle} alt="map" />;
      case "building":
        return <Image source={CommercialImage} style={imageStyle} alt="building" />;
      default:
        return <Image source={HouseImage} style={imageStyle} alt="default" />;
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.iconContainer,
          selected && styles.iconContainerSelected,
        ]}
      >
        {renderIcon()}
      </View>
      <Text style={styles.label}>{type}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
   
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainerSelected: {
    backgroundColor: "#1D3A76",
  },
  label: {
    fontSize: 14,
    color: "#333",
    fontFamily: 'Poppins',
    fontWeight:'650'
  },
});