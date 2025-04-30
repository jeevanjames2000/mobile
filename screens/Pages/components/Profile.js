import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
  BackHandler,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { Box, Toast } from "native-base";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import config from "../../../config";
import { Linking } from "react-native";
import { Platform } from "react-native";
import { CommonActions } from "@react-navigation/native";
export default function Profile() {
  const [data, setData] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState("N/A");
  const [city, setCity] = useState("N/A");
  const [address, setAddress] = useState("N/A");
  const [pincode, setPincode] = useState("N/A");
  const [gstNumber, setGstNumber] = useState("N/A");
  const [reraNumber, setReraNumber] = useState("N/A");
  const [photo, setPhoto] = useState(null);
  const [userFile, setUserFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();
  const handleEditProfileImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission denied!", "Camera roll access is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled) {
      setUserFile({
        uri: result.assets[0].uri,
        name: "profile.jpg",
        type: "image/jpeg",
      });
      setImageModalVisible(true);
    }
  };
  //logout api
  const performLogout = async () => {
    setLoading(true);
    await AsyncStorage.clear();
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("recentSuggestions");
    await AsyncStorage.removeItem("userdetails");
    await AsyncStorage.removeItem("city_id");
    await AsyncStorage.removeItem("cached_properties");
    setTimeout(() => {
      navigation.navigate("Login");
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        })
      );
      setLoading(false);
    }, 1000);
  };
  const [userDetails, setUserDetails] = useState(null);
  const CACHE_DURATION = 10 * 60 * 1000;
  const fetchProfileDetails = async () => {
    try {
      const storedDetails = await AsyncStorage.getItem("userdetails");
      if (!storedDetails) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "User details not found.",
          position: "top",
        });
        return;
      }
      const parsedUserDetails = JSON.parse(storedDetails);
      setUserDetails(parsedUserDetails);
      const cachedData = await AsyncStorage.getItem("profileData");
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const currentTime = new Date().getTime();
        if (currentTime - timestamp < CACHE_DURATION) {
          setData(data);
          setName(data.name || "N/A");
          setEmail(data.email || "N/A");
          setPhone(data.mobile || "N/A");
          setState(data.state || "N/A");
          setCity(data.city || "N/A");
          setAddress(data.address || "N/A");
          setPincode(data.pincode || "N/A");
          setGstNumber(data.gst_number || "N/A");
          setReraNumber(data.rera_number || "N/A");
          setPhoto(data.photo || null);
          return;
        }
      }
      const response = await axios.get(
        `https://api.meetowner.in/user/v1/getProfile?user_id=${parsedUserDetails?.user_id}`
      );
      const fetchedData = response.data;
      if (fetchedData && typeof fetchedData === "object") {
        setData(fetchedData);
        setName(fetchedData.name || "N/A");
        setEmail(fetchedData.email || "N/A");
        setPhone(fetchedData.mobile || "N/A");
        setState(fetchedData.state || "N/A");
        setCity(fetchedData.city || "N/A");
        setAddress(fetchedData.address || "N/A");
        setPincode(fetchedData.pincode || "N/A");
        setGstNumber(fetchedData.gst_number || "N/A");
        setReraNumber(fetchedData.rera_number || "N/A");
        setPhoto(fetchedData.photo || null);
        await AsyncStorage.setItem(
          "profileData",
          JSON.stringify({ data: fetchedData, timestamp: new Date().getTime() })
        );
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Unable to load profile data.",
          position: "top",
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Unable to load profile data.",
        position: "top",
      });
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
  useEffect(() => {
    fetchProfileDetails();
  }, []);
  const handleLogout = () => {
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: () => performLogout() },
      ],
      { cancelable: false }
    );
  };
  //submit profile details Edit profile details
  const submitProfileDetails = async () => {
    if (!name || name.trim() === "") {
      Toast.show({
        duration: 1000,
        placement: "top-right",
        render: () => {
          return (
            <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
              Name cannot be empty.
            </Box>
          );
        },
      });
      return;
    }
    if (!userDetails.user_id) {
      Toast.show({
        duration: 1000,
        placement: "top-right",
        render: () => {
          return (
            <Box bg="green.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
              User details are missing. Please try again.
            </Box>
          );
        },
      });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        `https://api.meetowner.in/user/v1/updateUser`,
        {
          name: name,
          email: email,
          id: userDetails.user_id,
        }
      );
      if (response.data.message === "User updated successfully") {
        Toast.show({
          duration: 1000,
          placement: "top-right",
          render: () => {
            return (
              <Box bg="green.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
                User details updated successfully
              </Box>
            );
          },
        });
        AsyncStorage.removeItem("profileData");
        fetchProfileDetails();
        setModalVisible(false);
      } else {
        Toast.show({
          duration: 1000,
          placement: "top-right",
          render: () => {
            return (
              <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
                Failed to update profile.
              </Box>
            );
          },
        });
      }
    } catch (error) {
      Toast.show({
        title: "Something went wrong.",
        duration: 1000,
      });
    } finally {
      setLoading(false);
    }
  };
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const toggleAccordion = (section) => {
    setExpandedAccordion(expandedAccordion === section ? null : section);
  };
  const submitProfileImage = async () => {
    setModalVisible(false);
    setImageModalVisible(false);
    if (!userFile) {
      Alert.alert("Error", "Please upload a profile photo.");
      return;
    }
    const formData = new FormData();
    formData.append("photo", {
      uri: userFile.uri,
      type: userFile.type,
      name: userFile.name,
    });
    formData.append("user_id", userDetails.user_id);
    setLoading(true);
    try {
      const response = await axios.post(
        `https://api.meetowner.in/user/v1/uploadUserImage`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.data.photo) {
        AsyncStorage.removeItem("profileData");
        fetchProfileDetails(true);
        setImageModalVisible(false);
        setLoading(false);
        Toast.show({
          duration: 1000,
          placement: "top-right",
          render: () => {
            return (
              <Box bg="green.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
                Image Uploaded Successfully!
              </Box>
            );
          },
        });
      } else {
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      Toast.show({
        duration: 1000,
        placement: "top-right",
        render: () => {
          return (
            <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
              Failed to upload. Please try again!
            </Box>
          );
        },
      });
    }
  };
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const openEmailClient = async () => {
    const email = "team@meetowner.in";
    const subject = encodeURIComponent("Request to Delete My Account");
    const body = encodeURIComponent(
      "Hello Support,\n\nI would like to request the deletion of my account associated with this email. Please proceed with the necessary steps.\n\nThanks."
    );
    if (Platform.OS === "android") {
      const gmailUrl = `googlegmail://co?to=${email}&subject=${subject}&body=${body}`;
      const canOpenGmail = await Linking.canOpenURL(gmailUrl);
      if (canOpenGmail) {
        Linking.openURL(gmailUrl);
      } else {
        const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
        Linking.openURL(mailtoUrl);
      }
    } else {
      const mailtoUrl = `mailto:${email}?subject=${subject}&body=${body}`;
      Linking.openURL(mailtoUrl);
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.imageContainer}>
            <Image
              source={{
                uri: `https://api.meetowner.in/${photo}`,
              }}
              alt="profileImage"
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.editIcon}
              onPress={handleEditProfileImage}
            >
              <Ionicons name="pencil" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{data?.name || "N/A"}</Text>
          <Text style={styles.memberSince}>
            Member since:{" "}
            {data?.created_date
              ? new Date(data.created_date).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "N/A"}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.editProfileBtn}
          onPress={() => setModalVisible(true)}
        >
          <Text style={styles.editProfileText}>Edit Profile</Text>
        </TouchableOpacity>
        <View style={styles.accordionContainer}>
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleAccordion("homeSearch")}
          >
            <Text style={styles.accordionTitle}> Home Search</Text>
            <Ionicons
              name={
                expandedAccordion === "homeSearch"
                  ? "chevron-up-outline"
                  : "chevron-down-outline"
              }
              size={20}
              color="#4F46E5"
            />
          </TouchableOpacity>
          {expandedAccordion === "homeSearch" && (
            <View style={styles.accordionContent}>
              <Text style={styles.accordionText}>
                Search for properties with your preferences easily. Apply
                filters to refine your search.
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleAccordion("recommendations")}
          >
            <Text style={styles.accordionTitle}>Recommendation Properties</Text>
            <Ionicons
              name={
                expandedAccordion === "recommendations"
                  ? "chevron-up-outline"
                  : "chevron-down-outline"
              }
              size={20}
              color="#4F46E5"
            />
          </TouchableOpacity>
          {expandedAccordion === "recommendations" && (
            <View style={styles.accordionContent}>
              <Text style={styles.accordionText}>
                Get property recommendations based on your search history and
                preferences.
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleAccordion("reportFraud")}
          >
            <Text style={styles.accordionTitle}> Report a Fraud</Text>
            <Ionicons
              name={
                expandedAccordion === "reportFraud"
                  ? "chevron-up-outline"
                  : "chevron-down-outline"
              }
              size={20}
              color="#4F46E5"
            />
          </TouchableOpacity>
          {expandedAccordion === "reportFraud" && (
            <View style={styles.accordionContent}>
              <Text style={styles.accordionText}>
                Report suspicious activity or fraudulent listings to keep the
                platform secure.
              </Text>
            </View>
          )}
          <TouchableOpacity
            style={styles.accordionHeader}
            onPress={() => toggleAccordion("helpCenter")}
          >
            <Text style={styles.accordionTitle}>Help Center</Text>
            <Ionicons
              name={
                expandedAccordion === "helpCenter"
                  ? "chevron-up-outline"
                  : "chevron-down-outline"
              }
              size={20}
              color="#4F46E5"
            />
          </TouchableOpacity>
          {expandedAccordion === "helpCenter" && (
            <View style={styles.accordionContent}>
              <Text style={styles.accordionText}>
                Get assistance and answers from Meetowner support.
              </Text>
              <View style={styles.deleteInstructions}>
                <Text style={styles.deleteTitle}>
                  How to Delete Your Account?
                </Text>
                <View style={styles.deleteSteps}>
                  <Text style={styles.accordionText}>
                    • Contact our support team via email.
                  </Text>
                  <Text style={styles.accordionText}>
                    • Include your registered email and reason for deletion.
                  </Text>
                  <Text style={styles.accordionText}>
                    • Our team will process your request within 48 hours.
                  </Text>
                  <Text style={{ fontSize: 14 }}>• team@meetowner.in</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => setDeleteModalVisible(true)}
              >
                <Text style={styles.accordionTitle}>
                  Delete / Deactivate Account
                </Text>
                <Ionicons name="remove-circle-outline" size={20} color="red" />
              </TouchableOpacity>
              <Modal
                visible={deleteModalVisible}
                transparent
                animationType="slide"
              >
                <View style={styles.modalContainer}>
                  <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>
                      Delete / Deactivate Account
                    </Text>
                    <Text style={styles.modalText}>
                      <Text style={{ fontWeight: "bold" }}>📧 Contact: </Text>
                      team@meetowner.in
                    </Text>
                    <Text style={styles.modalText}>
                      <Text style={{ fontWeight: "bold" }}>
                        Send an email with the subject:{" "}
                      </Text>
                      "Request to Delete My Account"
                    </Text>
                    <TouchableOpacity
                      style={styles.emailButton}
                      onPress={openEmailClient}
                    >
                      <Text style={styles.emailButtonText}>
                        📩 Send Email Request
                      </Text>
                    </TouchableOpacity>
                    {}
                    <TouchableOpacity
                      style={styles.closeButton}
                      onPress={() => setDeleteModalVisible(false)}
                    >
                      <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </Modal>
            </View>
          )}
        </View>
      </ScrollView>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={60} color="green" />
        </View>
      )}
      <View style={styles.bottomButtons}>
        <TouchableOpacity
          style={styles.gobackbutton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.goBackText}>Go Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <Modal
        transparent={true}
        animationType="slide"
        visible={imageModalVisible}
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Upload Profile Image</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setImageModalVisible(false)}
              >
                <Text style={styles.closeText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={submitProfileImage}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Upload</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeader}>Edit Profile</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter Name"
              value={name}
              onChangeText={(text) => setName(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter Email"
              value={email}
              keyboardType="email-address"
              onChangeText={(text) => setEmail(text)}
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeBtn}
              >
                <Text style={styles.closeText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={submitProfileDetails}
                disabled={loading}
                style={styles.saveBtn}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.saveText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  profileSection: {
    alignItems: "center",
    marginVertical: 20,
  },
  loadingContainer: {
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  imageContainer: {
    position: "relative",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#4F46E5",
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    borderRadius: 60,
  },
  editIcon: {
    position: "absolute",
    bottom: 20,
    right: -2,
    backgroundColor: "#4F46E5",
    borderRadius: 20,
    padding: 5,
  },
  userName: {
    fontSize: 20,
    fontFamily: "PoppinsSemiBold",
    marginTop: 10,
    color: "#333",
  },
  memberSince: {
    fontSize: 14,
    color: "#6B7280",
    fontFamily: "PoppinsSemiBold",
  },
  editProfileBtn: {
    backgroundColor: "#1D3A76",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: "50%",
    alignSelf: "center",
    alignItems: "center",
  },
  editProfileText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "PoppinsSemiBold",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  bottomButtons: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  gobackbutton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: "45%",
    alignItems: "center",
    borderColor: "#B7B6B6",
    borderWidth: 1,
  },
  logoutBtn: {
    backgroundColor: "#1D3A76",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 30,
    width: "45%",
    alignItems: "center",
  },
  goBackText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  accordionContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginTop: 10,
    borderColor: "#EDF2FF",
    borderWidth: 3,
    elevation: 1,
  },
  accordionTitle: {
    fontSize: 16,
    marginTop: 2,
    color: "black",
    fontFamily: "PoppinsSemiBold",
  },
  accordionContent: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
  },
  accordionText: {
    fontSize: 14,
    color: "black",
    fontFamily: "Poppins",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 30,
    marginHorizontal: 30,
    borderRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: "center",
    fontFamily: "PoppinsSemiBold",
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 30,
    borderColor: "#DBDADA",
    paddingHorizontal: 12,
    marginVertical: 10,
    backgroundColor: "#fff",
    elevation: 3,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    gap: 5,
    width: "100%",
    paddingHorizontal: 10,
  },
  closeBtn: {
    width: "50%",
    borderWidth: 0.5,
    borderColor: "#B7B6B6",
    borderRadius: 30,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    alignItems: "center",
  },
  closeText: {
    color: "black",
    marginTop: 2,
    fontFamily: "Poppins",
  },
  saveBtn: {
    borderRadius: 30,
    width: "50%",
    borderWidth: 0.5,
    borderColor: "green",
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#1D3A76",
    alignItems: "center",
  },
  saveText: {
    color: "white",
    marginTop: 2,
    fontFamily: "Poppins",
  },
  deleteInstructions: { marginTop: 10 },
  deleteTitle: { fontSize: 14, fontWeight: "bold" },
  deleteSteps: { marginTop: 5 },
  deleteButton: {
    padding: 10,
    borderWidth: 0.5,
    borderColor: "red",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "95%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  modalText: { fontSize: 14, marginBottom: 5 },
  emailButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#4F46E5",
    borderRadius: 5,
    alignItems: "center",
  },
  emailButtonText: { color: "white", fontWeight: "bold" },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "gray",
    borderRadius: 5,
    alignItems: "center",
  },
  closeButtonText: { color: "white", fontWeight: "bold" },
});
