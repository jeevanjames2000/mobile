import React from "react";
import { StyleSheet, Text, View } from "react-native";

export const FilterSection = ({ title, children }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // padding:20
    paddingHorizontal:20,
    paddingTop:10,
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
    color: "#000",
    fontFamily:'PoppinsSemiBold'
  },
  content: {
    flexDirection: "column",
  },
});