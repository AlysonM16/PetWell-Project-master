import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getUserFiles } from "../api";

export default function LabRecords() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

useEffect(() => {
  async function fetchFiles() {
    try {
      const data = await getUserFiles();

      // Normalize backend data
      const normalized = data.map((f) => ({
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
}, []);

  const filteredFiles = files.filter((file) =>
    file.title.toLowerCase().includes(searchText.toLowerCase())
  );
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Files</Text>
      </View>

      {/* Profile */}
      <View style={styles.profileWrapper}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=5" }}
          style={styles.profileImg}
        />
      </View>

      {/* Search */}
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
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="filter" size={22} color="#444" />
        </TouchableOpacity>
      </View>

      {/* File List */}
      {loading ? (
        <ActivityIndicator size="large" color="#0C4A6E" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredFiles}
          keyExtractor={(item, index) => index.toString()}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <View style={styles.fileRow}>
              <Image
                source={require("../../assets/icon.png")}
                style={styles.pdfIcon}
              />
              <View style={styles.fileInfo}>
                <Text style={styles.fileTitle}>{item.title}</Text>
                <Text style={styles.fileMeta}>
                  {item.size}
                </Text>
              </View>
              <Ionicons name="ellipsis-vertical" size={20} color="#666" />
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },

  header: {
    backgroundColor: "#0C4A6E",
    height: 150,
    paddingTop: 10,
    paddingBottom: 15,
    alignItems: "center",
    justifyContent: "center",
  },

  backBtn: {
    position: "absolute",
    left: 17,
    top: 50,
    backgroundColor: "#A6C000",
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 13,
    zIndex: 10,
  },

  headerTitle: {
    marginTop: 10,
    backgroundColor: "#ffffff",
    paddingVertical: 5,
    paddingHorizontal: 187,
    borderRadius: 4,
    fontWeight: "700",
    fontSize: 18,
    zIndex: 5,
  },

  profileWrapper: {
    alignItems: "center",
    marginTop: -35,
  },

  profileImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "#FFA500",
  },

  searchRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    alignItems: "center",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    flex: 1,
    padding: 10,
    borderRadius: 8,
  },

  searchInput: {
    marginLeft: 8,
    flex: 1,
  },

  filterBtn: {
    marginLeft: 10,
    backgroundColor: "#eee",
    padding: 10,
    borderRadius: 8,
  },

  fileRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  pdfIcon: { width: 35, height: 35, marginRight: 12 },

  fileInfo: { flex: 1 },

  fileTitle: { fontWeight: "600", fontSize: 15 },

  fileMeta: { color: "#777", marginTop: 2 },
});
