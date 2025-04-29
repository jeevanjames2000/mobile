import React, { useEffect, useRef, useState } from "react";
import { NativeBaseProvider } from "native-base";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import MainNav from "./screens/Navigations/MainNav";
import { Provider, useDispatch } from "react-redux";
import store, { persistor } from "./store/store";
import { PersistGate } from "redux-persist/integration/react";
import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

export default function App() {
  const [expoPushToken, setExpoPushToken] = useState("");

  const [notification, setNotification] = useState(undefined);
  const notificationListener = useRef();
  const responseListener = useRef();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NativeBaseProvider>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <AppContent
              setExpoPushToken={setExpoPushToken}
              expoPushToken={expoPushToken}
              setNotification={setNotification}
              notificationListener={notificationListener}
              responseListener={responseListener}
            />
          </PersistGate>
        </Provider>
      </NativeBaseProvider>
    </GestureHandlerRootView>
  );
}
function AppContent({}) {
  const dispatch = useDispatch();
  const [userData, setUserData] = useState([]);
  useEffect(() => {
    const getData = async () => {
      const userDataString = await AsyncStorage.getItem("userdetails");
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setUserData(userData);
      }
    };
    getData();
  }, [dispatch]);
  return <MainNav />;
}
