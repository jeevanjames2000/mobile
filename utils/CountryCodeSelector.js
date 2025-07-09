import { Ionicons } from "@expo/vector-icons";
import { Icon } from "native-base";
import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Dimensions,
} from "react-native";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const countries = require("./countryCodes.json");
const CountryCodeSelector = ({ selectedCode, onSelect, setCountry }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const filteredCountries = countries.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial_code.includes(search)
  );
  const [flag, setFlag] = useState("🇮🇳");
  return (
    <>
      <TouchableOpacity
        style={styles.codeContainer}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <View style={styles.codeContent}>
          <Text style={styles.codeText}>
            {flag} {selectedCode}
          </Text>
          <Text style={styles.dropdownIcon}>
            <Icon as={Ionicons} name="chevron-down" size={4} color="#000" />
          </Text>
        </View>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View
            style={styles.modalContainer}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.header}>
              <Text style={styles.headerText}>Select Country Code</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              placeholder="Search country"
              style={styles.searchInput}
              value={search}
              onChangeText={setSearch}
            />
            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => {
                    onSelect(item.dial_code);
                    setCountry(item.name);
                    setFlag(item.flag);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.countryText}>
                    {item.flag} {item.name} ({item.dial_code})
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
const styles = StyleSheet.create({
  codeContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderRadius: 30,
    marginRight: 10,
    borderWidth: 0.4,
    borderColor: "#1D3A76",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  codeContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  codeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  dropdownIcon: {
    fontSize: 12,
    marginLeft: 4,
    color: "#555",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: SCREEN_HEIGHT * 0.5,
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    fontSize: 18,
    color: "#333",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  countryItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  countryText: {
    fontSize: 16,
    color: "#333",
  },
});
export default CountryCodeSelector;
