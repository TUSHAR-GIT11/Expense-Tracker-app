import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useAuth } from "../contexts/AuthContext";
import useFetchData from "../hooks/useFetchData";

const WalletPicker = ({ selectedWallet, onSelectWallet }) => {
  const { user } = useAuth();

  // sirf current user ke wallets
  const { data: wallets, loading } = useFetchData(
    "wallets",
    user?.uid ? [{ field: "uid", operator: "==", value: user.uid }] : []
  );

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Wallet</Text>

      {loading ? (
        <Text style={{ color: "white" }}>Loading wallets…</Text>
      ) : (
        <Picker
          selectedValue={selectedWallet}
          onValueChange={(itemValue) => onSelectWallet(itemValue)}
          style={styles.picker}
          dropdownIconColor="#fff"
        >
          <Picker.Item label="Select Wallet" value="" />
          {wallets.map((wallet) => (
            <Picker.Item
              label={wallet.name}
              value={wallet.id}
              key={wallet.id}
            />
          ))}
        </Picker>
      )}
    </View>
  );
};

export default WalletPicker;

const styles = StyleSheet.create({
  container: { paddingTop: 15 },
  label: { color: "white", marginBottom: 8 },
  picker: {
    color: "white",
    backgroundColor: "#1E1E1E",
    borderRadius: 8,
  },
});
