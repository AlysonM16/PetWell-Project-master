// screens/PetProfile.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useAuth } from "../AuthContext";
import api from "../api";

export default function PetProfile() {
  const navigation = useNavigation();
  const route = useRoute();
  const { petId, petData } = route.params || {};
  const { accessToken } = useAuth();

  const [pet, setPet] = useState(petData || null);
  const [loading, setLoading] = useState(!petData);

  useEffect(() => {
    const fetchPet = async () => {
      if (!petId || pet) return; // Already have data
      try {
        const res = await api.get(`/pets/${petId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setPet(res.data);
      } catch (err) {
        console.error("Error fetching pet:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPet();
  }, [petId, pet, accessToken]);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#0B4F6C" />
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: "#333" }}>Pet not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      {/* Pet Avatar */}
      <View style={styles.avatarContainer}>
        <Image
          source={
            pet.image
              ? { uri: pet.image }
              : require("../../assets/icon.png")
          }
          style={styles.avatar}
        />
      </View>

      {/* Pet Info Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Pet Information</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("EditPetProfile", { pet })}
          >
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Name</Text>
          <Text style={styles.value}>{pet.name || "-"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Breed</Text>
          <Text style={styles.value}>{pet.breed || "-"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Sex</Text>
          <Text style={styles.value}>{pet.sex || "-"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Date of Birth</Text>
          <Text style={styles.value}>{pet.dob || "-"}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Weight</Text>
          <Text style={styles.value}>{pet.weight || "-"}</Text>
        </View>
      </View>

      {/* Graph Button */}
      <TouchableOpacity
        style={styles.graphButton}
        onPress={() => navigation.navigate("Graph", { petId: pet.id })}
      >
        <Text style={styles.graphText}>View Lab Records</Text>
      </TouchableOpacity>

      {/* Notes Section */}
      <View style={styles.notesBox}>
        <Text style={styles.notesPlaceholder}>{pet.notes || "Notes"}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  loader: { flex: 1, justifyContent: "center", alignItems: "center" },

  avatarContainer: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: "#0B4F6C" },

  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  editText: { color: "#007bff" },

  infoRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 6 },
  label: { color: "#555", fontWeight: "500" },
  value: { fontWeight: "500" },

  graphButton: {
    backgroundColor: "#0B4F6C",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  graphText: { color: "#fff", fontWeight: "600" },

  notesBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    marginBottom: 30,
  },
  notesPlaceholder: { color: "#aaa" },
});
