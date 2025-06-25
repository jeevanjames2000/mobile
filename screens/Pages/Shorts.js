import React, { useState, useRef, useCallback, memo, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  FlatList,
  Dimensions,
  RefreshControl,
  BackHandler,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Box, HStack, Image, Text, Toast } from "native-base";
import WhatsAppIcon from "../../assets/propertyicons/whatsapp.png";
import { useDispatch } from "react-redux";
import { setPropertyDetails } from "../../store/slices/propertyDetails";
const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get("window");
const PropertyCard = memo(({ item, onPress, handleWhatsappChat }) => {
  const property = {
    image: `https://api.meetowner.in/uploads/${
      item?.image || "https://placehold.co/600x400"
    }`,
    title: item?.property_name || "N/A",
    price: item?.property_cost
      ? formatToIndianCurrency(item?.property_cost)
      : "N/A",
    sub_type: item?.sub_type,
    location: item?.google_address || "N/A",
    area: item?.area || "N/A",
    facing: item?.facing || "N/A",
    forSale: item?.property_for === "Sell" ? "Sale" : "Rent",
    bedrooms: item?.bedrooms || "N/A",
    bathrooms: item?.bathroom || "N/A",
  };
  return (
    <TouchableOpacity
      onPress={() => onPress && onPress(item)}
      activeOpacity={0.8}
    >
      <View style={styles.videoContainer}>
        <Image
          source={{ uri: property.image }}
          style={styles.image}
          resizeMode="cover"
          alt="shortsImage"
        />
        <View style={styles.bottomActions}>
          <HStack space={2} alignItems="center">
            <Box
              width={12}
              height={12}
              borderRadius={30}
              backgroundColor="#000"
              borderColor="#fff"
              borderWidth={0.5}
              alignItems="center"
              justifyContent="center"
            >
              <Text color="#fff" fontSize={12} fontWeight="extrabold">
                {item?.property_name?.[0] || "?"}
              </Text>
            </Box>
            <View style={styles.leftContent}>
              <Text style={styles.textContent} numberOfLines={1}>
                {property.title}
              </Text>
              <Text style={styles.propertyPriceOverlay}>
                ₹ {property.price}
              </Text>
              <Text style={styles.highlightedFeatureText} numberOfLines={1}>
                {[
                  "Apartment",
                  "Independent House",
                  "Independent Villa",
                ].includes(property.sub_type)
                  ? `${property.bedrooms} BHK ${property.sub_type} for Sale`
                  : `${property.sub_type} for ${property.forSale}`}
              </Text>
            </View>
          </HStack>
          <TouchableOpacity
            style={styles.whatsbuttonStyles}
            onPress={() => handleWhatsappChat(item)}
          >
            <HStack space={1} alignItems="center" justifyContent="center">
              <Image
                source={WhatsAppIcon}
                alt="WhatsApp Icon"
                style={{ width: 20, height: 20 }}
                resizeMode="contain"
              />
              <Text style={styles.WhatsbuttonsText}>Chat</Text>
            </HStack>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
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
export default function Shorts({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const dispatch = useDispatch();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const fetchProperties = useCallback(
    async (reset = true) => {
      setLoading(true);
      try {
        const response = await fetch(
          "https://api.meetowner.in/user/v1/getAllShorts"
        );
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const newProperties = reset ? data : [...properties, ...data];
          setProperties(newProperties);
        } else {
          console.warn("No properties found in response");
          if (reset) setProperties([]);
        }
      } catch (error) {
        console.error("Error fetching properties:", error);
        Toast.show({
          placement: "top",
          render: () => (
            <Box bg="red.500" px="2" py="1" rounded="sm" mb={5}>
              Failed to load properties.
            </Box>
          ),
        });
      } finally {
        setLoading(false);
        if (reset) setRefreshing(false);
      }
    },
    [properties]
  );
  useEffect(() => {
    const getData = async () => {
      try {
        const data = await AsyncStorage.getItem("userdetails");
        if (data) {
          const parsedUserDetails = JSON.parse(data);
          setUserInfo(parsedUserDetails);
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    getData();
    fetchProperties(true);
  }, []);
  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
        return true;
      } else {
        Alert.alert("Exit App", "Do you want to exit?", [
          { text: "Cancel", style: "cancel" },
          { text: "Exit", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      }
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [navigation]);
  const handleNavigate = useCallback(
    (item) => {
      dispatch(setPropertyDetails(item));
      navigation.navigate("PropertyDetails");
    },
    [dispatch, navigation]
  );
  const getOwnerDetails = useCallback(async (property) => {
    try {
      const response = await fetch(
        `https://api.meetowner.in/listings/getsingleproperty?unique_property_id=${property?.unique_property_id}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data.property_details?.seller_details || {};
    } catch (error) {
      console.error("Error fetching owner details:", error);
      return {};
    }
  }, []);
  const handleWhatsappChat = useCallback(
    async (property) => {
      try {
        const ownerData = await getOwnerDetails(property);
        const ownerPhone = ownerData?.mobile;
        if (!ownerPhone) {
          Toast.show({
            placement: "top-right",
            render: () => (
              <Box bg="red.500" px="2" py="1" mr={5} rounded="sm" mb={5}>
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
        const message = `Hi ${ownerName},\nI'm interested in this property: ${
          property.property_name
        }.\n${fullUrl}\nI look forward to your assistance in the home search. Please get in touch with me at ${
          userInfo?.mobile || "N/A"
        } to initiate the process.`;
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
              <Box bg="red.500" px="2" py="1" mr={5} rounded="sm" mb={5}>
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
            <Box bg="red.500" px="2" py="1" mr={5} rounded="sm" mb={5}>
              Failed to open WhatsApp chat.
            </Box>
          ),
        });
      }
    },
    [userInfo, getOwnerDetails]
  );
  const renderPropertyCard = useCallback(
    ({ item }) => {
      if (!item || !item.unique_property_id) {
        return null;
      }
      return (
        <PropertyCard
          item={item}
          onPress={handleNavigate}
          handleWhatsappChat={handleWhatsappChat}
        />
      );
    },
    [handleNavigate, handleWhatsappChat]
  );
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProperties(true);
  }, [fetchProperties]);
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 80,
    minimumViewTime: 300,
  };
  const getItemLayout = useCallback(
    (data, index) => ({
      length: SCREEN_HEIGHT,
      offset: SCREEN_HEIGHT * index,
      index,
    }),
    []
  );
  return (
    <SafeAreaProvider>
      {loading && properties.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1D3A76" />
          <Text style={styles.loadingText}>Loading Properties...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={properties}
          renderItem={renderPropertyCard}
          keyExtractor={(item) =>
            item.unique_property_id?.toString() || `item-${Math.random()}`
          }
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToAlignment="start"
          snapToInterval={SCREEN_HEIGHT}
          decelerationRate="fast"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={["#1D3A76"]}
              progressViewOffset={50}
            />
          }
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          getItemLayout={getItemLayout}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
        />
      )}
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  videoContainer: {
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH,
    backgroundColor: "#000",
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    borderRadius: 0,
  },
  bottomActions: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 20 : 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  leftContent: {
    justifyContent: "flex-start",
    flexDirection: "column",
  },
  textContent: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
  },
  whatsbuttonStyles: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
    borderColor: "#25D366",
    borderWidth: 1,
  },
  WhatsbuttonsText: {
    color: "#000",
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Poppins",
  },
  propertyPriceOverlay: {
    color: "#fff",
    fontSize: 14,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    fontFamily: "PoppinsSemiBold",
  },
  highlightedFeatureText: {
    fontSize: 12,
    color: "#fff",
    marginTop: 3,
    fontFamily: "PoppinsSemiBold",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    color: "#000",
    fontSize: 16,
    marginTop: 10,
    fontFamily: "Poppins",
  },
});
