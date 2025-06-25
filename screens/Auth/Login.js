import { useNavigation } from "@react-navigation/native";
import { Box, Image, Toast } from "native-base";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  Alert,
  TextInput,
  Animated,
} from "react-native";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setLoggedIn } from "../../store/slices/authSlice";
export default function LoginScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const handleChange = (text) => {
    setMobile(text);
    if (text.length === 10) {
      Keyboard.dismiss();
    }
  };
  const [isLoading, setIsLoading] = useState(false);
  const [whatsapploading, setWhatsappLoading] = useState(false);
  const registerUser = async (type) => {
    const registerApi = "https://api.meetowner.in/auth/registernew";
    try {
      const registerResponse = await axios.post(
        registerApi,
        {
          name: "N/A",
          mobile: mobile,
          city: 4,
          userType: "user",
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      const registerData = registerResponse.data;
      if (registerData.status === "success") {
        navigation.navigate("OtpScreen", {
          mobile,
          userDetails: registerData.user_details,
          token: registerData.accessToken,
          isWhatsApp: type === 1 ? true : false,
        });
        dispatch(setLoggedIn(true));
        Toast.show({
          placement: "top-right",
          render: () => {
            return (
              <Box bg="green.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
                User registered successfully!
              </Box>
            );
          },
        });
      } else {
        Toast.show({
          placement: "top-right",
          render: () => {
            return (
              <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
                Registration failed! Please try again.
              </Box>
            );
          },
        });
      }
    } catch (error) {
      Toast.show({
        placement: "top-right",
        render: () => {
          return (
            <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
              Registration failed! Please try again.
            </Box>
          );
        },
      });
    }
  };
  const checkUserExists = async () => {
    try {
      const checkUserUrl = await axios.post(
        "https://api.meetowner.in/auth/loginnew",
        {
          mobile: mobile,
        }
      );
      const data = checkUserUrl.data;
      if (checkUserUrl.status === 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  };
  const handleLoginOrRegister = async (type) => {
    if (!mobile || mobile.length != 10) {
      return Toast.show({
        placement: "top-right",
        render: () => {
          return (
            <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
              Please enter mobile number!
            </Box>
          );
        },
      });
    }
    const userExists = await checkUserExists(mobile);
    if (userExists) {
      if (type === 1) {
        const response = await axios.post(
          "https://api.meetowner.in/auth/loginnew",
          {
            mobile: mobile,
          }
        );
        const logindata = response.data;
        navigation.navigate("OtpScreen", {
          mobile,
          userDetails: logindata.user_details,
          token: logindata.accessToken,
          isWhatsApp: true,
        });
      } else {
        const response = await axios.post(
          "https://api.meetowner.in/auth/loginnew",
          {
            mobile: mobile,
          }
        );
        const data = response.data;
        if (data.message === "Login successful") {
          navigation.navigate("OtpScreen", {
            mobile,
            userDetails: data.user_details,
            token: data.accessToken,
            isWhatsApp: false,
          });
          dispatch(setLoggedIn(true));
        }
      }
    } else {
      if (type === 1) {
        await registerUser(type);
      } else {
        await registerUser(type);
      }
    }
  };
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
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const bottomSheetTranslate = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
        Animated.timing(bottomSheetTranslate, {
          toValue: 100,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        Animated.timing(bottomSheetTranslate, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }
    );
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <Image
            style={styles.image}
            source={require("../../assets/finalone.png")}
            alt="Meet Owner"
            resizeMode="cover"
          />
          <Animated.View
            style={[
              styles.bottomSheet,
              { transform: [{ translateY: bottomSheetTranslate }] },
            ]}
          >
            <Image
              source={require("../../assets/Untitled-22.png")}
              alt="Meet Owner Logo"
              style={styles.logo2}
              resizeMethod="contain"
            />
            <View style={styles.inputWrapper}>
              <Text style={styles.prefix}>+91</Text>
              <TextInput
                style={styles.mobileInput}
                keyboardType="phone-pad"
                value={mobile}
                onChangeText={handleChange}
                maxLength={10}
                placeholder="Enter mobile number"
                placeholderTextColor="#ccc"
              />
            </View>
            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => handleLoginOrRegister(0)}
              disabled={isLoading}
            >
              <Text style={styles.loginText}>
                {isLoading ? "Logging in..." : "Login"}
              </Text>
            </TouchableOpacity>
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.orText}>or</Text>
              <View style={styles.divider} />
            </View>
            <View style={styles.logoContainer}>
              <TouchableOpacity
                style={styles.whatsappButton}
                onPress={() => handleLoginOrRegister(1)}
                disabled={whatsapploading}
              >
                <View style={styles.whatsappContent}>
                  <Image
                    source={require("../../assets/whatsapp.png")}
                    alt="whatsapp icon"
                    style={styles.whatsappIcon}
                  />
                  <Text style={styles.whatsappText}>
                    {whatsapploading ? "Please wait..." : "WhatsApp"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.footerText}>
              By Continuing you agree to{" "}
              <Text style={styles.linkText}>Terms of Service</Text> and{" "}
              <Text style={styles.linkText}>Privacy Policy</Text>.
            </Text>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  image: {
    position: "absolute",
    top: 100,
    width: 400,
    height: 350,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "auto",
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  whatsappButton: {
    width: "100%",
    padding: 20,
    borderRadius: 30,
    backgroundColor: "#25D366",
    alignItems: "center",
  },
  whatsappContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  whatsappIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  whatsappText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    width: "70%",
    marginTop: 20,
    height: 45,
    borderBottomWidth: 2,
    borderBottomColor: "#000",
    fontSize: 16,
    paddingLeft: 5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EAF0FF",
    borderRadius: 50,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginTop: 5,
    backgroundColor: "#fff",
  },
  prefix: {
    fontSize: 16,
    color: "#000",
    marginRight: 8,
  },
  mobileInput: {
    flex: 1,
    fontSize: 16,
    color: "#000",
  },
  loginButton: {
    width: "100%",
    padding: 20,
    borderRadius: 30,
    marginTop: 20,
    alignItems: "center",
    backgroundColor: "#1D3A76",
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "90%",
    marginVertical: 10,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ccc",
  },
  orText: {
    marginHorizontal: 10,
    color: "#ddd",
    fontSize: 18,
    fontWeight: "bold",
  },
  signupButton: {
    width: "100%",
    padding: 15,
    borderRadius: 30,
    backgroundColor: "#25D366",
    alignItems: "center",
  },
  signupText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "bold",
  },
  footerText: {
    fontSize: 12,
    color: "#888",
    marginTop: 15,
    textAlign: "center",
  },
  linkText: {
    color: "#000",
    fontWeight: "bold",
  },
  logoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 1,
  },
  logoButton: {
    alignItems: "center",
    marginHorizontal: 10,
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 5,
  },
  logo: {
    width: 30,
    height: 30,
    marginBottom: 0,
  },
  logo2: {
    width: 177,
    height: 60,
    marginBottom: 5,
  },
  logoText: {
    fontSize: 12,
    color: "#333",
  },
});
