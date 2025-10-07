import React from "react";
import { Pressable, StyleSheet, Text, View, Image } from "react-native";
import * as Icons from "phosphor-react-native";

const WalletListItem = ({ item, index, router }) => {
  // Navigate to WalletModal and pass wallet data as params
  const handlePress = () => {
    router.push({
      pathname: "/(modals)/walletModal",
      params: {
        id: item.id,
        name: item.name,
        image: item.image || null,
      },
    });
  };

  return (
    <Pressable style={styles.container} onPress={handlePress}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.icon} />
      ) : (
        <Icons.Wallet size={28} color="limegreen" />
      )}
      <View style={styles.textContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.amount}>${item.amount?.toFixed(2) || "0.00"}</Text>
      </View>
    </Pressable>
  );
};

export default WalletListItem;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    padding: 12,
    borderRadius: 15,
    backgroundColor: "#1E1E1E",
  },
  icon: { width: 40, height: 40, borderRadius: 8, marginRight: 12 },
  textContainer: { flex: 1 },
  name: { color: "white", fontSize: 16, fontWeight: "500" },
  amount: { color: "gray", fontSize: 14, marginTop: 2 },
});
