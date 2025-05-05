import React, { useEffect, useState } from "react";
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
import { HStack, Text, Icon } from "native-base";
import HomeScreen from "../Pages/HomeScreen";
import Wishlist from "../Pages/Wishlist";
import Support from "../Pages/Support";
import Profile from "../Pages/components/Profile";
import { useNavigation } from "@react-navigation/native";
import Properties from "../Pages/components/LatestProperties";
import ShortSoon from "../Pages/ShortSoon";
const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeHeader = () => {
  const navigation = useNavigation();
  return (
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
        <Icon
          as={Ionicons}
          name="person-circle-outline"
          size={38}
          color="#000"
        />
      </Pressable>
    </HStack>
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
                <CustomHeader
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
        component={ShortSoon}
        // options={{
        //   tabBarStyle: { display: "none" },
        // }}
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
    paddingBottom: 10,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 18,
    backgroundColor: "#fff",
    // borderBottomWidth: 1,
    // borderBottomColor: "#ddd",
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
  title: {
    fontSize: 15,
    marginLeft: 10,
    marginTop: 2,
    color: "#000",
    fontFamily: "PoppinsSemiBold",
  },
});
