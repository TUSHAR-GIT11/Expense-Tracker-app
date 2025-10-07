import React from "react";
import { View, Image, Pressable, Text, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";

const ImageUpload = ({ file, onSelect, onClear }) => {
  
  const pickImage = async () => {
    try {
      // Ask permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access gallery is required!");
        return;
      }

      // Pick image
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onSelect(result.assets[0]);
      }
    } catch (error) {
      console.log("Image picker error:", error);
    }
  };

  return (
    <View style={styles.container}>
      {file ? (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: file.uri }}
            style={styles.image}
            resizeMode="cover"
          />
          <Pressable style={styles.clearBtn} onPress={onClear}>
            <Ionicons name="close-circle" size={24} color="red" />
          </Pressable>
        </View>
      ) : (
        <Pressable style={styles.uploadBtn} onPress={pickImage}>
          <Text style={styles.uploadText}>Select Image</Text>
        </Pressable>
      )}
    </View>
  );
};

export default ImageUpload;

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  uploadBtn: {
    backgroundColor: "#333",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  uploadText: { color: "#fff", fontSize: 16 },
  previewContainer: { position: "relative", width: 100, height: 100 },
  image: { width: 100, height: 100, borderRadius: 10 },
  clearBtn: {
    position: "absolute",
    top: -10,
    right: -10,
  },
});
