import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faClipboardList, faBookOpen } from "@fortawesome/free-solid-svg-icons"; // 👇 Swapped faUser to faBookOpen
import { ThemeContext } from "../App";

export default function AppHeader({ onHistoryPress, onGuidePress }) { // 👇 Swapped prop name
  const { colors } = useContext(ThemeContext);
  const styles = getStyles(colors);

  return (
    <View style={styles.header}>
      {/* Logo + Title */}
      <View style={styles.left}>
        
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
        {/* 👇 Updated to Guide Button */}
        <TouchableOpacity style={styles.iconBtn} onPress={onGuidePress} activeOpacity={0.8}>
          <FontAwesomeIcon icon={faBookOpen} size={18} color={colors.primary} /> 
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  header  : { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingTop: 8 },
  left    : { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  logoBox : { width: 54, height: 54, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, alignItems: "center", justifyContent: "center", backgroundColor: colors.cardBg, gap: 2 },
  logoLabel: { fontSize: 6, color: colors.primary, fontWeight: "700", textAlign: "center", lineHeight: 8 },
  titleBox : { flex: 1 },
  title    : { fontSize: 24, fontWeight: "800", color: colors.primary, letterSpacing: -0.5 },
  subtitle : { fontSize: 13, color: colors.textLight, marginTop: 1 },
  rightButtons: { flexDirection: "row", gap: 8 },
  iconBtn  : { width: 44, height: 44, borderRadius: 12, borderWidth: 1.5, borderColor: colors.borderLight, backgroundColor: colors.cardBg, alignItems: "center", justifyContent: "center" },
});