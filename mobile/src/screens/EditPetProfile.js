// screens/EditPetProfile.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import api, { setAccessToken } from "../api";
import { useAuth } from "../AuthContext";

export default function EditPetProfileScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { petId } = route.params;

  const { accessToken } = useAuth();

  // Set token for API instance
  useEffect(() => {
    if (accessToken) setAccessToken(accessToken);
  }, [accessToken]);

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUri, setImageUri] = useState(null);
  const [dob, setDob] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Load pet data
  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await api.get(`/pets/${petId}`);
        setPet(res.data);
        setImageUri(res.data.img || null);

        // parse DOB string to Date object if available
        if (res.data.dob) {
          const [month, day, year] = res.data.dob.split("/").map(Number);
          setDob(new Date(year, month - 1, day));
        }
      } catch (err) {
        console.log("Error loading pet:", err);
        Alert.alert("Error", "Failed to load pet data.");
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [petId]);

  // Image picker
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!pet) return;
    if (!dob) return Alert.alert("Error", "Date of birth is required.");

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", pet.name || "");
      formData.append("breed", pet.breed || "");
      formData.append("sex", pet.sex || "");
      formData.append(
        "dob",
        dob
          ? `${dob.getMonth() + 1}/${dob.getDate()}/${dob.getFullYear()}`
          : ""
      );
      formData.append("weight", parseFloat(pet.weight) || 0);


      if (imageUri && imageUri !== pet.img) {
        const filename = imageUri.split("/").pop();
        const ext = filename.split(".").pop();
        formData.append("image", {
          uri: imageUri,
          name: filename,
          type: `image/${ext}`,
        });
      }

      await api.put(`/pets/${petId}`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Success", "Pet updated successfully!");
      navigation.goBack();
    } catch (err) {
      console.log("Error updating pet:", err.response?.data || err.message);
      Alert.alert("Error", "Failed to update pet.");
    } finally {
      setSaving(false);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setDob(selectedDate);
  };

  if (loading || !pet) {
    return (
      <View style={styles.loader}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#fff" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Edit Pet</Text>
          <View style={styles.headerArc} />

          <View style={styles.petWrapper}>
            <Image
              source={{
                uri: imageUri
                  ? imageUri
                  : "https://via.placeholder.com/120?text=Pet",
              }}
              style={styles.petImage}
            />
            <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
              <Text style={{ fontWeight: "700" }}>✎</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.petType}>{pet.breed || "Pet"}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.label}>Pet's Name</Text>
          <TextInput
            style={styles.input}
            value={pet.name}
            onChangeText={(v) => setPet({ ...pet, name: v })}
          />

          <Text style={styles.label}>Date of Birth</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text>
              {dob
                ? `${dob.getMonth() + 1}/${dob.getDate()}/${dob.getFullYear()}`
                : "Select Date"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={dob || new Date()}
              mode="date"
              display="default"
              onChange={onChangeDate}
              maximumDate={new Date()}
            />
          )}

          <Text style={styles.label}>Breed</Text>
          <TextInput
            style={styles.input}
            value={pet.breed}
            onChangeText={(v) => setPet({ ...pet, breed: v })}
          />

          <Text style={styles.label}>Sex</Text>
          <TextInput
            style={styles.input}
            value={pet.sex}
            onChangeText={(v) => setPet({ ...pet, sex: v })}
          />

          <Text style={styles.label}>Weight (lbs)</Text>
          <TextInput
            style={styles.input}
            value={String(pet.weight || "")}
            keyboardType="numeric"
            onChangeText={(v) => setPet({ ...pet, weight: v })}
          />

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveText}>
                {saving ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingTop: 12, paddingBottom: 50, backgroundColor: "#fff", alignItems: "center" },
  backButton: { position: "absolute", left: 16, top: 61, backgroundColor: "#A6C000", borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10, zIndex: 10 },
  backText: { fontSize: 18, fontWeight: "700" },
  headerTitle: { marginTop: 50, backgroundColor: "#ffffff", paddingVertical: 6, paddingHorizontal: 172, borderRadius: 4, fontWeight: "700", fontSize: 18, zIndex: 5 },
  headerArc: { position: "absolute", bottom: 10, left: 0, right: 0, height: 250, backgroundColor: "#1F6578", borderBottomLeftRadius: 200, borderBottomRightRadius: 200 },
  petWrapper: { position: "absolute", bottom: 30, alignSelf: "center" },
  petImage: { width: 110, height: 110, borderRadius: 75, borderWidth: 4, borderColor: "#F4A62A" },
  editIcon: { position: "absolute", right: 6, bottom: 6, width: 30, height: 30, borderRadius: 15, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center" },
  petType: { marginTop: 60, color: "#ffffff", fontSize: 22, fontWeight: "800", marginBottom: 10 },
  form: { marginTop: 24, backgroundColor: "#ffffff", paddingHorizontal: 24, paddingBottom: 32 },
  label: { fontWeight: "700", fontSize: 18, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 25, paddingHorizontal: 16, paddingVertical: 10, marginBottom: 14, fontSize: 16 },
  buttonsRow: { marginTop: 8, marginBottom: 36, flexDirection: "row", justifyContent: "flex-start" },
  saveButton: { backgroundColor: "#16495B", paddingVertical: 14, paddingHorizontal: 30, borderRadius: 14 },
  saveText: { color: "#ffffff", fontWeight: "700" },
});
