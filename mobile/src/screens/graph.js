import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Dimensions, ActivityIndicator } from "react-native";
import Plotly from "react-native-plotly";

export default function Graph({ route }) {
  const [dataSets, setDataSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [labData, setLabData] = useState(null);
  const { petId } = route.params;

  useEffect(() => {
    async function fetchLabData() {
      try {
        const response = await fetch(`http://192.168.1.6:8000/api/labs?petId=${petId}`);
        const json = await response.json();

        setLabData(json); 

        const metrics = {};

        (json.visits || []).forEach((visit) => {
          (visit.records || []).forEach((rec) => {
            if (!metrics[rec.test_name]) metrics[rec.test_name] = { x: [], y: [], name: rec.test_name };
            metrics[rec.test_name].x.push(visit.visit_date);
            metrics[rec.test_name].y.push(rec.value);
          });
        });

        setDataSets(Object.values(metrics));
      } catch (error) {
        console.error("Failed to fetch lab data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchLabData();
  }, [petId]);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1d7fbf" />
      </View>
    );
  }

  const { width } = Dimensions.get("window");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Pet {petId} Metrics</Text>

      {dataSets.length > 0 ? (
        <Plotly
          data={dataSets.map((ds) => ({
            x: ds.x,
            y: ds.y,
            type: "scatter",
            mode: "lines+markers",
            name: ds.name,
          }))}
          layout={{
            width: width - 40,
            height: 400,
            title: "Lab Metrics Over Time",
            xaxis: { title: "Date" },
            yaxis: { title: "Value" },
            margin: { t: 50, l: 50, r: 20, b: 50 },
          }}
          config={{ displayModeBar: true }}
          style={{ width: width - 40, height: 400 }}
        />
      ) : (
        <Text>No metrics data available.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 20, alignItems: "center" },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
});
