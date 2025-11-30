import React from "react";
import {
  View,
  Image,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PetProfileScreen({ navigation }) {
  const dog = {
    name: "Dog C.",
    breed: "Siberian Husky",
    sex: "Female",
    dob: "10/25/2022 (3)",
    weight: "50.4 lbs",
    image: {
      uri: "https://cdn2.thedogapi.com/images/S1V3Qeq4X_1280.jpg",
    },
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerArc} />

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.title}>{dog.name}</Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Dog Image */}
      <View style={styles.imageContainer}>
        <Image source={dog.image} style={styles.image} />
      </View>

      {/* Info Card */}
      <ScrollView contentContainerStyle={styles.infoContainer}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Dog&apos;s Information</Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("EditPetProfile")}
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Breed</Text>
            <Text style={styles.value}>{dog.breed}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Sex</Text>
            <Text style={styles.value}>{dog.sex}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Date of Birth</Text>
            <Text style={styles.value}>{dog.dob}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.label}>Weight</Text>
            <Text style={styles.value}>{dog.weight}</Text>
          </View>
        </View>

        {/* Lab Records Section */}
        <TouchableOpacity
          style={styles.labSection}
          onPress={() => navigation.navigate("Graph")}
        >
          <Text style={styles.labTitle}>Lab Records Graph</Text>
          <Ionicons name="arrow-forward" size={20} color="#000" />
        </TouchableOpacity>

        {/* Notes Box */}
        <View style={styles.notesBox}>
          <Text style={styles.notesPlaceholder}>Notes</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    height: 280,
    alignItems: "center",
  },
  headerArc: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: "#B9BF1D",
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
  },
  backButton: {
    position: "absolute",
    left: 17,
    top: 50,
    backgroundColor: "#0B4F6C",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 13,
    zIndex: 10,
  },
  title: {
    marginTop: 60,
    backgroundColor: "#ffffff",
    paddingVertical: 5,
    paddingHorizontal: 170,
    borderRadius: 4,
    fontWeight: "700",
    fontSize: 18,
    zIndex: 5,
  },

  imageContainer: { alignItems: "center", marginTop: -150 },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "orange",
  },

  infoContainer: { alignItems: "center", padding: 20 },
  card: {
    backgroundColor: "#f9f9f9",
    borderRadius: 15,
    width: "100%",
    padding: 15,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  cardTitle: { fontWeight: "600", fontSize: 16 },
  editText: { color: "#007bff" },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  label: { color: "#555" },
  value: { fontWeight: "500" },

  labSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  labTitle: { fontWeight: "600", fontSize: 16 },

  notesBox: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  notesPlaceholder: { color: "#aaa" },
});