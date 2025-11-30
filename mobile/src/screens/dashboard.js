// src/screens/dashboard.js
import React, { useState, useEffect, useRef } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Animated, Easing } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../AuthContext";

function deriveDisplayName(user) {
  if (!user) return "Full Name";
  if (user.full_name) return user.full_name;
  if (user.name) return user.name;
  if (user.email) {
    const raw = user.email.split("@")[0];
    return raw
      .replace(/[._]+/g, " ")
      .split(" ")
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return "Full Name";
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [userName, setUserName] = useState("Full Name");

  useEffect(() => {
    setUserName(deriveDisplayName(user));
  }, [user]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 1000,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Animated.View
        style={[
          styles.curvedHeader,
          { opacity: fadeAnim, transform: [{ translateY }] },
        ]}
      />

      <View style={styles.profileCard}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=5" }}
          style={styles.avatar}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.userName}>{userName}</Text>

          {/* Edit Profile */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pets Section */}
      <View style={styles.petsSection}>
        <Text style={styles.sectionTitle}>Your Pets:</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>

          {/* PET 1 */}
          <TouchableOpacity
            onPress={() => navigation.navigate("PetProfile")}
            activeOpacity={0.8}
>
            <View style={styles.petCard}>
              <Image
                source={{ uri: "https://cdn2.thedogapi.com/images/S1V3Qeq4X_1280.jpg" }}
                style={styles.petImage}
              />
              <Text style={styles.petName}>Simba</Text>
              <Text style={styles.petAge}>Age: 4</Text>
              <Text style={styles.petBirthday}>Birthday Countdown: 10 days</Text>

              <Text style={styles.healthTitle}>Health Summary</Text>
              <Image
                source={{
                  uri: "https://quickchart.io/chart?c={type:'line',data:{labels:['Jan','Feb','Mar','Apr','May'],datasets:[{label:'Weight',data:[10,11,12,12,13]}]}}",
                }}
                style={styles.healthChart}
              />

              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => navigation.navigate("Graph")}
              >
                <Text style={styles.detailsText}>See Details</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* PET 2 */}
          <TouchableOpacity
            onPress={() => navigation.navigate("PetProfile")}
            activeOpacity={0.8}
>
            <View style={styles.petCard}>
              <Image
                source={{ uri: "https://cdn2.thedogapi.com/images/S1V3Qeq4X_1280.jpg" }}
                style={styles.petImage}
              />
              <Text style={styles.petName}>Jojo</Text>
              <Text style={styles.petAge}>Age: 2</Text>
              <Text style={styles.petBirthday}>Birthday Countdown: 20 days</Text>

              <Text style={styles.healthTitle}>Health Summary</Text>
              <Image
                source={{
                  uri: "https://quickchart.io/chart?c={type:'line',data:{labels:['Jan','Feb','Mar','Apr','May'],datasets:[{label:'Weight',data:[5,5.2,5.4,5.3,5.6]}]}}",
                }}
                style={styles.healthChart}
              />

              <TouchableOpacity
                style={styles.detailsButton}
                onPress={() => navigation.navigate("Graph")}
              >
                <Text style={styles.detailsText}>See Details</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

        </ScrollView>

        {/* New Pet Button */}
        <TouchableOpacity
          style={styles.newPetButton}
          onPress={() => navigation.navigate("AddPet")}
        >
          <Text style={styles.newPetText}>New Pet</Text>
          <View style={styles.addIcon}>
            <Ionicons name="add" size={20} color="#fff" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  curvedHeader: {
    backgroundColor: "#B9BF1D",
    height: 125,
    borderBottomLeftRadius: 90,
    borderBottomRightRadius: 90,
    transform: [{ scaleX: 1.2 }],
  },
  profileCard: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    padding: 30,
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: "#B9BF1D",
    backgroundColor: "#eee",
  },
  welcomeText: { fontSize: 18, fontWeight: "bold", color: "#000" },
  userName: { fontSize: 16, color: "#333", marginBottom: 6 },
  editButton: {
    backgroundColor: "#0B4F6C",
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 15,
    alignSelf: "flex-start",
  },
  editText: { color: "#fff", fontWeight: "600", fontSize: 13 },

  petsSection: { marginTop: 30, paddingHorizontal: 15 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#000", marginBottom: 10 },

  petCard: {
    backgroundColor: "#0B4F6C",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#10a8e8ff",
    padding: 18,
    marginRight: 18,
    width: 230,
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 60,
    alignSelf: "center",
    marginBottom: 8,
    borderWidth: 3,
    borderColor: "#B9BF1D",
  },
  petName: { fontSize: 18, fontWeight: "bold", color: "#fff", textAlign: "center" },
  petAge: { color: "#fff", textAlign: "center", marginTop: 4 },
  petBirthday: { color: "#fff", textAlign: "center", marginBottom: 15, fontSize: 13 },
  healthTitle: { color: "#fff", fontWeight: "600", fontSize: 14, marginBottom: 8, textAlign: "center" },
  healthChart: { width: "100%", height: 70, borderRadius: 8, backgroundColor: "#fff", marginBottom: 10 },
  detailsButton: { backgroundColor: "#fff", borderRadius: 8, paddingVertical: 5, alignSelf: "center", paddingHorizontal: 20 },
  detailsText: { color: "#0B4F6C", fontWeight: "600" },

  newPetButton: {
    marginTop: 20,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0B4F6C",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#B9BF1D",
  },
  newPetText: { color: "#fff", fontSize: 16, fontWeight: "600", marginRight: 8 },
  addIcon: { backgroundColor: "#B9BF1D", width: 28, height: 28, borderRadius: 20, alignItems: "center", justifyContent: "center" },
});
