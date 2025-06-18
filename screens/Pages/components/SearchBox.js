import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
} from "react-native";
import {
  View,
  HStack,
  Text,
  Actionsheet,
  useDisclose,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Toast,
  Box,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import { BackHandler } from "react-native";
import {
  setCities,
} from "../../../store/slices/propertyDetails";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  setBHK,
  setOccupancy,
  setPropertyIn,
  setSearchData,
  setSubType,
  setPropertyFor,
  setCity,
  setPossesionStatus,
} from "../../../store/slices/searchSlice";
import CustomHeaderFilter from "./SearchBarComponents/CustomHeaderFilter";
import { PropertyTypeIcon } from "./SearchBarComponents/PropertyIcon";
import { FilterSection } from "./SearchBarComponents/FilterSection";
import { FilterOption } from "./SearchBarComponents/FilterOption";
import SearchBarSection from "./SearchBarComponents/SearchBarSection";

export default function SearchBox() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { isOpen, onOpen, onClose } = useDisclose();
  const {
    tab,
    property_in,
    sub_type,
    bhk,
    occupancy,
    price,
    location,
    property_cost,
    property_for,
    city,
  } = useSelector((state) => state.search, shallowEqual);
  const searchData = useSelector((state) => state.search);
  
  const cities = useSelector((state) => state.property.cities, shallowEqual);
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState(location || "");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPropertyType, setSelectedPropertyType] = useState(tab || "Buy");
  const [selectedBuildingType, setSelectedBuildingType] = useState(
    property_in || "Residential"
  );
  const [selectedBudget, setSelectedBudget] = useState(property_cost || "");
  const [selectedSubPropertyType, setSelectedSubPropertyType] = useState(
    sub_type || "Apartment"
  );
  const [selectedBedrooms, setSelectedBedrooms] = useState(bhk || "");
  const [selectedFurnishing, setSelectedFurnishing] = useState("");
  const [selectedPostedBy, setSelectedPostedBy] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedPossession, setSelectedPossession] = useState(occupancy || "");
  const inputRef = useRef(null);

  const mapTabToPropertyFor = (tab) => {
    const mapping = {
      Buy: "Sell",
      Rent: "Rent",
      Plot: "Sell",
      Commercial: "Sell",
    };
    return mapping[tab] || "Sell";
  };

  useEffect(() => {
    setSelectedPropertyType(tab || "Buy");
    setSelectedBuildingType(property_in || "Residential");
    setSelectedSubPropertyType(sub_type || "Apartment");
    if (property_in === "Commercial") {
      setSelectedSubPropertyType(sub_type || "Retail Shop");
    } else if (tab === "Plot") {
      setSelectedSubPropertyType("Plot");
    } else {
      setSelectedSubPropertyType(sub_type || "Apartment");
    }
    setSelectedBedrooms(bhk || "");
    setSelectedPossession(occupancy || "");
    setSearchQuery(location || "");
  }, [tab, property_in, sub_type, bhk, occupancy, location]);

  const togglePropertyType = (type) => {
    setSelectedPropertyType(type);
    const propertyFor = mapTabToPropertyFor(type);
    const payload = {
      tab: type,
      property_for: propertyFor,
      property_in: "",
      sub_type: "",
      bhk: null,
      occupancy: "",
      property_cost: propertyFor === "Rent" ? "" : property_cost,
    };
    if (type === "Plot") {
      payload.sub_type = "Plot";
      payload.property_in = "";
    } else if (type === "Commercial") {
      payload.property_in = "Commercial";
      payload.sub_type = "Retail Shop";
    } else if (type === "Buy" || type === "Rent") {
      payload.property_in = "Residential";
      payload.sub_type = "Apartment";
    }
    setSelectedBuildingType(payload.property_in || "Residential");
    setSelectedSubPropertyType(payload.sub_type || "Apartment");
    setSelectedBedrooms("");
    setSelectedPossession("");
    setSelectedBudget(propertyFor === "Rent" ? "" : selectedBudget);
    dispatch(setSearchData(payload));
  };

  const toggleBuildingType = (type) => {
    setSelectedBuildingType(type);
    dispatch(setPropertyIn(type));
    if (type === "Commercial") {
      const defaultSubType = "Retail Shop";
      const defaultPossession = "Ready to move";
      setSelectedSubPropertyType(defaultSubType);
      dispatch(setSubType(defaultSubType));
      setSelectedPossession(defaultPossession);
      dispatch(setOccupancy(defaultPossession));
      dispatch(setPossesionStatus(defaultPossession));
      setSelectedBedrooms("");
      dispatch(setBHK(null));
    } else {
      setSelectedSubPropertyType("Apartment");
      dispatch(setSubType("Apartment"));
      setSelectedPossession("");
      dispatch(setOccupancy(""));
      dispatch(setPossesionStatus(""));
    }
  };

  const toggleSubPropertyType = (type) => {
    const validResidentialSubTypes = [
      "Apartment",
      "Independent Villa",
      "Independent House",
      "Plot",
      "Land",
      "Others",
    ];
    const validCommercialSubTypes = [
      "Office",
      "Retail Shop",
      "Showroom",
      "Warehouse",
      "Plot",
      "Others",
    ];
    const validSubTypes =
      selectedBuildingType === "Commercial"
        ? validCommercialSubTypes
        : validResidentialSubTypes;
    if (validSubTypes.includes(type)) {
      setSelectedSubPropertyType(type);
      dispatch(setSubType(type));
      if (["Plot", "Land", "Others"].includes(type)) {
        setSelectedBedrooms("");
        dispatch(setBHK(null));
      }
    }
  };

  const toggleBedroom = (type) => {
    const validBHKs = [
      "1 BHK",
      "2 BHK",
      "3 BHK",
      "4 BHK",
      "5 BHK",
      "6 BHK",
      "7 BHK",
      "8 BHK",
    ];
    if (validBHKs.includes(type)) {
      setSelectedBedrooms(type);
      dispatch(setBHK(type));
    }
  };

  const toggleFurnishing = (type) => setSelectedFurnishing(type);
  const togglePostedBy = (type) => setSelectedPostedBy(type);
  const toggleAmenity = (type) =>
    setSelectedAmenities((prev) =>
      prev.includes(type)
        ? prev.filter((item) => item !== type)
        : [...prev, type]
    );

  const Budget = [
    { label: "Up to 50 Lakhs", value: "50" },
    { label: "50-75 Lakhs", value: "50-75" },
    { label: "75 Lakhs+", value: "75+" },
  ];

  const toggleBudget = (value) => {
    setSelectedBudget(value);
    dispatch(setSearchData({ property_cost: value }));
  };

  const togglePossession = (type) => {
    const isPlotOrLand = ["Plot", "Land"].includes(selectedSubPropertyType);
    const validPossessionStatuses = property_for === "Rent"
      ? ["Ready to move In"]
      : isPlotOrLand
      ? ["Future", "Immediate"]
      : ["Ready to move", "Under Construction"];

    if (validPossessionStatuses.includes(type)) {
      setSelectedPossession(type);
      dispatch(setOccupancy(type));
      dispatch(setPossesionStatus(type));
    } else if (property_for === "Rent" && type !== "Ready to move") {
      setSelectedPossession("Ready to move");
      dispatch(setOccupancy("Ready to move"));
      dispatch(setPossesionStatus("Ready to move"));
    }
  };

  useEffect(() => {
    const loadCitiesFromStorage = async () => {
      try {
        setLoading(true);
        const storedCities = await AsyncStorage.getItem("cachedCities");
        if (storedCities) {
          const parsedCities = JSON.parse(storedCities);
          dispatch(setCities(parsedCities));
        } else {
          const response = await fetch(
            "https://api.meetowner.in/api/v1/getAllCities"
          );
          const data = await response.json();
          const formattedCities = data.map((cityObj) => ({
            label: cityObj.city,
            value: cityObj.city,
          }));
          dispatch(setCities(formattedCities));
          await AsyncStorage.setItem(
            "cachedCities",
            JSON.stringify(formattedCities)
          );
        }
      } catch (error) {
        console.error("Error loading cities:", error);
        try {
          const response = await fetch(
            "https://api.meetowner.in/api/v1/getAllCities"
          );
          const data = await response.json();
          const formattedCities = data.map((cityObj) => ({
            label: cityObj.city,
            value: cityObj.city,
          }));
          dispatch(setCities(formattedCities));
          await AsyncStorage.setItem(
            "cachedCities",
            JSON.stringify(formattedCities)
          );
        } catch (fetchError) {
          console.error("Error fetching cities from API:", fetchError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadCitiesFromStorage();
  }, [dispatch]);

  useEffect(() => {
    setLocations(cities);
    setFilteredLocations(cities);
    if (city && cities.length > 0) {
      const matchedCity = cities.find(
        (c) => c.label.toLowerCase() === city.toLowerCase()
      );
      if (matchedCity) {
        setSelectedLocation({
          label: matchedCity.label,
          value: matchedCity.value,
        });
      } else {
        setSelectedLocation(null);
      }
    } else {
      setSelectedLocation(null);
    }
  }, [city, cities]);

  const handleCitySearch = (query) => {
    setSearchQuery(query);
    setFilteredLocations(
      query === ""
        ? locations
        : locations.filter((loc) =>
            loc.label.toLowerCase().includes(query.toLowerCase())
          )
    );
  };

  const handleCitySelect = (item) => {
    setSelectedLocation(item);
    dispatch(setCity(item.label)); // Dispatch setCity
    onClose();
    setSearchQuery("");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleCitySelect(item)}
      style={styles.fullWidthItem}
    >
      <Text style={styles.fullWidthText}>{item.label}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        Alert.alert("Exit App", "Do you want to exit?", [
          { text: "Cancel", style: "cancel" },
          { text: "Exit", onPress: () => BackHandler.exitApp() },
        ]);
      }
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [navigation]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <CustomHeaderFilter
          navigation={navigation}
          title="Filters"
          handleClearAll={handleClearAll}
        />
      ),
    });
  }, [navigation, handleClearAll]);

  const handleClearAll = () => {
    setSelectedPropertyType("Buy");
    setSelectedBuildingType("Residential");
    setSelectedSubPropertyType("Apartment");
    setSelectedBedrooms("");
    setSelectedPossession("");
    setSelectedFurnishing("");
    setSelectedPostedBy("");
    setSelectedAmenities([]);
    setSelectedLocation(null);
    setSearchQuery("");
    setFilteredLocations(locations);
    setSelectedBudget("");
    dispatch(
      setSearchData({
        tab: "Buy",
        property_for: "Sell",
        property_in: "Residential",
        sub_type: "Apartment",
        bhk: null,
        occupancy: "",
        location: "",
        budget: "",
        price: "Relevance",
        plot_subType: "Buy",
        commercial_subType: "Buy",
        property_cost: "",
        city: "", // Clear city in Redux
      })
    );
    Toast.show({
      duration: 1000,
      placement: "top-right",
      render: () => {
        return (
          <Box bg="green.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
            Filters cleared
          </Box>
        );
      },
    });
  };

  const handlePropertiesLists = () => {
    navigation.navigate("PropertyList");
  };

  const residentialPropertyTypes = [
    "Apartment",
    "Independent Villa",
    "Independent House",
    "Plot",
    "Land",
    "Others",
  ];
  const commercialPropertyTypes = [
    "Office",
    "Retail Shop",
    "Showroom",
    "Warehouse",
    "Plot",
    "Others",
  ];
  const propertyTypes =
    selectedBuildingType === "Commercial" || selectedPropertyType === "Commercial"
      ? commercialPropertyTypes
      : residentialPropertyTypes;
  const isPlotOrLand = ["Plot", "Land"].includes(selectedSubPropertyType);
  const possessionStatuses = property_for === "Rent"
    ? ["Ready to move In"]
    : isPlotOrLand
      ? ["Future", "Immediate"]
      : ["Ready to move", "Under Construction"];

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.shadowSection}>
          <View style={styles.locationSection}>
            <Text style={styles.locationLabel}>You are searching in</Text>
            <TouchableOpacity style={styles.cityButton} onPress={onOpen}>
              <HStack space={1} alignItems="center">
                <Text style={styles.cityText}>
                  {selectedLocation?.label || city || "Select City"}
                </Text>
                <Ionicons name="chevron-down" size={20} color="gray" />
              </HStack>
            </TouchableOpacity>
          </View>
          <View style={styles.propertyTypeIconsContainer}>
            <PropertyTypeIcon
              type="Buy"
              icon="home"
              selected={selectedPropertyType === "Buy"}
              onPress={() => togglePropertyType("Buy")}
            />
            <PropertyTypeIcon
              type="Rent"
              icon="key"
              selected={selectedPropertyType === "Rent"}
              onPress={() => togglePropertyType("Rent")}
            />
            <PropertyTypeIcon
              type="Plot"
              icon="map"
              selected={selectedPropertyType === "Plot"}
              onPress={() => togglePropertyType("Plot")}
            />
            <PropertyTypeIcon
              type="Commercial"
              icon="building"
              selected={selectedPropertyType === "Commercial"}
              onPress={() => togglePropertyType("Commercial")}
            />
          </View>
        </View>
        <SearchBarSection />
        {(selectedPropertyType === "Plot" || selectedPropertyType === "Commercial") && (
          <FilterSection title="Looking For">
            <View style={styles.filterOptionsRow}>
              <FilterOption
                label="Buy"
                selected={searchData.property_for === "Sell"}
                onPress={() => dispatch(setPropertyFor("Sell"))}
                checkmark={true}
              />
              <FilterOption
                label="Rent"
                selected={searchData.property_for === "Rent"}
                onPress={() => dispatch(setPropertyFor("Rent"))}
                checkmark={true}
              />
            </View>
          </FilterSection>
        )}
        <FilterSection title="Building Type">
          <View style={styles.filterOptionsRow}>
            <FilterOption
              label="Residential"
              selected={selectedBuildingType === "Residential"}
              onPress={() => toggleBuildingType("Residential")}
              checkmark={true}
            />
            <FilterOption
              label="Commercial"
              selected={selectedBuildingType === "Commercial"}
              onPress={() => toggleBuildingType("Commercial")}
              checkmark={true}
            />
          </View>
        </FilterSection>
        <FilterSection title="Property Type">
          <View style={styles.filterOptionsGrid}>
            {propertyTypes.map((type) => (
              <FilterOption
                key={type}
                label={type}
                selected={selectedSubPropertyType === type}
                onPress={() => toggleSubPropertyType(type)}
              />
            ))}
          </View>
        </FilterSection>
        {selectedBuildingType !== "Commercial" &&
          selectedPropertyType !== "Commercial" &&
          selectedSubPropertyType !== "Land" &&
          selectedSubPropertyType !== "Plot" && (
            <FilterSection title="Bedrooms">
              <View style={styles.filterOptionsRow}>
                {["1 BHK", "2 BHK", "3 BHK", "4 BHK"].map((bhk) => (
                  <FilterOption
                    key={bhk}
                    label={bhk}
                    selected={selectedBedrooms === bhk}
                    onPress={() => toggleBedroom(bhk)}
                  />
                ))}
              </View>
              <View style={styles.filterOptionsRow}>
                {["5 BHK", "6 BHK", "7 BHK", "8 BHK"].map((bhk) => (
                  <FilterOption
                    key={bhk}
                    label={bhk}
                    selected={selectedBedrooms === bhk}
                    onPress={() => toggleBedroom(bhk)}
                  />
                ))}
              </View>
            </FilterSection>
          )}
        {(tab !== "Rent" && searchData.property_for !== "Rent") && (
          <FilterSection title="Budget">
            <View style={styles.filterOptionsRow}>
              {Budget.map((item) => (
                <FilterOption
                  key={item.value}
                  label={item.label}
                  selected={selectedBudget === item.value}
                  onPress={() => toggleBudget(item.value)}
                />
              ))}
            </View>
          </FilterSection>
        )}
        <FilterSection title="Possession Status">
          <View style={styles.filterOptionsRow}>
            {possessionStatuses.map((status) => (
              <FilterOption
                key={status}
                label={status}
                selected={selectedPossession === status}
                onPress={() => togglePossession(status)}
              />
            ))}
          </View>
        </FilterSection>
        <View style={styles.bottomSpacing} />
      </ScrollView>
      <TouchableOpacity
        style={styles.fixedExploreButton}
        onPress={handlePropertiesLists}
      >
        <HStack alignItems="center" justifyContent="center" py={4}>
          <Ionicons name="compass-outline" size={20} color="purple" />
          <Text color="#1D3A76" ml={2}>
            <Text fontWeight="bold">View all properties</Text>
          </Text>
        </HStack>
      </TouchableOpacity>
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%" }}
        >
          <Actionsheet.Content
            justifyContent="flex-start"
            alignItems="flex-start"
            maxHeight={500}
            width="100%"
          >
            <TextInput
              placeholder="Search city"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleCitySearch}
              style={styles.actionsheetInput}
              ref={inputRef}
            />
            <FlatList
              data={filteredLocations}
              keyExtractor={(item, index) => `${item.label}-${index}`}
              renderItem={renderItem}
              ListEmptyComponent={
                <Text style={{ textAlign: "center", color: "gray" }}>
                  No locations found
                </Text>
              }
              keyboardShouldPersistTaps="always"
              contentContainerStyle={{ width: "100%" }}
              style={{ width: "100%" }}
              nestedScrollEnabled={true}
            />
          </Actionsheet.Content>
        </KeyboardAvoidingView>
      </Actionsheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  shadowSection: {
    marginVertical: 20,
    marginHorizontal: 15,
    borderColor: "#E0E0E0",
    borderWidth: 0.5,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 110,
    elevation: 0.1,
    overflow: "hidden",
  },
  locationSection: {
    marginTop: 16,
    paddingHorizontal: 15,
  },
  locationLabel: {
    fontSize: 12,
    color: "#000",
    marginBottom: 4,
    fontFamily: "Poppins",
  },
  cityButton: {
    paddingHorizontal: 10,
    paddingBottom: 8,
  },
  cityText: {
    fontSize: 16,
    color: "#000",
    fontFamily: "PoppinsSemiBold",
  },
  propertyTypeIconsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 16,
    paddingHorizontal: 15,
  },
  currentLocation: {
    justifyContent: "flex-end",
    alignItems: "flex-end",
    margin: 5,
    paddingHorizontal: 15,
  },
  fixedExploreButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    zIndex: 1000,
  },
  filterOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  filterOptionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  actionsheetInput: {
    width: "100%",
    height: 50,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 16,
    fontSize: 16,
    marginVertical: 8,
  },
  fullWidthItem: {
    flex: 1,
    width: "100%",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  fullWidthText: {
    fontSize: 16,
    color: "#333",
  },
  bottomSpacing: {
    height: 100,
  },
});