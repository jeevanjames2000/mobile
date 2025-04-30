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
const mapTabToPropertyFor = (tab) => {
  const mapping = {
    Buy: "Sell",
    Rent: "Rent",
    Plot: "Sell",
    Commercial: "Sell",
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
      property_in: "",
      sub_type: "",
    };
    if (id === "Plot") {
      payload.sub_type = "Plot";
      payload.property_in = "";
    } else if (id === "Commercial") {
      payload.property_in = "Commercial";
      payload.sub_type = "";
    } else if (id === "Buy") {
      payload.property_in = "Residential";
      payload.sub_type = "Apartment";
    } else if (id === "Rent") {
      payload.property_in = "Residential";
      payload.sub_type = "Apartment";
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
            style={[
              styles.tabText,
              activeTab === tab.id && styles.activeTabText,
            ]}
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
    paddingHorizontal: 10,
    marginTop: 15,
    marginBottom: 15,
  },
  tab: {
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 30,
    marginRight: 8,
    backgroundColor: "#ffffff",
    borderColor: "#DBDADA",
    borderWidth: 1,
  },
  activeTab: {
    backgroundColor: "#1D3A76",
  },
  tabText: {
    fontSize: 12,
    color: "#000",
    fontFamily: "PoppinsSemiBold",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "500",
  },
});
