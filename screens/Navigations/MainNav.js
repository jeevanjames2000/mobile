import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Pressable, Text, StyleSheet, View, TouchableOpacity } from "react-native";
import { HStack, Icon } from "native-base";
import { Ionicons } from "@expo/vector-icons";
import LoginScreen from "../Auth/Login";
import SplashScreen from "../Auth/SplashScreen";
import PageNavs from "./PageNavs";
import OtpScreen from "../Auth/OtpScreen";
import PropertyDetails from "../Pages/components/PropertyDetails";
import Profile from "../Pages/components/Profile";
import PropertyLists from "../Pages/components/PropertyLists";
import Wishlist from "../Pages/Wishlist";
import { Platform } from "react-native";
import Support from "../Pages/Support";
import SearchBox from "../Pages/components/SearchBox";
const Stack = createNativeStackNavigator();

const CustomHeader = ({ navigation, title, route, icon }) => {
  return (
    <HStack
      style={styles.header}
      justifyContent="space-between"
      alignItems="center"
    >
      <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
        <Icon as={Ionicons} name="arrow-back" size={6} color="#000" />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Pressable onPress={() => navigation.navigate(route)}>
        <Icon as={Ionicons} name={icon} size={6} color="#000" />
      </Pressable>
    </HStack>
  );
};


const CustomHeaderFilter = ({ navigation, title, handleClearAll,  }) => {
  return (
    <HStack
      style={styles.header}
      justifyContent="space-between"
      alignItems="center"
    >
      <View>
        <HStack>
          <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
            <Icon as={Ionicons} name="chevron-back-outline" size={6} color="#000" />
          </Pressable>
          <Text style={styles.titleFilter}>{title}</Text>
        </HStack>
        
      </View>
      <TouchableOpacity onPress={handleClearAll}>
        <Text style={styles.clear}>Clear all</Text>
      </TouchableOpacity>
      
    
    </HStack>
  );
};

const CustomHeaderProperties = ({ navigation, title, route, icon }) => {
  return (
    <HStack
      style={styles.headerProperties}
      justifyContent="start"
      alignItems="center"
    >
      <Pressable onPress={() => navigation.goBack()} style={styles.iconButton}>
        <Icon as={Ionicons} name="chevron-back-outline" size={6} color="#000" />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
    </HStack>
  );
};

export default function MainNav() {
  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="OtpScreen"
            component={OtpScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="dashboard"
            component={PageNavs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Support"
            component={Support}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="PropertyDetails"
            component={PropertyDetails}
            options={{ headerShown: true }} // Header is set in PropertyDetails
          />
          <Stack.Screen
            name="Wishlist"
            component={Wishlist}
            options={({ navigation }) => ({
              header: () => (
                <CustomHeader
                  navigation={navigation}
                  title="Wishlist"
                  route="Wishlist"
                  icon=""
                />
              ),
            })}
          />
          <Stack.Screen
            name="Profile"
            component={Profile}
            options={({ navigation }) => ({
              header: () => (
                <CustomHeaderProperties
                  navigation={navigation}
                  title="profile"
                  route="dashboard"
                  icon=""
                />
              ),
            })}
          />
          <Stack.Screen
            name="SearchBox"
            component={SearchBox}
              options={{ headerShown: true }} 
          />
          <Stack.Screen
            name="PropertyList"
            component={PropertyLists}
            options={({ navigation }) => ({
              header: () => (
                <CustomHeaderProperties
                  navigation={navigation}
                  title="Properties"
                  route="Wishlist"
                  icon="heart-outline"
                />
              ),
            })}
          />
        </Stack.Navigator>
      </SafeAreaProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 10,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 18,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#DBDADA",
  },
  headerProperties: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,

    backgroundColor: "#F5F5F5",
  },
  iconButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    marginLeft: 10,
    color: "#000",
    fontFamily: "PoppinsSemiBold",
  },
  titleFilter:{
    fontSize: 18,
    marginLeft: 5,
    color: "#000",
    marginTop:5,
    fontFamily: "PoppinsSemiBold",
  },
  clear:{
    fontSize: 12,
  
    color: "#1A1A1A",
    marginTop:5,
    fontFamily: "Poppins",
    fontWeight:'400'
  }
});
