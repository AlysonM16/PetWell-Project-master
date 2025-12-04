import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import axios from "axios";
import { useNavigation, useRoute } from "@react-navigation/native";

export default function FileUploadScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { petId } = route.params;
  const [uploading, setUploading] = useState(false);
  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
      if (result.type === "cancel") return;

      const file = result.assets?.[0] || result; // iOS may return result directly
      console.log("Selected file:", file);

      let fileUri = file.uri;
      const fileName = file.name;

      // Only Android may need content:// -> file:// conversion
      if (Platform.OS === "android" && fileUri.startsWith("content://")) {
        const destPath = `${FileSystem.cacheDirectory}${fileName}`;
        await FileSystem.copyAsync({ from: fileUri, to: destPath });
        fileUri = destPath;
      }

      const formData = new FormData();
      formData.append("file", {
        uri: fileUri,
        name: fileName,
        type: "application/pdf",
      });
      formData.append("petId", petId);

      setUploading(true);
      const backendIP = "10.203.93.9";

      const res = await axios.post(`http://${backendIP}:8000/process-pdf`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload success!");
      Alert.alert("Success", "File uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err.message || err);
      Alert.alert("Upload failed", err.message || "Unknown error occurred");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
        <Text style={styles.closeText}>X</Text>
      </TouchableOpacity>

      <View style={styles.curvedTop} />
      <View style={styles.card}>
        <Text style={styles.title}>File Upload</Text>
        <Ionicons name="document-attach-outline" size={70} color="#ffffffff" style={{ marginVertical: 20 }} />

        {uploading ? (
          <ActivityIndicator size="large" color="#B4BD00" />
        ) : (
          <TouchableOpacity style={styles.chooseButton} onPress={pickFile}>
            <Text style={styles.chooseButtonText}>Choose File</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#ffff", alignItems: "center", justifyContent: "center" },
  closeButton: { position: "absolute", top: 50, right: 30, zIndex: 20, backgroundColor: "#0B4F6C", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  closeText: { fontSize: 20, fontWeight: "bold", color: "#fff" },
  curvedTop: { position: "absolute", top: 0, width: "100%", height: 170, backgroundColor: "#B4BD00", borderBottomLeftRadius: 120, borderBottomRightRadius: 120 },
  card: { backgroundColor: "#0B4F6C", width: "80%", paddingVertical: 150, paddingHorizontal: 20, borderRadius: 25, alignItems: "center", elevation: 6, shadowColor: "#000000ff", shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  title: { fontSize: 30, fontWeight: "bold", color: "#ffffffff" },
  chooseButton: { marginTop: 25, backgroundColor: "#B4BD00", paddingVertical: 14, paddingHorizontal: 40, borderRadius: 10 },
  chooseButtonText: { color: "#ffff", fontWeight: "bold", fontSize: 18 },
});
