import React, { useCallback, useEffect, useState } from "react";
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { HStack, Text as NBText } from "native-base";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import LatestPropertiesWrapper from "./LatestPropertiesWrapper";
import BestDealPropertiesWrapper from "./BestDealPropertiesWrapper";
import HighDealPropertiesWrapper from "./HighDemandProjectsWrapper";
import ExclusivePropertiesWrapper from "./ExclusivePropertiesWrapper";
import HousePickPropertiesWrapper from "./HousePickPropertiesWrapper";
import { StyleSheet } from "react-native";
import UserProfileModal from "../../../../utils/UserProfileModal";
import { useUserProfileCheck } from "../../../../utils/UserProfileCheckWrapper";
const HomeWrapper = ({ activeTab, selectedCity }) => {
  const {
    user,
    showModal,
    setShowModal,
    checkUserProfile,
    handleChange,
    handleSubmit,
  } = useUserProfileCheck();
  useFocusEffect(
    useCallback(() => {
      checkUserProfile();
    }, [])
  );
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const handlePropertiesLists = useCallback(() => {
    navigation.navigate("PropertyList", { activeTab });
  }, [navigation, activeTab]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);
  const handleApiLoaded = () => {
    setLoading(false);
  };
  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1D3A76" />
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <LatestPropertiesWrapper
        activeTab={activeTab}
        selectedCity={selectedCity}
        onApiLoaded={handleApiLoaded}
      />
      <BestDealPropertiesWrapper
        activeTab={activeTab}
        selectedCity={selectedCity}
        onApiLoaded={handleApiLoaded}
      />
      <HStack py={2} mx={2} justifyContent={"space-between"}>
        <NBText fontSize={20} fontFamily={"PoppinsSemiBold"}>
          Best House Pick's
        </NBText>
        <TouchableOpacity onPress={handlePropertiesLists}>
          <NBText fontSize={15} fontFamily={"PoppinsSemiBold"} color={"#000"}>
            View All
          </NBText>
        </TouchableOpacity>
      </HStack>
      <HousePickPropertiesWrapper
        activeTab={activeTab}
        selectedCity={selectedCity}
        onApiLoaded={handleApiLoaded}
      />
      <HStack py={2} mx={2} justifyContent={"space-between"}>
        <NBText fontSize={20} fontFamily={"PoppinsSemiBold"}>
          High Demand Projects
        </NBText>
        <TouchableOpacity onPress={handlePropertiesLists}>
          <NBText fontSize={15} fontFamily={"PoppinsSemiBold"} color={"#000"}>
            View All
          </NBText>
        </TouchableOpacity>
      </HStack>
      <HighDealPropertiesWrapper
        activeTab={activeTab}
        selectedCity={selectedCity}
        onApiLoaded={handleApiLoaded}
      />
      <ExclusivePropertiesWrapper
        activeTab={activeTab}
        selectedCity={selectedCity}
        onApiLoaded={handleApiLoaded}
      />
      <UserProfileModal
        visible={showModal}
        user={user}
        loading={loading}
        onCancel={() => setShowModal(false)}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    backgroundColor: "#fff",
    marginBottom: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
export default HomeWrapper;
