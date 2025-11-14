import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Please fill all the details.");
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      Alert.alert("Login successful");
      router.replace("/(tabs)");
    } else {
      Alert.alert("Login failed", res.msg);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>Hey,</Text>
            <Text style={styles.greeting}>Welcome Back</Text>
            <Text style={styles.subText}>
              Login now to track all your expenses
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
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
            <Pressable onPress={() => router.push("/(auth)/forgotPassword")}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>

            <Pressable onPress={handleSubmit} style={styles.btnContainer}>
              <Text style={styles.btnText}>Login</Text>
            </Pressable>
          </View>

          {/* Account sign-up */}
          <View style={styles.accountContainer}>
            <Text style={styles.accountText}>Dont have an account?</Text>
            <Pressable onPress={() => router.push("/(auth)/register")}>
              <Text style={styles.signUpText}> Sign up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Login;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#171717",
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingVertical: 30,
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
  forgotText: {
    alignSelf: "flex-end",
    marginTop: 10,
    color: "#C7F02C",
    fontWeight: "500",
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
  signUpText: {
    color: "#C7F02C",
    fontSize: 16,
    fontWeight: "700",
  },
});
