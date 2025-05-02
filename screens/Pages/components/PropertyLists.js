import { useState, useCallback, useEffect, useRef, memo } from "react";
import {
  View,
  Text,
  FlatList,
  HStack,
  Image,
  Pressable,
  Spinner,
  IconButton,
  VStack,
  Box,
  Toast,
  StatusBar,
} from "native-base";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useDispatch, useSelector } from "react-redux";
import {
  setIntrestedProperties,
  setPropertyDetails,
} from "../../../store/slices/propertyDetails";
import config from "../../../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Share,
  Linking,
  Platform,
} from "react-native";
import UserAvatar from "./propertyDetailsComponents/UserAvatar";
import WhatsAppIcon from "../../../assets/propertyicons/whatsapp.png";
import ApprovedIcon from "../../../assets/propertyicons/verified.png";
import SearchBarProperty from "./propertyDetailsComponents/SearchBarProperty";
import FilterBar from "./propertyDetailsComponents/FilterBar";
import ShareDetailsModal from "./ShareDetailsModal";
import { setLocation } from "../../../store/slices/searchSlice";
import { debounce } from "lodash";
const userTypeMap = {
  3: "Builder",
  4: "Agent",
  5: "Owner",
  6: "Channel Partner",
};
const PropertyCard = memo(
  ({
    item,
    onFav,
    onNavigate,
    userDetails,
    onShare,
    intrestedProperties,
    contactNow,
    handleWhatsappChat,
  }) => {
    const formatValue = (value) => {
      return value % 1 === 0
        ? parseInt(value)
        : parseFloat(value).toFixed(2).replace(/\.00$/, "");
    };
    const area = item.builtup_area
      ? `${formatValue(item.builtup_area)} sqft`
      : `${formatValue(item.length_area) || 0} x ${
          formatValue(item.width_area) || 0
        } sqft`;
    const isInitiallyInterested = (intrestedProperties || [])?.some(
      (prop) => prop === item?.unique_property_id
    );
    const [isLiked, setIsLiked] = useState(isInitiallyInterested);
    const handleFavClick = () => {
      onFav(item, !isLiked);
      setIsLiked((prev) => !prev);
    };
    const [imageError, setImageError] = useState(false);
    const placeholderImage = "https://placehold.co/400x200.png";
    const imageUri =
      item?.image && item.image.trim() !== "" && !imageError
        ? `https://api.meetowner.in/uploads/${item.image}`
        : placeholderImage;
    const getUserTypeColor = (type) => {
      switch (type) {
        case 3:
          return "#1e3a8a";
        case 4:
          return "#7e22ce";
        case 5:
          return "#16a34a";
        case 6:
          return "#f97316";
        default:
          return "#1e3a8a";
      }
    };
    return (
      <View style={styles.containerVstack}>
        <Pressable onPress={() => onNavigate(item)}>
          <VStack alignItems="flex-start">
            <Image
              source={{ uri: imageUri }}
              alt={`Image of ${item?.property_name || "Property"}`}
              w={400}
              h={200}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleFavClick}
              >
                <Ionicons
                  name={isLiked ? "heart" : "heart-outline"}
                  size={20}
                  color={isLiked ? "#FE4B09" : "#fff"}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => onShare(item)}
              >
                <Ionicons name="share-social-outline" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <HStack>
              {(item.sub_type === "Apartment" ||
                item.sub_type === "Independent Villa") && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {item?.occupancy === "Ready to move" && (
                    <Text style={styles.possessionText}>Ready to move</Text>
                  )}
                  {item?.occupancy === "Under Construction" &&
                    item?.under_construction && (
                      <>
                        <View style={styles.verticalDivider} />
                        <Text style={styles.possessionText}>
                          Possession Starts -{" "}
                          {new Date(item.under_construction).toLocaleDateString(
                            "en-GB",
                            {
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </Text>
                      </>
                    )}
                </View>
              )}
              {item.sub_type === "Plot" && (
                <Text style={styles.possessionText}>
                  {item.possession_status?.toLowerCase() === "immediate"
                    ? "Immediate"
                    : "Future"}
                </Text>
              )}
              {["Others", "Office", "Retail Shop"].includes(item.sub_type) && (
                <Text style={styles.possessionText}>{item.occupancy}</Text>
              )}
              <Text style={styles.possesionText}>|</Text>
              <Text style={styles.possesionText}>
                {["Plot", "Land"].includes(item.sub_type)
                  ? `${formatValue(item.plot_area)} sqyd`
                  : item.builtup_area
                  ? `${formatValue(item.builtup_area)} sqft`
                  : `${formatValue(item.length_area || 0)} x ${formatValue(
                      item.width_area || 0
                    )} sqft`}
              </Text>
            </HStack>
            <VStack style={styles.contentContainer}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text style={styles.propertyText} numberOfLines={1}>
                  {item.property_name || "N/A"}
                </Text>
                <HStack
                  space={1}
                  alignItems="center"
                  px={2}
                  py={0.5}
                  justifyContent="center"
                >
                  <Image
                    alt="approve"
                    source={ApprovedIcon}
                    size={22}
                    color="green"
                    resizeMethod="contain"
                  />
                  <Text
                    fontSize="12"
                    style={{ fontFamily: "PoppinsSemiBold" }}
                    color="green.600"
                    thin
                  >
                    {"Verified"}
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
              {item.sub_type === "Apartment" ||
              item.sub_type === "Independent House" ? (
                <Text style={styles.propertyText}>
                  {item.property_in || "N/A"} | {item.bedrooms} BHK{" "}
                  {item.sub_type || "N/A"} For {item.property_for}
                </Text>
              ) : (
                <Text style={styles.propertyText}>
                  {item.property_in || "N/A"} | {item.sub_type || "N/A"}
                </Text>
              )}
            </VStack>
          </VStack>
        </Pressable>
        <HStack
          justifyContent="space-between"
          space={1}
          py={3}
          mb={1.5}
          px={2}
          style={{ borderTopWidth: 2, borderTopColor: "#f5f5f5" }}
          alignItems="center"
        >
          <Box flex={0.2} alignItems="flex-start">
            <UserAvatar item={item} size={24} />
          </Box>
          <VStack flex={0.5} justifyContent="center">
            <Text
              style={styles.username}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item?.user?.name || "Unknown"}
            </Text>
            <Text
              style={[
                styles.userType,
                { color: getUserTypeColor(item?.user?.user_type) },
              ]}
            >
              {userTypeMap[item?.user?.user_type] || "Unknown"}
            </Text>
          </VStack>
          <TouchableOpacity
            style={styles.whatsbuttonStyles}
            flex={0.25}
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
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonStyles}
            flex={0.25}
            onPress={() => {
              contactNow(item);
            }}
          >
            <Text style={styles.buttonsText}>Contact</Text>
          </TouchableOpacity>
        </HStack>
      </View>
    );
  }
);
const mapTabToPropertyFor = (tab) => {
  const mapping = {
    Buy: "Sell",
    Rent: "Rent",
    Plot: "Sell",
    Commercial: "Sell",
  };
  return mapping[tab] || "Sell";
};
const formatToIndianCurrency = (value) => {
  if (value >= 10000000) return (value / 10000000).toFixed(2) + " Cr";
  if (value >= 100000) return (value / 100000).toFixed(2) + " L";
  if (value >= 1000) return (value / 1000).toFixed(2) + " K";
  return value.toString();
};
export default function PropertyLists({ route }) {
  const intrestedProperties = useSelector(
    (state) => state.property.intrestedProperties
  );
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const [properties, setProperties] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [paginationLoading, setPaginationLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [page, setPage] = useState(1);
  const {
    tab,
    property_in,
    property_for,
    sub_type,
    bhk,
    occupancy,
    location,
    possession_status,
    price,
    city,
  } = useSelector((state) => state.search);
  const [searchQuery, setSearchQuery] = useState(location || "");
  const [userDetails, setUserDetails] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const locationCacheRef = useRef({});
  const [userInfo, setUserInfo] = useState("");
  const [filters, setFilters] = useState({
    property_for: property_for || "Sell",
    property_in: property_in || "Residential",
    sub_type: sub_type || "Apartment",
    search: location || "",
    bedrooms: bhk || "",
    property_cost: "",
    priceFilter: price || "Relevance",
    occupancy: occupancy || "",
    possession_status: possession_status || "",
    property_status: 1,
  });
  const mapPriceFilterToApiValue = (priceFilter) => {
    const validFilters = [
      "Relevance",
      "Price: Low to High",
      "Price: High to Low",
      "Newest First",
    ];
    return validFilters.includes(priceFilter) ? priceFilter : "Relevance";
  };
  const debouncedFetchProperties = useCallback(
    debounce((reset, appliedFilters) => {
      fetchProperties(reset, appliedFilters);
    }, 3000),
    []
  );
  useEffect(() => {
    const updatedFilters = {
      property_for: property_for || "Sell",
      property_in:
        property_in ||
        (tab === "Commercial"
          ? "Commercial"
          : tab === "Plot"
          ? ""
          : "Residential"),
      sub_type:
        sub_type ||
        (tab === "Plot"
          ? "Plot"
          : tab === "Commercial"
          ? "Retail Shop"
          : "Apartment"),
      bedrooms: bhk || "",
      occupancy: occupancy || "",
      possession_status: possession_status || "",
      search: location || "",
      priceFilter: price || "Relevance",
      property_cost: "",
      property_status: 1,
    };
    setFilters(updatedFilters);
    setSearchQuery(location || "");
    setPage(1);
    setProperties([]);
    fetchProperties(true, updatedFilters);
  }, [tab, property_in, sub_type, bhk, occupancy, location, price]);
  const fetchProperties = useCallback(
    async (reset = false, appliedFilters = filters) => {
      if (!hasMore && !reset) return;
      if (reset) setInitialLoading(true);
      else setPaginationLoading(true);
      setError(null);
      try {
        const pageToFetch = reset ? 1 : page;
        const cacheKey = `${location}_${JSON.stringify(appliedFilters)}`;
        if (locationCacheRef.current[cacheKey] && !reset && pageToFetch === 1) {
          setProperties(locationCacheRef.current[cacheKey]);
          setHasMore(true);
          setInitialLoading(false);
          setPaginationLoading(false);
          return;
        }
        const isPlotOrLand =
          appliedFilters.sub_type === "Plot" ||
          appliedFilters.sub_type === "Land";
        const queryParams = new URLSearchParams({
          page: pageToFetch,
          property_for: appliedFilters.property_for || "Sell",
          property_in: appliedFilters.property_in || "",
          sub_type: appliedFilters.sub_type || "",
          search: appliedFilters.search || "",
          bedrooms: appliedFilters.bedrooms
            ? appliedFilters.bedrooms.replace(" BHK", "")
            : "",
          property_cost: appliedFilters.property_cost || "",
          priceFilter: encodeURIComponent(
            mapPriceFilterToApiValue(appliedFilters.priceFilter)
          ),
          ...(isPlotOrLand
            ? { possession_status: appliedFilters.possession_status || "" }
            : { occupancy: appliedFilters.occupancy || "" }),
          property_status: "1",
        }).toString();
        const url = `https://api.meetowner.in/listings/v1/getAllPropertiesByType?${queryParams}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        if (data?.properties?.length > 0) {
          setProperties((prev) => {
            const newProperties = reset
              ? data.properties
              : [...prev, ...data.properties];
            return newProperties;
          });
          setPage(pageToFetch + 1);
          setHasMore(data.current_page < data.total_pages);
          if (reset || pageToFetch === 1) {
            locationCacheRef.current[cacheKey] = data.properties;
          }
        } else {
          if (reset) setProperties([]);
          setHasMore(false);
        }
      } catch (error) {
        setError("Failed to load properties. Please try again.");
        if (reset) setProperties([]);
        setHasMore(false);
      } finally {
        setInitialLoading(false);
        setPaginationLoading(false);
        if (reset) setRefreshing(false);
      }
    },
    [page, hasMore]
  );
  useEffect(() => {
    const getData = async () => {
      try {
        const data = await AsyncStorage.getItem("userdetails");
        if (data) {
          const parsedUserDetails = JSON.parse(data);
          setUserInfo(parsedUserDetails);
          setUserDetails(parsedUserDetails);
          await fetchIntrestedProperties(parsedUserDetails);
        } else {
          console.warn("No user details found in AsyncStorage");
        }
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };
    getData();
  }, []);
  const handleAPI = async (item) => {
    const owner = await getOwnerDetails(item.unique_property_id);
    const payload = {
      channelId: "67a9e14542596631a8cfc87b",
      channelType: "whatsapp",
      recipient: {
        name: owner?.name || "Unknown",
        phone: `91${owner?.mobile}`,
      },
      whatsapp: {
        type: "template",
        template: {
          templateName: "leads_information_for_partners_clone",
          bodyValues: {
            name: userDetails?.name || "User",
            phone: userDetails?.mobile || "",
            variable_3: item?.sub_type || "Property",
            variable_4: item?.property_name || "N/A",
            variable_5: item?.google_address?.split(",")[0]?.trim() || "N/A",
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
      await axios.post(
        "https://server.gallabox.com/devapi/messages/whatsapp",
        payload,
        { headers }
      );
      Toast.show({
        duration: 1000,
        placement: "top-right",
        render: () => (
          <Box bg="green.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
            Details submitted successfully.
          </Box>
        ),
      });
    } catch (error) {
      Toast.show({
        placement: "top-right",
        render: () => (
          <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
            Failed to send WhatsApp message.
          </Box>
        ),
      });
    }
  };
  const handleInterestAPI = async (property, isAlreadyLiked) => {
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
      User_user_id: userInfo.user_id,
      userName: userInfo.name,
      userEmail: userInfo?.email || "N/A",
      userMobile: userInfo.mobile,
      ...property,
      status: isAlreadyLiked ? 1 : 0,
    };
    try {
      await fetch(`${config.awsApiUrl}/fav/v1/postIntrest`, {
        method: "POST",
        body: payload,
      });
      await handleAPI(property);
      await fetchIntrestedProperties(userInfo);
      Toast.show({
        placement: "top-right",
        render: () => (
          <Box bg="green.300" px="2" py="1" rounded="sm" mb={5}>
            {isAlreadyLiked ? "Added to favorites" : "Removed from favorites"}
          </Box>
        ),
      });
    } catch (error) {
      Toast.show({
        placement: "top-right",
        render: () => (
          <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
            Failed to update favorite. Please try again.
          </Box>
        ),
      });
    }
  };
  const fetchIntrestedProperties = async (userInfo) => {
    try {
      if (!userInfo?.user_id) {
        return;
      }
      const response = await axios.get(
        `${config.awsApiUrl}/fav/v1/getAllFavourites?user_id=${userInfo.user_id}`
      );
      const liked = response.data.favourites || [];
      const likedIds = liked.map((fav) => fav.unique_property_id);
      dispatch(setIntrestedProperties(likedIds));
    } catch (error) {}
  };
  const getOwnerDetails = async (property) => {
    try {
      const response = await fetch(
        `https://api.meetowner.in/listings/getsingleproperty?unique_property_id=${property?.unique_property_id}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return data.property_details?.seller_details || {};
    } catch (error) {
      return {};
    }
  };
  const handleFavourites = useCallback(
    async (item, action) => {
      try {
        await handleInterestAPI(item, action);
      } catch (error) {
        console.error("Error in handleFavourites:", error);
        Toast.show({
          placement: "top-right",
          render: () => (
            <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
              Failed to add favourite.
            </Box>
          ),
        });
      }
    },
    [userDetails]
  );
  const shareProperty = async (property) => {
    try {
      await Share.share({
        title: property?.property_name || "Check out this property!",
        message: `${property?.property_name}\nLocation: ${property?.location_id}\nhttps://api.meetowner.in/property?unique_property_id=${property.unique_property_id}`,
        url: `https://api.meetowner.in/property?unique_property_id=${property?.unique_property_id}`,
      });
    } catch (error) {
      console.error("Error sharing property:", error);
    }
  };
  const handleShare = useCallback((item) => {
    shareProperty(item);
  }, []);
  const handleNavigate = useCallback(
    (item) => {
      dispatch(setPropertyDetails(item));
      navigation.navigate("PropertyDetails");
    },
    [navigation, dispatch]
  );
  const getItemLayout = useCallback(
    (_, index) => ({
      length: 300,
      offset: 300 * index,
      index,
    }),
    []
  );
  const contactNow = (item) => {
    setSelectedItem(item);
    setSelectedPropertyId(item);
    setModalVisible(true);
  };
  const [owner, setOwner] = useState("");
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
  const renderPropertyCard = useCallback(
    ({ item }) => (
      <PropertyCard
        item={item}
        onFav={handleFavourites}
        onNavigate={handleNavigate}
        userDetails={userDetails}
        onShare={() => handleShare(item)}
        intrestedProperties={intrestedProperties}
        contactNow={contactNow}
        handleWhatsappChat={handleWhatsappChat}
      />
    ),
    [handleFavourites, handleNavigate, userDetails, intrestedProperties]
  );
  const handleScroll = useCallback((event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowScrollToTop(offsetY > 100);
  }, []);
  const scrollToTop = useCallback(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      setShowScrollToTop(false);
    }
  }, []);
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    setProperties([]);
    fetchProperties(true, filters);
  }, [filters, fetchProperties]);
  const loadMoreProperties = useCallback(() => {
    if (!paginationLoading && hasMore) {
      fetchProperties(false);
    }
  }, [paginationLoading, hasMore, fetchProperties]);
  const handleLocationSearch = useCallback(
    (query) => {
      setSearchQuery(query);
      dispatch(setLocation(query));
      const updatedFilters = { ...filters, search: query };
      setFilters(updatedFilters);
      setPage(1);
      setProperties([]);
      debouncedFetchProperties(true, updatedFilters);
    },
    [filters, debouncedFetchProperties, dispatch]
  );
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={"#f5f5f5"} />
      <View style={styles.container}>
        <SearchBarProperty
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleLocationSearch={handleLocationSearch}
          fetchProperties={fetchProperties}
          filters={filters}
          setFilters={setFilters}
          selectedCity={city}
        />
        <FilterBar />
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : initialLoading ? (
          <View style={styles.loadingContainer}>
            <Spinner size="lg" color="#1D3A76" />
            <Text style={styles.loadingText}>Loading Properties...</Text>
          </View>
        ) : properties.length > 0 ? (
          <FlatList
            ref={flatListRef}
            data={properties}
            keyExtractor={(item) => item.unique_property_id}
            renderItem={renderPropertyCard}
            onEndReached={loadMoreProperties}
            onEndReachedThreshold={0.7}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            initialNumToRender={10}
            maxToRenderPerBatch={50}
            windowSize={21}
            updateCellsBatchingPeriod={50}
            getItemLayout={getItemLayout}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#1D3A76"]}
              />
            }
            ListFooterComponent={
              paginationLoading ? (
                <View style={styles.loaderContainer}>
                  <Spinner size="small" color="#1D3A76" />
                </View>
              ) : !hasMore && properties.length > 0 ? (
                <View style={styles.footerContainer}>
                  <Text style={styles.footerText}>No More Properties</Text>
                </View>
              ) : null
            }
          />
        ) : (
          <View style={styles.noPropertiesContainer}>
            <Text style={styles.noPropertiesText}>No properties found</Text>
          </View>
        )}
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
        {showScrollToTop && (
          <IconButton
            position="absolute"
            bottom={10}
            right={5}
            bg="white"
            borderRadius="full"
            shadow={3}
            icon={<Ionicons name="arrow-up" size={24} color="#1D3A76" />}
            onPress={scrollToTop}
          />
        )}
      </View>
    </>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 10,
    paddingTop: 2,
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
    fontWeight: "bold",
  },
  userType: {
    color: "#7C7C7C",
    fontFamily: "Poppins",
    fontSize: 10,
    fontWeight: "bold",
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
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 30,
  },
  possessionText: {
    fontSize: 14,
    fontFamily: "PoppinsSemiBold",
    color: "gray",
    marginTop: 5,
    marginLeft: 5,
  },
  whatsbuttonStyles: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 17,
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
    fontWeight: "bold",
    color: "#1D3A76",
  },
  footerContainer: {
    padding: 20,
    alignItems: "center",
  },
  noPropertiesContainer: {
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    paddingHorizontal: 15,
  },
  noPropertiesText: {
    color: "#000",
    fontFamily: "PoppinsSemiBold",
    fontSize: 14,
  },
  actionButtons: {
    position: "absolute",
    top: 10,
    right: 10,
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
});
