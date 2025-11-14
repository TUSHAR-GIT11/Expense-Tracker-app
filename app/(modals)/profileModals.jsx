import React, { useState } from "react";
import * as ImagePicker from "expo-image-picker";

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

import { updateDoc, doc } from "firebase/firestore";
import { useRouter } from "expo-router";
import axios from "axios";

import { useAuth } from "../../contexts/AuthContext";
import { db } from "../../config/firebase"; // Firestore only
import BackButton from "../../components/BackButton";
import DefaultProfileImage from "../../assets/images/image.png";

// 🔑 Cloudinary Credentials
const CLOUD_NAME = "df3skhlll"; 
const UPLOAD_PRESET = "images";       

const ProfileModals = () => {
  const [loading, setLoading] = useState(false);
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [image, setImage] = useState(user?.image || null);
  const router = useRouter();

  // Pick image from gallery
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
      mediaTypes: ImagePicker.MediaTypeOptions?.Images || 1, // safe fallback
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
  // Upload to Cloudinary + Update Firestore
  const handleUpdate = async () => {
    if (!user?.uid) {
      Alert.alert("Error", "User ID not found");
      return;
    }

    setLoading(true);

    try {
      let imageUrl = image;

      // Upload to Cloudinary if image is local
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

      // Update Firestore + Auth context
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
  container: {
    flex: 1,
    backgroundColor: "#121212", // darker, sleek background
  },
  scrollContent: {
    paddingBottom: 80,
  },
  textContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  text: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 28,
  },
  imageContainer: {
    marginTop: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "#2C2C2C",
    borderWidth: 2,
    borderColor: "#C7F02C",
  },
  iconWrapper: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#C7F02C",
    borderRadius: 20,
    padding: 8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  inputContainer: {
    marginTop: 50,
    marginHorizontal: 20,
    padding: 20,
    backgroundColor: "#1E1E1E",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputTxt: {
    color: "#AAAAAA",
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 16,
    backgroundColor: "#2C2C2C",
  },
  updateContainer: {
    marginTop: 40,
    marginHorizontal: 20,
  },
  updateBtn: {
    backgroundColor: "#C7F02C",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#C7F02C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  updateText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#121212",
  },
});

