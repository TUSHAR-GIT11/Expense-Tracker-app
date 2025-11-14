import { StyleSheet, Image } from "react-native";
import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { auth } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      // 👇 check auth state directly
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // ✅ user logged in → go to tabs
          router.replace("/(tabs)");
        } else {
          // ❌ no user → go to welcome
          router.replace("/(auth)/welcome");
        }
      });
    }, 1500); // splash delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Image
        style={styles.logo}
        resizeMode="contain"
        source={require("../assets/images/splashImage.png")}
      />
    </SafeAreaView>
  );
};

export default Index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#171717",
  },
  logo: {
    height: "20%",
    aspectRatio: 1,
  },
});
