import React, { useState, useCallback, useEffect } from "react";
import {
  SafeAreaView, View, StatusBar, StyleSheet, Text
} from "react-native";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

import AppHeader         from "./Components/AppHeader";
import TabBar            from "./Components/TabBar";
import DashboardScreen   from "./screen/DashboardScreen";
import ScanScreen        from "./screen/ScanScreen";
import StressGuideScreen from "./screen/Stressguidescreen";
import HistoryScreen     from "./screen/HistoryScreen";
import RecordScreen      from "./screen/RecordScreen";
import { initDatabase }  from "./services/database";
import { colors }        from "./styles/theme";

// ── Register all FontAwesome solid icons once ─────────────
library.add(fas);

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dbReady,   setDbReady]   = useState(false);

  useEffect(() => {
    const setup = async () => {
      await initDatabase();
      // Wake up Hugging Face Space on app launch
      fetch("https://marian522-ricestressclassification.hf.space/")
        .then(() => console.log("✅ API warmed up"))
        .catch(() => console.log("⚠️ API waking up..."));
      setDbReady(true);
    };
    setup();
  }, []);

  const handleNewScan = useCallback((item) => {
    // No longer need to track history in state — screens load from SQLite directly
  }, []);

  const handleHistoryPress = useCallback(() => setActiveTab("history"), []);

  if (!dbReady) {
    return (
      <SafeAreaView style={styles.loading}>
        <Text style={{ fontSize: 48 }}>🌾</Text>
        <Text style={{ color: colors.textLight, marginTop: 12, fontSize: 15 }}>
          Loading Rice Stress Lab...
        </Text>
      </SafeAreaView>
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <DashboardScreen
            isFocused={activeTab === "dashboard"}
            onScanPress={() => setActiveTab("scan")}
          />
        );
      case "scan":
        return <ScanScreen onNewScan={handleNewScan} />;
      case "guide":
        return <StressGuideScreen />;
      case "records":
        return <RecordScreen isFocused={activeTab === "records"} />;
      case "history":
        return <HistoryScreen isFocused={activeTab === "history"} />;
      default:
        return null;
    }
  };

  const tabForBar = activeTab === "history" ? "dashboard" : activeTab;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.appBg} />

      {/* Fixed header + tabbar — never scrolls */}
      <View style={styles.topBar}>
        <AppHeader onHistoryPress={handleHistoryPress} />
        <TabBar activeTab={tabForBar} onTabPress={setActiveTab} />
      </View>

      {/* Each screen manages its own scrolling */}
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea       : { flex: 1, backgroundColor: colors.appBg },
  loading        : { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.appBg },
  topBar         : { paddingHorizontal: 20, paddingTop: 16 },
  screenContainer: { flex: 1, paddingHorizontal: 20 },
});