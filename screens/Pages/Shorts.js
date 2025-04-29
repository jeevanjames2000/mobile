import React, { useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Dimensions,
  RefreshControl,
  Modal,
  BackHandler,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Video from "react-native-video";
const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const videoData = [
  {
    id: "1",
    title: "Meetowner",
    source: require("../../assets/images/0_House_Location_720x1280.mp4"),
  },
  {
    id: "2",
    title: "Meetowner",
    source: require("../../assets/images/0_House_Location_720x1280.mp4"),
  },
];
export default function Shorts({ navigation }) {
  const [likedVideos, setLikedVideos] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [showCommentBox, setShowCommentBox] = useState({});
  const [comments, setComments] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [menuVisible, setMenuVisible] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const videoRef = useRef(null);
  const handleLike = (id) => {
    setLikedVideos((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const handleCommentToggle = (id) => {
    setShowCommentBox((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const handleCommentChange = (id, text) => {
    setCommentInputs((prev) => ({
      ...prev,
      [id]: text,
    }));
  };
  const handleCommentSubmit = (id) => {
    if (!commentInputs[id]) return;
    setComments((prev) => ({
      ...prev,
      [id]: [...(prev[id] || []), commentInputs[id]],
    }));
    setCommentInputs((prev) => ({
      ...prev,
      [id]: "",
    }));
    setShowCommentBox((prev) => ({
      ...prev,
      [id]: false,
    }));
  };
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const handleMenuToggle = (id) => {
    setMenuVisible((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };
  const handleMenuAction = (action, item) => {
    setMenuVisible((prev) => ({
      ...prev,
      [item.id]: false,
    }));
  };
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;
  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
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
  const renderVideoItem = ({ item, index }) => (
    <View style={styles.videoContainer}>
      <Video
        source={item.source}
        ref={videoRef}
        style={styles.video}
        resizeMode="cover"
        repeat={true}
        paused={currentIndex !== index}
        muted={false}
        playInBackground={false}
        playWhenInactive={false}
      />

      <View>
        <View style={styles.propertyInfo}>
          <Text style={styles.propertyTitle}>{item.title}</Text>
        </View>
        <View style={styles.bottomActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleLike(item.id)}
          >
            <Ionicons
              name={likedVideos[item.id] ? "heart" : "heart-outline"}
              size={28}
              color={likedVideos[item.id] ? "red" : "#fff"}
            />
            <Text style={styles.actionText}>Like</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleCommentToggle(item.id)}
          >
            <Ionicons name="chatbubble-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>
              {comments[item.id]?.length || 0}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="share-social-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
      {comments[item.id]?.length > 0 && (
        <View style={styles.commentsSection}>
          {comments[item.id].map((comment, idx) => (
            <View key={idx} style={styles.commentItem}>
              <Text style={styles.commentText}>{comment}</Text>
            </View>
          ))}
        </View>
      )}
      {showCommentBox[item.id] && (
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.commentBox}
        >
          <TextInput
            placeholder="Write a comment..."
            placeholderTextColor="#999"
            value={commentInputs[item.id] || ""}
            onChangeText={(text) => handleCommentChange(item.id, text)}
            style={styles.commentInput}
          />
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => handleCommentSubmit(item.id)}
          >
            <Text style={styles.submitText}>Post</Text>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      )}
    </View>
  );
  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <FlatList
          ref={flatListRef}
          data={videoData}
          renderItem={renderVideoItem}
          keyExtractor={(item) => item.id}
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={SCREEN_HEIGHT}
          snapToAlignment="start"
          decelerationRate="fast"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  videoContainer: {
    height: SCREEN_HEIGHT,
    width: "100%",
  },
  video: {
    width: "100%",
    height: "100%",
  },
  menuButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  menuOptions: {
    position: "absolute",
    top: 80,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 5,
    paddingVertical: 8,
  },
  menuItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  menuText: {
    color: "#333",
    fontSize: 14,
  },
  propertyInfo: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    bottom: SCREEN_HEIGHT * 0.18,
    left: 20,
  },
  propertyTitle: {
    color: "#fff",
    fontSize: 18,
    marginRight: 10,
    fontWeight: "bold",
  },
  openButton: {
    marginTop: 8,
    backgroundColor: "#000",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  openButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  bottomActions: {
    position: "absolute",
    bottom: SCREEN_HEIGHT * 0.1,
    left: 20,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  actionButton: {
    alignItems: "center",
    marginRight: 20,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  commentsSection: {
    position: "absolute",
    bottom: SCREEN_HEIGHT * 0.15,
    left: 10,
    width: "85%",
    maxHeight: 200,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
    padding: 8,
  },
  commentItem: {
    padding: 6,
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  commentText: {
    color: "#333",
    fontSize: 14,
  },
  commentBox: {
    position: "absolute",
    bottom: SCREEN_HEIGHT * 0.05,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  commentInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  submitButton: {
    marginLeft: 10,
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  submitText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
