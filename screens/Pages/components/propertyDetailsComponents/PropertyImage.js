import React, { useState, useEffect } from "react";
import { Image } from "native-base";
const PropertyImage = ({ item, width = 400, height = 200, borderRadius = 20 }) => {
  const [isImageValid, setIsImageValid] = useState(null);
  const imageUrl = item?.image && item.image.trim() !== ""
    ? `https://api.meetowner.in/uploads/${item.image}`
    : null;
  const placeholderUrl = `https://placehold.co/200x100@3x.png?text=${encodeURIComponent(item?.property_name || "Property")}`;
  useEffect(() => {
    if (!imageUrl) {
      setIsImageValid(false);
      return;
    }
    const checkImage = async () => {
      try {
        const response = await fetch(imageUrl,);
        setIsImageValid(response.ok);
      } catch (error) {
        console.warn(`Failed to validate image ${imageUrl}:`, error);
        setIsImageValid(false);
      }
    };
    checkImage();
  }, [imageUrl]);
  if (isImageValid === null) {
    return (
      <Image
        source={{ uri: placeholderUrl }}
        alt={`Image of ${item?.property_name || "Property"}`}
        w={width}
        h={height}
        resizeMode="cover"
        style={{ borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }}
      />
    );
  }
  return (
    <Image
      source={{ uri: isImageValid ? imageUrl : placeholderUrl }}
      alt={`Image of ${item?.property_name || "Property"}`}
      w={width}
      h={height}
      resizeMode="cover"
      style={{ borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }}
      onError={() => setIsImageValid(false)}
    />
  );
};
export default PropertyImage;