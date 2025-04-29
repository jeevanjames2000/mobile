import React, { useCallback, useEffect, useState } from "react"; 
import { Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { HStack, Text as NBText } from "native-base";
import { useNavigation } from "@react-navigation/native"; 
import LatestPropertiesWrapper from "./LatestPropertiesWrapper";
import BestDealPropertiesWrapper from "./BestDealPropertiesWrapper";
import HighDealPropertiesWrapper from "./HighDemandProjectsWrapper";
import ExclusivePropertiesWrapper from "./ExclusivePropertiesWrapper";
import HousePickPropertiesWrapper from "./HousePickPropertiesWrapper";
import { StyleSheet } from "react-native";
const HomeWrapper = ({ activeTab, selectedCity }) => {
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
      <HStack py={2} mx={2} justifyContent={"space-between"}>
        <NBText fontSize={20} fontFamily={"PoppinsSemiBold"}>
          Latest Properties
        </NBText>
        <TouchableOpacity onPress={handlePropertiesLists}>
          <NBText fontSize={15} fontFamily={"PoppinsSemiBold"} color={"#000"}>
            View All
          </NBText>
        </TouchableOpacity>
      </HStack>
      <LatestPropertiesWrapper activeTab={activeTab} selectedCity={selectedCity}  onApiLoaded={handleApiLoaded}  />
      <HStack py={2} mx={2} justifyContent={"space-between"}>
        <NBText fontSize={20} fontFamily={"PoppinsSemiBold"}>
          Best Deal Properties
        </NBText>
        <TouchableOpacity onPress={handlePropertiesLists}>
          <NBText fontSize={15} fontFamily={"PoppinsSemiBold"} color={"#000"}>
            View All
          </NBText>
        </TouchableOpacity>
      </HStack>
      <BestDealPropertiesWrapper activeTab={activeTab} selectedCity={selectedCity}  onApiLoaded={handleApiLoaded}  />
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
      <HousePickPropertiesWrapper activeTab={activeTab} selectedCity={selectedCity}  onApiLoaded={handleApiLoaded}  />
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
      <HighDealPropertiesWrapper activeTab={activeTab} selectedCity={selectedCity}   onApiLoaded={handleApiLoaded} />
      <HStack py={2} mx={2} justifyContent={"space-between"}>
        <NBText fontSize={20} fontFamily={"PoppinsSemiBold"}>
          MeetOwner Exclusive
        </NBText>
      </HStack>
      <ExclusivePropertiesWrapper activeTab={activeTab} selectedCity={selectedCity}   onApiLoaded={handleApiLoaded} />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: '#f5f5f5',
    marginBottom: 100,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
export default HomeWrapper;
