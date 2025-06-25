import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  View,
  HStack,
  Text,
  Actionsheet,
  useDisclose,
  FlatList,
  KeyboardAvoidingView,
  Image,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import "react-native-get-random-values";
import { useNavigation } from "@react-navigation/native";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import * as Location from "expo-location";
import { setCities } from "../../../store/slices/propertyDetails";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import LocationImage from "../../../assets/location_icon.png";
import { setCity } from "../../../store/slices/searchSlice";

export default function HerosSection({ setSelectedCity }) {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { isOpen, onOpen, onClose } = useDisclose();
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const cities = useSelector((state) => state.property.cities, shallowEqual);
  const city = useSelector((state) => state.search.city, shallowEqual);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState("");
  const inputRef = useRef(null);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const storedCities = await AsyncStorage.getItem("cachedCities");
      let formattedCities;
      if (storedCities) {
        formattedCities = JSON.parse(storedCities);
      } else {
        const response = await fetch(
          "https://api.meetowner.in/api/v1/getAllCities"
        );
        const data = await response.json();
        formattedCities = data.map((cityObj) => ({
          label: cityObj.city,
          value: cityObj.city,
        }));
        await AsyncStorage.setItem(
          "cachedCities",
          JSON.stringify(formattedCities)
        );
      }
      dispatch(setCities(formattedCities));
      setLocations(formattedCities);
      setFilteredLocations(formattedCities);
    } catch (error) {
      console.error("Error fetching cities:", error);
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
        setLocations(formattedCities);
        setFilteredLocations(formattedCities);
      } catch (fetchError) {
        console.error("Error fetching cities from API:", fetchError);
      }
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.warn("Location permission denied");
        dispatch(setCity("Unknown City"));
        setUserLocation("Unknown City");
        return;
      }
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });
      const { latitude, longitude } = location.coords;
      const geocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (geocode.length > 0) {
        const cityName = geocode[0]?.city || "Unknown City";
        setUserLocation(cityName);
        dispatch(setCity(cityName));
      }
    } catch (error) {
      console.error("Error getting user location:", error);
      dispatch(setCity("Unknown City"));
      setUserLocation("Unknown City");
    }
  };

  useEffect(() => {
    fetchCities();
    if (!city) {
      getUserLocation();
    }
  }, [dispatch, city]);

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
        setSelectedCity(matchedCity);
      } else {
        setSelectedLocation(null);
        setSelectedCity(null);
      }
    } else {
      setSelectedLocation(null);
      setSelectedCity(null);
    }
  }, [cities, city, setSelectedCity]);

  const fetchProfileDetails = async () => {
    try {
      const storedDetails = await AsyncStorage.getItem("userdetails");
      if (!storedDetails) {
        return;
      }
      const parsedUserDetails = JSON.parse(storedDetails);
      const response = await axios.get(
        `https://meetowner.in/Api/api?table=users&mobile=${parsedUserDetails?.mobile}&key=meetowner_universal&transc=get_user_det_by_mobile`
      );
      const fetchedData = response.data;
      if (Array.isArray(fetchedData) && fetchedData.length > 0) {
        const data = fetchedData[0];
        await AsyncStorage.setItem("userdetails");
      }
    } catch (error) {
      console.error("Error fetching profile details:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100); // Reduced delay for faster focus
    }
    fetchProfileDetails();
  }, [isOpen]);

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
    setSelectedCity(item);
    dispatch(setCity(item.label));
    onClose();
    setSearchQuery("");
  };

  const handlePropertiesLists = () => {
    navigation.navigate("SearchBox");
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => handleCitySelect(item)}
      style={styles.fullWidthItem}
    >
      <Text style={styles.fullWidthText}>{item.label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.cityButton} onPress={onOpen}>
          <HStack space={1} alignItems="center">
            <Text style={styles.cityText}>
              {selectedLocation?.label || city || "Select City"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="gray" />
          </HStack>
        </TouchableOpacity>
        <View style={{ flex: 1, position: "relative" }}>
          <TextInput
            placeholder="Search locality"
            value={searchQuery}
            placeholderTextColor="#999"
            onPressIn={handlePropertiesLists}
            selectTextOnFocus={false}
            style={styles.textInput}
          />
        </View>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={handlePropertiesLists}
        >
          <Image
            source={LocationImage}
            alt="locationImage"
            style={{ width: 30, height: 30 }}
          />
        </TouchableOpacity>
      </View>
      {loading && (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      )}
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
                <Text
                  style={{ textAlign: "center", color: "gray", padding: 16 }}
                >
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
    backgroundColor: "#ffffff",
    marginTop: 0,
    paddingHorizontal: 10,
  },
  searchContainer: {
    width: "100%",
    borderWidth: 0.5,
    borderRadius: 30,
    borderColor: "#ddd",
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    elevation: 1,
    ...(Platform.OS !== "ios" && {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 5,
    }),
  },
  cityButton: {
    paddingHorizontal: 10,
    paddingRight: 2,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    backgroundColor: "#f9f9f9",
  },
  cityText: {
    fontSize: 12,
    color: "#333",
    fontFamily: "PoppinsSemiBold",
  },
  textInput: {
    height: 60,
    fontSize: 14,
    color: "#333",
    flex: 1,
    backgroundColor: "white",
    paddingHorizontal: 10,
    borderRadius: 30,
  },
  iconButton: {
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: "#f9f9f9",
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
  loaderContainer: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
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
});
