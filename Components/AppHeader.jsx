import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons";
import { colors } from "../styles/theme";

export default function AppHeader({ onHistoryPress }) {
  return (
    <View style={styles.header}>
      {/* Logo + Title */}
      <View style={styles.left}>
        <View style={styles.logoBox}>
          <FontAwesomeIcon icon={["fas", "seedling"]} size={22} color={colors.primary} />
          <Text style={styles.logoLabel}>RICE{"\n"}STRESS LAB</Text>
        </View>
        <View style={styles.titleBox}>
          <Text style={styles.title}>Rice Stress Lab</Text>
          <Text style={styles.subtitle}>Rice plant stress analytics</Text>
        </View>
      </View>

      {/* History Icon Button */}
      <TouchableOpacity style={styles.iconBtn} onPress={onHistoryPress} activeOpacity={0.8}>
        <FontAwesomeIcon icon={faClipboardList} size={22} color={colors.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header  : { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingTop: 8 },
  left    : { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  logoBox : { width: 54, height: 54, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, alignItems: "center", justifyContent: "center", backgroundColor: colors.cardBg, gap: 2 },
  logoLabel: { fontSize: 6, color: colors.primary, fontWeight: "700", textAlign: "center", lineHeight: 8 },
  titleBox : { flex: 1 },
  title    : { fontSize: 24, fontWeight: "800", color: colors.primary, letterSpacing: -0.5 },
  subtitle : { fontSize: 13, color: colors.textLight, marginTop: 1 },
  iconBtn  : { width: 48, height: 48, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.white, alignItems: "center", justifyContent: "center" },
});