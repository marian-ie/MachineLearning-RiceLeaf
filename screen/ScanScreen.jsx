import React, { useState, useContext } from "react";
import {
  View, Text, TouchableOpacity, Image,
  ActivityIndicator, StyleSheet, Alert, ScrollView, Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faUpload, faCamera, faMagnifyingGlass, faChevronDown,
  faChevronUp, faTriangleExclamation, faCircleCheck,
  faWifi, faFloppyDisk, faRotateRight, faSun, faBug, faLeaf,
} from "@fortawesome/free-solid-svg-icons";
import { predictImage, checkServerHealth } from "../services/api";
import { saveScan } from "../services/database";
import { CLASS_COLORS, CLASS_FA_ICONS } from "../styles/theme";
import CameraGuideModal from "../Components/cameraguideModal";
import { ThemeContext } from "../ThemeContext"; 

export default function ScanScreen({ onNewScan, userId }) {
  const { isDark, colors } = useContext(ThemeContext);
  const dynamicClassColors = CLASS_COLORS(isDark);
  const styles = getStyles(colors);

  const [imageUri,     setImageUri]     = useState(null);
  const [result,       setResult]       = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [saved,        setSaved]        = useState(false);
  const [error,        setError]        = useState(null);
  const [showAccuracy, setShowAccuracy] = useState(false);
  const [showGuide,    setShowGuide]    = useState(false);

  const resetState = () => { setResult(null); setError(null); setSaved(false); setShowAccuracy(false); };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission needed", "Allow gallery access."); return; }
    const picked = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (!picked.canceled) { resetState(); setImageUri(picked.assets[0].uri); }
  };

  const handleCameraPress = () => { setShowGuide(true); };

  const openCamera = async () => {
    setShowGuide(false);
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert("Permission needed", "Allow camera access."); return; }
    const photo = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!photo.canceled) { resetState(); setImageUri(photo.assets[0].uri); }
  };

  const runPrediction = async () => {
    if (!imageUri) return;
    setLoading(true); setError(null); setResult(null); setSaved(false); setShowAccuracy(false);
    const response = await predictImage(imageUri);
    if (response.success) {
      setResult(response.data);
      await saveToDatabase(response.data);
    } else {
      setError(response.error);
    }
    setLoading(false);
  };

  const saveToDatabase = async (predictionData) => {
    setSaving(true);
    try {
      const scanId = await saveScan({ ...predictionData, image_uri: imageUri }, userId);
      onNewScan({
        id: scanId, image_uri: imageUri,
        label       : predictionData.predicted_class,
        display_name: predictionData.display_name,
        confidence  : predictionData.confidence,
        info        : predictionData.recommendation,
        is_uncertain: predictionData.is_uncertain,
        all_probabilities: predictionData.all_probabilities,
        timestamp   : new Date().toISOString(),
      });
      setSaved(true);
    } catch (err) { console.error("Save failed:", err); }
    setSaving(false);
  };

  const testConnection = async () => {
    const res = await checkServerHealth();
    Alert.alert(
      res.success ? "Connected" : "Not Connected",
      res.success
        ? `Server running\nModel: ${res.data.model}`
        : `Error: ${res.error}\n\nCheck your IP in services/api.js`
    );
  };

  const clr  = result ? dynamicClassColors[result.display_name] || dynamicClassColors.Healthy : null;
  const faIconMap = { sun: faSun, bug: faBug, leaf: faLeaf };
  const iconString = result ? CLASS_FA_ICONS[result.display_name] || "leaf" : "leaf";
  const CurrentIcon = faIconMap[iconString] || faLeaf;

  return (
    <>
      <CameraGuideModal visible={showGuide} onClose={() => setShowGuide(false)} onContinue={openCamera} />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.uploadBtn} onPress={pickFromGallery} activeOpacity={0.85}>
            <FontAwesomeIcon icon={faUpload} size={16} color={colors.white} />
            <Text style={styles.uploadBtnText}>Upload Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cameraBtn} onPress={handleCameraPress} activeOpacity={0.85}>
            <FontAwesomeIcon icon={faCamera} size={16} color={colors.primary} />
            <Text style={styles.cameraBtnText}>Camera Scan</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <FontAwesomeIcon icon={faCamera} size={36} color={colors.border} />
              <Text style={styles.placeholderText}>
                Take a picture or upload a rice plant image to analyze.
              </Text>
            </View>
          )}
        </View>

        {imageUri && !loading && (
          <TouchableOpacity style={styles.analyzeBtn} onPress={runPrediction} activeOpacity={0.85}>
            <FontAwesomeIcon icon={faMagnifyingGlass} size={16} color={colors.white} />
            <Text style={styles.analyzeBtnText}>Analyze Leaf</Text>
          </TouchableOpacity>
        )}

        {loading && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Analyzing rice leaf...</Text>
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <FontAwesomeIcon icon={faTriangleExclamation} size={16} color={colors.pestBorder} />
            <View style={{ flex: 1 }}>
              <Text style={styles.errorTitle}>Unable to Analyze Rice Leaf</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          </View>
        )}

        <View style={styles.resultCard}>
          <Text style={styles.resultCardTitle}>Scan Result</Text>

          {!result && !loading && (
            <View style={styles.noResultBox}>
              <FontAwesomeIcon icon={faMagnifyingGlass} size={32} color={colors.border} />
              <Text style={styles.noResultText}>No analysis yet</Text>
              <Text style={styles.noResultSub}>
                {imageUri ? "Press Analyze Leaf to start" : "Upload or take a photo to analyze."}
              </Text>
            </View>
          )}

          {result && clr && (
            <View style={styles.resultContent}>
              <View style={[styles.classBadge, { backgroundColor: clr.bg, borderColor: clr.border }]}>
                <FontAwesomeIcon icon={CurrentIcon} size={22} color={clr.text} />
                <Text style={[styles.classLabel, { color: clr.text }]}>
                  {result.display_name}
                </Text>
              </View>

              <Text style={[styles.confidenceText, { color: clr.text }]}>
                {result.confidence}% confidence
              </Text>

              <View style={styles.modelBadge}>
                <Text style={styles.modelText}>Model: ResNet18 — 99.66% accuracy</Text>
              </View>

              {result.is_uncertain && (
                <View style={styles.uncertainBox}>
                  <FontAwesomeIcon icon={faTriangleExclamation} size={14} color={colors.droughtBorder} />
                  <Text style={styles.uncertainText}>
                    Low confidence — recommend manual inspection by agronomist
                  </Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.toggleBtn}
                onPress={() => setShowAccuracy(!showAccuracy)}
                activeOpacity={0.8}
              >
                <Text style={styles.toggleBtnText}>
                  {showAccuracy ? "Hide" : "Show"} Detailed Accuracy
                </Text>
                <FontAwesomeIcon
                  icon={showAccuracy ? faChevronUp : faChevronDown}
                  size={13}
                  color={colors.primary}
                />
              </TouchableOpacity>

              {showAccuracy && (
                <View style={styles.accuracyBox}>
                  <Text style={styles.accuracyTitle}>Class Probabilities</Text>
                  {Object.entries(result.all_probabilities).map(([cls, prob]) => {
                    const name = cls.replace("ClassA-","").replace("ClassB-","").replace("ClassC-","");
                    const c    = dynamicClassColors[name] || dynamicClassColors.Healthy;
                    const fiString = CLASS_FA_ICONS[name] || "leaf";
                    const RowIcon = faIconMap[fiString] || faLeaf;
                    return (
                      <View key={cls} style={styles.probRow}>
                        <FontAwesomeIcon icon={RowIcon} size={13} color={c.text} />
                        <Text style={styles.probLabel}>{name}</Text>
                        <View style={styles.probBarBg}>
                          <View style={[styles.probBarFill, { width: `${Math.min(prob,100)}%`, backgroundColor: c.border }]} />
                        </View>
                        <Text style={styles.probValue}>{prob}%</Text>
                      </View>
                    );
                  })}
                </View>
              )}

              <View style={styles.recommendBox}>
                <Text style={styles.recommendTitle}>Recommendation</Text>
                <Text style={styles.recommendText}>{result.recommendation}</Text>
              </View>

              <View style={styles.saveRow}>
                {saving && (
                  <>
                    <FontAwesomeIcon icon={faFloppyDisk} size={13} color={colors.textLight} />
                    <Text style={styles.savingText}>Saving to history...</Text>
                  </>
                )}
                {saved && (
                  <>
                    <FontAwesomeIcon icon={faCircleCheck} size={13} color={colors.primary} />
                    <Text style={styles.savedText}>Saved to history</Text>
                  </>
                )}
              </View>

              <TouchableOpacity
                style={styles.rescanBtn}
                onPress={() => { setImageUri(null); resetState(); }}
                activeOpacity={0.8}
              >
                <FontAwesomeIcon icon={faRotateRight} size={14} color={colors.primary} />
                <Text style={styles.rescanText}>Scan Another Leaf</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container      : { paddingBottom: Platform.OS === "ios" ? 40 : 36, },
  buttonRow      : { flexDirection: "row", gap: 12, marginBottom: 14 },
  uploadBtn      : { flex: 1, backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  uploadBtnText  : { color: colors.white, fontWeight: "700", fontSize: 14 },
  cameraBtn      : { flex: 1, backgroundColor: colors.cardBg, borderRadius: 12, borderWidth: 1.5, borderColor: colors.primary, paddingVertical: 15, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8 },
  cameraBtnText  : { color: colors.primary, fontWeight: "700", fontSize: 14 },
  imageBox       : { backgroundColor: colors.cardBg, borderRadius: 16, overflow: "hidden", minHeight: 220, marginBottom: 14, alignItems: "center", justifyContent: "center" },
  image          : { width: "100%", height: 220, resizeMode: "cover" },
  imagePlaceholder: { padding: 40, alignItems: "center", gap: 14 },
  placeholderText: { color: colors.textLight, fontSize: 14, textAlign: "center", lineHeight: 22 },
  analyzeBtn     : { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: "center", marginBottom: 10, flexDirection: "row", justifyContent: "center", gap: 8 },
  analyzeBtnText : { color: colors.white, fontWeight: "700", fontSize: 15 },
  testBtn        : { backgroundColor: colors.cardBg, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingVertical: 11, alignItems: "center", marginBottom: 14, flexDirection: "row", justifyContent: "center", gap: 6 },
  testBtnText    : { color: colors.primary, fontSize: 13, fontWeight: "600" },
  loadingBox     : { alignItems: "center", padding: 24, gap: 10 },
  loadingText    : { color: colors.textLight, fontSize: 14 },
  errorBox       : { backgroundColor: colors.pestBg, borderRadius: 12, padding: 14, marginBottom: 14, flexDirection: "row", gap: 10, alignItems: "flex-start" },
  errorTitle     : { color: colors.pestBorder, fontWeight: "700", fontSize: 14, marginBottom: 3 },
  errorText      : { color: colors.pestBorder, fontSize: 13, marginBottom: 3 },
  errorHint      : { color: colors.textLight, fontSize: 12 },
  resultCard     : { backgroundColor: colors.cardBg, borderRadius: 16, padding: 18 },
  resultCardTitle: { fontSize: 18, fontWeight: "700", color: colors.primary, marginBottom: 14 },
  noResultBox    : { alignItems: "center", paddingVertical: 28, gap: 10 },
  noResultText   : { fontSize: 16, fontWeight: "600", color: colors.text },
  noResultSub    : { fontSize: 13, color: colors.textLight, textAlign: "center" },
  resultContent  : { gap: 12 },
  classBadge     : { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", borderRadius: 50, borderWidth: 1.5, paddingVertical: 8, paddingHorizontal: 16, gap: 8 },
  classLabel     : { fontSize: 18, fontWeight: "700" },
  confidenceText : { fontSize: 15, fontWeight: "600", color: colors.text },
  uncertainBox   : { backgroundColor: colors.droughtBg, borderRadius: 10, padding: 10, flexDirection: "row", gap: 8, alignItems: "center" },
  uncertainText  : { color: colors.droughtBorder, fontSize: 12, flex: 1 },
  toggleBtn      : { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: colors.cardBg, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, borderWidth: 1, borderColor: colors.border },
  toggleBtnText  : { fontSize: 13, fontWeight: "600", color: colors.primary },
  accuracyBox    : { backgroundColor: colors.appBg, borderRadius: 12, padding: 14, gap: 10 },
  accuracyTitle  : { fontSize: 13, fontWeight: "700", color: colors.textLight, marginBottom: 4 },
  probRow        : { flexDirection: "row", alignItems: "center", gap: 8 },
  probLabel      : { width: 120, fontSize: 12, color: colors.text },
  probBarBg      : { flex: 1, height: 8, backgroundColor: colors.borderLight, borderRadius: 4, overflow: "hidden" },
  probBarFill    : { height: 8, borderRadius: 4 },
  probValue      : { width: 44, textAlign: "right", fontSize: 12, color: colors.text, fontWeight: "600" },
  recommendBox   : { backgroundColor: colors.appBg, borderRadius: 12, padding: 14 },
  recommendTitle : { fontWeight: "700", fontSize: 14, marginBottom: 6, color: colors.primary },
  recommendText  : { fontSize: 13, color: colors.text, lineHeight: 20 },
  saveRow        : { flexDirection: "row", alignItems: "center", gap: 6, justifyContent: "center" },
  savingText     : { color: colors.textLight, fontSize: 13 },
  savedText      : { color: colors.primary, fontWeight: "700", fontSize: 13 },
  rescanBtn      : { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.cardBg },
  rescanText     : { color: colors.primary, fontWeight: "600", fontSize: 13 },
  modelBadge: { backgroundColor: colors.cardBg, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 12, alignSelf: "flex-start", borderWidth: 1, borderColor: colors.border },
  modelText: { fontSize: 12, color: colors.textLight, fontWeight: "600" },
});