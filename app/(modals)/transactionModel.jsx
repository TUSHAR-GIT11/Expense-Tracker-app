import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
  Image,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Dropdown } from "react-native-element-dropdown";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { collection, addDoc, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import useFetchData from "../../hooks/useFetchData";
import { useAuth } from "../../contexts/AuthContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { expenseCategories, incomeCategories } from "../../constants/data";

const TransactionModal = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAuth();

  const { data: wallets, loading: walletsLoading } = useFetchData("wallets", []);

  const [transaction, setTransaction] = useState({
    type: "income",
    wallet: "",
    category: "",
    icon: "",
    date: new Date(),
    amount: "",
    description: "",
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [amountError, setAmountError] = useState("");

  const { id } = params;

  // Animated delete button
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const handlePressIn = () => Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }).start();
  const handlePressOut = () => Animated.spring(scaleAnim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();

  // Initialize transaction state if editing
  useEffect(() => {
    if (walletsLoading) return;

    if (id) {
      const fetchTransaction = async () => {
        const transRef = doc(db, "transactions", id);
        const transSnap = await getDoc(transRef);
        if (transSnap.exists()) {
          const data = transSnap.data();
          setTransaction({
            type: data.type,
            wallet: data.wallet,
            category: data.category,
            icon: data.icon || "",
            date: data.date?.toDate() || new Date(),
            amount: String(data.amount),
            description: data.description || "",
          });
        }
      };
      fetchTransaction();
    }
  }, [id, walletsLoading]);

  // Pick image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled)
      setTransaction((prev) => ({ ...prev, icon: result.assets[0].uri }));
  };

  const handleSave = async () => {
    if (!transaction.type || !transaction.wallet || !transaction.category || !transaction.amount) {
      return Alert.alert("Missing fields", "Please fill all required fields.");
    }

    try {
      const amountNum = parseFloat(transaction.amount);
      if (isNaN(amountNum)) throw new Error("Amount must be a number");

      const walletRef = doc(db, "wallets", transaction.wallet);
      const walletSnap = await getDoc(walletRef);
      if (!walletSnap.exists()) return Alert.alert("Error", "Selected wallet does not exist.");

      const currentAmount = Number(walletSnap.data().amount || 0);

      if (transaction.type === "expense" && amountNum > currentAmount && !id) {
        return Alert.alert("Insufficient Funds", `This wallet only has $${currentAmount.toFixed(2)}.`);
      }

      let newAmount;
      if (id) {
        const transactionRef = doc(db, "transactions", id);
        const oldSnap = await getDoc(transactionRef);
        const oldAmount = Number(oldSnap.data().amount || 0);

        newAmount =
          transaction.type === "income"
            ? currentAmount - oldAmount + amountNum
            : currentAmount + oldAmount - amountNum;

        if (transaction.type === "expense" && newAmount < 0) {
          return Alert.alert("Insufficient Funds", `This wallet only has $${currentAmount.toFixed(2)}.`);
        }

        await updateDoc(transactionRef, { ...transaction, amount: amountNum });
      } else {
        newAmount =
          transaction.type === "income"
            ? currentAmount + amountNum
            : currentAmount - amountNum;

        await addDoc(collection(db, "transactions"), {
          ...transaction,
          uid: user.uid,
          amount: amountNum,
          created: new Date(),
        });
      }

      await updateDoc(walletRef, { amount: newAmount });
      Alert.alert("✅ Transaction Saved!");
      router.canGoBack() ? router.back() : router.replace("/");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", err.message);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    Alert.alert("Delete Transaction", "Are you sure you want to delete this transaction?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const transactionRef = doc(db, "transactions", id);
            const transactionSnap = await getDoc(transactionRef);
            if (!transactionSnap.exists()) return;

            const { amount: transAmount, wallet: walletId, type: transType } = transactionSnap.data();
            const walletRef = doc(db, "wallets", walletId);
            const walletSnap = await getDoc(walletRef);
            const currentAmount = Number(walletSnap.data()?.amount || 0);

            const newAmount = transType === "income" ? currentAmount - transAmount : currentAmount + transAmount;

            await updateDoc(walletRef, { amount: newAmount });
            await deleteDoc(transactionRef);

            Alert.alert("✅ Transaction Deleted");
            router.canGoBack() ? router.back() : router.replace("/");
          } catch (err) {
            console.log(err);
            Alert.alert("Error", err.message);
          }
        },
      },
    ]);
  };

  // Filter wallets only for current logged-in user
  const walletOptions =
    wallets
      ?.filter((w) => w.uid === user.uid)
      .map((w) => ({
        label: `${w.name} ($${w.amount?.toFixed(2) || "0.00"})`,
        value: w.id,
      })) || [];

  const categoryOptions = Object.entries(transaction.type === "income" ? incomeCategories : expenseCategories)
    .map(([key, val]) => ({ label: val.label, value: key }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#171717" }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <Text style={styles.txt}>{id ? "Update Transaction" : "New Transaction"}</Text>
        </View>

        <KeyboardAwareScrollView
          style={styles.middle}
          contentContainerStyle={{ paddingBottom: 40 }}
          enableOnAndroid
          extraScrollHeight={120}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Type</Text>
            <Dropdown
              style={styles.dropdown}
              data={[
                { label: "Expense", value: "expense" },
                { label: "Income", value: "income" },
              ]}
              labelField="label"
              valueField="value"
              value={transaction.type}
              placeholder="Select type"
              placeholderStyle={{ color: "#aaa" }}
              selectedTextStyle={{ color: "white" }}
              onChange={(item) => setTransaction((prev) => ({ ...prev, type: item.value, category: "" }))}
            />
          </View>

          {/* Wallet */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Wallet</Text>
            {walletsLoading ? (
              <ActivityIndicator size="small" color="limegreen" />
            ) : walletOptions.length === 0 ? (
              <Text style={{ color: "white", marginTop: 10 }}>You have no wallets. Please create one first.</Text>
            ) : (
              <Dropdown
                style={styles.dropdown}
                data={walletOptions}
                labelField="label"
                valueField="value"
                value={transaction.wallet}
                placeholder="Select wallet"
                placeholderStyle={{ color: "#aaa" }}
                selectedTextStyle={{ color: "white" }}
                onChange={(item) => setTransaction((prev) => ({ ...prev, wallet: item.value }))}
              />
            )}
          </View>

          {/* Category */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{transaction.type === "income" ? "Income Category" : "Expense Category"}</Text>
            <Dropdown
              style={styles.dropdown}
              data={categoryOptions}
              labelField="label"
              valueField="value"
              value={transaction.category}
              placeholder="Select category"
              placeholderStyle={{ color: "#aaa" }}
              selectedTextStyle={{ color: "white" }}
              onChange={(item) => setTransaction((prev) => ({ ...prev, category: item.value }))}
            />
          </View>

          {/* Date */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date</Text>
            <Pressable style={styles.dropdown} onPress={() => setShowDatePicker(true)}>
              <Text style={{ color: "white" }}>{transaction.date?.toDateString()}</Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={transaction.date || new Date()}
                mode="date"
                display="default"
                onChange={(e, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setTransaction((prev) => ({ ...prev, date: selectedDate }));
                }}
              />
            )}
          </View>

          {/* Amount */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter amount"
              placeholderTextColor="#aaa"
              keyboardType="numeric"
              value={transaction.amount}
              onChangeText={(text) => {
                const amountNum = parseFloat(text) || 0;
                const selectedWallet = wallets.find((w) => w.id === transaction.wallet);
                const walletAmount = selectedWallet?.amount || 0;

                if (transaction.type === "expense" && amountNum > walletAmount) {
                  setAmountError(`Insufficient funds: $${walletAmount.toFixed(2)} available`);
                } else {
                  setAmountError("");
                }

                setTransaction((prev) => ({ ...prev, amount: text }));
              }}
            />
            {amountError ? <Text style={styles.errorText}>{amountError}</Text> : null}
          </View>

          {/* Description */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter description"
              placeholderTextColor="#aaa"
              value={transaction.description}
              onChangeText={(text) => setTransaction((prev) => ({ ...prev, description: text }))}
            />
          </View>

          {/* Icon */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Transaction Icon</Text>
            <Pressable style={styles.uploadBox} onPress={pickImage}>
              {transaction.icon ? (
                <Image source={{ uri: transaction.icon }} style={{ width: 60, height: 60, borderRadius: 8 }} />
              ) : (
                <Text style={{ color: "#aaa" }}>+ Upload Image</Text>
              )}
            </Pressable>
          </View>
        </KeyboardAwareScrollView>

        {/* Footer */}
        <View style={styles.footerRow}>
          {id && (
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <Pressable style={styles.deleteBtn} onPress={handleDelete} onPressIn={handlePressIn} onPressOut={handlePressOut}>
                <Ionicons name="trash" size={18} color="white" />
              </Pressable>
            </Animated.View>
          )}

          <Pressable style={[styles.addBtn, amountError ? { backgroundColor: "#555" } : null]} onPress={handleSave} disabled={!!amountError}>
            <Text style={styles.addBtnText}>{id ? "Update Transaction" : "Save Transaction"}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default TransactionModal;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "space-between" },
  header: { marginTop: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", position: "relative", paddingHorizontal: 20 },
  backButton: { position: "absolute", left: 20, padding: 5, backgroundColor: "#aaa", borderRadius: 20 },
  deleteBtn: { padding: 8, backgroundColor: "#333", borderRadius: 20, justifyContent: "center", alignItems: "center", marginRight: 10 },
  txt: { color: "white", fontWeight: "500", fontSize: 20 },
  middle: { flex: 1 },
  inputContainer: { paddingTop: 20, paddingHorizontal: 20, zIndex: 100 },
  label: { color: "white", fontSize: 15, marginBottom: 8 },
  dropdown: { borderWidth: 1, borderColor: "white", borderRadius: 8, paddingHorizontal: 10, height: 50, justifyContent: "center", zIndex: 1000 },
  input: { borderWidth: 1, borderColor: "white", borderRadius: 8, paddingHorizontal: 10, height: 50, color: "white" },
  uploadBox: { height: 80, borderWidth: 1, borderColor: "white", borderRadius: 8, alignItems: "center", justifyContent: "center" },
  footerRow: { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginBottom: 20 },
  addBtn: { flex: 1, backgroundColor: "#C7F02C", paddingVertical: 14, borderRadius: 8, alignItems: "center" },
  addBtnText: { color: "black", fontSize: 16, fontWeight: "600", textAlign: "center" },
  errorText: { color: "tomato", marginTop: 5, fontSize: 13 },
});
