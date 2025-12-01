import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../AuthContext";
import api from "../api";
import * as ImagePicker from "expo-image-picker";

export default function AddPet() {
  const navigation = useNavigation();
  const { accessToken } = useAuth();

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.cancelled) setImageUri(result.uri);
  };

  const handleAddPet = async () => {
    if (!name || !age) return alert("Please enter pet name and age.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("age", age);

      if (imageUri) {
        const filename = imageUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append("image", { uri: imageUri, name: filename, type });
      }

      await api.post("/pets", formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Pet added successfully!");
      navigation.goBack();
    } catch (err) {
      console.log(err);
      alert("Error adding pet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Add New Pet</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.petImage} />
        ) : (
          <Text style={styles.pickText}>Pick an Image</Text>
        )}
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Pet Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />

      <TouchableOpacity style={styles.button} onPress={handleAddPet} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Add Pet</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#0B4F6C",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  imagePicker: {
    height: 150,
    width: 150,
    backgroundColor: "#eee",
    borderRadius: 75,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: 20,
  },
  petImage: { width: 150, height: 150, borderRadius: 75 },
  pickText: { color: "#666" },
});
