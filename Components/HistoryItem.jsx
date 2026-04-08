import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { colors } from "../styles/theme";

export default function HistoryItem({ item }) {
  const confidencePercent = Math.round(item.confidence * 100);
  const date = new Date(item.createdAt);

  return (
    <View style={styles.row}>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{item.label}</Text>
        <Text style={styles.confidence}>{confidencePercent}% confidence</Text>
        <Text style={styles.date}>
          {date.toLocaleDateString()} {date.toLocaleTimeString()}
        </Text>
      </View>
      {item.imageUri ? (
        <Image source={{ uri: item.imageUri }} style={styles.thumb} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  textWrap: { flex: 1, marginRight: 8 },
  label: { fontSize: 14, fontWeight: "600", color: colors.textPrimary },
  confidence: { fontSize: 12, color: colors.brand700, marginTop: 2 },
  date: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  thumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: colors.appBg,
  },
});