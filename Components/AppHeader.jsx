import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faClipboardList, faUser } from "@fortawesome/free-solid-svg-icons"; // Added faUser
import { ThemeContext } from "../App"; // <-- Import Context

export default function AppHeader({ onHistoryPress, onProfilePress }) {
  const { colors } = useContext(ThemeContext);
  const styles = getStyles(colors);

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

      {/* Buttons */}
      <View style={styles.rightButtons}>
        <TouchableOpacity style={styles.iconBtn} onPress={onHistoryPress} activeOpacity={0.8}>
          <FontAwesomeIcon icon={faClipboardList} size={20} color={colors.primary} />
        </TouchableOpacity>
        {/* 👇 New Profile Button */}
        <TouchableOpacity style={styles.iconBtn} onPress={onProfilePress} activeOpacity={0.8}>
          <FontAwesomeIcon icon={faUser} size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  header  : { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingTop: 8 },
  left    : { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  logoBox : { width: 54, height: 54, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, alignItems: "center", justifyContent: "center", backgroundColor: colors.cardBg, gap: 2 },
  logoLabel: { fontSize: 6, color: colors.primary, fontWeight: "700", textAlign: "center", lineHeight: 8 },
  titleBox : { flex: 1 },
  title    : { fontSize: 24, fontWeight: "800", color: colors.primary, letterSpacing: -0.5 },
  subtitle : { fontSize: 13, color: colors.textLight, marginTop: 1 },
  rightButtons: { flexDirection: "row", gap: 8 },
  iconBtn  : { width: 44, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: colors.borderLight, backgroundColor: colors.cardBg, alignItems: "center", justifyContent: "center" },
});