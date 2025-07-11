import React, { useEffect, useRef, useState } from "react";
import { NativeBaseProvider } from "native-base";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MainNav from "./screens/Navigations/MainNav";
import { Provider, useDispatch } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import store, { persistor } from "./store/store";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import registerNNPushToken from "native-notify";
import { enableScreens } from "react-native-screens";
enableScreens();

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});
export default function App() {
  registerNNPushToken(29649, "F0aj4ZbKXb1zufIIuKYdj3");
  const [expoPushToken, setExpoPushToken] = useState("");
  const [notification, setNotification] = useState(undefined);
  const notificationListener = useRef();
  const responseListener = useRef();
  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
      if (token) {
        setExpoPushToken(token);
      }
    });
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        setNotification(notification);
      });
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {});
    return () => {
      if (notificationListener.current) {
        Notifications.removeNotificationSubscription(
          notificationListener.current
        );
      }
      if (responseListener.current) {
        Notifications.removeNotificationSubscription(responseListener.current);
      }
    };
  }, []);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <NativeBaseProvider>
            <AppContent
              expoPushToken={expoPushToken}
              setNotification={setNotification}
              notificationListener={notificationListener}
              responseListener={responseListener}
            />
          </NativeBaseProvider>
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
function AppContent({ expoPushToken, setNotification }) {
  const dispatch = useDispatch();
  const [userData, setUserData] = useState(null);
  useEffect(() => {
    const getData = async () => {
      try {
        const userDataString = await AsyncStorage.getItem("userdetails");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          setUserData(userData);
        }
      } catch (error) {}
    };
    getData();
  }, [dispatch]);
  useEffect(() => {
    if (expoPushToken && userData?.id && userData?.mobile) {
      fetch("https://api.meetowner.in/user/v1/insertToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userData.id,
          mobile: userData.mobile,
          push_token: expoPushToken,
        }),
      })
        .then((res) => res.json())
        .then((data) => {})
        .catch((error) => {});
    }
  }, [expoPushToken, userData]);
  return <MainNav />;
}
async function registerForPushNotificationsAsync() {
  let token;
  if (!Device.isDevice) {
    Alert.alert(
      "Error",
      "Push notifications require a physical device, not a simulator."
    );
    return;
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== "granted") {
    return;
  }
  try {
    token = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "871b5e55-6c02-430a-9cc9-6d6fbb44af89",
      })
    ).data;
  } catch (error) {}
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#ffffff",
    });
  }
  return token;
}
