import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";

export default function EditProfileScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdate = () => {
    if (password && password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    Alert.alert("Updated", "Profile updated successfully");
  };

  const handleDelete = () => {
    Alert.alert("Delete Account", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => {} },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#ffffffff" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
          <View style={styles.header}>
            <View style={styles.headerArc}/>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack && navigation.goBack()}
            >
              <Text style={styles.backText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Edit Profile</Text>
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: "https://i.pravatar.cc/150?img=5" }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editIcon}>
                <Text style={{ fontWeight: "700" }}>✎</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.form}>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Your name"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="you@email.com"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+1 555 000 0000"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="New password"
              placeholderTextColor="#9ca3af"
            />

            <Text style={styles.label}>Re-Enter Password</Text>
            <TextInput
              style={styles.input}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              placeholder="Re-enter password"
              placeholderTextColor="#9ca3af"
            />

            <View style={styles.buttonsRow}>
              <TouchableOpacity style={styles.updateButton} onPress={handleUpdate}>
                <Text style={styles.updateText}>Update</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleDelete}>
                <Text style={styles.deleteText}>Delete Account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  header: {
    height: 280, // ensures enough room for banner and avatar
    alignItems: "center",
  },

  headerArc: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor: "#1F6578",
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
    zIndex: 0,
  },

  backButton: {
    position: "absolute",
    left: 17,
    top: 50,
    backgroundColor: "#A6C000",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 13,
    zIndex: 10,
  },

  backText: {
    fontSize: 18,
    fontWeight: "700",
  },

  headerTitle: {
    marginTop: 60,
    backgroundColor: "#ffffff",
    paddingVertical: 5,
    paddingHorizontal: 160,
    borderRadius: 4,
    fontWeight: "700",
    fontSize: 18,
    zIndex: 5,
  },

  avatarWrapper: {
    position: "absolute",
    bottom: 80,
    alignSelf: "center",
    zIndex: 10,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: "#d9e4f2",
  },

  editIcon: {
    position: "absolute",
    right: 8,
    bottom: 8,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },

  form: {
    marginTop: 0, // aligns form just below avatar
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
  },

  label: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 14,
    fontSize: 16,
  },

  buttonsRow: {
    marginTop: 12,
    marginBottom: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  updateButton: {
    backgroundColor: "#16495B",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 14,
  },

  updateText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  deleteText: {
    color: "#B91C1C",
    fontWeight: "600",
  },
});