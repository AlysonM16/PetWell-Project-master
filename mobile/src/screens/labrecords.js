import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TextInput, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getUserFiles } from "../api";

export default function LabRecords() {
  const navigation = useNavigation(); // <-- added
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  useFocusEffect(
    React.useCallback(() => {
      async function fetchFiles() {
        setLoading(true);
        try {
          const data = await getUserFiles();
          const normalized = data.map(f => ({
            title: f.title || "Unknown File",
            size: f.size,
            path: f.path || null,
            petId: f.petId,
          }));
          setFiles(normalized);
        } catch (error) {
          console.error("Error fetching user files:", error);
        } finally {
          setLoading(false);
        }
      }
      fetchFiles();
    }, [])
  );

  const filteredFiles = files.filter(file =>
    file.title.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate("Home")} // <-- navigate to Home
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Files</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#aaa" />
          <TextInput
            placeholder="Search"
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0C4A6E" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredFiles}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <View style={styles.fileRow}>
              <Image source={require("../../assets/icon.png")} style={styles.pdfIcon} />
              <View style={styles.fileInfo}>
                <Text style={styles.fileTitle}>{item.title}</Text>
                <Text style={styles.fileMeta}>{item.size}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { backgroundColor: "#0C4A6E", height: 140, paddingTop: 10, alignItems: "center", justifyContent: "center" },
  backBtn: { position: "absolute", left: 17, top: 50, backgroundColor: "#A6C000", borderRadius: 12, paddingHorizontal: 18, paddingVertical: 13, zIndex:10 },
  headerTitle: { marginTop: 10, backgroundColor: "#fff", paddingVertical: 5, paddingHorizontal: 187, borderRadius: 4, fontWeight: "700", fontSize: 18 },
  searchRow: { marginTop: 20, flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, alignItems: "center" },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", flex: 1, padding: 10, borderRadius: 8 },
  searchInput: { marginLeft: 8, flex: 1 },
  fileRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", padding: 14, borderRadius: 10, marginTop: 10 },
  pdfIcon: { width: 35, height: 35, marginRight: 12 },
  fileInfo: { flex: 1 },
  fileTitle: { fontWeight: "600", fontSize: 15 },
  fileMeta: { color: "#777", marginTop: 2 },
});
