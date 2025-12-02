// screens/AddPet.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  Image,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../AuthContext";
import api from "../api";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AddPetScreen() {
  const navigation = useNavigation();
  const { accessToken } = useAuth();

  // --- Form state ---
  const [petName, setPetName] = useState("");
  const [dob, setDob] = useState(null); // Date object
  const [breed, setBreed] = useState("");
  const [sex, setSex] = useState("");
  const [weight, setWeight] = useState("");
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showBreedModal, setShowBreedModal] = useState(false);
  const [showSexModal, setShowSexModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const breeds = [
    "Siberian Husky",
    "Golden Retriever",
    "Beagle",
    "Bulldog",
    "Poodle",
    "Labrador Retriever",
  ];
  const sexes = ["Male", "Female", "Other"];

  // --- Image Picker ---
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });
    if (!result.cancelled) setImageUri(result.uri);
  };

  // --- Add Pet ---
  const handleAddPet = async () => {
    if (!petName) return alert("Pet name is required");

    setLoading(true);
    try {
      const formData = new FormData();

      formData.append("name", petName);

      if (dob) {
        const dobString = `${dob.getMonth() + 1}/${dob.getDate()}/${dob.getFullYear()}`;
        formData.append("dob", dobString);
      }

      if (breed) formData.append("breed", breed);
      if (sex) formData.append("sex", sex);

      if (weight) {
        // Convert to float, then to string to send in FormData
        const weightFloat = parseFloat(weight);
        if (isNaN(weightFloat)) {
          alert("Weight must be a number");
          setLoading(false);
          return;
        }
        formData.append("weight", weightFloat.toString());
      }

      if (imageUri) {
        const filename = imageUri.split("/").pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image`;
        formData.append("image", {
          uri: imageUri,
          name: filename,
          type,
        });
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
      console.log("Error adding pet:", err.response?.data || err.message);
      alert("Error adding pet. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  // --- Date picker handler ---
  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) setDob(selectedDate);
  };

  // --- Render ---
  return (
    <View style={styles.screenWrapper}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeText}>X</Text>
      </TouchableOpacity>
      <View style={styles.curvedBackground} />
      <View style={styles.card}>
        <Text style={styles.title}>Add Pet</Text>
        <MaterialCommunityIcons name="dog" size={50} color="#0B4F6C" />

        {/* Image Picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.petImage} />
          ) : (
            <Text style={styles.pickText}>Pick Image</Text>
          )}
        </TouchableOpacity>

        {/* Name */}
        <Text style={styles.label}>Pet’s Name</Text>
        <TextInput style={styles.input} value={petName} onChangeText={setPetName} />

        {/* DOB */}
        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
          <Text>{dob ? `${dob.getMonth() + 1}/${dob.getDate()}/${dob.getFullYear()}` : "Select Date"}</Text>
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

        {/* Breed */}
        <Text style={styles.label}>Breed</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setShowBreedModal(true)}>
          <Text style={styles.dropdownText}>{breed || "Select Breed"}</Text>
          <Ionicons name="chevron-down" size={20} color="#333" />
        </TouchableOpacity>

        {/* Sex */}
        <Text style={styles.label}>Sex</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setShowSexModal(true)}>
          <Text style={styles.dropdownText}>{sex || "Select Sex"}</Text>
          <Ionicons name="chevron-down" size={20} color="#333" />
        </TouchableOpacity>

        {/* Weight */}
        <Text style={styles.label}>Weight (lbs)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={weight}
          onChangeText={setWeight}
        />

        {/* Add Button */}
        <TouchableOpacity style={styles.addButton} onPress={handleAddPet} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.addButtonText}>Add</Text>}
        </TouchableOpacity>
      </View>

      {/* Breed Modal */}
      <Modal visible={showBreedModal} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowBreedModal(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <FlatList
                data={breeds}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setBreed(item);
                      setShowBreedModal(false);
                    }}
                  >
                    <Text>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Sex Modal */}
      <Modal visible={showSexModal} transparent animationType="slide">
        <TouchableWithoutFeedback onPress={() => setShowSexModal(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContent}>
              <FlatList
                data={sexes}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSex(item);
                      setShowSexModal(false);
                    }}
                  >
                    <Text>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    paddingTop: -10,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 25,
    zIndex: 20,
    backgroundColor: "#0B4F6C",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeText: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  curvedBackground: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 300,
    backgroundColor: "#B4BD00",
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },
  card: {
    backgroundColor: "#fff",
    width: "85%",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginTop: 50,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#B4BD00", marginBottom: 10 },
  label: { alignSelf: "flex-start", color: "#0B4F6C", fontWeight: "bold", marginTop: -1 },
  input: { width: "100%", borderBottomWidth: 1, borderBottomColor: "#0B4F6C", paddingVertical: 6, marginBottom: 10 },
  dropdown: { width: "100%", backgroundColor: "#fff", marginTop: 5, borderRadius: 12, padding: 12, borderColor: "#ccc", borderWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  dropdownText: { color: "#777" },
  addButton: { backgroundColor: "#0B4F6C", width: "60%", paddingVertical: 12, borderRadius: 12, marginTop: 15 },
  addButtonText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 16 },
  imagePicker: { height: 100, width: 100, borderRadius: 50, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", marginVertical: 10 },
  petImage: { width: 100, height: 100, borderRadius: 50 },
  pickText: { color: "#666" },
  modalBackground: { flex: 1, backgroundColor: "#00000055", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", width: "80%", borderRadius: 12, padding: 15, maxHeight: "50%" },
  modalItem: { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#eee" },
});
