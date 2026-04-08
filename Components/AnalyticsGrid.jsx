import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../styles/theme";

function AnalyticsCard({ label, value }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export default function AnalyticsGrid({ total, healthy, drought, pest }) {
  return (
    <>
      <View style={styles.row}>
        <AnalyticsCard label="Total scans" value={total} />
        <AnalyticsCard label="Healthy" value={healthy} />
      </View>
      <View style={styles.row}>
        <AnalyticsCard label="Drought" value={drought} />
        <AnalyticsCard label="Pest" value={pest} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  card: {
    flex: 1,
    backgroundColor: colors.brand50,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 12,
    color: colors.brand700,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.brand900,
  },
});