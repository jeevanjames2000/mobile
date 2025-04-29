import React, { useState, useEffect } from "react";
import { Image, Box, Text } from "native-base";

const UserAvatar = ({ item, size = 24 }) => {
  const [isImageValid, setIsImageValid] = useState(null); // null (initial), true (valid), false (invalid)

  const photo = item?.user?.photo;
  const firstLetter = item?.user?.name?.charAt(0)?.toUpperCase() || "?";
  const imageUrl = photo ? `https://api.meetowner.in/uploads/${photo}` : null;

  // Check if the image URL is valid
  useEffect(() => {
    if (!photo || photo.trim() === "") {
      setIsImageValid(false);
      return;
    }

    // Function to verify image accessibility
    const checkImage = async () => {
      try {
        const response = await fetch(imageUrl, { method: "HEAD" });
        if (response.ok) {
          setIsImageValid(true);
        } else {
          setIsImageValid(false);
        }
      } catch (error) {
        console.warn(`Failed to load image ${imageUrl}:`, error);
        setIsImageValid(false);
      }
    };

    checkImage();
  }, [photo, imageUrl]);

  // Render loading state while checking image validity
  if (isImageValid === null) {
    return (
      <Box
        width={12}
        height={12}
        borderRadius={30}
        backgroundColor="#E0E0E0" // Placeholder background
        alignItems="center"
        justifyContent="center"
        borderColor="#000000"
        borderWidth="0.5"
      >
        <Text color="#000" fontSize={size * 0.5} fontWeight="bold">
          {firstLetter}
        </Text>
      </Box>
    );
  }

  return (
    <>
      {isImageValid ? (
        <Image
          source={{ uri: imageUrl }}
          alt={`${item?.user?.name || "User"}'s Profile Picture`}
          width={12}
          height={12}
          borderRadius={30}
          resizeMode="cover"
          onError={() => setIsImageValid(false)} // Fallback if image fails to load
        />
      ) : (
        <Box
          width={12}
          height={12}
          borderRadius={30}
          backgroundColor="#FFFFFF"
          alignItems="center"
          justifyContent="center"
          borderColor="#000000"
          borderWidth="0.5"
        >
          <Text color="#000" fontSize={size * 0.5} fontWeight="bold">
            {firstLetter}
          </Text>
        </Box>
      )}
    </>
  );
};

export default UserAvatar;