import React, { useEffect } from "react";
import { View, StyleSheet, Animated } from "react-native";
import { HStack } from "native-base";

const SkeletonLoader = () => {
  // Create an Animated value for the pulse effect
  const pulseAnim = new Animated.Value(0.4); // Start with lower opacity

  useEffect(() => {
    // Set up the pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.0, // Fade to full opacity
          duration: 800, // Duration of fade-in
          useNativeDriver: true, // Use native driver for better performance
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4, // Fade back to lower opacity
          duration: 800, // Duration of fade-out
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Interpolate the opacity for the pulse effect
  const opacity = pulseAnim;

  return (
    <View style={styles.skeletonContainer}>
      <HStack style={styles.skeletonHeader}>
        <Animated.View style={[styles.skeletonText, { opacity }]} />
        <Animated.View style={[styles.skeletonButton, { opacity }]} />
      </HStack>
      <HStack style={styles.skeletonContent}>
        <Animated.View style={[styles.skeletonCard, { opacity }]} />
        <Animated.View style={[styles.skeletonCard, { opacity }]} />
      </HStack>
    </View>
  );
};

const styles = StyleSheet.create({
  skeletonContainer: {
    marginVertical: 10,
    marginHorizontal: 10,
  },
  skeletonHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  skeletonText: {
    width: 150,
    height: 24,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
  skeletonButton: {
    width: 60,
    height: 20,
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
  },
  skeletonContent: {
    flexDirection: "row",
  },
  skeletonCard: {
    width: 350,
    height: 220,
    backgroundColor: "#e0e0e0",
    borderRadius: 16,
    marginRight: 15,
  },
});

export default SkeletonLoader;
