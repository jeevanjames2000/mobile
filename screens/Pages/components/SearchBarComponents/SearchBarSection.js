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
import { View, FlatList, Image, Text } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { debounce } from "lodash";
import LocationImage from "../../../../assets/location_icon.png";
import { useDispatch, useSelector } from "react-redux";
import { setLocation } from "../../../../store/slices/searchSlice";
export default function SearchBarSection() {
  const searchData = useSelector((state) => state.search);
  const navigation = useNavigation();
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const fetchSuggestions = async (city, query) => {
    if (!query || query.length < 3 || !city) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.meetowner.in/api/v1/search?query=${encodeURIComponent(
          query
        )}&city=${encodeURIComponent(city)}`
      );
      const data = await response.json();
      const formattedSuggestions = data.map((item) => ({
        label: item.locality,
        value: item.locality,
      }));
      setSuggestions(formattedSuggestions);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };
  const debouncedFetchSuggestions = useCallback(
    debounce((city, query) => {
      fetchSuggestions(city, query);
    }, 300),
    []
  );
  const dispatch = useDispatch();
  const handleSearch = useMemo(
    () => (query) => {
      dispatch(setLocation(query));
      setLocalSearchQuery(query);
      setSearchQuery(query);
      if (query.trim().length >= 3) {
        debouncedFetchSuggestions(searchData.city, query);
      } else {
        setSuggestions([]);
      }
    },
    [localSearchQuery, searchQuery, setLocalSearchQuery]
  );
  const handleClear = () => {
    setLocalSearchQuery("");
    setSearchQuery("");
    dispatch(setLocation(""));
    setSuggestions([]);
  };
  const renderSuggestionItem = ({ item }) => (
    <TouchableOpacity
      style={styles.suggestionItem}
      onPress={() => {
        setLocalSearchQuery(item.label);
        setSearchQuery(item.label);
        dispatch(setLocation(item.label));
        setSuggestions([]);
      }}
    >
      <Text style={styles.suggestionText}>{item.label}</Text>
    </TouchableOpacity>
  );
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search locality"
          value={localSearchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
          style={styles.textInput}
          ref={inputRef}
        />
        {localSearchQuery.length > 0 && (
          <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
            <Ionicons name="close-circle" size={20} color="#000" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.navigate("SearchBox")}
        >
          <Image
            source={LocationImage}
            style={{ width: 30, height: 30 }}
            alt="location"
          />
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color="#999" />
        </View>
      ) : suggestions.length > 0 ? (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.label}
          renderItem={renderSuggestionItem}
          style={styles.suggestionsList}
        />
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    marginTop: 10,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  textInput: {
    height: 60,
    fontSize: 14,
    color: "#333",
    flex: 1,
    backgroundColor: "#F6F6F6",
    paddingHorizontal: 20,
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
  },
  clearButton: {
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    backgroundColor: "#F6F6F6",
  },
  iconButton: {
    paddingHorizontal: 20,
    justifyContent: "center",
    alignItems: "center",
    height: 60,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
    backgroundColor: "#F6F6F6",
  },
  suggestionsList: {
    position: "absolute",
    top: 65,
    left: 10,
    right: 10,
    width: "100%",
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
});
