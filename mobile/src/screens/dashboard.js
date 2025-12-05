import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../AuthContext";
import { getPets, setAccessToken } from "../api";

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user, accessToken } = useAuth(); 
  const [pets, setPets] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-40)).current;

  // Animate header
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

  useEffect(() => {
    if (accessToken) {
      setAccessToken(accessToken);
      loadPets(true);
    }
  }, [accessToken]);

  // Fetch lab data per pet and generate mini chart
  const fetchLabDataAndMiniChart = async (petId) => {
    try {
      const response = await fetch(`http://192.168.1.6:8000/api/labs?petId=${petId}`);
      const labData = await response.json();

      if (!labData || !labData.visits) return null;

      const metrics = {};
      labData.visits.forEach((visit) => {
        (visit.records || []).forEach((rec) => {
          if (!metrics[rec.test_name]) metrics[rec.test_name] = [];
          metrics[rec.test_name].push(rec.value);
        });
      });

      // Build QuickChart mini chart URL
      const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(
        JSON.stringify({
          type: "line",
          data: {
            labels: labData.visits.map(v => v.visit_date),
            datasets: Object.keys(metrics).map(key => ({
              label: key,
              data: metrics[key],
            })),
          },
          options: {
            legend: { display: false },
            scales: {
              x: { display: false },
              y: { display: false },
            },
          },
        })
      )}&width=300&height=70`;

      return chartUrl;
    } catch (err) {
      console.error("Error fetching lab data:", err);
      return null;
    }
  };

  const loadPets = useCallback(
    async (fullScreen = false) => {
      try {
        if (fullScreen) setInitialLoading(true);
        else setRefreshing(true);

        const data = await getPets();
        const normalized = await Promise.all(
          (data || []).map(async (p) => {
            const chartUrl = await fetchLabDataAndMiniChart(p.id);
            return {
              ...p,
              img: p.img || p.image || null,
              chartUrl,
            };
          })
        );
        setPets(normalized);
      } catch (err) {
        console.log("Failed to load pets:", err);
      } finally {
        if (fullScreen) setInitialLoading(false);
        else setRefreshing(false);
      }
    },
    []
  );

  useFocusEffect(
    useCallback(() => {
      loadPets(false);
    }, [loadPets])
  );

  if (initialLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0B4F6C" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Animated.View
        style={[styles.curvedHeader, { opacity: fadeAnim, transform: [{ translateY }] }]}
      />

      <View style={styles.profileCard}>
        <Image
          source={user?.avatarUri ? { uri: user.avatarUri } : require("../../assets/pfp.png")}
          style={styles.avatar}
        />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.userName}>{user?.name || "Full Name"}</Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.petsSection}>
        <Text style={styles.sectionTitle}>Your Pet’s:</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {pets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              onPress={() => navigation.navigate("PetProfile", { petId: pet.id })}
              activeOpacity={0.8}
            >
              <View style={styles.petCard}>
                <Image
                  source={pet.img ? { uri: pet.img } : require("../../assets/paw.png")}
                  style={styles.petImage}
                />
                <Text style={styles.petName}>{pet.name || "Unknown"}</Text>
                <Text style={styles.petSex}>Sex: {pet.sex || "-"}</Text>
                <Text style={styles.petBreed}>Breed: {pet.breed || "-"}</Text>

                <Text style={styles.healthTitle}>Health Summary</Text>
                <Image
                  source={{ uri: pet.chartUrl || "https://quickchart.io/chart?c={type:'line',data:{labels:['Jan','Feb'],datasets:[{label:'Value',data:[0,0]}]}}&width=300&height=70" }}
                  style={styles.healthChart}
                />

                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => navigation.navigate("Graph", { petId: pet.id })}
                >
                  <Text style={styles.detailsText}>See Details</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.newPetButton}
          onPress={() => navigation.navigate("AddPet")}
        >
          <Text style={styles.newPetText}>New Pet</Text>
          <View style={styles.addIcon}>
            <Ionicons name="add" size={20} color="#fff" />
          </View>
        </TouchableOpacity>

        {refreshing && (
          <View style={{ alignItems: "center", marginTop: 12 }}>
            <ActivityIndicator size="small" color="#0B4F6C" />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  curvedHeader: { backgroundColor: "#B9BF1D", height: 125, borderBottomLeftRadius: 90, borderBottomRightRadius: 90, transform: [{ scaleX: 1.2 }] },
  profileCard: { backgroundColor: "#ffffff", flexDirection: "row", alignItems: "center", padding: 30, marginHorizontal: 20, marginTop: -40, borderRadius: 25, shadowColor: "#090707ff", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 5 },
  avatar: { width: 80, height: 80, borderRadius: 40, borderWidth: 3, borderColor: "#B9BF1D", backgroundColor: "#eee" },
  welcomeText: { fontSize: 18, fontWeight: "bold", color: "#000" },
  userName: { fontSize: 16, color: "#333", marginBottom: 6 },
  editButton: { backgroundColor: "#0B4F6C", borderRadius: 20, paddingVertical: 6, paddingHorizontal: 15, alignSelf: "flex-start" },
  editText: { color: "#fff", fontWeight: "600", fontSize: 13 },
  petsSection: { marginTop: 30, paddingHorizontal: 15 },
  sectionTitle: { fontSize: 20, fontWeight: "bold", color: "#000", marginBottom: 10 },
  petCard: { backgroundColor: "#0B4F6C", borderRadius: 20, borderWidth: 2, borderColor: "#10a8e8ff", padding: 18, marginRight: 18, width: 230 },
  petImage: { width: 100, height: 100, borderRadius: 60, alignSelf: "center", marginBottom: 8, borderWidth: 3, borderColor: "#B9BF1D" },
  petName: { fontSize: 18, fontWeight: "bold", color: "#fff", textAlign: "center" },
  petSex: { color: "#fff", textAlign: "center", marginTop: 4 },
  petBreed: { color: "#fff", textAlign: "center", marginBottom: 15, fontSize: 13 },
  healthTitle: { color: "#fff", fontWeight: "600", fontSize: 14, marginBottom: 8, textAlign: "center" },
  healthChart: { width: "100%", height: 70, borderRadius: 8, backgroundColor: "#fff", marginBottom: 10 },
  detailsButton: { backgroundColor: "#fff", borderRadius: 8, paddingVertical: 5, alignSelf: "center", paddingHorizontal: 20 },
  detailsText: { color: "#0B4F6C", fontWeight: "600" },
  newPetButton: { marginTop: 20, alignSelf: "center", flexDirection: "row", alignItems: "center", backgroundColor: "#0B4F6C", borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10, elevation: 3, borderWidth: 1, borderColor: "#B9BF1D" },
  newPetText: { color: "#fff", fontSize: 16, fontWeight: "600", marginRight: 8 },
  addIcon: { backgroundColor: "#B9BF1D", width: 28, height: 28, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
