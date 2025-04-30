import React from "react";
import { Pressable, Text, StyleSheet, View } from "react-native";
import { HStack } from "native-base";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";

const PropertyHeader = ({
  navigation,
  title,
  isInterested,
  handleIntrests,
  handleShare,
  property,
}) => {
  const navigate = useNavigation();
  const handleNavigate = () => {
    navigate.navigate("Wishlist");
  };
  return (
    <HStack
      style={styles.header}
      justifyContent="space-between"
      alignItems="center"
    >
      <View>
        <HStack>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back-outline" size={24} color="#000" />
          </Pressable>

          <Text style={styles.title}>{title}</Text>
        </HStack>
      </View>

      <View>
        <HStack space={4}>
          <Pressable onPress={handleNavigate} style={styles.iconButton}>
            <Ionicons
              name={
                isInterested === property.unique_property_id
                  ? "heart"
                  : "heart-outline"
              }
              size={24}
              color={
                isInterested === property.unique_property_id ? "red" : "#000"
              }
            />
          </Pressable>
          <Pressable
            onPress={() => handleShare && handleShare()}
            style={styles.iconButton}
          >
            <Ionicons name="share-social-outline" size={24} color="#000" />
          </Pressable>
        </HStack>
      </View>
    </HStack>
  );
};

const styles = StyleSheet.create({
  header: {
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  iconButton: {
    padding: 8,
  },
  title: {
    marginTop: 5,
    fontSize: 18,
    fontFamily: "PoppinsSemiBold",
    color: "#000",
  },
});

export default PropertyHeader;
