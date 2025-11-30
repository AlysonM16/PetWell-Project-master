import React, { useState } from "react";
import { View, Text, Image, StyleSheet, ScrollView } from "react-native";
import { Calendar } from "react-native-calendars";
import { Dropdown } from "react-native-element-dropdown";

import Svg, { Polyline, Line, Text as SvgText } from "react-native-svg";

// ====== CUSTOM LINE CHART (NO VICTORY, NO OTHER LIBS) ======
function LineChart({ dataSets }) {
  const width = 350;
  const height = 220;
  const padding = 25;

  // Pull all Y values
  const allY = dataSets.flatMap((ds) => ds.data.map((p) => p.y));
  const minY = Math.min(...allY);
  const maxY = Math.max(...allY);

  const scaleX = (i, total) =>
    padding + (i / (total - 1)) * (width - padding * 2);

  const scaleY = (y) =>
    height - padding - ((y - minY) / (maxY - minY)) * (height - padding * 2);

  return (
    <Svg width={width} height={height} style={{ backgroundColor: "#f2f2f2", borderRadius: 12 }}>
      {/* Y AXIS */}
      <Line
        x1={padding}
        y1={padding}
        x2={padding}
        y2={height - padding}
        stroke="black"
        strokeWidth="2"
      />

      {/* X AXIS */}
      <Line
        x1={padding}
        y1={height - padding}
        x2={width - padding}
        y2={height - padding}
        stroke="black"
        strokeWidth="2"
      />

      {/* METRIC LINES */}
      {dataSets.map((set, idx) => {
        const points = set.data
          .map((p, i) =>
            `${scaleX(i, set.data.length)},${scaleY(p.y)}`
          )
          .join(" ");

        return (
          <Polyline
            key={set.name}
            points={points}
            fill="none"
            stroke={["#1d7fbf", "#ff4d4d", "#00cc88"][idx % 3]}
            strokeWidth="3"
          />
        );
      })}

      {/* Legend */}
      {dataSets.map((set, idx) => (
        <SvgText
          key={set.name}
          x={padding + idx * 110}
          y={padding - 5}
          fill={["#1d7fbf", "#ff4d4d", "#00cc88"][idx % 3]}
          fontSize="14"
        >
          {set.name}
        </SvgText>
      ))}
    </Svg>
  );
}

// ========== MAIN SCREEN COMPONENT ==========
export default function Graph() {
  const [selectedMetrics, setSelectedMetrics] = useState(["Glucose", "Protein"]);
  const [dateRange, setDateRange] = useState({
    start: "2023-01-10",
    end: "2023-01-25",
  });

  const sampleData = {
    Glucose: [
      { x: "Jan 1", y: 90 },
      { x: "Jan 10", y: 110 },
      { x: "Jan 20", y: 105 },
    ],
    Protein: [
      { x: "Jan 1", y: 6.5 },
      { x: "Jan 10", y: 5.8 },
      { x: "Jan 20", y: 6.1 },
    ],
    Calcium: [
      { x: "Jan 1", y: 10 },
      { x: "Jan 10", y: 11 },
      { x: "Jan 20", y: 9.5 },
    ],
  };

  const metricsOptions = [
    { label: "Glucose", value: "Glucose" },
    { label: "Protein", value: "Protein" },
    { label: "Complete Blood Count (CBC)", value: "CBC" },
    { label: "Calcium", value: "Calcium" },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Dog</Text>
        <Image
          source={{ uri: "https://place-puppy.com/200x200" }}
          style={styles.avatar}
        />
      </View>

      {/* CHART */}
      <View style={{ marginTop: 60, alignItems: "center" }}>
        <LineChart
          dataSets={selectedMetrics
            .filter((m) => sampleData[m])
            .map((m) => ({ name: m, data: sampleData[m] }))}
        />
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
        multiple={true}
        placeholder="Select metrics"
        onChange={(items) => setSelectedMetrics(items.map((i) => i.value))}
        style={styles.dropdown}
      />

      {/* DATE RANGE */}
      <Text style={styles.sectionTitle}>Date Range</Text>
      <Calendar
        markingType="period"
        markedDates={{
          [dateRange.start]: {
            startingDay: true,
            color: "#1d7fbf",
            textColor: "#fff",
          },
          [dateRange.end]: {
            endingDay: true,
            color: "#1d7fbf",
            textColor: "#fff",
          },
        }}
        onDayPress={(day) =>
          setDateRange((prev) => ({ ...prev, end: day.dateString }))
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    backgroundColor: "#1d7fbf",
    height: 160,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 10,
  },

  headerText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },

  avatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
    position: "absolute",
    bottom: -40,
  },

  metricList: {
    padding: 20,
    marginTop: 50,
  },

  metricRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#1d7fbf",
    marginRight: 10,
  },

  metricText: { fontSize: 16 },

  sectionTitle: {
    paddingHorizontal: 20,
    fontSize: 18,
    marginTop: 10,
    fontWeight: "600",
  },

  dropdown: {
    marginHorizontal: 20,
    marginVertical: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
  },
});