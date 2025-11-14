import { Alert, Pressable, StyleSheet, Text, TextInput, View, SafeAreaView, ScrollView } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';

const ForgotPassword = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Please enter your email.");
      return;
    }

    const auth = getAuth();
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Success", "Password reset link sent to your email!");
      router.push("/(auth)/login"); // navigate back to login
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subText}>
            Enter your email below and we will send you a link to reset your password.
          </Text>
        </View>

        <View style={styles.form}>
          <TextInput
            value={email}
            onChangeText={setEmail}
            style={styles.inputText}
            placeholder='Enter your email'
            placeholderTextColor="#aaa"
            keyboardType="email-address"
          />

          <Pressable onPress={handleReset} style={styles.btnContainer}>
            <Text style={styles.btnText}>Send Reset Link</Text>
          </Pressable>
        </View>

        <View style={styles.accountContainer}>
          <Text style={styles.accountText}>Remembered your password?</Text>
          <Pressable onPress={() => router.push("/(auth)/login")}>
            <Text style={styles.signInText}> Login</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ForgotPassword;

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
  title: {
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
