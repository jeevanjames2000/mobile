import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image, Spinner, Text, Toast } from "native-base";
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
export default function SplashScreen() {
  const navigation = useNavigation();
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const data = await AsyncStorage.getItem("userdetails");
        const parsedUserDetails = data ? JSON.parse(data) : null;
        let routeName = "Login";
        if (token) {
          try {
            if (token) {
              if (parsedUserDetails) {
                routeName = "dashboard";
              } else {
                await AsyncStorage.removeItem("token");
                await AsyncStorage.removeItem("userdetails");
                routeName = "Login";
              }
            } else {
              await AsyncStorage.removeItem("token");
              await AsyncStorage.removeItem("userdetails");
              Toast.show({
                title: "Session expired. Please login again.",
                duration: 3000,
              });
              routeName = "Login";
            }
          } catch (error) {
            await AsyncStorage.removeItem("token");
            routeName = "Login";
          }
        } else {
          routeName = "Login";
        }
        setTimeout(() => {
          navigation.replace(routeName);
        }, 2000);
      } catch (error) {
        navigation.replace("Login");
      }
    };
    checkToken();
  }, []);
  return (
    <View style={styles.container}>
      <Image
        style={styles.image}
        source={require("../../assets/Screen 1.png")}
        alt="Meet Owner Logo"
        resizeMode="contain"
      />
      <View style={styles.loaderContainer}>
        <Text fontSize={20} fontWeight="bold">
          Welcome to Meetowner
        </Text>
      </View>
      <Spinner size={40} style={{ marginTop: 20 }} />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: "70%",
  },
  loaderContainer: {
    marginTop: -10,
  },
});
