import React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  Keyboard,
  StyleSheet,
  Dimensions,
} from "react-native";
const { width, height } = Dimensions.get("window");
const UserProfileModal = ({
  visible,
  user,
  loading,
  onCancel,
  onChange,
  onSubmit,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <TouchableOpacity
            activeOpacity={1}
            style={styles.backdropTouchable}
            onPress={onCancel}
          />
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.modal}>
              <Text style={styles.title}>Update Your Profile</Text>
              <Text style={styles.description}>
                Please complete your name, email, and city to access full
                features.
              </Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  value={user.name}
                  onChangeText={(text) => onChange("name", text)}
                  placeholder="Full Name"
                  placeholderTextColor="#9CA3AF"
                />
                <TextInput
                  style={styles.input}
                  value={user.email}
                  onChangeText={(text) => onChange("email", text)}
                  placeholder="Email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                />
                <TextInput
                  style={styles.input}
                  value={user.city}
                  onChangeText={(text) => onChange("city", text)}
                  placeholder="City"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.updateBtn,
                    loading && styles.updateBtnDisabled,
                  ]}
                  onPress={onSubmit}
                  disabled={loading}
                >
                  <Text style={styles.updateBtnText}>
                    {loading ? "Updating..." : "Update"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  backdropTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    width: width * 0.9,
    maxWidth: 600,
    minHeight: 300,
    maxHeight: height * 0.8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 24,
    textAlign: "center",
  },
  inputContainer: {},
  input: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
    color: "#000",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
  },
  cancelBtnText: { fontSize: 16, fontWeight: "500", color: "#000" },
  updateBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#1D3A76",
    borderRadius: 8,
  },
  updateBtnDisabled: { opacity: 0.6 },
  updateBtnText: { fontSize: 16, fontWeight: "500", color: "#fff" },
});
export default UserProfileModal;
