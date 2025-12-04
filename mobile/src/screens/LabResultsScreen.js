// src/screens/LabResultsScreen.js
import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

export default function LabResultsScreen({ route }) {
  const { report } = route.params || {};

  if (!report || !report.visits || report.visits.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No lab data available.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Lab Results</Text>
      <Text style={styles.subtitle}>Pet Data {report.petId ?? "-"}</Text>

      {report.visits.map((visit, index) => (
        <View key={`${visit.visit_date}-${index}`} style={styles.visitCard}>
          <Text style={styles.visitDate}>
            Visit date: {visit.visit_date || "Unknown"}
          </Text>

          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>
              Test
            </Text>
            <Text style={[styles.cell, styles.headerCell]}>Value</Text>
            <Text style={[styles.cell, styles.headerCell]}>Unit</Text>
            <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>
              Reference range
            </Text>
          </View>

          {visit.records?.map((record, i) => (
            <View key={`${record.test_name}-${i}`} style={styles.row}>
              <Text style={[styles.cell, { flex: 2 }]}>
                {record.test_name}
              </Text>
              <Text style={styles.cell}>
                {record.value !== null && record.value !== undefined
                  ? String(record.value)
                  : "-"}
              </Text>
              <Text style={styles.cell}>{record.unit || "-"}</Text>
              <Text style={[styles.cell, { flex: 2 }]}>
                {record.reference_range || "-"}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: "#f5f7fa",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f5f7fa",
  },
  emptyText: {
    fontSize: 16,
    color: "#555",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#0B4F6C",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 16,
    color: "#555",
  },
  visitCard: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  visitDate: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#0B4F6C",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#e5e5e5",
  },
  headerRow: {
    backgroundColor: "#B4BD0015",
  },
  cell: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
    fontSize: 14,
    color: "#222",
  },
  headerCell: {
    fontWeight: "700",
    color: "#0B4F6C",
  },
});