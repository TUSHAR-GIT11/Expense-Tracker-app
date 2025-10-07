import React, { useState } from "react";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Icons from "phosphor-react-native";
import * as ImagePicker from "expo-image-picker";
import { updateDoc, doc } from "firebase/firestore";
import { useRouter } from "expo-router";

import { useAuth } from "../contexts/AuthContext";
import { db } from "../config/firebase"; // still using Firestore for user doc
import BackButton from "../components/BackButton";
import DefaultProfileImage from "../assets/images/image.png";
import axios from "axios";

// 🔑 Replace with your Cloudinary credentials
const CLOUD_NAME = "df3skhlll";    // e.g., "myapp123"
const UPLOAD_PRESET = "images";          // your unsigned preset

const ProfileModals = () => {
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [image, setImage] = useState(user?.image || null);
  const router = useRouter();

  // pick image from gallery
  const onPickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission needed",
          "We need gallery permission to select an image."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled && result.assets.length > 0) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      console.log("Image pick error:", err);
      Alert.alert("Error", "Failed to pick image. Try again.");
    }
  };

  // upload to Cloudinary + update Firestore
  const handleUpdate = async () => {
    if (!user?.uid) {
      Alert.alert("Error", "User ID not found");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = image;

      // upload to cloudinary if local URI
      if (image && !image.startsWith("http")) {
        const formData = new FormData();
        formData.append("file", {
          uri: image,
          type: "image/jpeg",
          name: `profile_${user.uid}.jpg`,
        });
        formData.append("upload_preset", UPLOAD_PRESET);

        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
        const res = await axios.post(cloudinaryUrl, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        imageUrl = res.data.secure_url;
      }

      // update Firestore + Auth context
      await updateDoc(doc(db, "users", user.uid), { name, image: imageUrl });
      setUser({ ...user, name, image: imageUrl });

      setLoading(false);
      router.back();
    } catch (err) {
      console.log("Cloudinary upload error:", err);
      Alert.alert("Upload failed", "Check Cloudinary credentials or internet.");
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <BackButton />
          <View style={styles.textContainer}>
            <Text style={styles.text}>Update Profile</Text>
          </View>

          {/* Profile Image + Pencil */}
          <View style={styles.imageContainer}>
            <View>
              <Image
                style={styles.profileImage}
                source={image ? { uri: image } : DefaultProfileImage}
              />
              <Pressable onPress={onPickImage} style={styles.iconWrapper}>
                <Icons.PencilSimpleLine size={24} color="black" weight="bold" />
              </Pressable>
            </View>
          </View>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputTxt}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter Name"
              placeholderTextColor="white"
            />
          </View>

          {/* Update Button */}
          <View style={styles.updateContainer}>
            <Pressable
              style={[styles.updateBtn, loading && { opacity: 0.6 }]}
              onPress={handleUpdate}
              disabled={loading}
            >
              <Text style={styles.updateText}>
                {loading ? "Updating..." : "Update"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ProfileModals;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#171717" },
  text: { color: "white", fontWeight: "600", fontSize: 25 },
  textContainer: { alignItems: "center", justifyContent: "center" },
  imageContainer: { marginTop: 80, alignItems: "center", justifyContent: "center" },
  scrollContent: { paddingBottom: 60 },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#ccc",
  },
  iconWrapper: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 6,
    elevation: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 10,
    paddingHorizontal: 15,
    color: "white",
  },
  inputTxt: { color: "white", marginBottom: 15, marginLeft: 10 },
  inputContainer: { paddingHorizontal: 15, marginTop: 40 },
  updateContainer: { marginTop: 40, paddingHorizontal: 20, marginBottom: 30 },
  updateBtn: {
    backgroundColor: "#C7F02C",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  updateText: { fontSize: 16, fontWeight: "600" },
});
