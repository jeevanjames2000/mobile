import axios from "axios";
import React, { useState, useCallback, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import config from "../../../../config";
import { Toast } from "native-base";
const ContactActionSheet = ({ isOpen, onClose, title, selectedPropertyId }) => {
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "" });
  const [userInfo, setUserInfo] = useState(null);
  const [owner, setOwner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const getOwnerDetails = useCallback(async () => {
    if (!selectedPropertyId?.unique_property_id) return;
    try {
      const res = await fetch(
        `https://api.meetowner.in/listings/getsingleproperty?unique_property_id=${selectedPropertyId.unique_property_id}`
      );
      const data = await res.json();
      if (res.ok && data?.property_details?.seller_details) {
        setOwner(data.property_details.seller_details);
      }
    } catch (err) {
      console.error("Owner fetch failed", err);
    }
  }, [selectedPropertyId]);
  const loadUserDetails = async () => {
    try {
      const storedData = await AsyncStorage.getItem("userdetails");
      if (storedData) {
        const user = JSON.parse(storedData);
        setUserInfo(user);
        setFormData({
          name: user.name || "",
          mobile: user.mobile || "",
          email: user.email || "",
        });
      }
    } catch (error) {
      console.error("AsyncStorage error:", error);
      Toast.show({
        type: "error",
        text1: "Failed to load user details",
      });
    }
  };
  useEffect(() => {
    loadUserDetails();
    getOwnerDetails();
  }, [selectedPropertyId]);
  const handleAPI = async () => {
    const payload = {
      channelId: "67a9e14542596631a8cfc87b",
      channelType: "whatsapp",
      recipient: { name: owner?.name, phone: `91${owner?.mobile}` },
      whatsapp: {
        type: "template",
        template: {
          templateName: "leads_information_for_partners_clone",
          bodyValues: {
            name: userInfo?.name,
            phone: userInfo?.mobile,
            variable_3: selectedPropertyId?.sub_type || "Property",
            variable_4: selectedPropertyId?.property_name,
            variable_5: selectedPropertyId?.google_address
              ?.split(",")[0]
              ?.trim(),
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
        type: "success",
        text1: "Details submitted successfully",
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "WhatsApp API failed",
      });
    }
  };
  const handleSchedule = async () => {
    if (!formData.name || !formData.mobile) {
      Alert.alert("Missing Fields", "Please fill in all required fields.");
      return;
    }
    try {
      setIsLoading(true);
      await axios.post(`${config.awsApiUrl}/enquiry/v1/contactSeller`, {
        unique_property_id: selectedPropertyId.unique_property_id,
        user_id: userInfo.user_id,
        name: formData.name,
        mobile: formData.mobile,
      });
      await handleAPI();
      onClose();
    } catch (err) {
      Toast.show({ type: "error", text1: "Submission failed" });
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Modal
      animationType="slide"
      transparent
      visible={isOpen}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.bottomSheet}>
          <View style={styles.bottomSheetHeader}>
            <Text style={styles.bottomSheetTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.formContainer}>
            {["name", "mobile", "email"].map((field, index) => (
              <React.Fragment key={index}>
                <Text style={styles.label}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </Text>
                <TextInput
                  style={styles.input}
                  value={formData[field]}
                  placeholder={`Enter your ${field}`}
                  onChangeText={(text) =>
                    setFormData({ ...formData, [field]: text })
                  }
                  keyboardType={field === "mobile" ? "phone-pad" : "default"}
                />
              </React.Fragment>
            ))}
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSchedule}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? "Submitting..." : "Submit"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: "55%",
  },
  bottomSheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontFamily: "PoppinsSemiBold",
    color: "#333",
  },
  closeButton: {
    fontSize: 18,
    color: "#333",
  },
  formContainer: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
    fontFamily: "PoppinsMedium",
  },
  input: {
    borderWidth: 2,
    borderColor: "#EDF2FF",
    borderRadius: 30,
    paddingHorizontal: 10,
    paddingVertical: 16,
    marginBottom: 15,
    fontSize: 14,
    fontFamily: "PoppinsRegular",
    shadowColor: "#4979FB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  submitButton: {
    backgroundColor: "#1D3A76",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PoppinsMedium",
  },
});
export default ContactActionSheet;
