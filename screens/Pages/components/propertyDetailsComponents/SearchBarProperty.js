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
  Toast,
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
  selectedCity = "Hyderabad",
}) => {
  const { isOpen: isFilterOpen, onOpen: onOpenFilter, onClose: onCloseFilter } = useDisclose();
  const { isOpen: isSortOpen, onOpen: onOpenSort, onClose: onCloseSort } = useDisclose();
  const dispatch = useDispatch();
  const { tab, property_in, sub_type, bhk, occupancy, location, price } = useSelector(
    (state) => state.search
  );
  const [localSearchQuery, setLocalSearchQuery] = useState(location || searchQuery || "");
  const [suggestions, setSuggestions] = useState([]);
  const [recentSuggestions, setRecentSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const MAX_CACHE_SIZE = 5;

  const [selectedPropertyType, setSelectedPropertyType] = useState(tab || "Buy");
  const [selectedBuildingType, setSelectedBuildingType] = useState(
    property_in || filters.property_in || (tab === "Commercial" ? "Commercial" : tab === "Plot" ? "" : "Residential")
  );
  const [selectedSubPropertyType, setSelectedSubPropertyType] = useState(
    sub_type || filters.sub_type || (tab === "Plot" ? "Plot" : tab === "Commercial" ? "Office" : "Apartment")
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

  // Define property types
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

  // Determine which property types to show
  const propertyTypes =
    selectedBuildingType === "Commercial" || tab === "Commercial"
      ? commercialPropertyTypes
      : residentialPropertyTypes;

  // Determine possession statuses
  const isPlotOrLand = ["Plot", "Land"].includes(selectedSubPropertyType);
  const possessionStatuses = isPlotOrLand
    ? ["Immediate", "Future"]
    : ["Ready to Move", "Under Construction"];

  useEffect(() => {
    setLocalSearchQuery(location || searchQuery || "");
    setSelectedPropertyType(tab || "Buy");
    setSelectedBuildingType(
      property_in || filters.property_in || (tab === "Commercial" ? "Commercial" : tab === "Plot" ? "" : "Residential")
    );
    setSelectedSubPropertyType(
      sub_type || filters.sub_type || (tab === "Plot" ? "Plot" : tab === "Commercial" ? "Office" : "Apartment")
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

  const togglePropertyType = (type) => {
    setSelectedPropertyType(type);
    const payload = {
      tab: type,
      property_for: mapTabToPropertyFor(type),
      property_in: "",
      sub_type: "",
      bhk: null,
      occupancy: "",
    };
    if (type === "Plot") {
      payload.sub_type = "Plot";
      payload.property_in = "";
    } else if (type === "Commercial") {
      payload.property_in = "Commercial";
      payload.sub_type = "Office";
    } else if (type === "Buy" || type === "Rent") {
      payload.property_in = "Residential";
      payload.sub_type = "Apartment";
    }
    setSelectedBuildingType(payload.property_in || "Residential");
    setSelectedSubPropertyType(payload.sub_type || "Apartment");
    setSelectedBedrooms("");
    setSelectedPossession("");
    dispatch(setSearchData(payload));
  };


  const toggleBuildingType = (type) => {
    setSelectedBuildingType(type);
    dispatch(setPropertyIn(type));
    if (type === "Commercial") {
      setSelectedSubPropertyType("Office"); // Default to Office
      setSelectedBedrooms("");
      dispatch(setSubType("Office"));
      dispatch(setBHK(""));
    } else {
      setSelectedSubPropertyType("Apartment");
      dispatch(setSubType("Apartment"));
    }
    setSelectedPossession("");
    dispatch(setOccupancy(""));
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
      selectedBuildingType === "Commercial" || tab === "Commercial"
        ? validCommercialSubTypes
        : validResidentialSubTypes;

    if (validSubTypes.includes(type)) {
      setSelectedSubPropertyType(type);
      dispatch(setSubType(type));
      if (["Plot", "Land", "Others"].includes(type)) {
        setSelectedBedrooms("");
        dispatch(setBHK(""));
      }
    }
  };

  const toggleBedroom = (type) => {
    setSelectedBedrooms(type);
    dispatch(setBHK(type));
  };

  const togglePossession = (type) => {
    const validPossessionStatuses = isPlotOrLand
      ? ["Immediate", "Future"]
      : ["Ready to Move", "Under Construction"];
    if (validPossessionStatuses.includes(type)) {
      setSelectedPossession(type);
      dispatch(setOccupancy(type));
    }
  };

  const applyFilters = () => {
    const updatedFilters = {
      ...filters,
      property_for: mapTabToPropertyFor(selectedPropertyType),
      property_in: selectedBuildingType,
      sub_type: selectedSubPropertyType,
      bedrooms: selectedBedrooms,
      occupancy: selectedPossession,
      priceFilter: selectedSort,
      search: localSearchQuery.trim() || "Hyderabad",
      property_status: 1,
    };
    setFilters(updatedFilters);
    dispatch(setSearchData({
      tab: selectedPropertyType,
      property_for: mapTabToPropertyFor(selectedPropertyType),
      property_in: selectedBuildingType,
      sub_type: selectedSubPropertyType,
      bhk: selectedBedrooms,
      occupancy: selectedPossession,
      price: selectedSort,
      location: localSearchQuery.trim() || "Hyderabad",
    }));
    if (["Plot", "Land", "Others"].includes(selectedSubPropertyType) || selectedBuildingType === "Commercial") {
      dispatch(setBHK(""));
      updatedFilters.bedrooms = "";
    }
    fetchProperties(true, updatedFilters, localSearchQuery.trim() || "Hyderabad");
    onCloseFilter();
  };

  const clearAllFilters = () => {
    const defaultPropertyType = "Buy";
    const defaultBuildingType = "Residential";
    const defaultSubType = "Apartment";
    setSelectedPropertyType(defaultPropertyType);
    setSelectedBuildingType(defaultBuildingType);
    setSelectedSubPropertyType(defaultSubType);
    setSelectedBedrooms("");
    setSelectedPossession("");
    setSelectedSort("Relevance");
    const defaultFilters = {
      property_for: mapTabToPropertyFor(defaultPropertyType),
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
    dispatch(setSearchData({
      tab: defaultPropertyType,
      property_for: mapTabToPropertyFor(defaultPropertyType),
      property_in: defaultBuildingType,
      sub_type: defaultSubType,
      bhk: "",
      occupancy: "",
      price: "Relevance",
      location: "",
    }));
    fetchProperties(true, defaultFilters, "Hyderabad");
    onCloseFilter();

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
               <FilterSection title="Looking For">
                        <View style={styles.filterOptionsRow}>
                          <FilterOption
                            label="Buy"
                            selected={selectedPropertyType === "Buy"}
                            onPress={() => togglePropertyType("Buy")}
                            checkmark={true}
                          />
                          <FilterOption
                            label="Rent"
                            selected={selectedPropertyType === "Rent"}
                            onPress={() => togglePropertyType("Rent")}
                            checkmark={true}
                          />
                        </View>
              </FilterSection>
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
                tab !== "Commercial" &&
                selectedSubPropertyType !== "Land" &&
                selectedSubPropertyType !== "Plot" && (
                  <FilterSection title="Bedrooms">
                    <View style={styles.filterOptionsRow}>
                      {["1 BHK", "2 BHK", "3 BHK"].map((bhk) => (
                        <FilterOption
                          key={bhk}
                          label={bhk}
                          selected={selectedBedrooms === bhk}
                          onPress={() => toggleBedroom(bhk)}
                        />
                      ))}
                    </View>
                    <View style={styles.filterOptionsRow}>
                      {["4 BHK", "5 BHK", "6 BHK", "7 BHK", "8 BHK"].map((bhk) => (
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
