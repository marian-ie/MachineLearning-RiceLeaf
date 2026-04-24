import React, { useState, useEffect, useCallback, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, RefreshControl } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faTrash, faSun, faBug, faLeaf, faClockRotateLeft } from "@fortawesome/free-solid-svg-icons";
import { getAllScans, deleteScan, clearAllScans } from "../services/database";
import { CLASS_COLORS, CLASS_FA_ICONS } from "../styles/theme";
import { ThemeContext } from "../App"; 

export default function HistoryScreen({ userId }) {
  const { isDark, colors } = useContext(ThemeContext);
  const dynamicClassColors = CLASS_COLORS(isDark);
  const styles = getStyles(colors);

  const [scans, setScans]           = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadScans = useCallback(async () => { 
    setScans(await getAllScans(userId)); 
  }, [userId]);
  
  useEffect(() => { loadScans(); }, [loadScans]);

  const onRefresh = async () => { setRefreshing(true); await loadScans(); setRefreshing(false); };

  const handleDelete = (id) => Alert.alert("Delete Scan", "Remove this scan?", [
    { text: "Cancel", style: "cancel" },
    { text: "Delete", style: "destructive", onPress: async () => { 
        await deleteScan(id, userId);
        await loadScans(); 
    } }
  ]);

  const handleClearAll = () => Alert.alert("Clear All", "Delete all scan records?", [
    { text: "Cancel", style: "cancel" },
    { text: "Clear All", style: "destructive", onPress: async () => { 
        await clearAllScans(userId);
        await loadScans(); 
    } }
  ]);

  const faIconMap = { sun: faSun, bug: faBug, leaf: faLeaf };
  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString() + "  " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderItem = ({ item }) => {
    const clr    = dynamicClassColors[item.display_name] || dynamicClassColors.Healthy;
    const faIcon = faIconMap[CLASS_FA_ICONS[item.display_name]] || faLeaf;
    return (
      <View style={styles.card}>
        {item.image_uri ? (
          <Image source={{ uri: item.image_uri }} style={styles.thumb} />
        ) : (
          <View style={[styles.thumbPlaceholder, { backgroundColor: clr.bg }]}>
            <FontAwesomeIcon icon={faIcon} size={24} color={clr.text} />
          </View>
        )}
        <View style={styles.cardInfo}>
          <View style={[styles.badge, { backgroundColor: clr.bg, borderColor: clr.border }]}>
            <FontAwesomeIcon icon={faIcon} size={11} color={clr.text} />
            <Text style={[styles.badgeText, { color: clr.text }]}>{item.display_name}</Text>
          </View>
          <Text style={styles.confidence}>{item.confidence}% confidence</Text>
          {item.is_uncertain && <Text style={styles.uncertainTag}>⚠ Low confidence</Text>}
          <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
          <Text style={styles.recommendation} numberOfLines={1}>{item.recommendation}</Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
          <FontAwesomeIcon icon={faTrash} size={15} color={colors.pestBorder} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <FontAwesomeIcon icon={faClockRotateLeft} size={16} color={colors.primary} />
        <Text style={styles.headerTitle}>Scan History</Text>
        <Text style={styles.headerCount}>{scans.length} records</Text>
        {scans.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={styles.clearBtn}>
            <FontAwesomeIcon icon={faTrash} size={12} color={colors.pestBorder} />
            <Text style={[styles.clearText, { color: colors.pestBorder }]}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {scans.length === 0 ? (
        <View style={styles.emptyCard}>
          <FontAwesomeIcon icon={faClockRotateLeft} size={40} color={colors.border} />
          <Text style={styles.emptyText}>No scans yet</Text>
          <Text style={styles.emptySub}>Go to Scan Plant to analyze your first rice leaf</Text>
        </View>
      ) : (
        <FlatList
          data={scans}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container      : { flex: 1 },
  header         : { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  headerTitle    : { fontSize: 17, fontWeight: "700", color: colors.primary, flex: 1 },
  headerCount    : { fontSize: 13, color: colors.textLight },
  clearBtn       : { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: colors.pestBg, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  clearText      : { fontSize: 12, fontWeight: "600" },
  card           : { backgroundColor: colors.cardBg, borderRadius: 14, padding: 14, marginBottom: 12, flexDirection: "row", alignItems: "center", gap: 12 },
  thumb          : { width: 64, height: 64, borderRadius: 10 },
  thumbPlaceholder: { width: 64, height: 64, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cardInfo       : { flex: 1, gap: 4 },
  badge          : { alignSelf: "flex-start", borderRadius: 50, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 4, flexDirection: "row", alignItems: "center", gap: 5 },
  badgeText      : { fontWeight: "700", fontSize: 12 },
  confidence     : { fontSize: 12, color: colors.text, fontWeight: "600" },
  uncertainTag   : { fontSize: 11, color: colors.droughtBorder },
  timestamp      : { fontSize: 11, color: colors.textMuted },
  recommendation : { fontSize: 11, color: colors.textLight, fontStyle: "italic" },
  deleteBtn      : { padding: 8 },
  emptyCard      : { backgroundColor: colors.cardBg, borderRadius: 16, padding: 40, alignItems: "center", marginTop: 20, gap: 10 },
  emptyText      : { fontSize: 18, fontWeight: "700", color: colors.text },
  emptySub       : { fontSize: 13, color: colors.textLight, textAlign: "center", lineHeight: 20 },
});