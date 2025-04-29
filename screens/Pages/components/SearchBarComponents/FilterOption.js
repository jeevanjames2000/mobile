import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
export const FilterOption = ({ label, selected, onPress, checkmark = false }) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected && styles.containerSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {selected && checkmark && (
        <View style={styles.checkContainer}>
          <Ionicons name="checkmark" size={14} color="#fff" />
        </View>
      )}
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
  },
  containerSelected: {
    backgroundColor: "#1D3A76",
    borderColor: "#f5f5f5",
  },
  label: {
    fontSize: 14,
    color: "#333",
    fontFamily:'PoppinsMedium',
    marginTop:3,
    fontWeight:'600'
  },
  labelSelected: {
    color:"#f5f5f5",
     fontWeight:'600'
  },
  checkContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
});