import React, { useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import * as ImagePicker from "expo-image-picker";
import { doc, deleteDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../config/firebase";
import { useAuth } from "../../contexts/AuthContext";

const WalletModal = () => {
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState({ image: null });
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams();

  const isEditing = Boolean(params?.id);

  useEffect(() => {
    if (!isEditing) {
      setName("");
      setWallet({ image: null });
      return;
    }

    setName(params?.name ?? "");
    setWallet({ image: params?.image ?? null });
  }, [isEditing, params?.id, params?.name, params?.image]);

  const handleBack = () => router.back();

  const onPickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return alert("Gallery permission is required");

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.7,
      });

      if (!result.canceled && result.assets?.length > 0) {
        setWallet({ image: result.assets[0].uri });
      }
    } catch (err) {
      console.log("Image pick error:", err);
      alert("Failed to pick image. Try again.");
    }
  };

  const removeImage = () => setWallet({ image: null });

  const handleDeleteWallet = async () => {
    if (!params?.id) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, "wallets", params.id));
      Alert.alert("Deleted", "Wallet deleted successfully");
      router.replace("/wallet");
    } catch (err) {
      console.log("Delete error:", err);
      alert("Failed to delete wallet: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddWallet = async () => {
    if (!name.trim()) return alert("Please enter wallet name");
    if (!user?.uid) return alert("You must be logged in");
    if (!db) return alert("Firestore not initialized");

    setLoading(true);
    try {
      if (isEditing) {
        // Update wallet
        await updateDoc(doc(db, "wallets", params.id), {
          name,
          image: wallet.image ?? null,
          updated: serverTimestamp(),
        });
        Alert.alert("Updated", "Wallet updated successfully");
      } else {
        // Add new wallet
        const docRef = await addDoc(collection(db, "wallets"), {
          name,
          image: wallet.image ?? null,
          uid: user.uid,
          created: serverTimestamp(),
          amount: 0,
        });
        console.log("Added wallet with ID:", docRef.id);
        Alert.alert("Added", "Wallet added successfully");
      }
      router.replace("/wallet");
    } catch (err) {
      console.log("Wallet error:", err);
      alert("Something went wrong: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert("Delete Wallet", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: handleDeleteWallet },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#171717" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable onPress={handleBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="white" />
            </Pressable>
            <Text style={styles.txt}>{isEditing ? "Update Wallet" : "New Wallet"}</Text>
          </View>

          {/* Middle */}
          <View style={styles.middle}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Wallet Name</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Name"
                placeholderTextColor="#aaa"
              />
            </View>

            <View style={styles.iconContainer}>
              <Text style={styles.label}>Wallet Icon</Text>
              {!wallet.image ? (
                <Pressable onPress={onPickImage} style={styles.uploadBox}>
                  <Icons.UploadSimple color="#aaa" size={20} />
                  <Text style={styles.uploadText}>Upload Image</Text>
                </Pressable>
              ) : (
                <View style={styles.previewWrapper}>
                  <Image source={{ uri: wallet.image }} style={styles.previewImage} />
                  <Pressable style={styles.removeBtn} onPress={removeImage}>
                    <Text style={styles.removeText}>✕</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            {isEditing && (
              <Pressable style={styles.deleteBtn} onPress={confirmDelete}>
                <Icons.Trash color="white" size={22} weight="bold" />
              </Pressable>
            )}
            <Pressable style={styles.addBtn} onPress={handleAddWallet} disabled={loading}>
              {loading ? (
                <ActivityIndicator color="black" />
              ) : (
                <Text style={styles.addBtnText}>{isEditing ? "Update Wallet" : "Add Wallet"}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default WalletModal;

// Styles remain the same
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between" },
  header: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    paddingHorizontal: 20,
  },
  backButton: {
    position: "absolute",
    left: 20,
    padding: 5,
    backgroundColor: "#aaa",
    borderRadius: 20,
  },
  txt: { color: "white", fontWeight: "500", fontSize: 20 },
  middle: { flex: 1 },
  inputContainer: { paddingTop: 25, paddingHorizontal: 20 },
  label: { color: "white", fontSize: 15 },
  input: {
    color: "white",
    borderColor: "white",
    borderWidth: 1,
    marginTop: 10,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  iconContainer: { paddingTop: 25, paddingHorizontal: 20 },
  uploadBox: {
    borderWidth: 2,
    borderColor: "#aaa",
    borderStyle: "dashed",
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 12,
  },
  uploadText: { color: "#aaa", fontSize: 16, fontWeight: "500" },
  previewWrapper: {
    marginTop: 12,
    position: "relative",
    width: 100,
    height: 100,
  },
  previewImage: { width: 100, height: 100, borderRadius: 8 },
  removeBtn: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "red",
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: { color: "white", fontWeight: "bold" },
  footer: {
    marginHorizontal: 20,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addBtn: {
    flex: 1,
    backgroundColor: "#C7F02C",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteBtn: {
    marginRight: 10,
    backgroundColor: "red",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnText: {
    color: "black",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
