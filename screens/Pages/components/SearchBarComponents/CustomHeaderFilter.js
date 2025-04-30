import React from "react";
import { Pressable, Text, StyleSheet, View, Platform } from "react-native";
import { HStack } from "native-base";
import Ionicons from "@expo/vector-icons/Ionicons";

const CustomHeaderFilter = ({ navigation, title, handleClearAll }) => {
  return (
    <HStack
      style={styles.header}
      justifyContent="space-between"
      alignItems="center"
    >
      <View>
        <HStack alignItems="center">
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.iconButton}
          >
            <Ionicons name="chevron-back-outline" size={24} color="#000" />
          </Pressable>
          <Text style={styles.titleFilter}>{title}</Text>
        </HStack>
      </View>
      <Pressable onPress={handleClearAll}>
        <Text style={styles.clear}>Clear all</Text>
      </Pressable>
    </HStack>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: 10,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 18,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#DBDADA",
  },
  iconButton: {
    padding: 8,
  },
  titleFilter: {
    fontSize: 18,
    marginLeft: 5,
    color: "#000",
    marginTop: 5,
    fontFamily: "PoppinsSemiBold",
  },
  clear: {
    fontSize: 12,
    color: "#1A1A1A",
    marginTop: 5,
    fontFamily: "Poppins",
    fontWeight: "400",
  },
});

export default CustomHeaderFilter;