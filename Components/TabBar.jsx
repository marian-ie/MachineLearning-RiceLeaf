import React, { useContext } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faHouse, faMagnifyingGlass, faUser, faChartBar } from "@fortawesome/free-solid-svg-icons";
import { ThemeContext } from "../App";

const TABS = [
  { key: "dashboard", label: "Home",    icon: faHouse           },
  { key: "scan",      label: "Scan",    icon: faMagnifyingGlass },
  { key: "records",   label: "Records", icon: faChartBar        }, 
  { key: "profile",   label: "Profile", icon: faUser            }, 
];

export default function TabBar({ activeTab, onTabPress }) {
  const { colors } = useContext(ThemeContext);
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabPress(tab.key)}
            activeOpacity={0.8}
          >
            <FontAwesomeIcon
              icon={tab.icon}
              size={16}
              color={isActive ? "#FFF" : colors.primary}
            />
            <Text style={[styles.label, isActive && styles.activeLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const getStyles = (colors) => StyleSheet.create({
  container : { flexDirection: "row", backgroundColor: colors.cardBg, borderRadius: 50, padding: 4, borderWidth: 1, borderColor: colors.borderLight },
  tab       : { flex: 1, paddingVertical: 10, borderRadius: 50, alignItems: "center", gap: 3 },
  activeTab : { backgroundColor: colors.primary },
  label     : { fontSize: 11, fontWeight: "600", color: colors.primary },
  activeLabel: { color: "#FFF", fontWeight: "700" },
});