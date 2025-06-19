import React, { useCallback, useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Linking,
  Modal, Share,
  View,
  Text,
  Platform
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { Toast, Box, FlatList, HStack } from "native-base";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import ShareDetailsModal from "./ShareDetailsModal";
import PropertyHeader from "./propertyHeader";
import * as Location from "expo-location";
import { Pressable } from "react-native";
import { useRoute } from "@react-navigation/native";
import WhatsAppIcon from "../../../assets/propertyicons/whatsapp.png";
const facilityIconMap = {
  Lift: "caret-back-circle-outline",
  CCTV: "videocam-outline",
  Gym: "fitness-outline",
  Garden: "leaf-outline",
  "Club House": "business-outline",
  Sports: "tennisball-outline",
  "Swimming Pool": "water-outline",
  Intercom: "call-outline",
  "Power Backup": "battery-charging-outline",
  "Gated Community": "lock-closed-outline",
  "Regular Water": "water-outline",
  "Community Hall": "people-outline",
  "Pet Allowed": "paw-outline",
  "Entry / Exit": "enter-outline",
  "Outdoor Fitness Station": "barbell-outline",
  "Half Basket Ball Court": "basketball-outline",
  Gazebo: "home-outline",
  "Badminton Court": "tennisball-outline",
  "Children Play Area": "happy-outline",
  "Ample Greenery": "leaf-outline",
  "Water Harvesting Pit": "water-outline",
  "Water Softener": "filter-outline",
  "Solar Fencing": "sunny-outline",
  "Security Cabin": "shield-outline",
  Lawn: "leaf-outline",
  "Transformer Yard": "flash-outline",
  Amphitheatre: "musical-notes-outline",
  "Lawn with Stepping Stones": "leaf-outline",
  None: "close-outline",
};
export default function PropertyDetails({ navigation }) {
  const route = useRoute();
  const dispatch = useDispatch();
  const property = useSelector((state) => state.property.propertyDetails);

const formatToIndianCurrency = (value) => {
  if (value >= 10000000) {
    const crores = value / 10000000;
    return Math.floor(crores) === crores ? crores + " Cr" : crores.toFixed(2) + " Cr";
  }
  if (value >= 100000) {
    const lakhs = value / 100000;
    return Math.floor(lakhs) === lakhs ? lakhs + " L" : lakhs.toFixed(2) + " L";
  }
  if (value >= 1000) {
    const thousands = value / 1000;
    return Math.floor(thousands) === thousands ? thousands + " K" : thousands.toFixed(2) + " K";
  }
  return value.toString();
};
  const [userInfo, setUserInfo] = useState("");
  const [location, setLocation] = useState(null);
  const [region, setRegion] = useState(null);
  const [facilites, setFacilities] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [type, setType] = useState("");
  const [isInterested, setIsInterested] = useState(false);
  const [submittedType, setSubmittedType] = useState(null);
  const [owner, setOwner] = useState("");
  const [floorPlan, setFloorPlan] = useState("");
  const [isFloorPlanModalVisible, setIsFloorPlanModalVisible] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [isPhotosLoading, setIsPhotosLoading] = useState(false);
  const fetchPropertyDetails = (unique_property_id) => async (dispatch) => {
    try {
      const response = await fetch(
        `https://api.meetowner.in/listings/getsingleproperty?unique_property_id=${unique_property_id}`
      );
      const data = await response.json();
      if (response.ok) {
        dispatch({
          type: "setPropertyDetails",
          payload: data.property_details,
        });
      } else {
        throw new Error("Failed to fetch property details");
      }
    } catch (error) {
      console.error("Error fetching property:", error);
      Toast.show({
        placement: "top-right",
        render: () => (
          <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
            Failed to load property details.
          </Box>
        ),
      });
    }
  };
  const uniquePropertyId = route.params?.unique_property_id;
  useEffect(() => {
    if (uniquePropertyId && uniquePropertyId !== property?.unique_property_id) {
      dispatch(fetchPropertyDetails(uniquePropertyId));
    }
  }, [uniquePropertyId, property?.unique_property_id, dispatch]);
  const getCacheKey = () => `photos_${property?.unique_property_id}`;
  useEffect(() => {
    const getData = async () => {
      const data = await AsyncStorage.getItem("userdetails");
      const parsedUserDetails = JSON.parse(data);
      setUserInfo(parsedUserDetails);
    };
    getData();
    getCoordinatesFromAddress(property.google_address);
    fetchFacilities();
    fetchFloorPlans();
    fetchProjectPhotos();
  }, [
    property?.google_address,
    property?.unique_property_id,
    fetchProjectPhotos,
  ]);
  const fetchFloorPlans = async () => {
    try {
      const response = await fetch(
        `https://api.meetowner.in/listings/v1/getAllFloorPlans/${property?.unique_property_id}`
      );
      const data = await response.json();
      if (data && data.length > 0 && data[0].image) {
        const imageUrl = `https://api.meetowner.in/uploads/${data[0].image}`;
        setFloorPlan(imageUrl);
      } else {
        setFloorPlan("");
      }
    } catch (error) {
      console.error("Error fetching floor plans:", error);
      setFloorPlan("");
    }
  };
  const fetchProjectPhotos = useCallback(async () => {
    setIsPhotosLoading(true);
    try {
      const cachedPhotos = await AsyncStorage.getItem(getCacheKey());
      if (cachedPhotos) {
        const parsedPhotos = JSON.parse(cachedPhotos);
        setPhotos(parsedPhotos);
        setIsPhotosLoading(false);
        return;
      }
      const response = await fetch(
        `https://api.meetowner.in/property/getpropertyphotos?unique_property_id=${property?.unique_property_id}`
      );
      const data = await response.json();
      if (
        data &&
        data.status === "success" &&
        data.images &&
        data.images.length > 0
      ) {
        const imageUrls = data.images.map((image) => image.url);
        setPhotos(imageUrls);
        await AsyncStorage.setItem(getCacheKey(), JSON.stringify(imageUrls));
      } else {
        setPhotos([]);
      }
    } catch (error) {
      console.error("Error fetching project photos:", error);
      setPhotos([]);
    } finally {
      setIsPhotosLoading(false);
    }
  }, [property?.unique_property_id]);
  const fetchFacilities = async () => {
    try {
      const response = await fetch(
        `https://api.meetowner.in/listings/getsingleproperty?unique_property_id=${property?.unique_property_id}`
      );
      const data = await response.json();
      setFacilities(data?.property_details?.facilities);
    } catch (error) {}
  };
  const defaultLocation = {
    latitude: 17.385044,
    longitude: 78.486671,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };
  const getCoordinatesFromAddress = async (address) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "Location permissions are required to geocode the address."
        );
        setLocation(defaultLocation);
        setRegion(defaultLocation);
        setErrorMsg("Location permissions denied.");
        return;
      }

      // Geocode the address using Expo Location
      if (address) {
        const geocoded = await Location.geocodeAsync(address, {
          accuracy: Location.Accuracy.Balanced,
        });

        if (geocoded && geocoded.length > 0) {
          const { latitude, longitude } = geocoded[0];
          const initialRegion = {
            latitude,
            longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
          setLocation(initialRegion);
          setRegion(initialRegion);
        } else {
          setLocation(defaultLocation);
          setRegion(defaultLocation);
          setErrorMsg("Unable to geocode the address.");
        }
      } else {
        setLocation(defaultLocation);
        setRegion(defaultLocation);
        setErrorMsg("No address provided.");
      }
    } catch (error) {
      console.error("Error geocoding address:", error);
      setLocation(defaultLocation);
      setRegion(defaultLocation);
      setErrorMsg("Error geocoding address.");
    }
  };

  const getOwnerDetails = async (property) => {
    const response = await fetch(
      `https://api.meetowner.in/listings/v1/getSingleProperty?unique_property_id=${property?.unique_property_id}`
    );
    const data = await response.json();
    const propertydata = data.property_details;
    const sellerdata = propertydata.seller_details;
    if (response.status === 200) {
      setOwner(sellerdata);
    }
    return sellerdata;
  };
  const handleAPI = async () => {
    const owner = await getOwnerDetails(selectedPropertyId);
    const payload = {
      channelId: "67a9e14542596631a8cfc87b",
      channelType: "whatsapp",
      recipient: { name: owner?.name, phone: `91${owner?.mobile}` },
      whatsapp: {
        type: "template",
        template: {
          templateName: "leads_information_for_partners_clone",
          bodyValues: {
            name: userInfo?.name,
            phone: userInfo?.mobile,
            variable_3:
              selectedPropertyId?.property_subtype ||
              selectedPropertyId?.sub_type ||
              "Property",
            variable_4: selectedPropertyId?.property_name,
            variable_5: selectedPropertyId?.google_address.split(",")[0].trim(),
          },
        },
      },
    };
    const headers = {
      apiKey: "67e3a37bfa6fbc8b1aa2edcf",
      apiSecret: "a9fe1160c20f491eb00389683b29ec6b",
      "Content-Type": "application/json",
    };
    try {
      const url = "https://server.gallabox.com/devapi/messages/whatsapp";
      await axios.post(url, payload, { headers });
    } catch (error) {}
  };
  const handleScheduleVisit = () => {
    setModalVisible(true);
    setSelectedPropertyId(property);
  };
  const handleIntrests = async (type) => {
    setSelectedPropertyId(property);
    await handleAPI();
    setType(type);
    setSubmittedType(type);
    setIsInterested(!isInterested);
  };
  const shareProperty = async () => {
    try {
      await Share.share({
        message: `Check out this property: ${property.property_name} at ${
          property.google_address
        }. ${property.bedrooms} BHK ${
          property.sub_type
        } for ₹${formatToIndianCurrency(
          property.property_cost
        )}. https://api.meetowner.in/property?unique_property_id=${
          property.unique_property_id
        }`,
        url: `https://api.meetowner.in/property?unique_property_id=${property.unique_property_id}`,
        title: `Property: ${property.property_name}`,
      });
    } catch (error) {
      console.error("Error sharing property:", error);
    }
  };
  const handleShare = useCallback(() => {
    shareProperty();
  }, []);
  const handleWhatsappChat = useCallback(
     async (property) => {
       try {
         let ownerData = await getOwnerDetails(property);
         const ownerPhone = ownerData?.mobile;
         if (!ownerPhone) {
           Toast.show({
             placement: "top-right",
             render: () => (
               <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
                 Owner phone number not available.
               </Box>
             ),
           });
           return;
         }
         const whatsappStoreLink =
           Platform.OS === "android"
             ? "https://play.google.com/store/apps/details?id=com.whatsapp"
             : "https://apps.apple.com/us/app/whatsapp-messenger/id310633997";
         const fullUrl = `https://meetowner.app/property/${property.unique_property_id}`;
         const ownerName = ownerData?.name || "Owner";
         const message = `Hi ${ownerName},\nI'm interested in this property: ${property.property_name}.\n${fullUrl}\nI look forward to your assistance in the home search. Please get in touch with me at ${userInfo.mobile} to initiate the process.`;
         const encodedMessage = encodeURIComponent(message);
         const normalizedPhone = ownerPhone.startsWith("+")
           ? ownerPhone.replace(/\D/g, "")
           : `91${ownerPhone.replace(/\D/g, "")}`;
         const whatsappUrl = `https://wa.me/${normalizedPhone}?text=${encodedMessage}`;
         const supported = await Linking.canOpenURL(whatsappUrl);
         if (supported) {
           await Linking.openURL(whatsappUrl);
         } else {
           Toast.show({
             placement: "top-right",
             render: () => (
               <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
                 WhatsApp is not installed. Redirecting to app store...
               </Box>
             ),
           });
           await Linking.openURL(whatsappStoreLink);
         }
       } catch (error) {
         console.error("Error opening WhatsApp:", error);
         Toast.show({
           placement: "top-right",
           render: () => (
             <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
               Failed to open WhatsApp chat.
             </Box>
           ),
         });
       }
     },
     [owner, userInfo, getOwnerDetails]
   );
  const memoizedPhotos = useMemo(() => photos, [photos]);
  const SkeletonLoader = () => (
    <FlatList
      data={[1, 2, 3, 4]}
      horizontal
      keyExtractor={(item) => `skeleton-${item}`}
      renderItem={() => <View style={styles.skeletonPhoto} />}
      showsHorizontalScrollIndicator={false}
    />
  );
  React.useLayoutEffect(() => {
    navigation.setOptions({
      header: () => (
        <PropertyHeader
          navigation={navigation}
          title="Property Details"
          isInterested={isInterested}
          handleIntrests={handleIntrests}
          handleShare={handleShare}
          property={property}
        />
      ),
    });
  }, [navigation, isInterested, handleIntrests, handleShare]);
  const formatValue = (value) => {
    return value % 1 === 0
      ? parseInt(value)
      : parseFloat(value).toFixed(2).replace(/\.00$/, "");
  };
  return (
    <View style={styles.mainContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.section}>
          {isPhotosLoading ? (
            <SkeletonLoader />
          ) : photos.length > 0 ? (
            <FlatList
              data={memoizedPhotos}
              horizontal
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <Pressable>
                  <Image
                    source={{ uri: item }}
                    style={styles.projectPhoto}
                    alt="projectPhoto"
                    resizeMode="cover"
                  />
                </Pressable>
              )}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noImageText}>No project photos available</Text>
          )}
          <Text style={styles.overview}>Overview</Text>
          <View style={styles.containerPosession}>
            {(property.sub_type === "Apartment" ||
              property.sub_type === "Independent Villa") && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                {property?.occupancy === "Ready to move" && (
                  <Text style={styles.possessionText}>Ready to move</Text>
                )}
                {property?.occupancy === "Under Construction" &&
                  property?.under_construction && (
                    <>
                      <View style={styles.verticalDivider} />
                      <Text style={styles.possessionText}>
                        Possession Starts -{" "}
                        {new Date(
                          property.under_construction
                        ).toLocaleDateString("en-GB", {
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </>
                  )}
                  
              </View>
            )}
             {(property.property_for === "Rent" ) && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <>
                      <View style={styles.verticalDivider} />
                      <Text style={styles.possessionText}>
                        Available From - {" "}
                        {new Date(
                          property.available_from
                        ).toLocaleDateString("en-GB", {
                          month: "short",
                          year: "numeric",
                        })}
                      </Text>
                    </>  
              </View>
            )}

            {property.sub_type === "Plot" && (
              <Text style={styles.possessionText}>
                {property.possession_status?.toLowerCase() === "immediate"
                  ? "Immediate"
                  : "Future"}
              </Text>
            )}

            <Text style={styles.propertyname} numberOfLines={1}>
              {property.property_name}{" "}
              <Text numberOfLines={1}>/ {property.location_id}</Text>
            </Text>
          </View>
          <Text style={styles.overview}>Pricing</Text>
          <HStack
            alignItems="center"
            space={2}
            style={styles.containerPosession}
          >
            <Text style={styles.propertyPrice}>
              ₹ {property.property_for === 'Rent' ? formatToIndianCurrency(property.monthly_rent || 0) : formatToIndianCurrency(property.property_cost || 0)}
            </Text>
            <Text style={styles.propertyPrice} marginLeft="1">
              {["Apartment", "Independent House", "Independent Villa"].includes(
                property.sub_type
              )
                ? `| ${property.bedrooms} BHK ${property.sub_type} for ${property.property_for}`
                : `${property.sub_type} for ${property.property_for}`}
            </Text>
          </HStack>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.card}>
            <View style={styles.overviewGrid}>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Project Area</Text>
                <Text style={styles.overviewValue}>
                  {formatValue(property.total_project_area)} {property.total_project_area_type ||"Acres"}
                </Text>
              </View>

            {property.builtup_area !== null &&   (property?.sub_type !== "Plot" &&
                property?.sub_type !== "Land" && (
                  <View style={styles.overviewItem}>
                    <Text style={styles.overviewLabel}>Built-up Area</Text>
                    <Text style={styles.overviewValue}>
                      {formatValue(property.builtup_area)} {property.area_units}
                    </Text>
                  </View>
                ))
              }

              {(property?.sub_type === "Plot" ||
                property?.sub_type === "Land") && (
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Plot Area</Text>
                  <Text style={styles.overviewValue}>
                    {formatValue(property.plot_area)} {property.area_units}
                  </Text>
                </View>
              )}

              {(property.possession_status !== null || property.occupancy !== null) && ( <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Occupancy Status</Text>
                <Text style={styles.overviewValue}>
                  {property.possession_status || property.occupancy}
                </Text>
              </View>)}
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Property Type</Text>
                <Text style={styles.overviewValue}>{property.property_in}</Text>
              </View>
              {property.bedrooms > 0 && (
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Bedrooms</Text>
                  <Text style={styles.overviewValue}>
                    {property.bedrooms || 0}
                  </Text>
                </View>
              )}
              {property.bathroom > 0 && (
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Bathrooms</Text>
                  <Text style={styles.overviewValue}>
                    {property?.bathroom || 0}
                  </Text>
                </View>
              )}
              {property.balconies > 0 && (
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Balconies</Text>
                  <Text style={styles.overviewValue}>
                    {property?.balconies || 0}
                  </Text>
                </View>
              )}
               {property.bike_parking > 0 && (
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>bike Parking</Text>
                  <Text style={styles.overviewValue}>
                    {property.bike_parking || 0}
                  </Text>
                </View>
              )}
              {property.car_parking > 0 && (
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Car Parking</Text>
                  <Text style={styles.overviewValue}>
                    {property.car_parking || 0}
                  </Text>
                </View>
              )}
               {property.rera_approved == 1 && (
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>RERA Approved</Text>
                  <Text style={styles.overviewValue}>
                    Yes
                  </Text>
                </View>
              )}
              {property.passenger_lifts > 0 && (
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Passenger Lifts</Text>
                  <Text style={styles.overviewValue}>
                   {property.passenger_lifts || 0}
                  </Text>
                </View>
              )}
              {property.service_lifts > 0 && (
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Service Lifts</Text>
                  <Text style={styles.overviewValue}>
                   {property.service_lifts || 0}
                  </Text>
                </View>
              )}
               {property.private_parking > 0 && (
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Private Parking</Text>
                  <Text style={styles.overviewValue}>
                   {property.private_parking || 0}
                  </Text>
                </View>
              )}
               {property.public_parking > 0 && (
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Public Parking</Text>
                  <Text style={styles.overviewValue}>
                   {property.public_parking || 0}
                  </Text>
                </View>
              )}
              {property.stair_cases > 0 && (
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Stair Cases</Text>
                  <Text style={styles.overviewValue}>
                   {property.stair_cases || 0}
                  </Text>
                </View>
              )}
              {property.pantry_room === "Yes" && (
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Pantry Room</Text>
                  <Text style={styles.overviewValue}>
                   Yes
                  </Text>
                </View>
              )}
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Facing</Text>
                <Text style={styles.overviewValue}>{property.facing || 0}</Text>
              </View>
              <View style={styles.overviewItem}>
                <Text style={styles.overviewLabel}>Furnished</Text>
                <Text style={styles.overviewValue}>
                  {property.furnished_status || "No"}
                </Text>
              </View>
               {property.security_deposit !== null && (
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Security Deposit</Text>
                  <Text style={styles.overviewValue}>
                    {Number.parseFloat(property.security_deposit).toFixed(0)} Months
                  </Text>
                </View>
              )}
               {property.maintenance !== null && (
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Maintenance </Text>
                  <Text style={styles.overviewValue}>
                    {formatToIndianCurrency(property.maintenance || 0)}
                  </Text>
                </View>
              )}
               {property.lock_in !== null && (
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Lock in period </Text>
                  <Text style={styles.overviewValue}>
                    {Number.parseFloat(property.lock_in).toFixed(0)} Months
                  </Text>
                </View>
              )}
              {property.brokerage_charge !== null && (
                <View style={styles.overviewItem}>
                  <Text style={styles.overviewLabel}>Brokerage Charge </Text>
                  <Text style={styles.overviewValue}>
                      {formatToIndianCurrency(property.brokerage_charge || 0)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        {floorPlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Floor Plan</Text>
            {floorPlan ? (
              <Pressable onPress={() => setIsFloorPlanModalVisible(true)}>
                <Image
                  source={{ uri: floorPlan }}
                  style={styles.floorPlanImage}
                  alt="floorPlan"
                  resizeMode="cover"
                />
              </Pressable>
            ) : (
              <Text style={styles.noImageText}>No floor plan available</Text>
            )}
          </View>
        )}
        {facilites && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Facilities</Text>
            <View style={styles.card}>
              <View style={styles.facilitiesGrid}>
                {typeof facilites === "string" && facilites.trim() !== "" ? (
                  facilites.split(", ").map((facility, index) => (
                    <View key={index} style={styles.facilityItem}>
                      <Ionicons
                        name={
                          facilityIconMap[facility.trim()] ||
                          "help-circle-outline"
                        }
                        size={20}
                        color="#000"
                        style={styles.facilityIcon}
                      />
                      <Text style={styles.facilityText}>{facility.trim()}</Text>
                    </View>
                  ))
                ) : (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={styles.facilityText}>
                      No details available
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        <View
          style={{
            borderRadius: 30,
            shadowColor: "#fff",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.2,
            shadowRadius: 5,
            elevation: 5,
            marginBottom: 10,
          }}
        >
          {region ? (
            <MapView
              style={styles.map}
              region={region}
              onRegionChangeComplete={(newRegion) => setRegion(newRegion)}
              showsScale={true}
              loadingEnabled={true}
            >
              {location && (
                <Marker
                  coordinate={{
                    latitude: location.latitude,
                    longitude: location.longitude,
                  }}
                  title={property?.google_address || "Location"}
                  description={
                    property?.google_address || "This is your selected location"
                  }
                />
              )}
            </MapView>
          ) : (
            <Text fontSize={16} fontWeight={"bold"} textAlign={"center"}>
              Loading map...
            </Text>
          )}
        </View>
      </ScrollView>
      <View style={styles.ctaContainer}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={() => handleWhatsappChat(property)}
        >
          <HStack space={1} alignItems="center" justifyContent="center">
            <Image
              source={WhatsAppIcon}
              alt="WhatsApp Icon"
              style={{ width: 18, height: 18 }}
              resizeMode="contain"
            />
            <Text style={styles.WhatsbuttonsText}>Chat</Text>
          </HStack>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => handleScheduleVisit("contact seller")}
        >
          <Text style={styles.ctaButtonText}>Contact Seller</Text>
        </TouchableOpacity>
      </View>
      {modalVisible && (
        <Pressable
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.3)",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onPress={() => setModalVisible(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{
              width: "90%",
              backgroundColor: "#fff",
              borderRadius: 10,
              elevation: 5,
            }}
          >
            <ShareDetailsModal
              modalVisible={modalVisible}
              setModalVisible={setModalVisible}
              selectedPropertyId={selectedPropertyId}
            />
          </Pressable>
        </Pressable>
      )}
      <Modal
        visible={isFloorPlanModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsFloorPlanModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          {}
          <Pressable
            style={styles.closeButton}
            onPress={() => setIsFloorPlanModalVisible(false)}
          >
            <Ionicons name="close" size={30} color="#fff" />
          </Pressable>
          {}
          <Image
            source={{ uri: floorPlan }}
            style={styles.fullScreenImage}
            alt="fullScreen"
            resizeMode="contain"
          />
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  projectPhoto: {
    width: 350,
    height: 230,
    borderRadius: 10,
    marginRight: 10,
    marginVertical: 10,
    backgroundColor: "#e0e0e0",
  },
  container: {
    padding: 13,
    backgroundColor: "#f5f5f5",
    paddingBottom: 100,
  },
  map: {
    width: "100%",
    height: 250,
    borderRadius: 30,
    marginTop: 5,
  },
  propertyImage: {
    width: "100%",
    height: undefined,
    aspectRatio: 16 / 9,
    borderRadius: 10,
    marginTop: 30,
    marginBottom: 16,
    overflow: "hidden",
  },
  containerPosession: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    space: 10,
    padding: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  possesionText: {
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
    color: "#7C7C7C",
    margin: 5,
  },
  overview: {
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
    color: "#000",
  },
  propertyname: {
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
    color: "#000",
    marginTop: 5,
  },
  possessionText: {
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
    color: "gray",
    marginTop: 5,
  },
  propertyPrice: {
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
    color: "#000",
  },
  propertBHK: {
    fontSize: 14,
    fontFamily: "Poppins",
    color: "#7C7C7C",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "PoppinsSemiBold",
    color: "#000",
  },
  card: {
    borderRadius: 16,
    backgroundColor: "#ffffff",
    margin: 5,
    padding: 20,
    overflow: "visible",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  overviewGrid: {
    flexDirection: "column",
  },
  overviewItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  overviewLabel: {
    fontSize: 14,
    flex: 1,
    fontFamily: "PoppinsSemiBold",
    color: "#000",
  },
  overviewValue: {
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    color: "#000",
    textAlign: "right",
  },
  facilitiesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  facilityItem: {
    flexDirection: "row",
    alignItems: "center",
    width: "50%",
    marginBottom: 12,
  },
  facilityIcon: {
    marginRight: 8,
  },
  facilityText: {
    fontSize: 12,
    fontFamily: "PoppinsSemiBold",
    color: "#000",
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  ctaContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#ffffff",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 0,

    elevation: 1,
  },
  ctaButton: {
    backgroundColor: "#1D3A76",
    padding: 10,
    borderRadius: 30,
    justifyContent: "center",
    width: "48%",
    alignItems: "center",
    marginBottom: 5,
  },
  chatButton: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 30,
    width: "48%",
    alignItems: "center",
    borderColor: "green",
    borderWidth: 1,
    marginBottom: 5,
  },
  buttonsText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Poppins",
  },
  WhatsbuttonsText: {
    color: "#000",
    fontSize: 14,
    marginTop: 2,
    fontFamily: "Poppins",
  },
  chatButtonText: {
    color: "#000",
    fontSize: 14,
  },
  ctaButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  modalContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 10,
    padding: 10,
  },
  floorPlanImage: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 16,
    overflow: "hidden",
  },
  noImageText: {
    fontSize: 14,
    fontFamily: "Poppins",
    color: "#7C7C7C",
    textAlign: "center",
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
});
