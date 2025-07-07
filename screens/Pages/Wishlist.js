import React, { memo, useCallback, useState, useEffect } from "react";
import {
  Platform,
  SafeAreaView,
  StyleSheet,
  KeyboardAvoidingView,
  TouchableOpacity,
  BackHandler,
  Alert,
  Share,
  Linking,
} from "react-native";
import {
  useDisclose,
  StatusBar,
  View,
  Text,
  FlatList,
  HStack,
  Image,
  Pressable,
  Spinner,
  VStack,
  Box,
  Toast,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import config from "../../config";
import { useDispatch } from "react-redux";
import axios from "axios";
import {
  setIntrestedProperties,
  setPropertyDetails,
} from "../../store/slices/propertyDetails";
import PropertyImage from "./components/propertyDetailsComponents/PropertyImage";
import WhatsAppIcon from "../../assets/propertyicons/whatsapp.png";
import ApprovedIcon from "../../assets/propertyicons/verified.png";
import { useUserProfileCheck } from "../../utils/UserProfileCheckWrapper";
import UserProfileModal from "../../utils/UserProfileModal";
import ContactActionSheet from "./components/propertyDetailsComponents/ContactActionSheet";
export default function Wishlist() {
  const {
    user,
    showModal,
    setShowModal,
    loading,
    checkUserProfile,
    handleChange,
    handleSubmit,
  } = useUserProfileCheck();
  useEffect(() => {
    checkUserProfile();
  }, []);
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [state, setState] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclose();
  const [userInfo, setUserInfo] = useState(null);
  const [properties, setProperties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [owner, setOwner] = useState("");

  useEffect(() => {
    const backAction = () => {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        Alert.alert("Exit App", "Do you want to exit?", [
          { text: "Cancel", style: "cancel" },
          { text: "Exit", onPress: () => BackHandler.exitApp() },
        ]);
      }
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [navigation]);
  const formatToIndianCurrency = (value) => {
    if (value >= 10000000) return (value / 10000000).toFixed(2) + " Cr";
    if (value >= 100000) return (value / 100000).toFixed(2) + " L";
    if (value >= 1000) return (value / 1000).toFixed(2) + " K";
    return value?.toString();
  };
  const contactNow = (item) => {
    setSelectedPropertyId(item);
    setModalVisible(true);
  };
  const PropertyCard = memo(
    ({ item, onShare, onFav, onNavigate, handleWhatsappChat }) => {
      const area = item.builtup_area
        ? `${item.builtup_area} sqft`
        : `${item.length_area || 0} x ${item.width_area || 0} sqft`;
      const [isLiked, setIsLiked] = useState(true);
      const handleFavClick = () => {
        setIsLiked(false);
        onFav(item);
      };
      return (
        <View style={styles.containerVstack}>
          <Pressable onPress={() => onNavigate(item)}>
            <VStack alignItems="flex-start">
              <View style={styles.imageContainer}>
                <PropertyImage item={item} />
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => onFav(item)}
                  >
                    <Ionicons
                      name={isLiked ? "heart" : "heart-outline"}
                      size={18}
                      color={isLiked ? "#FE4B09" : "#000"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => onShare(item)}
                  >
                    <Ionicons
                      name="share-social-outline"
                      size={18}
                      color="#000"
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <HStack>
                <Text style={styles.possesionText}>
                  {item?.occupancy === "Ready to move"
                    ? "Ready to move"
                    : item?.under_construction
                    ? `Possession by ${new Date(
                        item.under_construction
                      ).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}`
                    : "N/A"}
                </Text>
                <Text style={styles.possesionText}>|</Text>
                <Text style={styles.possesionText}>{area}</Text>
              </HStack>
              <VStack style={styles.contentContainer}>
                <HStack
                  justifyContent="space-between"
                  alignItems="center"
                  // px={2}
                  width="100%"
                >
                  <Text
                    numberOfLines={1}
                    style={[styles.propertyText, { flex: 1 }]}
                  >
                    {item.property_name || "N/A"}
                  </Text>

                  <HStack space={1} alignItems="center">
                    <Image
                      alt="approve"
                      source={ApprovedIcon}
                      style={{ width: 16, height: 16 }}
                      resizeMode="contain"
                    />
                    <Text
                      fontSize="12"
                      style={{ fontFamily: "PoppinsSemiBold" }}
                      color="green.600"
                    >
                      Verified
                    </Text>
                  </HStack>
                </HStack>
                <HStack
                  justifyContent={"space-between"}
                  space={1}
                  alignItems="center"
                >
                  <Text style={styles.propertyText}>
                    ₹ {formatToIndianCurrency(item.property_cost || 0)}
                  </Text>
                </HStack>
                <Text style={styles.propertyText}>
                  {item.property_in || "N/A"} | {item.sub_type || "N/A"}
                </Text>
              </VStack>
            </VStack>
          </Pressable>
          <HStack
            justifyContent="space-between"
            space={2}
            py={3}
            mb={1.5}
            px={2}
            style={{ borderTopWidth: 2, borderTopColor: "#f5f5f5" }}
            alignItems="center"
          >
            <Pressable
              style={styles.whatsbuttonStyles}
              flex={0.5}
              onPress={() => handleWhatsappChat(item)}
            >
              <HStack space={1} alignItems="center" justifyContent="center">
                <Image
                  source={WhatsAppIcon}
                  alt="WhatsApp Icon"
                  width={5}
                  height={5}
                  resizeMode="contain"
                />
                <Text style={styles.WhatsbuttonsText}>Chat</Text>
              </HStack>
            </Pressable>
            <Pressable
              style={styles.buttonStyles}
              flex={0.5}
              onPress={() => contactNow(item)}
            >
              <Text style={styles.buttonsText}>Contact</Text>
            </Pressable>
          </HStack>
        </View>
      );
    }
  );
  const fetchIntrestedProperties = async (userInfo) => {
    setIsLoading(true);
    try {
      if (!userInfo?.id) {
        console.warn("User ID not found in userInfo:", userInfo);
        return;
      }
      const response = await axios.get(
        `${config.awsApiUrl}/fav/v1/getAllFavourites?user_id=${userInfo.id}`
      );
      const liked = response.data.favourites || [];

      setProperties(liked);
      const likedIds = liked
        .map((fav) => fav.unique_property_id)
        .filter(Boolean);
      dispatch(setIntrestedProperties(likedIds));
    } catch (error) {
      console.error("Error fetching interested properties:", error);
      Toast.show({
        placement: "top-right",
        render: () => (
          <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
            Failed to fetch favorites.
          </Box>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };
  const handleInterestAPI = async (property) => {
    if (!userInfo) {
      Toast.show({
        placement: "top-right",
        render: () => (
          <Box bg="yellow.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
            Please log in to save property!
          </Box>
        ),
      });
      return;
    }
    const payload = {
      user_id: userInfo.id,
      unique_property_id: property.unique_property_id,
      property_name: property.property_name,
    };
    try {
      await axios.post(`${config.awsApiUrl}/fav/v1/postIntrest`, payload);
      await fetchIntrestedProperties(userInfo);
      Toast.show({
        placement: "top-right",
        render: () => (
          <Box bg="green.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
            Removed from favorites
          </Box>
        ),
      });
    } catch (error) {
      console.error("Error posting interest:", error);
    }
  };
  const getOwnerDetails = async (id) => {
    try {
      const response = await fetch(
        `https://api.meetowner.in/listings/v1/getSingleProperty?unique_property_id=${id}`
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const propertydata = data.property;
      const sellerdata = propertydata.user;
      return sellerdata || {};
    } catch (error) {
      return {};
    }
  };
  const handleWhatsappChat = useCallback(
    async (property) => {
      try {
        let ownerData = await getOwnerDetails(property.unique_property_id);
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
  const shareProperty = async (property) => {
    try {
      await Share.share({
        title: property.property_name || "Check out this property!",
        message: `${property.property_name}\nLocation: ${property.google_address}\nhttps://api.meetowner.in/property?unique_property_id=${property.unique_property_id}`,
        url:
          property.image && property.image.trim() !== ""
            ? `https://api.meetowner.in/uploads/${property.image}`
            : undefined,
      });
    } catch (error) {
      console.error("Error sharing property:", error);
      Toast.show({
        placement: "top-right",
        render: () => (
          <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
            Failed to share property.
          </Box>
        ),
      });
    }
  };
  const handleShare = useCallback((item) => {
    shareProperty(item);
  }, []);
  const onNavigate = (item) => {
    dispatch(setPropertyDetails(item));
    navigation.navigate("PropertyDetails");
  };
  useFocusEffect(
    useCallback(() => {
      const getData = async () => {
        try {
          const data = await AsyncStorage.getItem("userdetails");
          if (data) {
            const parsedUserDetails = JSON.parse(data);
            setUserInfo(parsedUserDetails);
            await fetchIntrestedProperties(parsedUserDetails);
          } else {
            console.warn("No user details found in AsyncStorage");
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error fetching user details:", error);
          setIsLoading(false);
          Toast.show({
            placement: "top-right",
            render: () => (
              <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
                Failed to load user details.
              </Box>
            ),
          });
        }
      };
      getData();
    }, [])
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Spinner size="lg" color="#1D3A76" />
              <Text style={styles.loadingText}>Loading Favorites...</Text>
            </View>
          ) : properties.length === 0 ? (
            <View style={styles.noFavouritesContainer}>
              <Image
                source={require("../../assets/add_15869358.png")}
                alt="No Favorites"
                resizeMode="contain"
                style={styles.logo}
              />
              <Text style={styles.noPropertiesText}>No Favourites Found</Text>
            </View>
          ) : (
            <FlatList
              data={properties}
              renderItem={({ item }) => (
                <View px={1} py={2}>
                  <PropertyCard
                    item={item}
                    onFav={handleInterestAPI}
                    onShare={handleShare}
                    onNavigate={onNavigate}
                    handleWhatsappChat={handleWhatsappChat}
                  />
                </View>
              )}
              keyExtractor={(item, index) =>
                item?.unique_property_id
                  ? item.unique_property_id.toString()
                  : `item-${index}`
              }
              contentContainerStyle={{
                paddingBottom: 100,
              }}
            />
          )}
          <ContactActionSheet
            isOpen={modalVisible}
            onClose={() => {
              setModalVisible(false);
              setSelectedPropertyId(null);
            }}
            onSubmit={() => {
              setModalVisible(false);
              setSelectedItem(null);
            }}
            userDetails={userInfo}
            title="Enquire Now"
            type="enquireNow"
            selectedPropertyId={selectedPropertyId}
          />
          <UserProfileModal
            visible={showModal}
            user={user}
            loading={loading}
            onCancel={() => setShowModal(false)}
            onChange={handleChange}
            onSubmit={handleSubmit}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  containerVstack: {
    borderRadius: 20,
    backgroundColor: "#ffffff",
    margin: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  propertyText: {
    color: "#000",
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
  },
  searchMoreText: {
    color: "#000",
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
  },
  username: {
    color: "#7C7C7C",
    fontFamily: "Poppins",
    fontSize: 10,
  },
  userType: {
    color: "#7C7C7C",
    fontFamily: "Poppins",
    fontSize: 10,
  },
  possesionText: {
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
    color: "#7C7C7C",
    margin: 5,
  },
  contentContainer: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  buttonStyles: {
    backgroundColor: "#1D3A76",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 30,
    textAlign: "center",
    justifyContent: "center",
    alignItems: "center",
  },
  whatsbuttonStyles: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 30,
    borderColor: "#25D366",
    borderWidth: 1,
  },
  buttonsText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Poppins",
  },
  WhatsbuttonsText: {
    color: "#000",
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Poppins",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
    color: "#1D3A76",
  },
  footerContainer: {
    padding: 20,
    alignItems: "center",
  },
  noFavouritesContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    paddingHorizontal: 15,
  },
  noPropertiesText: {
    color: "#000",
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
    marginTop: 10,
  },
  logo: {
    width: 100,
    height: 100,
  },
  actionButtons: {
    position: "absolute",
    top: 20,
    right: 10,
    flexDirection: "column",
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});
