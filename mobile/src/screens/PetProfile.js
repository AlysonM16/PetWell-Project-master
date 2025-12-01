import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import api from "../api";
import { useAuth } from "../AuthContext";

export default function PetProfile() {
  const navigation = useNavigation();
  const route = useRoute();
  const { petId } = route.params;
  const { accessToken } = useAuth();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const res = await api.get(`/pets/${petId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        setPet(res.data);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };
    if (accessToken) fetchPet();
  }, [petId, accessToken]);

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
        <Image
          source={{ uri: pet.image || "https://cdn2.thedogapi.com/images/S1V3Qeq4X_1280.jpg" }}
          style={styles.avatar}
        />
        <Text style={styles.petName}>{pet.name}</Text>
        <Text style={styles.petAge}>Age: {pet.age || "-"}</Text>
        <Text style={styles.petBirthday}>
          Birthday Countdown: {pet.birthdayCountdown || "-"} days 🎂
        </Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditPetProfile", { petId })}
          >
            <Text style={styles.editText}>Edit Pet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.graphButton}
            onPress={() => navigation.navigate("Graph", { petId })}
          >
            <Text style={styles.graphText}>View Graph</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Summary</Text>
        <Image
          source={{
            uri: pet.chartUrl || "https://quickchart.io/chart?c={type:'line',data:{labels:['Jan','Feb','Mar','Apr','May'],datasets:[{label:'Weight',data:[0,0,0,0,0]}]}}",
          }}
          style={styles.healthChart}
        />
      </View>

      {/* Additional pet details can go here */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { alignItems: "center", padding: 20 },
  avatar: { width: 120, height: 120, borderRadius: 60, borderWidth: 3, borderColor: "#B9BF1D", marginBottom: 15 },
  petName: { fontSize: 24, fontWeight: "bold", color: "#0B4F6C" },
  petAge: { fontSize: 16, color: "#333", marginTop: 5 },
  petBirthday: { fontSize: 14, color: "#666", marginTop: 2 },
  buttonRow: { flexDirection: "row", marginTop: 15 },
  editButton: { backgroundColor: "#0B4F6C", padding: 10, borderRadius: 20, marginRight: 10 },
  editText: { color: "#fff", fontWeight: "600" },
  graphButton: { backgroundColor: "#B9BF1D", padding: 10, borderRadius: 20 },
  graphText: { color: "#fff", fontWeight: "600" },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#0B4F6C", marginBottom: 10 },
  healthChart: { width: "100%", height: 200, borderRadius: 12, backgroundColor: "#eee" },
});
