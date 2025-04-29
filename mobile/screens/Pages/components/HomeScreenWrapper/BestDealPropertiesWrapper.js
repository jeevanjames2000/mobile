import React from "react";
import { FlatList } from "native-base";

import { StyleSheet } from "react-native";
import BestDealProperties from "../BestDealProperties";

const BestDealPropertiesWrapper = ({ activeTab, selectedCity }) => {
  return (
    <FlatList
    data={[{ key: "properties" }]}
      keyExtractor={(item) => item.key}
      renderItem={() => (
        <BestDealProperties activeTab={activeTab} selectedCity={selectedCity} />
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

export default BestDealPropertiesWrapper;