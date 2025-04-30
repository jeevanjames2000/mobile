import { Text } from "native-base";
import React, { useEffect, useState } from "react";
import { StyleSheet, SafeAreaView, StatusBar, View,BackHandler, } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
const componentBackgroundColor = "#fff";

export default function ShortSoon() {
        const navigation = useNavigation();
      React.useEffect(() => {
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
      }, []);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={componentBackgroundColor}
        />
        <View style={styles.contentContainer}>
          <Text
            fontSize={20}
            fontFamily={"PoppinsSemiBold"}
            style={styles.title}
          >
            Coming soon
          </Text>
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  contentContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontFamily: "PoppinsSemiBold",
    color: "#333",
  },
});