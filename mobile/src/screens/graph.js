import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { Calendar } from "react-native-calendars";
import { Dropdown } from "react-native-element-dropdown";
import Svg, { Polyline, Line, Text as SvgText } from "react-native-svg";
import { useRoute } from "@react-navigation/native";
import api from "../api";
import { useAuth } from "../AuthContext";

// ====== CUSTOM LINE CHART ======
function LineChart({ dataSets }) {
  const width = 350;
  const height = 220;
  const padding = 25;

  const allY = dataSets.flatMap((ds) => ds.data.map((p) => p.y));
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  const scaleX = (i, total) => padding + (i / (total - 1)) * (width - padding * 2);
  const scaleY = (y) => height - padding - ((y - minY) / (maxY - minY)) * (height - padding * 2);

  return (
    <Svg width={width} height={height} style={{ backgroundColor: "#f2f2f2", borderRadius: 12 }}>
      {/* Y AXIS */}
      <Line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="black" strokeWidth="2" />
      {/* X AXIS */}
      <Line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="black" strokeWidth="2" />

      {/* Metric lines */}
      {dataSets.map((set, idx) => {
        const points = set.data
          .map((p, i) => `${scaleX(i, set.data.length)},${scaleY(p.y)}`)
          .join(" ");

        return <Polyline key={set.name} points={points} fill="none" stroke={["#1d7fbf", "#ff4d4d", "#00cc88"][idx % 3]} strokeWidth="3" />;
      })}

      {/* Legend */}
      {dataSets.map((set, idx) => (
        <SvgText key={set.name} x={padding + idx * 110} y={padding - 5} fill={["#1d7fbf", "#ff4d4d", "#00cc88"][idx % 3]} fontSize="14">
          {set.name}
        </SvgText>
      ))}
    </Svg>
  );
}

// ========== MAIN COMPONENT ==========
export default function Graph() {
  const route = useRoute();
  const { petId } = route.params;
  const { accessToken } = useAuth();

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [dateRange, setDateRange] = useState({ start: null, end: null });

  const metricsOptions = [
    { label: "Glucose", value: "Glucose" },
    { label: "Protein", value: "Protein" },
    { label: "Complete Blood Count (CBC)", value: "CBC" },
    { label: "Calcium", value: "Calcium" },
  ];

  useEffect(() => {
    const fetchPetMetrics = async () => {
      try {
        const res = await api.get(`/pets/${petId}/metrics`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const data = res.data;

        // Expecting backend to return something like:
        // { pet: { name, image }, metrics: { Glucose: [...], Protein: [...], ... }, dateRange: { start, end } }

        setPet(data.pet);
        setSelectedMetrics(Object.keys(data.metrics));
        setDateRange(data.dateRange || { start: null, end: null });
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) fetchPetMetrics();
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
        <Text>Pet data not found.</Text>
      </View>
    );
  }

  const dataSets = selectedMetrics.map((metric) => ({
    name: metric,
    data: pet.metrics[metric] || [],
  }));

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>{pet.name}</Text>
        <Image source={{ uri: pet.image }} style={styles.avatar} />
      </View>

      {/* CHART */}
      <View style={{ marginTop: 60, alignItems: "center" }}>
        <LineChart dataSets={dataSets} />
      </View>

      {/* METRIC LIST */}
      <View style={styles.metricList}>
        {selectedMetrics.map((m) => (
          <View key={m} style={styles.metricRow}>
            <View style={styles.dot} />
            <Text style={styles.metricText}>{m} metric selected</Text>
          </View>
        ))}
      </View>

      {/* METRICS DROPDOWN */}
      <Text style={styles.sectionTitle}>Metrics</Text>
      <Dropdown
        data={metricsOptions}
        value={selectedMetrics}
        labelField="label"
        valueField="value"
        multiple
        placeholder="Select metrics"
        onChange={(items) => setSelectedMetrics(items.map((i) => i.value))}
        style={styles.dropdown}
      />

      {/* DATE RANGE */}
      <Text style={styles.sectionTitle}>Date Range</Text>
      <Calendar
        markingType="period"
        markedDates={{
          [dateRange.start]: { startingDay: true, color: "#1d7fbf", textColor: "#fff" },
          [dateRange.end]: { endingDay: true, color: "#1d7fbf", textColor: "#fff" },
        }}
        onDayPress={(day) => setDateRange((prev) => ({ ...prev, end: day.dateString }))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { backgroundColor: "#1d7fbf", height: 160, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, justifyContent: "center", alignItems: "center", paddingTop: 10 },
  headerText: { fontSize: 24, color: "#fff", fontWeight: "bold" },
  avatar: { width: 90, height: 90, borderRadius: 50, borderWidth: 4, borderColor: "#fff", position: "absolute", bottom: -40 },
  metricList: { padding: 20, marginTop: 50 },
  metricRow: { flexDirection: "row", alignItems: "center", marginVertical: 6 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#1d7fbf", marginRight: 10 },
  metricText: { fontSize: 16 },
  sectionTitle: { paddingHorizontal: 20, fontSize: 18, marginTop: 10, fontWeight: "600" },
  dropdown: { marginHorizontal: 20, marginVertical: 12, padding: 12, borderWidth: 1, borderColor: "#ccc", borderRadius: 10 },
});
