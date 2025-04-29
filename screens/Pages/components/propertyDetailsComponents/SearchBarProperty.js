import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Text as RNText,
  FlatList,
  ActivityIndicator,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  Box,
  HStack,
  Text,
  Actionsheet,
  VStack,
  Pressable,
  useDisclose,
} from "native-base";
import FilterIcon from "../../../../assets/propertyicons/filter.png";
import SortIcon from "../../../../assets/propertyicons/sort.png";
import { FilterSection } from "../SearchBarComponents/FilterSection";
import { FilterOption } from "../SearchBarComponents/FilterOption";
import debounce from "lodash/debounce";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { setBHK, setOccupancy, setPropertyIn, setSearchData, setSubType,setLocation,setPrice } from "../../../../store/slices/searchSlice";
const mapTabToPropertyFor = (tab) => {
  const mapping = {
    Buy: "Sell",
    Rent: "Rent",
    Plot: "Sell",
    Commercial: "Sell",
  };
  return mapping[tab] || "Sell";
};
const SearchBarProperty = ({
  searchQuery,
  setSearchQuery,
  handleLocationSearch,
  fetchProperties,
  filters,
  setFilters,
  selectedCity="Hyderabad",
}) => {
  const { isOpen: isFilterOpen, onOpen: onOpenFilter, onClose: onCloseFilter } = useDisclose();
  const { isOpen: isSortOpen, onOpen: onOpenSort, onClose: onCloseSort } = useDisclose();
  const dispatch = useDispatch();
  const { tab, property_in, sub_type, bhk, occupancy, location ,price } = useSelector(
    (state) => state.search
  );
  const [localSearchQuery, setLocalSearchQuery] = useState(location || searchQuery || "");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSuggestions, setRecentSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const MAX_CACHE_SIZE = 5;
    const [selectedBuildingType, setSelectedBuildingType] = useState(
      property_in || filters.property_in || (tab === "Commercial" ? "Commercial" : tab === "Plot" ? "" : "Residential")
    );
    const [selectedSubPropertyType, setSelectedSubPropertyType] = useState(
      sub_type || filters.sub_type || (tab === "Plot" ? "Plot" : tab === "Commercial" ? "" : "Apartment")
    );
    const [selectedBedrooms, setSelectedBedrooms] = useState(bhk || filters.bedrooms || "");
    const [selectedPossession, setSelectedPossession] = useState(occupancy || filters.occupancy || "");
    const [selectedSort, setSelectedSort] = useState(price || filters.priceFilter || "Relevance");
    const sortOptions = [
      "Relevance",
      "Price: Low to High",
      "Price: High to Low",
      "Newest First",
    ];
    useEffect(() => {
      setLocalSearchQuery(location || searchQuery || "");
      setSelectedBuildingType(
        property_in || filters.property_in || (tab === "Commercial" ? "Commercial" : tab === "Plot" ? "" : "Residential")
      );
      setSelectedSubPropertyType(
        sub_type || filters.sub_type || (tab === "Plot" ? "Plot" : tab === "Commercial" ? "" : "Apartment")
      );
      setSelectedBedrooms(bhk || filters.bedrooms || "");
      setSelectedPossession(occupancy || filters.occupancy || "");
      setSelectedSort(price || filters.priceFilter || "Relevance");
      if (["Plot", "Land", "Others"].includes(sub_type) || property_in === "Commercial") {
        setSelectedBedrooms("");
      }
    }, [tab, property_in, sub_type, bhk, occupancy, location, price, searchQuery, filters]);
  useEffect(() => {
    const loadRecentSuggestions = async () => {
      try {
        const cachedSuggestions = await AsyncStorage.getItem("recentSuggestions");
        if (cachedSuggestions) {
          setRecentSuggestions(JSON.parse(cachedSuggestions));
        }
      } catch (error) {
        console.error("Error loading recent suggestions:", error);
      }
    };
    loadRecentSuggestions();
  }, []);
  const saveToCache = async (newSuggestion) => {
    try {
      let updatedSuggestions = [newSuggestion, ...recentSuggestions];
      updatedSuggestions = Array.from(
        new Map(updatedSuggestions.map((item) => [item.value, item])).values()
      ).slice(0, MAX_CACHE_SIZE);
      await AsyncStorage.setItem("recentSuggestions", JSON.stringify(updatedSuggestions));
      setRecentSuggestions(updatedSuggestions);
    } catch (error) {
      console.error("Error saving to cache:", error);
    }
  };
  const fetchSuggestions = async (city, query) => {
    if (!query || query.length < 3 || !city) {
      setSuggestions(recentSuggestions);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.meetowner.in/api/v1/search?query=${encodeURIComponent(
          query
        )}&city=${encodeURIComponent(city)}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const formattedSuggestions = data.map((item) => ({
        label: item.locality,
        value: item.locality,
      }));
      const uniqueSuggestions = [
        ...recentSuggestions,
        ...formattedSuggestions.filter(
          (suggestion) => !recentSuggestions.some((recent) => recent.value === suggestion.value)
        ),
      ].slice(0, 10);
      setSuggestions(uniqueSuggestions);
      if (formattedSuggestions.length > 0) {
        saveToCache(formattedSuggestions[0]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions(recentSuggestions);
    } finally {
      setLoading(false);
    }
  };
  const debouncedFetchSuggestions = useCallback(
    debounce((city, query) => fetchSuggestions(city, query), 300),
    [recentSuggestions]
  );
  const handleSearch = useCallback(
    (query) => {
      setLocalSearchQuery(query);
      setSearchQuery(query);
      dispatch(setLocation(query));
      handleLocationSearch(query);
      const city = selectedCity;
      if (query.trim().length >= 3) {
        debouncedFetchSuggestions(city, query);
      } else {
        setSuggestions(recentSuggestions);
      }
    },
    [selectedCity, setSearchQuery, handleLocationSearch, recentSuggestions, debouncedFetchSuggestions, dispatch]
  );
  const handleClear = () => {
    setLocalSearchQuery("");
    setSearchQuery("");
    dispatch(setLocation(""));
    handleLocationSearch("");
    setSuggestions([]);
    fetchProperties(true, filters, "Hyderabad");
  };
  const handleSuggestionSelect = (item) => {
    setLocalSearchQuery(item.label);
    setSearchQuery(item.label);
    dispatch(setLocation(item.label));
    handleLocationSearch(item.label);
    setSuggestions([]);
    fetchProperties(true, filters, item.label);
  };
  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => handleSuggestionSelect(item)}
    >
      <Text style={styles.suggestionText}>{item.label}</Text>
    </TouchableOpacity>
  );
  const toggleBuildingType = (type) => {
    setSelectedBuildingType(type);
    if (type === "Commercial") {
      setSelectedSubPropertyType("");
      setSelectedBedrooms("");
    } else {
      setSelectedSubPropertyType("Apartment");
    }
  };
  const toggleSubPropertyType = (type) => {
    setSelectedSubPropertyType(type);
    if (["Plot", "Land", "Others"].includes(type)) {
      setSelectedBedrooms("");
    }
  };
  const toggleBedroom = (type) => setSelectedBedrooms(type);
  const togglePossession = (type) => setSelectedPossession(type);
  const applyFilters = () => {
    const updatedFilters = {
      ...filters,
      property_for: mapTabToPropertyFor(tab),
      property_in: selectedBuildingType,
      sub_type: selectedSubPropertyType,
      bedrooms: selectedBedrooms,
      occupancy: selectedPossession,
      priceFilter: selectedSort,
      search: localSearchQuery.trim() || "Hyderabad",
      property_status: 1,
    };
    setFilters(updatedFilters);
    dispatch(setPropertyIn(selectedBuildingType));
    dispatch(setSubType(selectedSubPropertyType));
    dispatch(setBHK(selectedBedrooms));
    dispatch(setOccupancy(selectedPossession));
    dispatch(setPrice(selectedSort));
    if (["Plot", "Land", "Others"].includes(selectedSubPropertyType) || selectedBuildingType === "Commercial") {
      dispatch(setBHK(""));
      updatedFilters.bedrooms = "";
    }
    fetchProperties(true, updatedFilters, localSearchQuery.trim() || "Hyderabad");
    onCloseFilter();
  };
  const clearAllFilters = () => {
    const defaultBuildingType = tab === "Commercial" ? "Commercial" : tab === "Plot" ? "" : "Residential";
    const defaultSubType = tab === "Plot" ? "Plot" : tab === "Commercial" ? "" : "Apartment";
    setSelectedBuildingType(defaultBuildingType);
    setSelectedSubPropertyType(defaultSubType);
    setSelectedBedrooms("");
    setSelectedPossession("");
    setSelectedSort("Relevance");
    const defaultFilters = {
      property_for: mapTabToPropertyFor(tab),
      property_in: defaultBuildingType,
      sub_type: defaultSubType,
      search: "",
      bedrooms: "",
      property_cost: "",
      priceFilter: "Relevance",
      occupancy: "",
      property_status: 1,
    };
    setFilters(defaultFilters);
    dispatch(setPropertyIn(defaultBuildingType));
    dispatch(setSubType(defaultSubType));
    dispatch(setBHK(""));
    dispatch(setOccupancy(""));
    dispatch(setLocation(""));
    dispatch(setPrice("Relevance"));
    fetchProperties(true, defaultFilters, "Hyderabad");
    onCloseFilter();
  };
  const handleSortSelect = (sortOption) => {
    setSelectedSort(sortOption);
    const updatedFilters = { ...filters, priceFilter: sortOption };
    setFilters(updatedFilters);
    dispatch(setPrice(sortOption));
    fetchProperties(true, updatedFilters, localSearchQuery.trim() || "Hyderabad");
    onCloseSort();
  };
  return (
    <View style={styles.container}>
      {}
      <View style={styles.searchWrapper}>
        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <Ionicons
              name="search"
              size={15}
              color="gray"
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search city "
              placeholderTextColor="#999"
              value={localSearchQuery}
              onChangeText={handleSearch}
              style={styles.textInput}
              ref={inputRef}
            />
            {localSearchQuery.trim() !== "" && (
              <TouchableOpacity onPress={handleClear} style={styles.cancelIcon}>
                <Ionicons name="close-circle" size={20} color="gray" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity style={styles.avatarButton} onPress={onOpenFilter}>
            <Box
              width={36}
              height={36}
              borderRadius={18}
              backgroundColor="#DDE8FF"
              alignItems="center"
              justifyContent="center"
            >
              <Image
                source={FilterIcon}
                style={{ width: 20, height: 20, tintColor: "#000" }}
                resizeMode="contain"
                alt="filterIcon"
              />
            </Box>
          </TouchableOpacity>
        </View>
        {}
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color="#999" />
          </View>
        ) : suggestions.length > 0 ? (
          <View style={styles.suggestionsContainer}>
            <FlatList
              data={suggestions}
              keyExtractor={(item) => item.label}
              renderItem={renderSuggestionItem}
              style={styles.suggestionsList}
            />
          </View>
        ) : null}
      </View>
      {}
      <View style={styles.sortWrapper}>
        <TouchableOpacity style={styles.sortContainer} onPress={onOpenSort}>
          <HStack alignItems="center">
            <Text style={styles.sortText}>Sort by</Text>
            <Image
              source={SortIcon}
              style={{ width: 10, height: 10, tintColor: "#000", marginTop: 3 }}
              resizeMode="contain"
              alt="sortIcon"
            />
          </HStack>
        </TouchableOpacity>
      </View>
      {}
      <Actionsheet isOpen={isFilterOpen} onClose={onCloseFilter}>
        <Actionsheet.Content maxHeight={700} backgroundColor={"#FFFFFF"}>
          <TouchableOpacity style={styles.closeIcon} onPress={clearAllFilters}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <ScrollView
            style={{ width: "100%" }}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          >
            <VStack width="100%" p={1}>
              <Text style={styles.filterText}>Filters</Text>
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
                  <FilterOption
                    label="Apartment"
                    selected={selectedSubPropertyType === "Apartment"}
                    onPress={() => toggleSubPropertyType("Apartment")}
                  />
                  <FilterOption
                    label="Independent Villa"
                    selected={selectedSubPropertyType === "Independent Villa"}
                    onPress={() => toggleSubPropertyType("Independent Villa")}
                  />
                  <FilterOption
                    label="Independent House"
                    selected={selectedSubPropertyType === "Independent House"}
                    onPress={() => toggleSubPropertyType("Independent House")}
                  />
                  <FilterOption
                    label="Plot"
                    selected={selectedSubPropertyType === "Plot"}
                    onPress={() => toggleSubPropertyType("Plot")}
                  />
                  <FilterOption
                    label="Land"
                    selected={selectedSubPropertyType === "Land"}
                    onPress={() => toggleSubPropertyType("Land")}
                  />
                  <FilterOption
                    label="Others"
                    selected={selectedSubPropertyType === "Others"}
                    onPress={() => toggleSubPropertyType("Others")}
                  />
                </View>
              </FilterSection>
              <FilterSection title="Bedrooms">
                <View style={styles.filterOptionsRow}>
                  <FilterOption
                    label="1 BHK"
                    selected={selectedBedrooms === "1 BHK"}
                    onPress={() => toggleBedroom("1 BHK")}
                  />
                  <FilterOption
                    label="2 BHK"
                    selected={selectedBedrooms === "2 BHK"}
                    onPress={() => toggleBedroom("2 BHK")}
                  />
                  <FilterOption
                    label="3 BHK"
                    selected={selectedBedrooms === "3 BHK"}
                    onPress={() => toggleBedroom("3 BHK")}
                  />
                </View>
                <View style={styles.filterOptionsRow}>
                  <FilterOption
                    label="4 BHK"
                    selected={selectedBedrooms === "4 BHK"}
                    onPress={() => toggleBedroom("4 BHK")}
                  />
                  <FilterOption
                    label="5 BHK"
                    selected={selectedBedrooms === "5 BHK"}
                    onPress={() => toggleBedroom("5 BHK")}
                  />
                  <FilterOption
                    label="6 BHK"
                    selected={selectedBedrooms === "6 BHK"}
                    onPress={() => toggleBedroom("6 BHK")}
                  />
                  <FilterOption
                    label="7 BHK"
                    selected={selectedBedrooms === "7 BHK"}
                    onPress={() => toggleBedroom("7 BHK")}
                  />
                   <FilterOption
                    label="8 BHK"
                    selected={selectedBedrooms === "8 BHK"}
                    onPress={() => toggleBedroom("8 BHK")}
                  />
                </View>
              </FilterSection>
              {/* <FilterSection title="Furnishing Status">
                <View style={styles.filterOptionsRow}>
                  <FilterOption
                    label="Furnished"
                    selected={selectedFurnishing === "Furnished"}
                    onPress={() => toggleFurnishing("Furnished")}
                  />
                  <FilterOption
                    label="Semi-Furnished"
                    selected={selectedFurnishing === "Semi-Furnished"}
                    onPress={() => toggleFurnishing("Semi-Furnished")}
                  />
                </View>
                <View style={styles.filterOptionsRow}>
                  <FilterOption
                    label="Unfurnished"
                    selected={selectedFurnishing === "Unfurnished"}
                    onPress={() => toggleFurnishing("Unfurnished")}
                  />
                  <FilterOption
                    label="Gated"
                    selected={selectedFurnishing === "Gated"}
                    onPress={() => toggleFurnishing("Gated")}
                  />
                </View>
              </FilterSection> */}
              {/* <FilterSection title="Posted By">
                <View style={styles.filterOptionsRow}>
                  <FilterOption
                    label="Owner"
                    selected={selectedPostedBy === "Owner"}
                    onPress={() => togglePostedBy("Owner")}
                  />
                  <FilterOption
                    label="Partner Agents"
                    selected={selectedPostedBy === "Partner Agents"}
                    onPress={() => togglePostedBy("Partner Agents")}
                  />
                </View>
              </FilterSection> */}
              {/* <FilterSection title="Amenities">
                <View style={styles.filterOptionsRow}>
                  <FilterOption
                    label="24*7 Security"
                    selected={selectedAmenities.includes("24*7 Security")}
                    onPress={() => toggleAmenity("24*7 Security")}
                  />
                  <FilterOption
                    label="Central AC"
                    selected={selectedAmenities.includes("Central AC")}
                    onPress={() => toggleAmenity("Central AC")}
                  />
                </View>
                <View style={styles.filterOptionsRow}>
                  <FilterOption
                    label="Visitor's Parking"
                    selected={selectedAmenities.includes("Visitor's Parking")}
                    onPress={() => toggleAmenity("Visitor's Parking")}
                  />
                  <FilterOption
                    label="Club House"
                    selected={selectedAmenities.includes("Club House")}
                    onPress={() => toggleAmenity("Club House")}
                  />
                </View>
                <View style={styles.filterOptionsRow}>
                  <FilterOption
                    label="Swimming Pool"
                    selected={selectedAmenities.includes("Swimming Pool")}
                    onPress={() => toggleAmenity("Swimming Pool")}
                  />
                  <FilterOption
                    label="Power Backup"
                    selected={selectedAmenities.includes("Power Backup")}
                    onPress={() => toggleAmenity("Power Backup")}
                  />
                </View>
                <View style={styles.filterOptionsRow}>
                  <FilterOption
                    label="Waiting/ Reception Room"
                    selected={selectedAmenities.includes("Waiting/ Reception Room")}
                    onPress={() => toggleAmenity("Waiting/ Reception Room")}
                  />
                </View>
              </FilterSection> */}
              <FilterSection title="Possession Status">
                <View style={styles.filterOptionsRow}>
                  <FilterOption
                    label="Ready to Move"
                    selected={selectedPossession === "Ready to Move"}
                    onPress={() => togglePossession("Ready to Move")}
                  />
                  <FilterOption
                    label="Under Construction"
                    selected={selectedPossession === "Under Construction"}
                    onPress={() => togglePossession("Under Construction")}
                  />
                </View>
              </FilterSection>
            </VStack>
          </ScrollView>
          <View style={styles.submitButtonContainer}>
            <Pressable onPress={applyFilters} style={styles.submitButton}>
              <Text color="white" fontSize="md" bold>
                Submit
              </Text>
            </Pressable>
          </View>
        </Actionsheet.Content>
      </Actionsheet>
      {}
      <Actionsheet isOpen={isSortOpen} onClose={onCloseSort}>
        <Actionsheet.Content backgroundColor="#FFFFFF">
          <TouchableOpacity style={styles.closeIcon} onPress={onCloseSort}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <VStack width="100%" alignItems="center">
            <Text style={styles.sortTitle}>Sort</Text>
            <View style={styles.sortDivider} />
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.sortOption,
                  selectedSort === option && styles.sortOptionSelected,
                ]}
                onPress={() => handleSortSelect(option)}
              >
                <RNText
                  style={[
                    styles.sortOptionText,
                    selectedSort === option && styles.sortOptionTextSelected,
                  ]}
                >
                  {option}
                </RNText>
              </TouchableOpacity>
            ))}
          </VStack>
        </Actionsheet.Content>
      </Actionsheet>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 5,
    marginVertical: 5,
  },
  searchWrapper: {
    flex: 0.8,
    position: "relative",
  },
  sortWrapper: {
    flex: 0.2,
    marginLeft: 5,
    zIndex: 1,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 1,
  },
  inputContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    position: "relative",
  },
  searchIcon: {
    marginLeft: 5,
    color: "#000",
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    paddingLeft: 10,
    paddingRight: 10,
    paddingVertical: 8,
    fontFamily: "Poppins",
  },
  cancelIcon: {
    position: "absolute",
    right: 10,
  },
  avatarButton: {
    marginLeft: 10,
  },
  sortContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    paddingVertical: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignItems: "center",
    elevation: 3,
  },
  sortText: {
    fontSize: 10,
    fontFamily: "PoppinsSemiBold",
    marginRight: 5,
  },
  loaderContainer: {
    padding: 10,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    marginTop: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    zIndex: 10,
  },
  suggestionsContainer: {
    position: "absolute",
    top: 50,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  suggestionsList: {
    maxHeight: 200,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  suggestionText: {
    fontSize: 14,
    fontFamily: "PoppinsRegular",
    color: "#333",
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
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  submitButton: {
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderRadius: 30,
    backgroundColor: "#1D3A76",
  },
  submitButtonContainer: {
    width: "100%",
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  filterText: {
    alignItems: "center",
    textAlign: "center",
    fontFamily: "PoppinsSemiBold",
    fontSize: 16,
  },
  sortTitle: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    color: "#333",
    marginBottom: 10,
  },
  sortDivider: {
    width: 30,
    height: 2,
    backgroundColor: "#333",
    marginBottom: 10,
  },
  sortOption: {
    width: "90%",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 5,
    borderColor: "#D9D9D9",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
  },
  sortOptionSelected: {
    backgroundColor: "#E6F0FA",
    borderWidth: 1,
    borderColor: "#1D3A76",
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginVertical: 5,
  },
  sortOptionText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    fontFamily: "PoppinsSemiBold",
  },
  sortOptionTextSelected: {
    color: "#1D3A76",
    fontWeight: "bold",
    fontFamily: "PoppinsSemiBold",
  },
});
export default SearchBarProperty;
