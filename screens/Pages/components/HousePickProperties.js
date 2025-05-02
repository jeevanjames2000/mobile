import React, { useEffect, useState, useCallback, useRef, memo } from "react";
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  StyleSheet, View,
  Text,
  Image
} from "react-native";
import {
  FlatList, Text as NBText
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSelector, useDispatch } from "react-redux";
import { setPropertyDetails } from "../../../store/slices/propertyDetails";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ContactActionSheet from "./propertyDetailsComponents/ContactActionSheet";
const PropertyCard = memo(({ item, onPress, onViewAll, contactNow }) => {
  const property = {
    image: `https://api.meetowner.in/uploads/${
      item?.image || "https://placehold.co/600x400"
    }`,
    title: item?.property_name || "N/A",
    price: item?.property_cost
      ? formatToIndianCurrency(item?.property_cost)
      : "N/A",
    location: item?.google_address || "N/A",
    area: item?.area || "N/A",
    facing: item?.facing || "N/A",
    forSale: item?.property_for === "Sell",
    bedrooms: item?.bedrooms || "N/A",
    bathrooms: item?.bathrooms || "N/A",
    car_parking: item?.car_parking || "N/A",
  };
  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        <View style={styles.card}>
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => onPress && onPress(item)}
          >
            <View style={styles.imageContainer}>
              <Image
                alt="propetyImage"
                source={{ uri: property.image }}
                style={styles.image}
                resizeMode="cover"
              />
              <TouchableOpacity style={styles.playButton}>
                <Ionicons name="play" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            <View style={styles.contentContainer}>
              <View style={styles.topRow}>
                <Text style={styles.developerName} numberOfLines={1}>
                  {property.title}
                </Text>
                <Text style={styles.priceRange}>{property.price}</Text>
              </View>
              <View style={styles.bottomRow}>
                <Text style={styles.projectLocation} numberOfLines={2}>
                  {property.location}
                </Text>
                <Text style={styles.apartmentInfo}>
                  {property.bedrooms} BHK Apartments
                </Text>
              </View>
            </View>
          </TouchableOpacity>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => onViewAll && onViewAll()}
            >
              <Text style={styles.viewAllText}>View All Projects</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => {
                contactNow(item);
              }}
            >
              <Text style={styles.contactButtonText}>Contact</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
});
const formatToIndianCurrency = (value) => {
  if (!value || isNaN(value)) return "N/A";
  const numValue = parseFloat(value);
  if (numValue >= 10000000) return (numValue / 10000000).toFixed(2) + " Cr";
  if (numValue >= 100000) return (numValue / 100000).toFixed(2) + " L";
  if (numValue >= 1000) return (numValue / 1000).toFixed(2) + " K";
  return numValue.toString();
};
export default function HousePickProperties({ activeTab }) {
  const intrests = useSelector((state) => state.property.intrestedProperties);
  const dispatch = useDispatch();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const [userDetails, setUserDetails] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [type, setType] = useState("");
  const [userInfo, setUserInfo] = useState("");
  const fetchProperties = useCallback(
    async (reset = true) => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://api.meetowner.in/listings/v1/getBestMeetowner"
        );
        const data = await response.json();
        if (data.results && data.results.length > 0) {
          const newProperties = reset
            ? data.results
            : [...properties, ...data.results];
          setProperties(newProperties);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
      } finally {
        setLoading(false);
        if (reset) setRefreshing(false);
      }
    },
    [activeTab, properties]
  );
  useEffect(() => {
    const getData = async () => {
      const data = await AsyncStorage.getItem("userdetails");
      const parsedUserDetails = JSON.parse(data);
      setUserInfo(parsedUserDetails);
    };
    getData();
    fetchProperties(true);
  }, []);
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProperties(true);
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
  const contactNow = (item) => {
    setSelectedItem(item);
    setSelectedPropertyId(item);
    setModalVisible(true);
  };
  const handleSubmit = (formData) => {
    setModalVisible(false);
    setSelectedItem(null);
  };
  const handleNavigate = useCallback(
    (item) => {
      dispatch(setPropertyDetails(item));
      navigation.navigate("PropertyDetails");
    },
    [dispatch, navigation]
  );
  const handlePropertiesLists = useCallback(() => {
    navigation.navigate("PropertyList", { activeTab });
  }, [navigation, activeTab]);
  const renderPropertyCard = useCallback(
    ({ item }) => {
      if (!item || !item.unique_property_id) {
        return null;
      }
      return (
        <PropertyCard
          item={item}
          onPress={() => handleNavigate(item)}
          onViewAll={() => handlePropertiesLists()}
          contactNow={contactNow}
        />
      );
    },
    [handleNavigate, handlePropertiesLists, contactNow]
  );
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    if (offsetY > 100 && !showScrollToTop) {
      setShowScrollToTop(true);
    } else if (offsetY <= 0 && showScrollToTop) {
      setShowScrollToTop(false);
    }
  };
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProperties(true);
  };
  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View>
        <FlatList
          ref={flatListRef}
          data={properties}
          keyExtractor={(item, index) =>
            item?.unique_property_id
              ? item.unique_property_id
              : `fallback-${index}`
          }
          renderItem={renderPropertyCard}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          nestedScrollEnabled={true}
          initialNumToRender={4}
          contentContainerStyle={styles.flatListContent}
          windowSize={10}
          maxToRenderPerBatch={4}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          ListEmptyComponent={() =>
            !loading && (
              <NBText textAlign={"center"}>No properties found.</NBText>
            )
          }
          ListFooterComponent={
            <TouchableOpacity
              style={styles.fixedExploreButton}
              onPress={handlePropertiesLists}
            ></TouchableOpacity>
          }
        />
      </View>
      <ContactActionSheet
        isOpen={modalVisible}
        onClose={() => {
          setModalVisible(false);
          setSelectedItem(null);
        }}
        onSubmit={handleSubmit}
        userDetails={userDetails}
        title="Contact Now"
        type="contact"
        selectedPropertyId={selectedPropertyId}
      />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  flatListContent: {
    paddingHorizontal: 5,
  },
  cardContainer: {
    width: 350,
    borderRadius: 10,
    // overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 1,
  },
  card: {
    width: "100%",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  playButton: {
    position: "absolute",
    right: 15,
    bottom: 15,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  developerName: {
    fontSize: 12,
    flex: 1,
    fontFamily: "PoppinsSemiBold",
  },
  projectLocation: {
    fontSize: 12,
    color: "#000",
    maxWidth: "60%",
    textAlign: "left",
    fontFamily: "Poppins",
  },
  priceRange: {
    fontSize: 12,
    fontFamily: "PoppinsSemiBold",
    color: "#000",
    flex: 1,
    textAlign: "right",
  },
  apartmentInfo: {
    fontSize: 12,
    color: "#000",
    flex: 1,
    textAlign: "right",
    fontFamily: "PoppinsSemiBold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 15,
  },
  contactButton: {
    backgroundColor: "#1D3A76",
    paddingHorizontal: 40,
    paddingVertical: 10,
    borderRadius: 30,
  },
  viewAllText: {
    color: "#1D3A76",
    textDecorationLine: "underline",
    fontSize: 14,
    textDecorationColor: "#1D3A76",
    fontFamily: "PoppinsSemiBold",
    marginTop: 10,
  },
  contactButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Poppins",
    marginTop: 4,
  },
});
