import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  SafeAreaView,
  Platform,
} from "react-native";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "native-base";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
export default function OtpScreen() {
  const route = useRoute();
  const { mobile, userDetails, token, isWhatsApp, international, countryCode } =
    route.params || {};

  const navigation = useNavigation();
  const BYPASS_NUMBERS = ["6302816551", "9701652639", "6305625580"];
  const ADMIN_BYPASS_CODE = "984870";
  const otpLength = 6;
  const [otp, setOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState(new Array(otpLength).fill(""));
  const inputs = useRef([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const getStoragedata = async () => {
      const data = await AsyncStorage.getItem("userdetails");
      return data ? JSON.parse(data) : null;
    };
    getStoragedata();
    if (mobile) {
      if (BYPASS_NUMBERS.includes(mobile)) {
        setOtp(ADMIN_BYPASS_CODE);
      } else {
        if (isWhatsApp) {
          sendWhatsAppMessage(mobile);
        } else {
          sendOTP(mobile);
        }
      }
    }
  }, [mobile]);
  const sendOTP = async (mobile) => {
    setError("");
    try {
      const response = await axios.get(
        `https://api.meetowner.in/auth/sendOtp?mobile=${mobile}`
      );
      const data = response.data;
      if (data.status === "success") {
        setOtp(data.otp);
        setMessage("OTP sent successfully to +91 " + mobile);
        setError("");
        setEnteredOtp(new Array(otpLength).fill(""));
      } else {
        setError("Failed to send OTP. Please try again later!");
        setMessage("");
      }
    } catch (error) {
      setError("Something went wrong. Please try again later!");
      setMessage("");
    }
  };
  const handleChange = (value, index) => {
    if (value.length > 1 && /^\d+$/.test(value)) {
      const clippedValue = value.slice(0, otpLength);
      const newOtp = new Array(otpLength).fill("");
      clippedValue.split("").forEach((digit, i) => {
        newOtp[i] = digit;
      });
      setEnteredOtp(newOtp);
      if (inputs.current[otpLength - 1]) {
        inputs.current[otpLength - 1].focus();
      }
      if (clippedValue.length === otpLength) {
        Keyboard.dismiss();
      }
      return;
    }
    if (isNaN(value)) return;
    let newOtp = [...enteredOtp];
    newOtp[index] = value;
    setEnteredOtp(newOtp);
    const completeOtp = newOtp.join("");
    if (completeOtp.length === otpLength) {
      Keyboard.dismiss();
      return;
    }
    if (value && index < otpLength - 1) {
      inputs.current[index + 1].focus();
    }
  };
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace") {
      if (!enteredOtp[index] && index > 0) {
        inputs.current[index - 1].focus();
      }
      if (enteredOtp[index]) {
        const newOtp = [...enteredOtp];
        newOtp[index] = "";
        setEnteredOtp(newOtp);
      }
    }
  };
  const sendWhatsAppMessage = async () => {
    const generatedOtp = Math.floor(100000 + Math.random() * 900000);
    setOtp(generatedOtp);
    setEnteredOtp(new Array(otpLength).fill(""));
    const url = "https://server.gallabox.com/devapi/messages/whatsapp";
    const payload = {
      channelId: "67a9e14542596631a8cfc87b",
      channelType: "whatsapp",
      recipient: {
        name: "Hello",
        phone: `${countryCode.replace("+", "")}${mobile}`,
      },
      whatsapp: {
        type: "template",
        template: {
          templateName: "login_otp",
          bodyValues: { otp: generatedOtp },
        },
      },
    };
    const headers = {
      apiKey: "67e3a37bfa6fbc8b1aa2edcf",
      apiSecret: "a9fe1160c20f491eb00389683b29ec6b",
      "Content-Type": "application/json",
    };
    try {
      const response = await axios.post(url, payload, { headers });
      setMessage(`WhatsApp OTP sent successfully to ${countryCode} ${mobile}`);
      setError("");
      return response.data;
    } catch (error) {
      setError("Failed to send OTP via WhatsApp. Please try again!");
      setMessage("");
      throw error;
    }
  };
  const handleVerifyOtp = async () => {
    const userEnteredOtp = enteredOtp.join("").trim();
    const generatedOtp = String(otp).trim();
    if (
      BYPASS_NUMBERS.includes(mobile) &&
      userEnteredOtp === ADMIN_BYPASS_CODE
    ) {
      await AsyncStorage.multiSet([
        ["token", token],
        ["usermobile", userDetails?.mobile || mobile],
        ["userdetails", JSON.stringify(userDetails)],
      ]);
      setLoading(false);
      setMessage("Admin access granted! 🚀");
      setError("");
      navigation.replace("dashboard");
      return;
    }
    if (userEnteredOtp.length !== otpLength) {
      setError("Please enter a valid 6-digit OTP.");
      setMessage("");
      setLoading(false);
      return;
    }
    if (userEnteredOtp === generatedOtp) {
      await AsyncStorage.multiSet([
        ["token", token],
        ["usermobile", userDetails?.mobile || mobile],
        ["userdetails", JSON.stringify(userDetails)],
      ]);
      setLoading(false);
      setMessage(
        isWhatsApp ? "WhatsApp verification successful!" : "Login successful!"
      );
      setError("");
      navigation.replace("dashboard");
    } else {
      setLoading(false);
      setError("Incorrect OTP. Please try again.");
      setMessage("");
    }
  };
  const resendOtp = async () => {
    if (isWhatsApp) {
      await sendWhatsAppMessage(mobile);
    } else {
      await sendOTP(mobile);
    }
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={26} color="#000" />
          </TouchableOpacity>
          <View style={styles.otpView}>
            <Text style={styles.title}>Enter the OTP sent to</Text>
            <View style={styles.otpContainer}>
              {enteredOtp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => (inputs.current[index] = el)}
                  style={styles.input}
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={6}
                  value={digit}
                  onChangeText={(value) => handleChange(value, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                />
              ))}
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            {message ? <Text style={styles.successText}>{message}</Text> : null}
            <TouchableOpacity onPress={resendOtp}>
              <Text style={styles.resendText}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bottomContainer}>
            <Button
              onPress={handleVerifyOtp}
              isLoading={loading}
              style={styles.continueButton}
              isLoadingText="Verifying..."
            >
              <Text style={styles.buttonText}>Continue</Text>
            </Button>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 50 : 30,
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 10,
  },
  otpView: { marginTop: 80, alignItems: "center" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 5 },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 15,
    marginBottom: 10,
  },
  input: {
    width: 45,
    height: 50,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 10,
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
  },
  errorText: { color: "red", marginTop: 10, fontWeight: "bold" },
  successText: { color: "green", marginTop: 10, fontWeight: "bold" },
  resendText: { color: "#1D3A76", fontWeight: "bold", marginTop: 10 },
  bottomContainer: {
    justifyContent: "flex-end",
    paddingBottom: 20,
    backgroundColor: "#fff",
    width: "100%",
  },
  continueButton: {
    backgroundColor: "#1D3A76",
    padding: 15,
    height: 60,
    borderRadius: 30,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
