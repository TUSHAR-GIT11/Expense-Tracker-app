import React, { useState, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Modal,
  Image,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../config/firebase";
import { useRouter } from "expo-router";

const Profile = () => {
  const { user } = useAuth();
  const router = useRouter();

  const [modalVisible, setModalVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  const confirmLogout = async () => {
    try {
      setModalVisible(false);
      await signOut(auth);
      router.replace("/(auth)/login");
    } catch (error) {
      console.log("Logout error:", error.message);
    }
  };

  const handleEdit = () => {
    router.push("/(modals)/profileModals");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image
            style={styles.profileImage}
            source={user?.image ? { uri: user.image } : require("../../assets/images/image.png")}
          />
        </View>

        <View style={styles.userContainer}>
          <Text style={styles.txt}>{user?.name}</Text>
          <Text style={styles.emailtxt}>{user?.email}</Text>
        </View>

        <View style={styles.editContainer}>
          <Pressable onPress={handleEdit} style={styles.editBtn}>
            <Text style={{ fontSize: 20 }}>Edit Profile</Text>
          </Pressable>
        </View>

        <View style={styles.settingContainer}>
          <Pressable style={styles.settingBtn}>
            <Text style={{ fontSize: 20 }}>Settings</Text>
          </Pressable>
        </View>

        <View style={styles.policyContainer}>
          <Pressable style={styles.policyBtn}>
            <Text style={{ fontSize: 20 }}>Privacy Policy</Text>
          </Pressable>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <Pressable onPress={() => setModalVisible(true)} style={styles.logoutBtn}>
            <Text style={{ fontSize: 20 }}>Log out</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* Logout Confirmation Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Are you sure you want to logout?</Text>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalBtn, { backgroundColor: "#555" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={{ color: "white" }}>Cancel</Text>
              </Pressable>

              <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <Pressable
                  style={[styles.modalBtn, { backgroundColor: "#C7F02C" }]}
                  onPress={confirmLogout}
                  onPressIn={handlePressIn}
                  onPressOut={handlePressOut}
                >
                  <Text style={{ color: "black" }}>Logout</Text>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#171717" },
  scrollContent: { paddingBottom: 40 },
  imageContainer: { marginTop: 40, alignItems: "center", justifyContent: "center" },
  profileImage: { width: 200, height: 200, borderRadius: 100, backgroundColor: "#ccc" },
  userContainer: { marginTop: 20, alignItems: "center", justifyContent: "center" },
  txt: { fontWeight: "bold", fontSize: 25, color: "white" },
  emailtxt: { color: "white", marginTop: 5 },
  logoutContainer: { padding: 25 },
  logoutBtn: {
    backgroundColor: "#C7F02C",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  editBtn: {
    backgroundColor: "#C7F02C",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  editContainer: { paddingTop: 20, paddingHorizontal: 25, marginTop: 30 },
  settingBtn: {
    backgroundColor: "#C7F02C",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  settingContainer: { paddingTop: 20, paddingHorizontal: 25 },
  policyBtn: {
    backgroundColor: "#C7F02C",
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  policyContainer: { paddingTop: 20, paddingHorizontal: 25 },

  /* Modal styles */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1E1E1E",
    borderRadius: 20,
    padding: 25,
    width: "80%",
    alignItems: "center",
  },
  modalText: { color: "white", fontSize: 18, textAlign: "center", marginBottom: 20 },
  modalButtons: { flexDirection: "row", justifyContent: "space-between", width: "100%" },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 5,
    alignItems: "center",
  },
});
