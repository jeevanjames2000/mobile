import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import {
  Icon,
  Input,
  View,
  HStack,
  Text,
  Actionsheet,
  useDisclose,
  FlatList,
  KeyboardAvoidingView,
  Image,
} from "native-base";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import "react-native-get-random-values";
import { useNavigation } from "@react-navigation/native";
import { useSelector, shallowEqual, useDispatch } from "react-redux";
import * as Location from "expo-location";
import { debounce } from "lodash";
import {
  setCities,
  setDeviceLocation,
} from "../../../store/slices/propertyDetails";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setCityId } from "../../../store/slices/authSlice";
import axios from "axios";
import LocationImage from "../../../assets/location_icon.png";
export default function HerosSection({ setSelectedCity }) {
  const dispatch = useDispatch();
  const [locations, setLocations] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclose();
  const cities = useSelector((state) => state.property.cities, shallowEqual);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch(
          "https://api.meetowner.in/general/getcities"
        );
        const data = await response.json();
        dispatch(setCities(data.cities || []));
        if (userLocation) {
          const matchedCity = data.cities.find(
            (city) => city.label.toLowerCase() === userLocation.toLowerCase()
          );
          if (matchedCity) {
            const data = {
              label: matchedCity.label,
              value: matchedCity.value,
            };
            AsyncStorage.setItem("city_id", JSON.stringify(data));
            dispatch(setCityId(data));
          } else {
          }
        }
      } catch (error) {}
    };
    fetchCities();
    getUserLocation();
  }, [dispatch, userLocation]);
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
        await AsyncStorage.setItem(
          "profileData",
          JSON.stringify({ data, timestamp: new Date().getTime() })
        );
      }
    } catch (error) {}
  };
  const [userLocation, setUserLocation] = useState("");
  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location access is required.");
        dispatch(setUserLocation("Unknown City"));
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
        const city = geocode[0]?.city || "Unknown City";
        setUserLocation(city);
        dispatch(setDeviceLocation(city));
      }
    } catch (error) {
      Alert.alert("Error", "Failed to get your location.");
      dispatch(setUserLocation("Unknown City"));
    }
  };
  const inputRef = useRef(null);
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
    setLocations(cities);
    fetchProfileDetails();
    setFilteredLocations(cities);
    if (userLocation && cities.length > 0) {
      const matchedCity = cities.find(
        (city) => city.label.toLowerCase() === userLocation.toLowerCase()
      );
      if (matchedCity) {
        setSelectedLocation({
          label: matchedCity.label,
          value: matchedCity.value,
        });
      } else {
        setSelectedLocation(null);
      }
    }
  }, [cities, userLocation]);
  const handleSearch = useMemo(
    () => (query) => {
      if (query === searchQuery) return;
      setSearchQuery(query);
      setFilteredLocations(
        query === ""
          ? locations
          : locations.filter((loc) =>
              loc.label.toLowerCase().includes(query.toLowerCase())
            )
      );
    },
    [searchQuery]
  );
  const handleLocationSearch = (query) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }
  };
  const handleCitySelect = (item) => {
    setSelectedLocation(item);
    setSelectedCity(item);
    onClose();
  };
  const handlePropertiesLists = () => {
    navigation.navigate("SearchBox");
  };
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.cityButton} onPress={onOpen}>
          <HStack space={1} alignItems="center">
            <Text style={styles.cityText}>
              {selectedLocation?.label || "Select City"}
            </Text>
            <Ionicons name="chevron-down" size={20} color="gray" />
          </HStack>
        </TouchableOpacity>
        <View style={{ flex: 1, position: "relative" }}>
          <TextInput
            placeholder="Search locality"
            value={searchQuery}
            placeholderTextColor="#999"
            onPress={handlePropertiesLists}
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
      <View
        style={{
          justifyContent: "center",
          alignItems: "center",
          flex: 1,
          width: "90%",
          alignSelf: "center",
          zIndex: 1,
        }}
      >
        {loading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="small" color="#999" />
          </View>
        ) : suggestions.length > 0 ? (
          <FlatList
            data={suggestions}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => {
                  setSearchQuery(item?.value || item?.label);
                  setSuggestions([]);
                }}
              >
                <Text style={styles.suggestionText}>{item?.label}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionsList}
          />
        ) : null}
      </View>
      <Actionsheet isOpen={isOpen} onClose={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ width: "100%" }}
        >
          <Actionsheet.Content
            justifyContent={"flex-start"}
            alignItems={"flex-start"}
            maxHeight={500}
            width={"100%"}
          >
            <TextInput
              placeholder="Search city"
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={handleSearch}
              style={styles.actionsheetInput}
            />
            <FlatList
              data={filteredLocations}
              keyExtractor={(item, index) => `${item.label}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleCitySelect(item)}
                  style={styles.fullWidthItem}
                >
                  <Text style={styles.fullWidthText}>{item.label}</Text>
                </TouchableOpacity>
              )}
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
    backgroundColor: "#f5f5f5",
    marginTop: 0,
    paddingHorizontal: 10,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: -10,
    gap: 4,
  },
  tab: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
    zIndex: 1,
  },
  tabHighlight: {
    position: "absolute",
    height: "80%",
    backgroundColor: "#1D3A76",
    borderRadius: 8,
    left: 3,
    zIndex: -1,
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
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 5,
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
  suggestionsList: {
    position: "absolute",
    top: 1,
    left: 0,
    right: 0,
    backgroundColor: "white",
    maxHeight: 200,
    borderRadius: 8,
    elevation: 5,
    zIndex: 999,
  },
  loaderContainer: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  suggestionText: {
    fontSize: 16,
    color: "#333",
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
