import React from "react";
import {
  Modal, View, Text, TouchableOpacity,
  StyleSheet, ScrollView,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faRuler, faRotate, faSun, faCircleCheck, faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { colors } from "../styles/theme";

const TIPS = [
  {
    icon   : faRuler,
    title  : "Distance",
    color  : "#1565C0",
    bg     : "#E3F2FD",
    tip    : "Hold your phone 20–30 cm (about 1 foot) away from the leaf.",
    good   : "Leaf fills most of the frame",
    bad    : "Too close (blurry) or too far (leaf too small)",
  },
  {
    icon   : faRotate,
    title  : "Angle",
    color  : "#6A1B9A",
    bg     : "#F3E5F5",
    tip    : "Point camera directly at the leaf — top-down or straight on.",
    good   : "Flat, parallel to leaf surface",
    bad    : "Sharp angle or tilted shot",
  },
  {
    icon   : faSun,
    title  : "Lighting",
    color  : "#E65100",
    bg     : "#FFF3E0",
    tip    : "Use natural daylight. Avoid shadows and direct flash.",
    good   : "Bright natural light, no shadows",
    bad    : "Dark room, flashlight, or harsh sunlight",
  },
];

export default function CameraGuideModal({ visible, onClose, onContinue }) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>📷 Before You Scan</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <FontAwesomeIcon icon={faXmark} size={18} color={colors.textLight} />
            </TouchableOpacity>
          </View>
          <Text style={styles.modalSub}>
            Follow these tips for the most accurate results
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {TIPS.map((t) => (
              <View key={t.title} style={[styles.tipCard, { backgroundColor: t.bg }]}>
                <View style={[styles.tipIconBox, { backgroundColor: t.bg }]}>
                  <FontAwesomeIcon icon={t.icon} size={22} color={t.color} />
                </View>
                <View style={styles.tipContent}>
                  <Text style={[styles.tipTitle, { color: t.color }]}>{t.title}</Text>
                  <Text style={styles.tipText}>{t.tip}</Text>
                  <View style={styles.tipRow}>
                    <FontAwesomeIcon icon={faCircleCheck} size={12} color="#2E7D32" />
                    <Text style={styles.tipGood}>{t.good}</Text>
                  </View>
                  <View style={styles.tipRow}>
                    <FontAwesomeIcon icon={faXmark} size={12} color="#C62828" />
                    <Text style={styles.tipBad}>{t.bad}</Text>
                  </View>
                </View>
              </View>
            ))}

            {/* Example Box */}
            <View style={styles.exampleBox}>
              <Text style={styles.exampleTitle}>✅ Perfect Shot Checklist</Text>
              {[
                "Single leaf visible and in focus",
                "Natural green background preferred",
                "No fingers or objects blocking the leaf",
                "Image is sharp and not blurry",
              ].map((item, i) => (
                <View key={i} style={styles.checkRow}>
                  <FontAwesomeIcon icon={faCircleCheck} size={13} color={colors.primary} />
                  <Text style={styles.checkText}>{item}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.85}>
            <FontAwesomeIcon icon={faCircleCheck} size={16} color={colors.white} />
            <Text style={styles.continueBtnText}>Got it — Open Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay      : { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modal        : { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "90%" },
  modalHeader  : { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  modalTitle   : { fontSize: 20, fontWeight: "800", color: colors.primary },
  closeBtn     : { padding: 4 },
  modalSub     : { fontSize: 13, color: colors.textLight, marginBottom: 18 },
  tipCard      : { borderRadius: 14, padding: 14, marginBottom: 12, flexDirection: "row", gap: 12 },
  tipIconBox   : { width: 44, height: 44, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  tipContent   : { flex: 1, gap: 4 },
  tipTitle     : { fontSize: 15, fontWeight: "700" },
  tipText      : { fontSize: 13, color: colors.text, lineHeight: 18 },
  tipRow       : { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  tipGood      : { fontSize: 12, color: "#2E7D32" },
  tipBad       : { fontSize: 12, color: "#C62828" },
  exampleBox   : { backgroundColor: colors.cardBg, borderRadius: 14, padding: 14, marginBottom: 16, gap: 8 },
  exampleTitle : { fontSize: 14, fontWeight: "700", color: colors.primary, marginBottom: 4 },
  checkRow     : { flexDirection: "row", alignItems: "center", gap: 8 },
  checkText    : { fontSize: 13, color: colors.text },
  continueBtn  : { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, alignItems: "center", flexDirection: "row", justifyContent: "center", gap: 8, marginTop: 8 },
  continueBtnText: { color: colors.white, fontWeight: "700", fontSize: 15 },
  cancelBtn    : { paddingVertical: 12, alignItems: "center" },
  cancelBtnText: { color: colors.textLight, fontSize: 14 },
});