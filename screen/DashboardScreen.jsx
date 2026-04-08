import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faMagnifyingGlass, faSun, faBug, faLeaf, faLightbulb, faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { colors, CLASS_COLORS, CLASS_FA_ICONS } from "../styles/theme";
import { getScanStats } from "../services/database";

export default function DashboardScreen({ history, prediction, onScanPress }) {
  const [stats, setStats] = useState({ total: 0, drought: 0, pest: 0, healthy: 0 });

  useEffect(() => {
    const load = async () => { const s = await getScanStats(); setStats(s); };
    load();
  }, [history]);

  const predName = prediction?.label?.replace("ClassA-","").replace("ClassB-","").replace("ClassC-","");
  const predClr  = predName ? CLASS_COLORS[predName] || CLASS_COLORS.Healthy : null;
  const faIconMap = { sun: faSun, bug: faBug, leaf: faLeaf };
  const predFaIcon = predName ? faIconMap[CLASS_FA_ICONS[predName]] || faLeaf : null;

  const STATS = [
    { label: "Total",   value: stats.total,   color: colors.primary,               bg: colors.cardBg,                   icon: faMagnifyingGlass },
    { label: "Drought", value: stats.drought, color: CLASS_COLORS.Drought.text,    bg: CLASS_COLORS.Drought.bg,         icon: faSun             },
    { label: "Pest",    value: stats.pest,    color: CLASS_COLORS.PestInfestation.text, bg: CLASS_COLORS.PestInfestation.bg, icon: faBug         },
    { label: "Healthy", value: stats.healthy, color: CLASS_COLORS.Healthy.text,    bg: CLASS_COLORS.Healthy.bg,         icon: faLeaf            },
  ];

  const TIPS = [
    "Take photos in natural daylight for best results",
    "Focus on a single leaf, up close",
    "Avoid black or dark backgrounds",
    "Results below 80% confidence need manual check",
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false}>

      {/* Latest Result */}
      <View style={styles.resultCard}>
        <Text style={styles.cardTitle}>Scan Result</Text>
        {!prediction ? (
          <View style={styles.noResultBox}>
            <FontAwesomeIcon icon={faMagnifyingGlass} size={30} color={colors.border} />
            <Text style={styles.noResultText}>No analysis yet</Text>
            <Text style={styles.noResultSub}>Go to Scan Plant to analyze an image.</Text>
          </View>
        ) : (
          <View style={styles.predBox}>
            <View style={[styles.classBadge, { backgroundColor: predClr.bg, borderColor: predClr.border }]}>
              <FontAwesomeIcon icon={predFaIcon} size={20} color={predClr.text} />
              <Text style={[styles.classLabel, { color: predClr.text }]}>{predName}</Text>
            </View>
            <Text style={[styles.confidence, { color: predClr.text }]}>
              {prediction.confidence}% confidence
            </Text>
            <Text style={styles.recommendation} numberOfLines={3}>
              {prediction.info}
            </Text>
          </View>
        )}
      </View>

      {/* Scan Now */}
      <TouchableOpacity style={styles.scanBtn} onPress={onScanPress} activeOpacity={0.85}>
        <FontAwesomeIcon icon={faMagnifyingGlass} size={16} color={colors.white} />
        <Text style={styles.scanBtnText}>Scan a Plant Now</Text>
      </TouchableOpacity>

      {/* Stats */}
      <View style={styles.statsCard}>
        <Text style={styles.cardTitle}>Detection Summary</Text>
        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.label} style={[styles.statBox, { backgroundColor: s.bg }]}>
              <FontAwesomeIcon icon={s.icon} size={16} color={s.color} />
              <Text style={[styles.statNum, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Tips */}
      <View style={styles.tipsCard}>
        <View style={styles.tipsHeader}>
          <FontAwesomeIcon icon={faLightbulb} size={16} color={colors.primary} />
          <Text style={styles.cardTitle}>Quick Tips</Text>
        </View>
        {TIPS.map((tip, i) => (
          <View key={i} style={styles.tipRow}>
            <FontAwesomeIcon icon={faCircleCheck} size={13} color={colors.primary} />
            <Text style={styles.tipText}>{tip}</Text>
          </View>
        ))}
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  resultCard  : { backgroundColor: colors.cardBg, borderRadius: 16, padding: 18, marginBottom: 14 },
  cardTitle   : { fontSize: 17, fontWeight: "700", color: colors.primary, marginBottom: 14 },
  noResultBox : { alignItems: "center", paddingVertical: 20, gap: 8 },
  noResultText: { fontSize: 16, fontWeight: "600", color: colors.text },
  noResultSub : { fontSize: 13, color: colors.textLight, textAlign: "center" },
  predBox     : { gap: 8 },
  classBadge  : { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", borderRadius: 50, borderWidth: 1.5, paddingVertical: 8, paddingHorizontal: 14, gap: 8 },
  classLabel  : { fontSize: 17, fontWeight: "700" },
  confidence  : { fontSize: 14, fontWeight: "600" },
  recommendation: { fontSize: 13, color: colors.textLight, lineHeight: 20 },
  scanBtn     : { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: "center", marginBottom: 14, flexDirection: "row", justifyContent: "center", gap: 8 },
  scanBtnText : { color: colors.white, fontWeight: "700", fontSize: 15 },
  statsCard   : { backgroundColor: colors.cardBg, borderRadius: 16, padding: 18, marginBottom: 14 },
  statsRow    : { flexDirection: "row", gap: 8 },
  statBox     : { flex: 1, borderRadius: 10, padding: 10, alignItems: "center", gap: 4 },
  statNum     : { fontSize: 20, fontWeight: "800" },
  statLabel   : { fontSize: 10, color: colors.textLight, textAlign: "center" },
  tipsCard    : { backgroundColor: colors.cardBg, borderRadius: 16, padding: 18, marginBottom: 14 },
  tipsHeader  : { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  tipRow      : { flexDirection: "row", alignItems: "flex-start", gap: 10, marginBottom: 10 },
  tipText     : { flex: 1, fontSize: 13, color: colors.text, lineHeight: 20 },
});