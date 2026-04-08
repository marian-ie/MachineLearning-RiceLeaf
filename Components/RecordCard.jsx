import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { colors } from "../styles/theme";

export default function RecordCard({ item }) {
  const confidencePercent = Math.round(item.confidence * 100);
  const date = new Date(item.createdAt);
  const isDrought = item.label === "Drought Stress";

  return (
    <View
      style={[
        styles.card,
        isDrought ? styles.droughtCard : styles.pestCard,
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.date}>
          {date.toLocaleDateString(undefined, {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
        <Text style={styles.time}>
          {date.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>

      <Text style={styles.label}>{item.label}</Text>
      <Text style={styles.confidence}>Confidence: {confidencePercent}%</Text>
      <Text style={styles.detail}>{item.info}</Text>

      {item.imageUri ? (
        <Image
          source={{ uri: item.imageUri }}
          style={styles.thumb}
          resizeMode="cover"
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  droughtCard: {
    backgroundColor: colors.drought.bg,
    borderLeftColor: colors.drought.border,
  },
  pestCard: {
    backgroundColor: colors.pest.bg,
    borderLeftColor: colors.pest.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  date: { fontSize: 12, fontWeight: "600", color: "#374151" },
  time: { fontSize: 12, color: colors.textMuted },
  label: { fontSize: 16, fontWeight: "700", color: colors.textPrimary, marginBottom: 4 },
  confidence: { fontSize: 13, color: colors.brand700, marginBottom: 6 },
  detail: { fontSize: 13, color: colors.textSecondary, marginBottom: 8 },
  thumb: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
});