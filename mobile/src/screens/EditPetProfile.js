// screens/EditPetProfile.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function EditPetProfile() {
  const navigation = useNavigation();
  const route = useRoute();
  const { petId } = route.params;
  const { accessToken } = useAuth();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUri, setImageUri] = useState(null);

  // Fetch pet info
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await api.get(`/pets/${petId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setPet(res.data);
        setImageUri(res.data.image || null);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [petId, accessToken]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.cancelled) setImageUri(result.uri);
  };

  const handleSave = async () => {
    if (!pet) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", pet.name);
      formData.append("breed", pet.breed);
      formData.append("sex", pet.sex);
      formData.append("dob", pet.dob);
      formData.append("weight", pet.weight);

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
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0B4F6C" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.loaderContainer}>
        <Text style={{ color: "#333" }}>Pet not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ color: "#0B4F6C", marginBottom: 10 }}>← Back</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={pickImage}>
          <Image
            source={
              imageUri
                ? { uri: imageUri }
                : require("../../assets/logo.png")
            }
            style={styles.avatar}
          />
        </TouchableOpacity>

        <TextInput
          style={styles.petNameInput}
          value={pet.name}
          onChangeText={(text) => setPet({ ...pet, name: text })}
        />
        <TextInput
          style={styles.petInfoInput}
          value={pet.age || ""}
          onChangeText={(text) => setPet({ ...pet, age: text })}
          placeholder="Age"
        />
        <TextInput
          style={styles.petInfoInput}
          value={pet.dob || ""}
          onChangeText={(text) => setPet({ ...pet, dob: text })}
          placeholder="DOB"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pet Details</Text>

        <TextInput
          style={styles.infoInput}
          value={pet.breed || ""}
          onChangeText={(text) => setPet({ ...pet, breed: text })}
          placeholder="Breed"
        />
        <TextInput
          style={styles.infoInput}
          value={pet.sex || ""}
          onChangeText={(text) => setPet({ ...pet, sex: text })}
          placeholder="Sex"
        />
        <TextInput
          style={styles.infoInput}
          value={pet.weight || ""}
          onChangeText={(text) => setPet({ ...pet, weight: text })}
          placeholder="Weight"
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSave}
        disabled={saving}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveText}>Save Changes</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: { alignItems: "center", padding: 20 },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#B9BF1D",
    marginBottom: 15,
  },
  petNameInput: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0B4F6C",
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: 200,
    textAlign: "center",
  },
  petInfoInput: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    width: 120,
    textAlign: "center",
  },

  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#0B4F6C", marginBottom: 10 },
  infoInput: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },

  saveButton: {
    backgroundColor: "#0B4F6C",
    padding: 15,
    borderRadius: 20,
    alignItems: "center",
    margin: 20,
  },
  saveText: { color: "#fff", fontWeight: "600" },
});
