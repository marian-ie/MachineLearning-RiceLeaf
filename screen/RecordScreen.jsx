import React, { useState, useEffect, useCallback, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, RefreshControl } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faChartBar, faSun, faBug, faLeaf, faChartPie } from "@fortawesome/free-solid-svg-icons";
import { getAllScans, getScanStats } from "../services/database";
import { CLASS_COLORS } from "../styles/theme";
import { ThemeContext } from "../App";

export default function RecordScreen({ userId }) {
  const { isDark, colors } = useContext(ThemeContext);
  const dynamicClassColors = CLASS_COLORS(isDark);
  const styles = getStyles(colors);

  const [stats,      setStats]      = useState({ total: 0, drought: 0, pest: 0, healthy: 0 });
  const [scans,      setScans]      = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [s, all] = await Promise.all([getScanStats(userId), getAllScans(userId)]);
    setStats(s); setScans(all);
  }, [userId]);

  useEffect(() => { loadData(); }, [loadData]);
  const onRefresh = async () => { setRefreshing(true); await loadData(); setRefreshing(false); };
  const getPct = (v) => stats.total > 0 ? Math.round((v / stats.total) * 100) : 0;

  const BARS = [
    { label: "Drought",          value: stats.drought, key: "Drought",          icon: faSun  },
    { label: "Pest Infestation",  value: stats.pest,    key: "PestInfestation",  icon: faBug  },
    { label: "Healthy",           value: stats.healthy, key: "Healthy",          icon: faLeaf },
  ];

  const groupByDate = () => {
    const groups = {};
    scans.forEach((scan) => {
      const date = new Date(scan.timestamp).toLocaleDateString();
      if (!groups[date]) groups[date] = { drought: 0, pest: 0, healthy: 0, total: 0 };
      groups[date].total++;
      if (scan.display_name === "Drought")         groups[date].drought++;
      if (scan.display_name === "PestInfestation") groups[date].pest++;
      if (scan.display_name === "Healthy")         groups[date].healthy++;
    });
    return Object.entries(groups).slice(0, 7);
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Summary */}
      <View style={styles.summaryRow}>
        {[
          { label: "Total Scans",  value: stats.total,                          color: colors.primary,                             bg: colors.cardBg,                                 icon: faChartBar },
          { label: "Healthy Rate", value: `${getPct(stats.healthy)}%`,          color: dynamicClassColors.Healthy.text,            bg: dynamicClassColors.Healthy.bg,                 icon: faLeaf     },
          { label: "Stress Rate",  value: `${getPct(stats.drought+stats.pest)}%`, color: dynamicClassColors.PestInfestation.text, bg: dynamicClassColors.PestInfestation.bg,       icon: faChartPie },
        ].map((item) => (
          <View key={item.label} style={[styles.summaryCard, { backgroundColor: item.bg }]}>
            <FontAwesomeIcon icon={item.icon} size={16} color={item.color} />
            <Text style={[styles.summaryNum, { color: item.color }]}>{item.value}</Text>
            <Text style={styles.summaryLabel}>{item.label}</Text>
          </View>
        ))}
      </View>

      {/* Distribution */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FontAwesomeIcon icon={faChartBar} size={15} color={colors.primary} />
          <Text style={styles.cardTitle}>Class Distribution</Text>
        </View>
        {stats.total === 0 ? (
          <Text style={styles.noData}>No scan data yet</Text>
        ) : BARS.map((bar) => {
          const pct = getPct(bar.value);
          const clr = dynamicClassColors[bar.key];
          return (
            <View key={bar.key} style={styles.barRow}>
              <View style={styles.barLabelRow}>
                <FontAwesomeIcon icon={bar.icon} size={13} color={clr.text} />
                <Text style={styles.barLabel}>{bar.label}</Text>
              </View>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { width: pct > 0 ? `${pct}%` : "2%", backgroundColor: clr.border }]} />
              </View>
              <Text style={[styles.barPct, { color: clr.text }]}>{bar.value} ({pct}%)</Text>
            </View>
          );
        })}
      </View>

      {/* Stress Breakdown */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <FontAwesomeIcon icon={faChartPie} size={15} color={colors.primary} />
          <Text style={styles.cardTitle}>Stress Breakdown</Text>
        </View>
        <View style={styles.stressRow}>
          {[
            { label: "Drought", value: stats.drought, key: "Drought", icon: faSun  },
            { label: "Pest",    value: stats.pest,    key: "PestInfestation", icon: faBug },
          ].map((item) => {
            const clr = dynamicClassColors[item.key];
            return (
              <View key={item.key} style={[styles.stressCard, { backgroundColor: clr.bg, borderColor: clr.border }]}>
                <FontAwesomeIcon icon={item.icon} size={28} color={clr.text} />
                <Text style={[styles.stressNum, { color: clr.text }]}>{item.value}</Text>
                <Text style={[styles.stressLabel, { color: clr.text }]}>{item.label}</Text>
                <Text style={[styles.stressPct, { color: clr.text }]}>{getPct(item.value)}%</Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Activity */}
      {scans.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <FontAwesomeIcon icon={faChartBar} size={15} color={colors.primary} />
            <Text style={styles.cardTitle}>Recent Activity</Text>
          </View>
          {groupByDate().map(([date, day]) => (
            <View key={date} style={styles.activityRow}>
              <Text style={styles.activityDate}>{date}</Text>
              <View style={styles.activityDots}>
                {day.drought > 0 && <View style={[styles.dot, { backgroundColor: dynamicClassColors.Drought.border }]}><Text style={styles.dotText}>{day.drought}</Text></View>}
                {day.pest > 0    && <View style={[styles.dot, { backgroundColor: dynamicClassColors.PestInfestation.border }]}><Text style={styles.dotText}>{day.pest}</Text></View>}
                {day.healthy > 0 && <View style={[styles.dot, { backgroundColor: dynamicClassColors.Healthy.border }]}><Text style={styles.dotText}>{day.healthy}</Text></View>}
              </View>
              <Text style={styles.activityTotal}>{day.total} scans</Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container    : { paddingBottom: 32 },
  summaryRow   : { flexDirection: "row", gap: 10, marginBottom: 14 },
  summaryCard  : { flex: 1, borderRadius: 12, padding: 12, alignItems: "center", gap: 4 },
  summaryNum   : { fontSize: 20, fontWeight: "800" },
  summaryLabel : { fontSize: 10, color: colors.textLight, textAlign: "center" },
  card         : { backgroundColor: colors.cardBg, borderRadius: 16, padding: 18, marginBottom: 14 },
  cardHeader   : { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  cardTitle    : { fontSize: 16, fontWeight: "700", color: colors.primary },
  noData       : { color: colors.textMuted, textAlign: "center", paddingVertical: 16 },
  barRow       : { marginBottom: 12 },
  barLabelRow  : { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 6 },
  barLabel     : { fontSize: 13, color: colors.text, fontWeight: "500" },
  barTrack     : { height: 10, backgroundColor: colors.borderLight, borderRadius: 5, overflow: "hidden", marginBottom: 4 },
  barFill      : { height: 10, borderRadius: 5 },
  barPct       : { fontSize: 12, fontWeight: "600" },
  stressRow    : { flexDirection: "row", gap: 12 },
  stressCard   : { flex: 1, borderRadius: 14, borderWidth: 1.5, padding: 16, alignItems: "center", gap: 4 },
  stressNum    : { fontSize: 26, fontWeight: "800" },
  stressLabel  : { fontSize: 13, fontWeight: "600" },
  stressPct    : { fontSize: 12 },
  activityRow  : { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  activityDate : { fontSize: 12, color: colors.textLight, width: 90 },
  activityDots : { flex: 1, flexDirection: "row", gap: 6 },
  dot          : { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  dotText      : { fontSize: 11, color: "#fff", fontWeight: "700" },
  activityTotal: { fontSize: 12, color: colors.textMuted, width: 55, textAlign: "right" },
});