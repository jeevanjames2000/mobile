import React, { useEffect, useState, useCallback, useRef, memo } from "react";
import {
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  View,
  Text,
  Image,
} from "react-native";
import { FlatList, Text as NBText } from "native-base";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { setPropertyDetails } from "../../../store/slices/propertyDetails";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ShareDetailsModal from "./ShareDetailsModal";
import { Modal, TouchableWithoutFeedback } from "react-native";
import bhk from "../../../assets/propertyicons/property.png";
import direction from "../../../assets/propertyicons/direction.png";
import location from "../../../assets/propertyicons/location.png";
import parking from "../../../assets/propertyicons/parking.png";
import shower from "../../../assets/propertyicons/bath.png";
const PropertyCard = memo(({ item, onPress }) => {
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
    bathrooms: item?.bathroom || "N/A",
    car_parking: item?.car_parking || "N/A",
    bike_parking: item?.bike_parking || "N/A",
  };
  return (
    <View style={[styles.highlightedContainer]}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => onPress && onPress(item)}
      >
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: property.image }}
            style={styles.image}
            alt="propertyImage"
          />
          <View style={styles.propertyNameOverlay}>
            <Text style={styles.propertyNameText}>{property.title}</Text>
            <Text style={styles.propertyPriceOverlay}>₹ {property.price}</Text>
          </View>
        </View>
        <View style={styles.highlightedDetails}>
          <View style={styles.locationContainer}>
            <Image
              source={location}
              style={{ width: 12, height: 12, tintColor: "#fff" }}
            />
            <Text style={styles.highlightedLocationText} numberOfLines={1}>
              {property.location}
            </Text>
          </View>
          <View style={styles.featuresContainer}>
            {/* <View style={styles.featureItem}>
                <Ionicons name="square-outline" size={14} color="#000" />
                <Text style={styles.highlightedFeatureText}>{property.area} Sq.yd</Text>
              </View> */}
            <View style={styles.featureItem}>
              <View style={styles.highlightedDirectionIcon}>
                <Image
                  source={direction}
                  alt="direction"
                  style={{ width: 12, height: 12, tintColor: "#fff" }}
                />
              </View>
              <Text style={styles.highlightedFeatureText}>
                {property.facing}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Image
                alt="bhk"
                source={bhk}
                style={{ width: 12, height: 12, tintColor: "#fff" }}
              />
              <Text style={styles.highlightedFeatureText}>
                {property.bedrooms !== "N/A"
                  ? `${property.bedrooms} BHK`
                  : "N/A"}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Image
                alt="shower"
                source={shower}
                style={{ width: 12, height: 12, tintColor: "#fff" }}
              />
              <Text style={styles.highlightedFeatureText}>
                {property.bathrooms !== "N/A"
                  ? `${property.bathrooms} Bath`
                  : "N/A"}
              </Text>
            </View>
            <View style={styles.featureItem}>
              <Image
                alt="parking"
                source={parking}
                style={{ width: 12, height: 12, tintColor: "#fff" }}
              />
              <Text style={styles.highlightedFeatureText}>
                {property.car_parking !== "N/A"
                  ? `${property.car_parking} Parking`
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
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
export default function HighDemandProperties({ activeTab }) {
  const intrests = useSelector((state) => state.property.intrestedProperties);
  const dispatch = useDispatch();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [type, setType] = useState("");
  const [userInfo, setUserInfo] = useState("");
  const fetchProperties = useCallback(
    async (reset = true) => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://api.meetowner.in/listings/v1/getHighDemandProjects"
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
      return <PropertyCard item={item} onPress={() => handleNavigate(item)} />;
    },
    [handleNavigate]
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
      <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
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
            windowSize={10}
            maxToRenderPerBatch={4}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={true}
            contentContainerStyle={{ paddingHorizontal: 10 }}
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
      </View>
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setModalVisible(false);
          }}
        >
          <View style={styles.modalContainer}>
            <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
              <View style={styles.modalContent}>
                <ShareDetailsModal
                  type={type}
                  modalVisible={modalVisible}
                  setModalVisible={setModalVisible}
                  selectedPropertyId={selectedPropertyId}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  highlightedContainer: {
    width: 300,
    height: 400,
    borderRadius: 20,
    marginRight: 15,
    marginVertical: 10,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  imageContainer: {
    position: "relative",
    height: 400,
  },
  image: {
    width: "100%%",
    height: "100%",
    borderRadius: 20,
  },
  actionButtons: {
    position: "absolute",
    top: 10,
    right: 20,
    flexDirection: "column",
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  detailsContainer: {
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 5,
    marginTop: 5,
    fontFamily: "PoppinsSemiBold",
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: "#616161",
    marginLeft: 4,
    fontFamily: "Poppins_400Regular",
    fontWeight: "500",
  },
  featuresContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 10,
    gap: 10,
    flexWrap: "wrap",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  propertyNameOverlay: {
    position: "absolute",
    bottom: 100,
    left: 0,
    right: 10,
    padding: 5,
    margin: 10,
  },
  propertyNameText: {
    color: "#fff",
    fontSize: 16,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontFamily: "PoppinsSemiBold",
  },
  propertyPriceOverlay: {
    color: "#fff",
    fontSize: 14,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontFamily: "PoppinsSemiBold",
  },
  highlightedDetails: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
  },
  highlightedLocationText: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 4,
    fontFamily: "PoppinsSemiBold",
  },
  highlightedFeatureText: {
    fontSize: 12,
    color: "#fff",
    marginLeft: 4,
    marginTop: 3,
    fontFamily: "PoppinsSemiBold",
  },
  highlightedDirectionIcon: {
    width: 14,
    height: 14,
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "PoppinsSemiBold",
  },
  highlightedDirectionIconText: {
    fontSize: 14,
    color: "#fff",
    fontFamily: "PoppinsSemiBold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 10,
  },
  fixedExploreButton: {
    marginBottom: 20,
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
});
