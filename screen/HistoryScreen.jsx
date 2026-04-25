import React, { useState, useEffect, useCallback, useContext } from "react";
import { View, Text, FlatList, TouchableOpacity, Image, StyleSheet, Alert, RefreshControl, Modal, ScrollView } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faTrash, faSun, faBug, faLeaf, faClockRotateLeft, faCircleXmark } from "@fortawesome/free-solid-svg-icons";
import { getAllScans, deleteScan, clearAllScans } from "../services/database";
import { CLASS_COLORS, CLASS_FA_ICONS } from "../styles/theme";
import { ThemeContext } from "../ThemeContext"; 

export default function HistoryScreen({ userId }) {
  const { isDark, colors } = useContext(ThemeContext);
  const dynamicClassColors = CLASS_COLORS(isDark);
  const styles = getStyles(colors);

  const [scans, setScans]           = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedScan, setSelectedScan] = useState(null);

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
      <TouchableOpacity style={styles.card} onPress={() => setSelectedScan(item)} activeOpacity={0.7}>
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
      </TouchableOpacity>
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

      <Modal visible={!!selectedScan} transparent animationType="fade" onRequestClose={() => setSelectedScan(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.detailsCard}>
            
            <View style={styles.detailsHeader}>
              <Text style={styles.detailsTitle}>Scan Details</Text>
              <TouchableOpacity onPress={() => setSelectedScan(null)} style={{ padding: 4 }}>
                <FontAwesomeIcon icon={faCircleXmark} size={24} color={colors.textLight} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 10 }}>
              {selectedScan?.image_uri ? (
                <Image source={{ uri: selectedScan.image_uri }} style={styles.detailsImage} />
              ) : (
                <View style={[styles.detailsImage, styles.thumbPlaceholder, { backgroundColor: colors.borderLight }]}>
                  <FontAwesomeIcon icon={faLeaf} size={40} color={colors.textLight} />
                </View>
              )}

              <View style={[styles.badge, { 
                backgroundColor: selectedScan ? (dynamicClassColors[selectedScan.display_name]?.bg || colors.borderLight) : colors.borderLight, 
                borderColor: selectedScan ? (dynamicClassColors[selectedScan.display_name]?.border || colors.border) : colors.border,
                alignSelf: "flex-start", marginTop: 16, marginBottom: 8 
              }]}>
                <Text style={[styles.badgeText, { 
                  color: selectedScan ? (dynamicClassColors[selectedScan.display_name]?.text || colors.text) : colors.text 
                }]}>
                  {selectedScan?.display_name}
                </Text>
              </View>

              <Text style={styles.detailsConfidence}>{selectedScan?.confidence}% Confidence</Text>
              {selectedScan?.is_uncertain && <Text style={styles.uncertainTag}>⚠ Low confidence — recommend manual inspection</Text>}
              <Text style={styles.detailsTimestamp}>{selectedScan ? formatDate(selectedScan.timestamp) : ""}</Text>

              <View style={styles.divider} />

              <Text style={styles.detailsSectionTitle}>Recommendation</Text>
              <Text style={styles.detailsRecommendation}>{selectedScan?.recommendation}</Text>
            </ScrollView>

          </View>
        </View>
      </Modal>

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

  modalOverlay     : { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  detailsCard      : { backgroundColor: colors.cardBg, borderRadius: 20, width: "100%", maxHeight: "85%", padding: 20, elevation: 5, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10 },
  detailsHeader    : { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  detailsTitle     : { fontSize: 18, fontWeight: "800", color: colors.primary },
  detailsImage     : { width: "100%", height: 250, borderRadius: 14, backgroundColor: colors.borderLight },
  detailsConfidence: { fontSize: 16, fontWeight: "700", color: colors.text, marginTop: 4 },
  detailsTimestamp : { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  divider          : { height: 1, backgroundColor: colors.borderLight, marginVertical: 16 },
  detailsSectionTitle: { fontSize: 14, fontWeight: "700", color: colors.primary, marginBottom: 8 },
  detailsRecommendation: { fontSize: 14, color: colors.text, lineHeight: 22 },
});