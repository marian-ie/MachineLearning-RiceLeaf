import React, { useState, useCallback, useEffect, createContext } from "react";
import { SafeAreaView, View, StatusBar, StyleSheet, Text, Alert } from "react-native";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

import AppHeader         from "./Components/AppHeader";
import TabBar            from "./Components/TabBar";
import DashboardScreen   from "./screen/DashboardScreen";
import ScanScreen        from "./screen/ScanScreen";
import StressGuideScreen from "./screen/Stressguidescreen";
import HistoryScreen     from "./screen/HistoryScreen";
import RecordScreen      from "./screen/RecordScreen";
import AuthScreen        from "./screen/AuthScreen";
import ProfileScreen     from "./screen/ProfileScreen";

import { initDatabase, deleteUserAccount }  from "./services/database";
import { getColors }        from "./styles/theme";

library.add(fas);

export const ThemeContext = createContext();

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dbReady,   setDbReady]   = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  const colors = getColors(isDarkTheme);

  useEffect(() => {
    const setup = async () => {
      await initDatabase();
      fetch("https://marian522-ricestressclassification.hf.space/")
        .catch(() => console.log(" API starting up..."));
      setDbReady(true);
    };
    setup();
  }, []);

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab("dashboard");
  };

  const handleDeleteAccount = async () => {
    await deleteUserAccount(currentUser.id);
    setCurrentUser(null);
    Alert.alert("Account Deleted", "Your account and all data have been removed.");
  };

  const handleHistoryPress = useCallback(() => setActiveTab("history"), []);

  const renderScreen = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardScreen isFocused={activeTab === "dashboard"} onScanPress={() => setActiveTab("scan")} userId={currentUser.id} />;
      case "scan":      return <ScanScreen onNewScan={() => {}} userId={currentUser.id} />;
      case "guide":     return <StressGuideScreen />;
      case "records":   return <RecordScreen isFocused={activeTab === "records"} userId={currentUser.id} />;
      case "history":   return <HistoryScreen isFocused={activeTab === "history"} userId={currentUser.id} />;
      case "profile":   
        return (
          <ProfileScreen 
            user={currentUser} 
            isDark={isDarkTheme} 
            onToggleTheme={(value) => setIsDarkTheme(value)} 
            onLogout={handleLogout} 
            onDeleteAccount={handleDeleteAccount} 
          />
        );
      default: return null;
    }
  };

  const tabForBar = activeTab === "history" ? "dashboard" : activeTab;

  // 👇 FIX: Wrap the ENTIRE return statement inside the Provider!
  return (
    <ThemeContext.Provider value={{ isDark: isDarkTheme, colors }}>
      {!dbReady ? (
        <SafeAreaView style={[styles.loading, { backgroundColor: colors.appBg }]}>
          {/* 👇 FIX: Cleaned up weird characters */}
          <Text style={{ fontSize: 48 }}>🌾</Text>
          <Text style={{ color: colors.textLight, marginTop: 12, fontSize: 15 }}>
            Loading Rice Stress Lab...
          </Text>
        </SafeAreaView>
      ) : !currentUser ? (
        <AuthScreen onLoginSuccess={(user) => setCurrentUser(user)} />
      ) : (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.appBg }]}>
          <StatusBar barStyle={isDarkTheme ? "light-content" : "dark-content"} backgroundColor={colors.appBg} />

          <View style={styles.topBar}>
            <AppHeader onHistoryPress={handleHistoryPress} onProfilePress={() => setActiveTab("profile")} />
            <TabBar activeTab={tabForBar} onTabPress={setActiveTab} />
          </View>

          <View style={styles.screenContainer}>
            {renderScreen()}
          </View>
        </SafeAreaView>
      )}
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  safeArea       : { flex: 1 },
  loading        : { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar         : { paddingHorizontal: 20, paddingTop: 16 },
  screenContainer: { flex: 1, paddingHorizontal: 20 },
});