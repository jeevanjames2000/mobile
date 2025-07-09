import React, { useCallback, useEffect, useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import {
  View,
  StyleSheet,
  Platform,
  Keyboard,
  Pressable,
  Image,
} from "react-native";
import { HStack, Text, Icon, Toast, Box } from "native-base";
import HomeScreen from "../Pages/HomeScreen";
import Wishlist from "../Pages/Wishlist";
import Support from "../Pages/Support";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Properties from "../Pages/components/LatestProperties";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Shorts from "../Pages/Shorts";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeHeader = () => {
  const navigation = useNavigation();
  const [photo, setPhoto] = useState(null);
  const [photoError, setPhotoError] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const fetchProfilePhoto = async () => {
        try {
          setIsImageLoading(true);

          const userDetailsData = await AsyncStorage.getItem("userdetails");
          const parsedUserDetails = userDetailsData
            ? JSON.parse(userDetailsData)
            : null;

          if (!parsedUserDetails?.id) {
            setPhotoError(true);

            Toast.show({
              placement: "top-right",
              render: () => (
                <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
                  User ID not found.
                </Box>
              ),
            });
            return;
          }

          const response = await axios.get(
            `https://api.meetowner.in/user/v1/getProfile?user_id=${parsedUserDetails.id}`
          );

          const fetchedData = response.data;

          if (fetchedData && fetchedData.photo) {
            setPhoto(fetchedData.photo);
          } else {
            setPhoto(null);
            setPhotoError(true);
          }
        } catch (error) {
          console.error("Error fetching profile photo:", error);
          setPhotoError(true);

          Toast.show({
            placement: "top-right",
            render: () => (
              <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
                Failed to fetch profile image.
              </Box>
            ),
          });
        } finally {
          setIsImageLoading(false);
        }
      };

      fetchProfilePhoto();
    }, [])
  );

  const getProfileImageSource = () => {
    if (photoError || !photo) {
      return null;
    }
    return { uri: `https://api.meetowner.in/${photo}` };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <HStack
        style={styles.headerContainer}
        justifyContent="space-between"
        alignItems="center"
      >
        <Image
          source={require("../../assets/Untitled-22.png")}
          alt="Meet Owner Logo"
          style={styles.logo}
          resizeMode="contain"
        />
        <Pressable onPress={() => navigation.navigate("Profile")}>
          {getProfileImageSource() ? (
            <Image
              source={getProfileImageSource()}
              alt="Profile Photo"
              style={styles.profileImage}
              onLoadStart={() => setIsImageLoading(true)}
              onLoad={() => setIsImageLoading(false)}
              onError={() => {
                setPhotoError(true);
                setIsImageLoading(false);
              }}
              resizeMode="cover"
            />
          ) : (
            <Icon
              as={Ionicons}
              name="person-circle-outline"
              size={38}
              color="#000"
            />
          )}
        </Pressable>
      </HStack>
    </SafeAreaView>
  );
};

const CustomHeader = ({ title, icon, routeName }) => {
  const navigation = useNavigation();
  return (
    <HStack style={styles.header} justifyContent="start" alignItems="center">
      <Pressable onPress={() => navigation.goBack()}>
        <Icon as={Ionicons} name="chevron-back-outline" size={6} color="#000" />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </HStack>
  );
};

const CustomHeaderShorts = ({ title, icon, routeName }) => {
  const navigation = useNavigation();

  return (
    <HStack
      style={[
        styles.headerShots,
        routeName === "Shorts" ? styles.transparentHeaderShots : null,
      ]}
      justifyContent="start"
      alignItems="center"
    >
      <Pressable onPress={() => navigation.goBack()}>
        <Icon
          as={Ionicons}
          name="chevron-back-outline"
          size={6}
          color={routeName === "Shorts" ? "#FFF" : "#000"}
        />
      </Pressable>
      <Text
        style={[
          styles.titleShots,
          routeName === "Shorts" ? styles.lightTextShots : null,
        ]}
      >
        {title}
      </Text>
    </HStack>
  );
};
function BottomTabs() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [isShortsVisible, setShortsVisible] = useState(false);
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        header: () => {
          switch (route.name) {
            case "Home":
              return <HomeHeader />;
            case "Wishlist":
              return <CustomHeader title="Wishlist" />;
            case "Shorts":
              return (
                <CustomHeaderShorts
                  title="Shorts"
                  icon="heart-outline"
                  routeName="Shorts"
                />
              );
            case "Support":
              return <CustomHeader title="Customer Support" />;
            default:
              return null;
          }
        },
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Wishlist") {
            iconName = focused ? "heart" : "heart-outline";
          } else if (route.name === "Shorts") {
            iconName = focused ? "play-circle" : "play-circle-outline";
          } else if (route.name === "Support") {
            iconName = focused ? "headset" : "headset-outline";
          }
          return (
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={28} color={color} />
            </View>
          );
        },
        tabBarActiveTintColor: "#1D3A76",
        tabBarInactiveTintColor: "#1D3A76",
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Wishlist" component={Wishlist} />
      <Tab.Screen
        name="Shorts"
        component={Shorts}
        options={{
          tabBarStyle: { display: "none" },
        }}
      />
      <Tab.Screen name="Support" component={Support} />
    </Tab.Navigator>
  );
}
export default function PageNavs() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTabs" component={BottomTabs} />
      <Stack.Screen name="Properties" component={Properties} />
    </Stack.Navigator>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
  },
  tabBar: {
    position: "absolute",
    bottom: Platform.select({ ios: 20, android: 5 }),
    width: "auto",
    alignSelf: "center",
    elevation: 5,
    backgroundColor: "#fff",
    borderRadius: 30,
    height: 70,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 5,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    margin: 5,
    marginLeft: 10,
    marginRight: 10,
  },
  transparentHeader: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 18,
    backgroundColor: "rgba(255, 255, 255, 0)",
  },
  iconButton: {
    padding: 12,
  },
  hiddenTabBar: {
    display: "none",
  },
  iconContainer: {
    flex: 1,
    position: "absolute",
    bottom: Platform.select({ ios: 0, android: 14 }),
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    paddingBottom: Platform.OS === "ios" ? 0 : 10,
    paddingTop: 10,
    paddingHorizontal: 18,
    backgroundColor: "#fff",
  },
  logo: {
    width: 120,
    height: 40,
  },
  header: {
    paddingBottom: 10,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 18,
    backgroundColor: "#f5f5f5",
  },
  headerContainerShots: {
    paddingBottom: 10,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 18,
    backgroundColor: "#fff",
  },
  headerShots: {
    paddingBottom: 10,
    paddingTop: Platform.OS === "ios" ? 20 : 20,
    paddingHorizontal: 18,
    backgroundColor: "#f5f5f5",
  },
  transparentHeaderShots: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 5,
    backgroundColor: "rgba(255, 255, 255, 0)",
  },
  lightTextShots: {
    color: "#FFF",
  },
  titleShots: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000", // Default text color
    marginLeft: 2,
  },

  title: {
    fontSize: 15,
    marginLeft: 10,
    marginTop: 2,
    color: "#000",
    fontFamily: "PoppinsSemiBold",
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 19,
  },
});
