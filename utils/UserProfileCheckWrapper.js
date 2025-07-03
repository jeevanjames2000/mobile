import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Toast, Box } from "native-base";
import axios from "axios";
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

  const showToast = (message, type = "error") => {
    Toast.show({
      duration: 1000,
      placement: "top-right",
      render: () => {
        return (
          <Box bg="green.300" px="2" py="1" mr={5} rounded="sm" mb={5}>
            {message}
          </Box>
        );
      },
    });
  };

  const checkUserProfile = async () => {
    try {
      const storedDetails = await AsyncStorage.getItem("userdetails");
      if (!storedDetails) {
        return showToast("User not found in storage.");
      }

      const { id } = JSON.parse(storedDetails);

      if (!id) return;

      const res = await axios.get(
        `${config.awsApiUrl}/user/v1/getProfile?user_id=${id}`
      );
      const profile = res.data;

      const isIncomplete =
        !profile?.name?.trim() ||
        !profile?.email?.trim() ||
        !profile?.city?.trim();

      setUser({
        user_id: profile.id || "",
        name: profile.name || "",
        email: profile.email || "",
        city: profile.city || "",
      });

      setShowModal(isIncomplete);
    } catch (err) {
      console.error("Profile fetch failed:", err);
      showToast("Failed to load profile.");
      setShowModal(false);
    }
  };

  const handleChange = (name, value) => {
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        id: user.user_id,
        name: user.name,
        email: user.email,
        city: user.city,
      };

      const res = await fetch(`${config.awsApiUrl}/user/v1/updateUser`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Update failed");

      showToast("Profile updated successfully!", "success");
      setShowModal(false);
    } catch (err) {
      console.error("Update failed:", err);
      showToast("Something went wrong while updating profile.");
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
