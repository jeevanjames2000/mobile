import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { setSearchData } from "../../../store/slices/searchSlice";
import { useDispatch, useSelector } from "react-redux";
const tabs = [
  { id: "Buy", label: "Buy" },
  { id: "Rent", label: "Rent" },
  { id: "Plot", label: "Plot" },
  { id: "Commercial", label: "Commercial" },
];

// Mapping function for tab to property_for
const mapTabToPropertyFor = (tab) => {
  const mapping = {
    Buy: "Sell",
    Rent: "Rent",
    Plot: "Sell", // Default to Sell for Plot
    Commercial: "Sell", // Default to Sell for Commercial
  };
  return mapping[tab] || "Sell";
};
export default function FilterTabs() {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.search.tab);
  const [activeTab, setActiveTab] = useState(data || "Buy");

  const handleTabChange = (id) => {
    setActiveTab(id);
    const payload = {
      tab: id,
      property_for: mapTabToPropertyFor(id),
      // Reset fields to avoid stale data
      property_in: "",
      sub_type: "",
    };

    // Set specific fields based on tab
    if (id === "Plot") {
      payload.sub_type = "Plot";
      payload.property_in = "";
    } else if (id === "Commercial") {
      payload.property_in = "Commercial";
      payload.sub_type = "";
    } else if (id === "Buy") {
      payload.property_in = "Residential"; // Default for Buy
      payload.sub_type = "Apartment"; // Default for Buy
    } else if (id === "Rent") {
      payload.property_in = "Residential"; // Default for Rent
      payload.sub_type = "Apartment"; // Default for Rent
    }

    dispatch(setSearchData(payload));
  };

  useEffect(() => {
    setActiveTab(data || "Buy");
  }, [data]);

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[styles.tab, activeTab === tab.id && styles.activeTab]}
          onPress={() => handleTabChange(tab.id)}
        >
          <Text
            style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}
          >
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 15,
    marginBottom: 15,
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    marginRight: 10,
    backgroundColor: "#ffffff",
    borderColor:"#DBDADA",
    borderWidth:1,
  },
  activeTab: {
    backgroundColor: "#1D3A76",
  },
  tabText: {
    fontSize: 12,
    color: "#000",

    fontFamily: 'PoppinsSemiBold',
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "500",
   
  },
});
