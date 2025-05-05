import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  SafeAreaView,
  Platform,
  KeyboardAvoidingView,
  BackHandler,
  Alert,
  ScrollView,
} from "react-native";
import { StatusBar } from "native-base";
import HerosSection from "./components/HerosSection";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import FilterTabs from "./components/FilterTabs";
import HomeWrapper from "./components/HomeScreenWrapper/HomeWrapper";

export default function HomeScreen() {
  const [activeTab, setActiveTab] = useState("Sell");
  const [selectedCity, setSelectedCity] = useState("Hyderabad");

  const handleActiveTab = (tab) => {
    setActiveTab(tab);
  };

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
    }
    if (Platform.OS === "android") {
      Notifications.setNotificationChannelAsync("default", {
        name: "default",
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: "#FF231F7C",
      });
    }
    return token;
  }

  async function savePushTokenToBackend(user_id, mobile, pushToken) {
    try {
      const response = await fetch(
        "https://api.meetowner.in/user/v1/insertToken",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: user_id,
            mobile: mobile,
            push_token: pushToken,
          }),
        }
      );
      const result = await response.json();
      if (result.success) {
      }
    } catch (error) {}
  }

  useEffect(() => {
    const getData = async () => {
      const userDataString = await AsyncStorage.getItem("userdetails");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        registerForPushNotificationsAsync().then((token) => {
          if (token) {
            savePushTokenToBackend(userData?.user_id, userData?.mobile, token);
            AsyncStorage.setItem("pushToken", token);
          }
        });
        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: true,
          }),
        });
      }
    };
    getData();
  }, []);

  const [exitCount, setExitCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (exitCount === 1) {
          BackHandler.exitApp();
        } else {
          Alert.alert(
            "Exit App",
            "Are you sure you want to exit?",
            [
              {
                text: "Cancel",
                onPress: () => null,
                style: "cancel",
              },
              {
                text: "Exit",
                onPress: () => BackHandler.exitApp(),
              },
            ],
            { cancelable: false }
          );
          setExitCount(1);
          setTimeout(() => setExitCount(0), 2000);
        }
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => backHandler.remove();
    }, [exitCount])
  );
  const componentBackgroundColor = "#fff";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <SafeAreaProvider>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar
            barStyle="dark-content"
            backgroundColor={componentBackgroundColor}
          />
          <ScrollView
            style={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            <FilterTabs />
            <HerosSection
              handleActiveTab={handleActiveTab}
              setSelectedCity={setSelectedCity}
            />
            <HomeWrapper activeTab={activeTab} selectedCity={selectedCity} />
          </ScrollView>
        </SafeAreaView>
      </SafeAreaProvider>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },

  contentContainer: {
    flex: 1,
  },
  flatListContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 10,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 10,
    paddingHorizontal: 10,
  },
});
