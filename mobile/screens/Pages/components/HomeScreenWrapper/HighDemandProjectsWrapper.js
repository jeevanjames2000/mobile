import React from "react";
import { FlatList } from "native-base";

import { StyleSheet } from "react-native";

import HighDemandProjects from "../HighDemandProject";

const HighDealPropertiesWrapper = ({ activeTab, selectedCity }) => {
  return (
    <FlatList
    data={[{ key: "properties" }]}
      keyExtractor={(item) => item.key}
      renderItem={() => (
        <HighDemandProjects activeTab={activeTab} selectedCity={selectedCity} />
      )}
      showsVerticalScrollIndicator={false}
        vertical={false}

      contentContainerStyle={styles.flatListContainer}
     
    />
  );
};

const styles = StyleSheet.create({
  flatListContainer: {
    // backgroundColor: "#fff",
    // paddingHorizontal: 10,
    // paddingVertical: 10,
  },
});

export default HighDealPropertiesWrapper;