import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const pdfs = Array.from({ length: 10 }).map((_, i) => ({
  id: i.toString(),
  title: i % 2 === 0 ? `report_2943.pdf` : `invoice_2943.pdf`,
  date: "2025-10-23",
  size: "62.5Mb",
}));

export default function LabRecords() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Files</Text>
      </View>
      <View style={styles.profileWrapper}>
        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=5" }}
          style={styles.profileImg}
        />
      </View>
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#aaa" />
          <TextInput placeholder="Search" style={styles.searchInput} />
        </View>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="filter" size={22} color="#444" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={pdfs}
        keyExtractor={(item) => item.id}
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
                {item.date} • {item.size}
              </Text>
            </View>
            <Ionicons name="ellipsis-vertical" size={20} color="#666" />
          </View>
        )}
      />
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

  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#0C4A6E",
    paddingVertical: 14,
  },

  navItem: { alignItems: "center" },

  navLabel: { color: "#fff", fontSize: 12, marginTop: 4 },
});
