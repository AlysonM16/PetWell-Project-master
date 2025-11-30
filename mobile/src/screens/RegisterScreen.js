// src/screens/RegisterScreen.js
import React, { useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableOpacity,
  Alert,


  
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  HelperText,
  useTheme,
} from "react-native-paper";
import { useAuth } from "../AuthContext";

export default function RegisterScreen({ navigation }) {
  const { colors } = useTheme();
  const { register, loading } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [secure1, setSecure1] = useState(true);
  const [secure2, setSecure2] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const emailValid = /\S+@\S+\.\S+/.test(email);
  const passValid = password.length >= 6;
  const match = passValid && password === confirm;
  const canSubmit = name.trim() && emailValid && match && !submitting && !loading;

  const onRegister = async () => {
    if (!canSubmit) {
      Alert.alert("Invalid input", "Fill all fields correctly.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password);
      // AuthContext will log the user in and Root will navigate
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const goToLogin = () => {
    navigation.replace("Login");
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      {/* Green rounded background block */}
      <View style={styles.greenPanel} />

      {/* White card on top */}
      <View style={styles.cardWrapper}>
        <View style={styles.headerRow}>
          <Text
            variant="titleLarge"
            style={[styles.title, { color: "#B9BF1D" }]}
          >
            Registration
          </Text>

          <TouchableOpacity style={styles.closeButton} onPress={goToLogin}>
            <Text style={styles.closeText}>X</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          mode="flat"
          label="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          underlineColor="#0B4F6C"
          activeUnderlineColor="#0B4F6C"
        />

        <TextInput
          mode="flat"
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          underlineColor="#0B4F6C"
          activeUnderlineColor="#0B4F6C"
        />
        <HelperText type="error" visible={email.length > 0 && !emailValid}>
          Enter a valid email
        </HelperText>

        <TextInput
          mode="flat"
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secure1}
          right={
            <TextInput.Icon
              icon={secure1 ? "eye-off" : "eye"}
              onPress={() => setSecure1((s) => !s)}
            />
          }
          style={styles.input}
          underlineColor="#0B4F6C"
          activeUnderlineColor="#0B4F6C"
        />
        <HelperText type="info" visible={password.length > 0 && !passValid}>
          Minimum 6 characters
        </HelperText>

        <TextInput
          mode="flat"
          label="Re-type Password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry={secure2}
          right={
            <TextInput.Icon
              icon={secure2 ? "eye-off" : "eye"}
              onPress={() => setSecure2((s) => !s)}
            />
          }
          style={styles.input}
          underlineColor="#0B4F6C"
          activeUnderlineColor="#0B4F6C"
        />
        <HelperText
          type={match ? "info" : "error"}
          visible={confirm.length > 0 && !match}
        >
          Passwords do not match
        </HelperText>

        {error ? (
          <HelperText type="error" visible>
            {error}
          </HelperText>
        ) : null}

        <Button
          mode="contained"
          onPress={onRegister}
          disabled={!canSubmit}
          loading={submitting || loading}
          style={styles.cta}
          contentStyle={styles.ctaContent}
        >
          Create Account
        </Button>

        <View style={styles.row}>
          <TouchableOpacity onPress={goToLogin}>
            <Text style={styles.link}>Have an account? Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    justifyContent: "center",
    alignItems: "center",
  },

  // Big green rounded shape
  greenPanel: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 40,
    top: 140,
    backgroundColor: "#B9BF1D",
    borderRadius: 40,
  },

  // White card sitting on top
  cardWrapper: {
    width: "85%",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingVertical: 24,
    elevation: 5,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },

  title: {
    fontWeight: "700",
    fontSize: 22,
  },

  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: "#0B4F6C",
    alignItems: "center",
    justifyContent: "center",
  },

  closeText: {
    color: "#ffffff",
    fontWeight: "600",
  },

  input: {
    backgroundColor: "transparent",
    marginTop: 6,
  },

  cta: {
    marginTop: 24,
    borderRadius: 8,
    alignSelf: "center",
    width: "70%",
    backgroundColor: "#0B4F6C",
  },

  ctaContent: {
    paddingVertical: 6,
  },

  row: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
  },

  link: {
    textDecorationLine: "underline",
    color: "#0B4F6C",
  },
});
