import React from "react";
import { FlatList } from "native-base";
import LatestProperties from "../LatestProperties";
import { StyleSheet } from "react-native";
const LatestPropertiesWrapper = ({ activeTab, selectedCity }) => {
  return (
    <FlatList
    data={[{ key: "properties" }]}
      keyExtractor={(item) => item.key}
      renderItem={() => (
        <LatestProperties activeTab={activeTab} selectedCity={selectedCity} />
      )}
      showsVerticalScrollIndicator={false}
        vertical={false}
      contentContainerStyle={styles.flatListContainer}
    />
  );
};
const styles = StyleSheet.create({
  flatListContainer: {
    backgroundColor: "# CLOSED",
  },
});
export default LatestPropertiesWrapper;