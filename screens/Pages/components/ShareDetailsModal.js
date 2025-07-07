import React, { useState, useCallback } from "react";
import {
  View,
  TextInput,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import config from "../../../config";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Box, HStack, Text, Toast } from "native-base";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
const ShareDetailsModal = ({
  modalVisible,
  setModalVisible,
  reloadApis,
  selectedPropertyId,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [owner, setOwner] = useState(null);
  const fetchUserDetails = useCallback(async () => {
    try {
      const data = await AsyncStorage.getItem("userdetails");
      if (data) {
        const profileData = JSON.parse(data);
        setUserInfo(profileData);
        setName(profileData.name || "");
        setEmail(profileData.email || "");
        setMobile(profileData.mobile || "");
      } else {
        console.warn("No user details found in AsyncStorage");
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      Toast.show({
        placement: "top-right",
        render: () => (
          <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
            Failed to load user details.
          </Box>
        ),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);
  const fetchOwnerDetails = useCallback(async () => {
    if (!selectedPropertyId?.unique_property_id) return;
    try {
      const response = await fetch(
        `https://api.meetowner.in/listings/v1/getSingleProperty?unique_property_id=${selectedPropertyId.unique_property_id}`
      );
      if (!response.ok) throw new Error("Failed to fetch owner details");
      const {
        property: { user: sellerData },
      } = await response.json();
      setOwner(sellerData);
    } catch (err) {
      console.error("Error fetching owner details:", err);
    }
  }, [selectedPropertyId?.unique_property_id]);
  useFocusEffect(
    useCallback(() => {
      if (modalVisible) {
        setIsLoading(true);
        Promise.all([fetchUserDetails(), fetchOwnerDetails()]).finally(() =>
          setIsLoading(false)
        );
      }
    }, [modalVisible, fetchUserDetails, fetchOwnerDetails])
  );
  const sendWhatsAppMessage = useCallback(async () => {
    if (!owner || !userInfo) return;
    const payload = {
      channelId: "67a9e14542596631a8cfc87b",
      channelType: "whatsapp",
      recipient: { name: owner.name, phone: `91${owner?.mobile}` },
      whatsapp: {
        type: "template",
        template: {
          templateName: "leads_information_for_partners_clone",
          bodyValues: {
            name: userInfo.name,
            phone: userInfo.mobile,
            variable_3: selectedPropertyId?.sub_type || "Property",
            variable_4: selectedPropertyId?.property_name,
            variable_5: selectedPropertyId?.google_address
              ?.split(",")[0]
              .trim(),
          },
        },
      },
    };
    try {
      await axios.post(
        "https://server.gallabox.com/devapi/messages/whatsapp",
        payload,
        {
          headers: {
            apiKey: "67e3a37bfa6fbc8b1aa2edcf",
            apiSecret: "a9fe1160c20f491eb00389683b29ec6b",
            "Content-Type": "application/json",
          },
        }
      );
      Toast.show({
        duration: 1000,
        placement: "top-right",
        render: () => (
          <Box bg="green.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
            Details submitted successfully.
          </Box>
        ),
      });
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);
    }
  }, [owner, userInfo, selectedPropertyId]);
  const handleSchedule = useCallback(async () => {
    if (!name || !mobile) {
      Alert.alert("Error", "All fields are required");
      return;
    }
    if (!userInfo || !selectedPropertyId) return;
    setIsLoading(true);
    try {
      await axios.post(`${config.awsApiUrl}/enquiry/v1/contactSeller`, {
        unique_property_id: selectedPropertyId.unique_property_id,
        user_id: userInfo.id,
        fullname: userInfo.name || "N/A",
        email: userInfo.email || "N/A",
        mobile: userInfo.mobile,
      });
      await sendWhatsAppMessage();
      await AsyncStorage.setItem(`alreadySubmitted`, "true");
    } catch (error) {
      console.error("Error in handleSchedule:", error);
    } finally {
      setModalVisible(false);
      reloadApis();
      setIsLoading(false);
    }
  }, [
    name,
    mobile,
    userInfo,
    selectedPropertyId,
    sendWhatsAppMessage,
    reloadApis,
    setModalVisible,
  ]);
  return (
    <View style={styles.container}>
      <HStack justifyContent="space-between" mb={2} alignItems="center">
        <Text fontSize={16} fontWeight="bold">
          Contact Seller
        </Text>
        <TouchableOpacity
          style={styles.closeIcon}
          onPress={() => setModalVisible(false)}
        >
          <Ionicons name="close-circle" size={30} color="#333" />
        </TouchableOpacity>
      </HStack>
      <TextInput
        placeholder="Enter Name"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
        style={styles.input}
        editable={!isLoading}
      />
      <TextInput
        placeholder="Enter Mobile"
        placeholderTextColor="#999"
        value={mobile}
        onChangeText={setMobile}
        keyboardType="phone-pad"
        style={styles.input}
        editable={!isLoading}
      />
      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSchedule}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? "Submitting..." : "Submit"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    position: "relative",
    width: "100%",
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    marginBottom: 15,
    paddingLeft: 10,
    borderRadius: 8,
  },
  closeIcon: {
    position: "absolute",
    right: -5,
    top: -10,
    zIndex: 1,
  },
  button: {
    backgroundColor: "#1D3A76",
    paddingVertical: 12,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonDisabled: {
    backgroundColor: "#ccc",
  },
  pressable: {
    height: 48,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#000",
    borderRadius: 8,
    marginBottom: 10,
  },
  iconContainer: {
    height: "100%",
    width: "15%",
    justifyContent: "center",
    backgroundColor: "#1D3A76",
    alignItems: "center",
  },
  icon: {
    marginHorizontal: "auto",
  },
  dateText: {
    fontSize: 16,
    color: "#000",
    flex: 1,
    marginLeft: 8,
  },
  placeholderText: {
    fontSize: 14,
    color: "#9ca3af",
    flex: 1,
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(242, 240, 240, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#1D3A76",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalButton: {
    marginTop: 10,
    width: "100%",
    borderColor: "#fff",
    borderWidth: 0.5,
    padding: 10,
    borderRadius: 30,
  },
});

export default ShareDetailsModal;
