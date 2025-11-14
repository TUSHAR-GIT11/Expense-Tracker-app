import React from "react";
import { Pressable, StyleSheet } from "react-native";
import * as Icons from "phosphor-react-native";
import { useRouter } from "expo-router";

const BackButton = () => {
  const router = useRouter();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && { opacity: 0.7 }, // subtle press effect
      ]}
      onPress={() => router.back()}
    >
      <Icons.ArrowLeft size={24} color="#121212" weight="bold" />
    </Pressable>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#C7F02C", // matches your update button accent
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 20,
    marginTop: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});
