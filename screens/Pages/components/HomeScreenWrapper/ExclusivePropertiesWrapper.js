import React from "react";
import { FlatList } from "native-base";
import { StyleSheet } from "react-native";
import ExclusiveProperties from "../ExclusiveProperties";
const ExclusivePropertiesWrapper = ({ activeTab, selectedCity }) => {
  return (
    <FlatList
      data={[{ key: "properties" }]}
      keyExtractor={(item) => item.key}
      renderItem={() => (
        <ExclusiveProperties activeTab={activeTab} selectedCity={selectedCity} />
      )}
      contentContainerStyle={styles.flatListContainer}
    />
  );
};
const styles = StyleSheet.create({
  flatListContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
});
export default ExclusivePropertiesWrapper;