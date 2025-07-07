import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
} from "react-native";
import axios from "axios";
import config from "../../../../config";
import { Box, useToast } from "native-base";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ContactActionSheet = ({
  isOpen,
  onClose,
  title,
  selectedPropertyId,
  onSubmit,
}) => {
  const toast = useToast();
  const showError = (msg) => {
    toast.show({
      placement: "top-right",
      render: () => (
        <Box bg="red.300" px="2" py="1" rounded="sm" mb={5}>
          <Text>{msg}</Text>
        </Box>
      ),
    });
  };

  const showSuccess = (msg) => {
    toast.show({
      placement: "top-right",
      render: () => (
        <Box bg="green.300" px="2" py="1" rounded="sm" mb={5}>
          <Text>{msg}</Text>
        </Box>
      ),
    });
  };
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "" });
  const [userInfo, setUserInfo] = useState(null);
  const [owner, setOwner] = useState(null);

  const [isLoading, setIsLoading] = useState(false);
  const getOwnerDetails = async (selectedPropertyId) => {
    const response = await fetch(
      `https://api.meetowner.in/listings/v1/getSingleProperty?unique_property_id=${selectedPropertyId.unique_property_id}`
    );
    const data = await response.json();
    const propertydata = data.property;
    const sellerdata = propertydata.user;
    if (response.status === 200) {
      setOwner(sellerdata);
    }
    return sellerdata;
  };
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
      toast.show({
        duration: 2000,
        render: () => (
          <Box
            bg="red.300"
            px="2"
            py="1"
            rounded="sm"
            style={{
              position: "absolute",
              top: 50,
              left: 20,
              right: 20,
              zIndex: 9999,
              alignItems: "center",
            }}
          >
            Missing user or owner data.
          </Box>
        ),
      });
      return;
    }
  };
  useEffect(() => {
    loadUserDetails();
    getOwnerDetails(selectedPropertyId);
  }, [selectedPropertyId]);

  const handleAPI = async () => {
    if (!owner || !userInfo) {
      showError("Missing user or owner data.");
      return;
    }

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
      showSuccess("Details submitted successfully.");
    } catch (error) {
      showError("Failed to send WhatsApp message.");
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
        user_id: userInfo.id,
        fullname: formData.name,
        mobile: formData.mobile,
      });
      await handleAPI();
      onClose();
    } catch (err) {
      showError("Failed to submit");
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
      onBackdropPress={onClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.backdrop}
          onPress={onClose}
        >
          <View
            style={styles.bottomSheet}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.bottomSheetHeader}>
              <Text style={styles.bottomSheetTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.formContainer}>
              {["name", "mobile", "email"].map((field) => (
                <React.Fragment key={field}>
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
                    editable={!isLoading}
                  />
                </React.Fragment>
              ))}
              <TouchableOpacity
                style={[
                  styles.submitButton,
                  isLoading && styles.submitButtonDisabled,
                ]}
                onPress={handleSchedule}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? "Submitting..." : "Submit"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
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
  backdrop: {
    flex: 1,
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
  submitButtonDisabled: {
    backgroundColor: "#cccccc",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PoppinsMedium",
  },
});

export default ContactActionSheet;
