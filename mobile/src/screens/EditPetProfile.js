import React, { useState, useEffect } from "react";
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
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../AuthContext";
import api from "../api";
import * as ImagePicker from "expo-image-picker";

export default function EditPetProfile() {
  const navigation = useNavigation();
  const route = useRoute();
  const { petId } = route.params;
  const { accessToken } = useAuth();

  const [pet, setPet] = useState(null);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await api.get(`/pets/${petId}`);
        setPet(res.data);
        setName(res.data.name);
        setAge(res.data.age?.toString());
        setImageUri(res.data.image);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [petId]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.cancelled) setImageUri(result.uri);
  };

  const handleSave = async () => {
    if (!name || !age) return alert("Please enter pet name and age.");
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("age", age);

      if (imageUri && imageUri !== pet.image) {
        const filename = imageUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append("image", { uri: imageUri, name: filename, type });
      }

      await api.put(`/pets/${petId}`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Pet updated successfully!");
      navigation.goBack();
    } catch (err) {
      console.log(err);
      alert("Error updating pet.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0B4F6C" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Edit Pet Profile</Text>

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

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={saving}>
        {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Save Changes</Text>}
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

/*
const styles = StyleSheet.create({
  header: {
    paddingTop: 12,
    paddingBottom: 50,
    backgroundColor: "#ffffffff",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 61,
    backgroundColor: "#A6C000",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    zIndex: 10,
  },
  backText: { fontSize: 18, fontWeight: "700" },
  headerTitle: {
    marginTop: 50,
    backgroundColor: "#ffffff",
    paddingVertical: 6,
    paddingHorizontal: 172,
    borderRadius: 4,
    fontWeight: "700",
    fontSize: 18,
    zIndex: 5,
  },
  headerArc: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    height: 250,
    backgroundColor: "#1F6578",
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
  },
  petWrapper: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 75,
    borderWidth: 4,
    borderColor: "#F4A62A",
  },
  editIcon: {
    position: "absolute",
    right: 6,
    bottom: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  petType: {
    marginTop: 60,
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
  },
  form: {
    marginTop: 24,
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingBottom: 32,
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
  inputWithIcon: {
    marginBottom: 14,
  },
  searchIcon: {
    position: "absolute",
    left: 10,
    top: 11,
    opacity: 0.6,
  },
  buttonsRow: {
    marginTop: 8,
    marginBottom: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  saveButton: {
    backgroundColor: "#16495B",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 14,
  },
  saveText: { color: "#ffffff", fontWeight: "700" },
  deactivateText: { color: "#B91C1C", fontWeight: "600" },
});
*/