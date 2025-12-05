// src/screens/LoginScreen.js
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
} from "react-native";
import {
  Text as PText,
  TextInput as PTextInput,
  Button as PButton,
  HelperText as PHelperText,
  useTheme,
} from "react-native-paper";
import { useAuth } from "../AuthContext";

const PetWellLogo = require("../../assets/logo.png");

export default function LoginScreen({ navigation }) {
  const { login, loading } = useAuth();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState("");

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const passValid = password.length >= 6;

  const onLogin = async () => {
    if (!emailValid || !passValid) {
      setError("Enter a valid email and a password with at least 6 characters.");
      return;
    }
    setError("");

    const result = await login(email.trim(), password);

    if (!result.ok) {
      setError(result.message || "Login failed. Try again.");
      return; // Stop here, don't navigate
    }

    // Success: navigate to Dashboard
    navigation.navigate({ screen: "Dashboard" });

  };

  const canSubmit = emailValid && passValid && !loading;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <ScrollView
        contentContainerStyle={styles.centeredContent}
        keyboardShouldPersistTaps="handled"
        style={styles.containerWidth}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={PetWellLogo}
              style={[styles.petWellImage, { width: 200, height: 150 }]}
              resizeMode="center"
            />
          </View>

          <PText variant="titleLarge" style={styles.loginTitle}>
            Login
          </PText>
          <PText variant="bodyMedium" style={styles.loginSubtitle}>
            Let's fetch your account!
          </PText>

          <PText style={styles.label}>Email</PText>
          <PTextInput
            mode="flat"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
            underlineColor="#000"
            activeUnderlineColor="#B9BF1D"
            placeholder="enter your email address"
          />
          <PHelperText type={emailValid ? "info" : "error"} visible={email.length > 0 && !emailValid}>
            Enter a valid email address
          </PHelperText>

          <PText style={[styles.label, styles.passwordLabel]}>Password</PText>
          <PTextInput
            mode="flat"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
            right={<PTextInput.Icon icon={secure ? "eye-off" : "eye"} onPress={() => setSecure(s => !s)} />}
            style={styles.input}
            underlineColor="#000"
            activeUnderlineColor="#B9BF1D"
            placeholder="enter your password"
          />
          <PHelperText type="info" visible={password.length > 0 && !passValid}>
            Minimum 6 characters
          </PHelperText>

          {error ? <PHelperText type="error" visible>{error}</PHelperText> : null}

          <PButton
            mode="contained"
            onPress={onLogin}
            disabled={!canSubmit}
            loading={loading}
            style={styles.ctaButton}
            contentStyle={styles.ctaContent}
            labelStyle={styles.ctaLabel}
          >
            Login
          </PButton>

          <View style={styles.row}>
            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
              <PText style={styles.linkText}>Forgot Password?</PText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.replace("Register")}>
              <PText style={styles.registerLinkText}>New User? Register</PText>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#FFFFFF" },
  containerWidth: { width: "90%", maxWidth: 400, alignSelf: 'center' },
  centeredContent: { flexGrow: 1, justifyContent: 'center', paddingVertical: 50 },
  content: { backgroundColor: "#FFFFFF", paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20, shadowOpacity: 0.15, shadowRadius: 3.84 },
  logoContainer: { alignItems: "center", marginBottom: 30 },
  petWellImage: { width: 100, height: 100 },
  loginTitle: { fontWeight: "bold", color: "#B9BF1D", marginBottom: 2 },
  loginSubtitle: { fontSize: 16, color: "#666", marginBottom: 30 },
  label: { fontSize: 14, fontWeight: "bold", color: "#0B4F6C", marginTop: 15 },
  passwordLabel: { marginTop: 25 },
  input: { backgroundColor: "transparent", height: 40, paddingHorizontal: 0, marginBottom: -4 },
  ctaButton: { marginTop: 20, borderRadius: 0, backgroundColor: "#0B4F6C", elevation: 2 },
  ctaContent: { height: 50 },
  ctaLabel: { fontSize: 18, fontWeight: "bold", color: "#ffff" },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 20, paddingHorizontal: 5 },
  linkText: { color: "#666", textDecorationLine: "none" },
  registerLinkText: { color: "#0D4B56", fontWeight: "bold", textDecorationLine: "none" },
});
