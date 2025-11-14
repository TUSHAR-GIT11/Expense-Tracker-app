import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  SafeAreaView,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const Register = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register } = useAuth();

  const handleSubmit = async () => {
    if (!name || !email || !password) {
      Alert.alert("Please fill all the details.");
      return;
    }

    const res = await register(email, password, name);
    if (res.success) {
      Alert.alert("Account created!");
      router.replace("/(tabs)");
    } else {
      Alert.alert("Registration failed", res.msg);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.container}
        enableOnAndroid={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Lets,</Text>
          <Text style={styles.greeting}>Get Started</Text>
          <Text style={styles.subText}>
            Create an account to track your expenses
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.inputText}
            placeholder="Enter name"
            placeholderTextColor="#aaa"
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.inputText}
            placeholder="Enter email"
            placeholderTextColor="#aaa"
            keyboardType="email-address"
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            style={styles.inputText}
            placeholder="Enter password"
            placeholderTextColor="#aaa"
            secureTextEntry
          />

          <Pressable onPress={handleSubmit} style={styles.btnContainer}>
            <Text style={styles.btnText}>Sign Up</Text>
          </Pressable>
        </View>

        {/* Account login */}
        <View style={styles.accountContainer}>
          <Text style={styles.accountText}>Already have an account?</Text>
          <Pressable onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.signInText}> Login</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default Register;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#171717",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    width: "100%",
    alignItems: "center",
    marginBottom: 40,
  },
  greeting: {
    color: "white",
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },
  subText: {
    color: "#aaa",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  form: {
    width: "100%",
    alignItems: "center",
  },
  inputText: {
    width: "100%",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    color: "white",
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginTop: 20,
    fontSize: 16,
  },
  btnContainer: {
    width: "100%",
    backgroundColor: "#C7F02C",
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  btnText: {
    color: "#171717",
    fontSize: 18,
    fontWeight: "700",
  },
  accountContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 30,
  },
  accountText: {
    color: "#aaa",
    fontSize: 16,
  },
  signInText: {
    color: "#C7F02C",
    fontSize: 16,
    fontWeight: "700",
  },
});
