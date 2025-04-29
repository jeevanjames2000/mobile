import React, { useEffect, useState, useCallback, useRef, memo } from "react";
import {
  Share,
  RefreshControl,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Keyboard,
  View,
  Text,
  Image,
} from "react-native";
import {
  Text as NBText,
  View as NBView,
  Actionsheet,
  useDisclose,
  Box,
  Toast,
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSelector, useDispatch } from "react-redux";
import {
  setIntrestedProperties,
  setTrendingProjects,
  setPropertyDetails,
} from "../../../store/slices/propertyDetails";
import config from "../../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import ShareDetailsModal from "./ShareDetailsModal";
import { Modal, TouchableWithoutFeedback } from "react-native";

const PropertyCard = memo(
  ({ item, onPress, onFav, onShare, intrestedProperties, enquireNow, isHighlighted = false }) => {
    const isInitiallyInterested = (intrestedProperties || [])?.some(
      (prop) =>
        prop?.property_details?.unique_property_id === item?.unique_property_id
    );
    const [isLiked, setIsLiked] = useState(isInitiallyInterested);

    const handleFavClick = () => {
      onFav(item, !isLiked);
      setIsLiked((prev) => !prev);
    };

    const property = {
      image: `https://api.meetowner.in/uploads/${item?.image || "https://placehold.co/600x400"}`,
      title: item?.property_name || "N/A",
      price: item?.property_cost ? formatToIndianCurrency(item?.property_cost) : "N/A",
      location: item?.google_address || "N/A",
      area: item?.area || "N/A",
      facing: item?.facing || "N/A",
      forSale: item?.property_for === "Sell",
      bedrooms: item?.bedrooms || "N/A",
      bathrooms: item?.bathrooms || "N/A",
      car_parking: item?.car_parking || "N/A",
    };

    return (
      <TouchableOpacity
        style={styles.ownerGridItem}
        onPress={() => onPress && onPress(item)}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: property.image }} style={styles.ownerImage}  alt="property"/>
        </View>
        <Text style={styles.ownerTitle} numberOfLines={1}>
          {property.title}
        </Text>
      </TouchableOpacity>
    );
  }
);

const formatToIndianCurrency = (value) => {
  if (!value || isNaN(value)) return "N/A";
  const numValue = parseFloat(value);
  if (numValue >= 10000000) return (numValue / 10000000).toFixed(2) + " Cr";
  if (numValue >= 100000) return (numValue / 100000).toFixed(2) + " L";
  if (numValue >= 1000) return (numValue / 1000).toFixed(2) + " K";
  return numValue.toString();
};

export default function ExclusiveProperties({ activeTab }) {
  const intrests = useSelector((state) => state.property.intrestedProperties);
  const dispatch = useDispatch();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
              "https://api.meetowner.in/listings/v1/getMeetOwnerExclusive"
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
     
    }, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);





  const handleNavigate = useCallback((item) => {
    dispatch(setPropertyDetails(item));
    navigation.navigate("PropertyDetails");
  }, [dispatch, navigation]);



  


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
      <View style={styles.container}>
        

        {/* Grid Layout for 4 Cards */}
        {loading ? (
          <NBText textAlign={"center"}>Loading...</NBText>
        ) : properties.length === 0 ? (
          <NBText textAlign={"center"}>No properties found.</NBText>
        ) : (
          <View style={styles.ownerGrid}>
            {properties.slice(0, 4).map((item, index) => (
              <PropertyCard
                key={item?.unique_property_id || `fallback-${index}`}
                item={item}
                onPress={() => handleNavigate(item)}
                onFav={(item, isLiked) => handleFavourites(item, isLiked)}
                onShare={() => handleShare(item)}
                intrestedProperties={intrests}
                enquireNow={() => {
                  setType("enquireNow");
                  setSelectedPropertyId(item);
                  setModalVisible(true);
                }}
                isHighlighted={false}
              />
            ))}
          </View>
        )}
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
  container: {
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  viewAllText: {
    fontSize: 14,
    color: "#666",
  },
  ownerGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
    paddingHorizontal: 10,
  },
  ownerGridItem: {
    width: "48%", // Almost half width with a small gap
    marginBottom: 15,
  },
  imageContainer: {
    position: "relative",
  },
  ownerImage: {
    width: "100%",
    height: 120,
    borderRadius: 10,
  },
  ownerTitle: {
    fontSize: 15,
    marginTop: 5,
    color: "#000",
    fontFamily: 'PoppinsBold',
  },
  
  
});