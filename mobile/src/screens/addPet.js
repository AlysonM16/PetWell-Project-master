// screens/addPet.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function AddPetScreen() {
  const navigation = useNavigation();
  const [petName, setPetName] = useState("");
  const [dob, setDob] = useState("");
  const [breed, setBreed] = useState("");
  const [notes, setNotes] = useState("");

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
        <Text style={styles.label}>Pet’s Name</Text>
        <TextInput
          style={styles.input}
          placeholder=""
          value={petName}
          onChangeText={setPetName}
        />
        <Text style={styles.label}>Pet’s Date of Birth</Text>
        <TextInput
          style={styles.input}
          placeholder="mm/dd/yyyy"
          value={dob}
          onChangeText={setDob}
        />
        <Text style={styles.label}>Breed</Text>
        <TouchableOpacity style={styles.dropdown}>
          <Text style={styles.dropdownText}>
            {breed ? breed : "Select Breed"}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#333" />
        </TouchableOpacity>
        <Text style={styles.label}>Additional Notes</Text>
        <TextInput
          style={[styles.input, { height: 60 }]}
          multiline
          value={notes}
          onChangeText={setNotes}
        />
        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenWrapper: {
    flex: 1,
    backgroundColor: "#ffffffff",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
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

  closeText: {
    color: "#ffff",
    fontWeight: "bold",
    fontSize: 18,
  },

  curvedBackground: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 425,
    backgroundColor: "#B4BD00",
    borderBottomLeftRadius: 100,
    borderBottomRightRadius: 100,
  },

  card: {
    backgroundColor: "#ffffffff",
    width: "85%",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#B4BD00",
    marginBottom: 10,
  },

  label: {
    alignSelf: "flex-start",
    color: "#0B4F6C",
    fontWeight: "bold",
    marginTop: 12,
  },

  input: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: "#0B4F6C",
    paddingVertical: 6,
    marginBottom: 10,
  },

  dropdown: {
    width: "100%",
    backgroundColor: "#fff",
    marginTop: 5,
    borderRadius: 12,
    padding: 15,
    borderColor: "#ccc",
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
    marginBottom: 10,
  },

  dropdownText: {
    color: "#777",
  },

  addButton: {
    backgroundColor: "#0B4F6C",
    width: "60%",
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 20,
  },

  addButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});