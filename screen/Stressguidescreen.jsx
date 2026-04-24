import React, { useState, useContext } from "react";
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity,
} from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import {
  faSun, faBug, faLeaf, faChevronDown, faChevronUp,
  faCircleDot, faFlask, faListCheck, faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import { getStressData } from "../styles/theme";
import { ThemeContext } from "../App";

const STRESS_KEYS = ["Drought", "PestInfestation", "Healthy"];

function StressCard({ stressKey }) {
  const { isDark, colors } = useContext(ThemeContext);
  const dynamicStressData = getStressData(isDark);
  const styles = getStyles(colors);
  
  const data = dynamicStressData[stressKey];
  const [expanded, setExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState("symptoms");

  const faIconMap = { sun: faSun, bug: faBug, leaf: faLeaf };
  const faIcon    = faIconMap[data.icon] || faLeaf;

  const SECTIONS = [
    { key: "symptoms",        label: "Symptoms",        icon: faCircleDot,          items: data.symptoms        },
    { key: "recommendations", label: "Recommendations", icon: faListCheck,          items: data.recommendations },
    { key: "treatments",      label: "Treatments",      icon: faFlask,              items: data.treatments      },
  ];

  return (
    <View style={[styles.card, { borderColor: data.border }]}>
      <TouchableOpacity
        style={[styles.cardHeader, { backgroundColor: data.bg }]}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.8}
      >
        <View style={[styles.iconCircle, { backgroundColor: data.bg, borderColor: data.border }]}>
          <FontAwesomeIcon icon={faIcon} size={24} color={data.color} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.cardTitle, { color: data.color }]}>{data.title}</Text>
          <View style={[styles.severityBadge, { backgroundColor: data.border }]}>
            <FontAwesomeIcon icon={faTriangleExclamation} size={10} color="#fff" />
            <Text style={styles.severityText}>Severity: {data.severity}</Text>
          </View>
        </View>
        <FontAwesomeIcon icon={expanded ? faChevronUp : faChevronDown} size={16} color={data.color} />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.cardBody}>
          <Text style={styles.description}>{data.description}</Text>

          <View style={styles.sectionTabs}>
            {SECTIONS.map((sec) => (
              <TouchableOpacity
                key={sec.key}
                style={[
                  styles.sectionTab,
                  activeSection === sec.key && { backgroundColor: data.color }
                ]}
                onPress={() => setActiveSection(sec.key)}
                activeOpacity={0.8}
              >
                <FontAwesomeIcon
                  icon={sec.icon}
                  size={11}
                  color={activeSection === sec.key ? "#fff" : data.color}
                />
                <Text style={[
                  styles.sectionTabText,
                  { color: activeSection === sec.key ? "#fff" : data.color }
                ]}>
                  {sec.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {SECTIONS.filter((s) => s.key === activeSection).map((sec) => (
            <View key={sec.key} style={styles.sectionContent}>
              {sec.items.map((item, i) => (
                <View key={i} style={styles.itemRow}>
                  <View style={[styles.itemDot, { backgroundColor: data.border }]} />
                  <Text style={styles.itemText}>{item}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export default function StressGuideScreen() {
  const { colors } = useContext(ThemeContext);
  const styles = getStyles(colors);

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerBox}>
        <FontAwesomeIcon icon={faLeaf} size={20} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Stress Guide</Text>
          <Text style={styles.headerSub}>
            Learn about rice stress types, symptoms, and treatments
          </Text>
        </View>
      </View>

      <View style={styles.legendRow}>
        {[
          { label: "Drought",  color: colors.droughtBorder, icon: faSun  },
          { label: "Pest",     color: colors.pestBorder,    icon: faBug  },
          { label: "Healthy",  color: colors.healthyBorder, icon: faLeaf },
        ].map((item) => (
          <View key={item.label} style={styles.legendItem}>
            <FontAwesomeIcon icon={item.icon} size={14} color={item.color} />
            <Text style={[styles.legendText, { color: item.color }]}>{item.label}</Text>
          </View>
        ))}
      </View>

      {STRESS_KEYS.map((key) => (
        <StressCard key={key} stressKey={key} />
      ))}

      <View style={styles.disclaimer}>
        <FontAwesomeIcon icon={faTriangleExclamation} size={14} color={colors.droughtBorder} />
        <Text style={[styles.disclaimerText, { color: colors.droughtBorder }]}>
          This guide is for reference only. Always consult a certified agronomist for professional diagnosis and treatment.
        </Text>
      </View>
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container    : { paddingBottom: 32 },
  headerBox    : { backgroundColor: colors.cardBg, borderRadius: 14, padding: 16, flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  headerTitle  : { fontSize: 18, fontWeight: "700", color: colors.primary },
  headerSub    : { fontSize: 12, color: colors.textLight, marginTop: 2, lineHeight: 18 },
  legendRow    : { flexDirection: "row", justifyContent: "space-around", backgroundColor: colors.cardBg, borderRadius: 12, padding: 12, marginBottom: 14 },
  legendItem   : { flexDirection: "row", alignItems: "center", gap: 6 },
  legendText   : { fontSize: 13, fontWeight: "600" },
  card         : { backgroundColor: colors.cardBg, borderRadius: 16, borderWidth: 1.5, marginBottom: 14, overflow: "hidden" },
  cardHeader   : { flexDirection: "row", alignItems: "center", padding: 16, gap: 12 },
  iconCircle   : { width: 50, height: 50, borderRadius: 25, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  headerInfo   : { flex: 1, gap: 6 },
  cardTitle    : { fontSize: 17, fontWeight: "800" },
  severityBadge: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", borderRadius: 50, paddingHorizontal: 8, paddingVertical: 3, gap: 4 },
  severityText : { fontSize: 11, color: "#fff", fontWeight: "600" },
  cardBody     : { padding: 16, borderTopWidth: 1, borderTopColor: colors.borderLight, gap: 12 },
  description  : { fontSize: 13, color: colors.text, lineHeight: 20 },
  sectionTabs  : { flexDirection: "row", gap: 6 },
  sectionTab   : { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 50, borderWidth: 1, borderColor: colors.border },
  sectionTabText: { fontSize: 11, fontWeight: "600" },
  sectionContent: { gap: 8 },
  itemRow      : { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  itemDot      : { width: 7, height: 7, borderRadius: 4, marginTop: 6 },
  itemText     : { flex: 1, fontSize: 13, color: colors.text, lineHeight: 20 },
  disclaimer   : { flexDirection: "row", gap: 10, alignItems: "flex-start", backgroundColor: colors.droughtBg, borderRadius: 12, padding: 14 },
  disclaimerText: { flex: 1, fontSize: 12, lineHeight: 18 },
});