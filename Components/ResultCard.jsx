import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, globalStyles } from "../styles/theme";

export default function ResultCard({ prediction, title = "Scan Result", badge }) {
  const confidencePercent = prediction
    ? Math.round(prediction.confidence * 100)
    : null;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={globalStyles.sectionTitle}>{title}</Text>
        {badge != null && (
          <Text style={styles.badge}>{badge}</Text>
        )}
      </View>

      {prediction ? (
        <>
          <Text style={globalStyles.predictionLabel}>{prediction.label}</Text>
          <Text style={globalStyles.confidenceText}>
            Confidence: {confidencePercent}%
          </Text>
          <Text style={globalStyles.infoText}>{prediction.info}</Text>
        </>
      ) : (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyTitle}>No analysis yet</Text>
          <Text style={styles.emptySub}>Go to Scan Plant to analyze an image.</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.brand50,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  badge: {
    fontSize: 11,
    color: colors.brand700,
    backgroundColor: colors.brand100,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 16,
    gap: 4,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.brand900,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textMuted,
  },
});