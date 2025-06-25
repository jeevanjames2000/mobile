import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast, Box } from "native-base";
import config from "../config";
export const useUserProfileCheck = () => {
  const [user, setUser] = useState({
    user_id: "",
    name: "",
    email: "",
    city: "",
  });
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const checkUserProfile = async () => {
    try {
      const data = await AsyncStorage.getItem("profileData");
      if (!data) return setShowModal(false);
      const data2 = JSON.parse(data);
      const userDetails = data2.data;
      const isLoggedIn = !!userDetails?.id;
      const isIncomplete =
        !userDetails?.name?.trim() ||
        !userDetails?.email?.trim() ||
        !userDetails?.city?.trim();
      if (isLoggedIn && isIncomplete) {
        setUser({
          user_id: userDetails.id || "",
          name: userDetails.name || "",
          email: userDetails.email || "",
          city: userDetails.city || "",
        });
        setShowModal(true);
      } else {
        setShowModal(false);
      }
    } catch (err) {
      console.error("Failed to read user profile:", err);
      setShowModal(false);
    }
  };
  const handleChange = (name, value) => {
    setUser((prev) => ({ ...prev, [name]: value }));
  };
  const handleSubmit = async () => {
    setLoading(true);
    const payload = {
      id: user.user_id,
      name: user.name,
      email: user.email,
      city: user.city,
    };
    try {
      const res = await fetch(`${config.awsApiUrl}/user/v1/updateUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Update failed");
      const currentUser = JSON.parse(
        (await AsyncStorage.getItem("profileData")) || "{}"
      );
      const updatedUser = {
        ...currentUser.data,
        name: user.name,
        email: user.email,
        city: user.city,
      };
      await AsyncStorage.setItem("profileData", JSON.stringify(updatedUser));
      Toast.show({
        placement: "top",
        render: () => (
          <Box bg="emerald.500" px="2" py="1" rounded="sm" mb={5}>
            Profile updated successfully!
          </Box>
        ),
      });
      setShowModal(false);
    } catch (error) {
      console.error("Profile update failed:", error);
      Toast.show({
        placement: "top",
        render: () => (
          <Box bg="red.500" px="2" py="1" rounded="sm" mb={5}>
            Something went wrong while updating profile.
          </Box>
        ),
      });
    } finally {
      setLoading(false);
    }
  };
  return {
    user,
    showModal,
    setShowModal,
    loading,
    checkUserProfile,
    handleChange,
    handleSubmit,
  };
};
