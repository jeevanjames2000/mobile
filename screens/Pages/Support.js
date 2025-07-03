import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Keyboard,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  StatusBar,
  Platform,
  BackHandler,
} from "react-native";
import {
  Box,
  VStack,
  HStack,
  Text,
  Pressable,
  Icon,
  useToast,
} from "native-base";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
const faqsData = [
  {
    id: 1,
    question: "How secure is my data with MeetOwner ?",
    answer:
      "meetowner.in prioritizes data security with encryption protocols and strict privacy policies.",
  },
  {
    id: 2,
    question: "How are builder and channel partner accounts verified ?",
    answer:
      "Builders and channel partners must provide valid business registration details, RERA (if applicable), and identity verification before account approval.",
  },
  {
    id: 3,
    question: "How does MeetOwner verify properties ?",
    answer:
      "MeetOwner conducts basic verification, including checking property documents uploaded by owners.",
  },
  {
    id: 4,
    question: "How long does it take for project approval on MeetOwner?",
    answer:
      "Project approval typically takes 24 to 48 hours after submission. ",
  },
  {
    id: 5,
    question: "Account & Login Issues",
    children: [
      {
        id: 1,
        question: "What should I do if I face login issues?",
        answer: `Ensure you are using the correct Phone Number linked to your account. \n If you are a Builder or Channel Partner, you will receive a 6-digit OTP for login.\n If you are a User or Buyer, you will receive a 4-digit OTP for login.`,
      },
      {
        id: 2,
        question: "How can I reach MeetOwner for login or account issues?",
        answer:
          "Email: support@meetowner.in\nPhone: +91-9701888071\nLive Chat: Available on the website for instant support.",
      },
    ],
  },
];
export default function Support() {
  const navigation = useNavigation();
  const [expanded, setExpanded] = useState(null);
  const [childExpanded, setChildExpanded] = useState(null);
  const [userInfo, setUserInfo] = useState("");
  const [formData, setFormData] = useState({
    name: userInfo?.name || "",
    mobile: userInfo?.mobile || "",
    email: userInfo?.email || "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoadingEffect, setIsLoadingEffect] = useState(false);
  const scrollViewRef = useRef();
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
  const toggleFAQ = (id) => {
    setExpanded(expanded === id ? null : id);
    if (expanded !== id) {
      setChildExpanded(null);
    }
  };
  const toggleChildFAQ = (childId) => {
    setChildExpanded(childExpanded === childId ? null : childId);
  };
  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };
  const validateForm = () => {
    let valid = true;
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
      valid = false;
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message cannot be empty";
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };
  const toast = useToast();
  const handleSubmit = () => {
    Keyboard.dismiss();
    if (!validateForm()) {
      return;
    }
    setIsLoadingEffect(true);
    axios
      .post(`https://api.meetowner.in/enquiry/v1/contactUs`, {
        name: formData.name,
        mobile: formData.mobile,
        email: formData.email,
        message: formData.message,
        user_id: userInfo.id,
      })
      .then((response) => {
        setIsLoadingEffect(false);
        if (!response.status === 201) {
          toast.show({
            placement: "top-right",
            render: () => {
              return (
                <Box bg="red.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
                  Something went wrong! Please try again later.
                </Box>
              );
            },
          });
        } else if (response.status === 201 || 200) {
          setIsLoadingEffect(false);
          toast.show({
            placement: "top-right",
            render: () => {
              return (
                <Box bg="green.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
                  Request Submitted!
                </Box>
              );
            },
          });
          setFormData({
            name: userInfo?.name || "",
            email: userInfo?.email || "",
            mobile: userInfo?.mobile || "",
            message: "",
          });
        }
      })
      .catch((error) => {
        setIsLoadingEffect(false);
      });
  };
  useEffect(() => {
    const getData = async () => {
      const data = await AsyncStorage.getItem("userdetails");
      const parsedUserDetails = JSON.parse(data);
      setUserInfo(parsedUserDetails);
    };
    getData();
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    );
    return () => {
      keyboardDidShowListener.remove();
    };
  }, []);
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.scrollContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            contentInsetAdjustmentBehavior="automatic"
          >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <VStack p={4} mt={1} space={4}>
                <Text
                  fontSize="xl"
                  textAlign="center"
                  fontFamily="PoppinsSemiBold"
                >
                  Frequently Asked Questions
                </Text>
                {faqsData.map((faq) => (
                  <Box
                    key={faq.id}
                    bg="white"
                    p={3}
                    borderWidth={1}
                    borderRadius={20}
                    borderColor="gray.200"
                  >
                    {faq.children ? (
                      <>
                        <Pressable onPress={() => toggleFAQ(faq.id)}>
                          <HStack
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Text fontFamily="PoppinsSemiBold">
                              {faq.question}
                            </Text>
                            <Icon
                              as={Ionicons}
                              name={
                                expanded === faq.id
                                  ? "chevron-up"
                                  : "chevron-down"
                              }
                              size={5}
                              color="gray.500"
                            />
                          </HStack>
                        </Pressable>
                        {expanded === faq.id && (
                          <VStack mt={2} space={2}>
                            {faq.children.map((child) => (
                              <Box
                                key={child.id}
                                bg="gray.50"
                                p={2}
                                borderWidth={1}
                                borderRadius={20}
                                borderColor="gray.200"
                              >
                                <Pressable
                                  onPress={() => toggleChildFAQ(child.id)}
                                >
                                  <HStack
                                    justifyContent="space-between"
                                    alignItems="center"
                                  >
                                    <Text fontFamily="Poppins">
                                      {child.question}
                                    </Text>
                                    <Icon
                                      as={Ionicons}
                                      name={
                                        childExpanded === child.id
                                          ? "chevron-up"
                                          : "chevron-down"
                                      }
                                      size={4}
                                      color="gray.500"
                                    />
                                  </HStack>
                                </Pressable>
                                {childExpanded === child.id && (
                                  <Text
                                    mt={2}
                                    color="gray.400"
                                    fontFamily="Poppins"
                                  >
                                    {child.answer}
                                  </Text>
                                )}
                              </Box>
                            ))}
                          </VStack>
                        )}
                      </>
                    ) : (
                      <>
                        <Pressable onPress={() => toggleFAQ(faq.id)}>
                          <HStack
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Text fontFamily="PoppinsSemiBold" fontSize={14}>
                              {faq.question}
                            </Text>
                            <Icon
                              as={Ionicons}
                              name={
                                expanded === faq.id
                                  ? "chevron-up"
                                  : "chevron-down"
                              }
                              size={5}
                              color="gray.500"
                            />
                          </HStack>
                        </Pressable>
                        {expanded === faq.id && (
                          <Text
                            mt={2}
                            color="gray.600"
                            fontFamily="Poppins"
                            fontSize={13}
                          >
                            {faq.answer}
                          </Text>
                        )}
                      </>
                    )}
                  </Box>
                ))}
                <Text
                  fontFamily="PoppinsSemiBold"
                  fontSize={16}
                  textAlign="left"
                  mt={5}
                  ml={2}
                >
                  Contact Us
                </Text>
                <VStack space={4} mt={2}>
                  <TextInput
                    style={[
                      styles.input,
                      errors.name && { borderColor: "red" },
                    ]}
                    placeholderTextColor="#999"
                    placeholder="Name"
                    value={formData.name}
                    onChangeText={(value) => handleChange("name", value)}
                  />
                  {errors.name && (
                    <Text style={styles.error}>{errors.name}</Text>
                  )}
                  <TextInput
                    style={[
                      styles.input,
                      errors.mobile && { borderColor: "red" },
                    ]}
                    placeholder="Mobile Number"
                    placeholderTextColor="#999"
                    keyboardType="phone-pad"
                    value={formData.mobile}
                    onChangeText={(value) => handleChange("mobile", value)}
                  />
                  {errors.mobile && (
                    <Text style={styles.error}>{errors.mobile}</Text>
                  )}
                  <TextInput
                    style={[
                      styles.input,
                      errors.email && { borderColor: "red" },
                    ]}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    keyboardType="email-address"
                    value={formData.email}
                    onChangeText={(value) => handleChange("email", value)}
                  />
                  <TextInput
                    style={[
                      styles.textArea,
                      errors.message && { borderColor: "red" },
                    ]}
                    placeholder="Your Message"
                    placeholderTextColor="#999"
                    value={formData.message}
                    onChangeText={(value) => handleChange("message", value)}
                    multiline
                    numberOfLines={4}
                  />
                  {errors.message && (
                    <Text style={styles.error}>{errors.message}</Text>
                  )}
                  <TouchableOpacity
                    style={styles.submitBtn}
                    onPress={handleSubmit}
                  >
                    <Text style={styles.submitBtnText}>
                      {isLoadingEffect ? "Submitting..." : "Submit"}
                    </Text>
                  </TouchableOpacity>
                </VStack>
              </VStack>
            </TouchableWithoutFeedback>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 100,
  },
  input: {
    height: 60,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#fff",
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    shadowColor: "#ddd",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderColor: "#EDF2FF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    backgroundColor: "#fff",
    textAlignVertical: "top",
    shadowColor: "#4979FB",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  submitBtn: {
    marginTop: 10,
    backgroundColor: "#1D3A76",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins",
  },
  error: {
    color: "red",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
  successMsg: {
    color: "green",
    textAlign: "center",
    marginTop: 10,
  },
});
