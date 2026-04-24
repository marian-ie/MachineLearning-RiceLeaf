import React, { useState, useCallback, useEffect, createContext } from "react";
import { SafeAreaView, View, StatusBar, StyleSheet, Text, Alert, Platform } from "react-native";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";

import AsyncStorage from '@react-native-async-storage/async-storage';

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
        .catch(() => console.log("⚠️ API starting up..."));

      try {
        const sessionData = await AsyncStorage.getItem('@user_session');
        if (sessionData) {
          const { user, timestamp } = JSON.parse(sessionData);
          const EXPIRATION_TIME = 7 * 24 * 60 * 60 * 1000; 
          
          if (Date.now() - timestamp < EXPIRATION_TIME) {
            setCurrentUser(user);
          } else {
            await AsyncStorage.removeItem('@user_session');
          }
        }
      } catch (e) {
        console.log("Failed to load session", e);
      }

      setDbReady(true);
    };
    setup();
  }, []);

  const handleLoginSuccess = async (user) => {
    setCurrentUser(user);
    try {
      const session = { user, timestamp: Date.now() };
      await AsyncStorage.setItem('@user_session', JSON.stringify(session));
    } catch (e) {
      console.log("Failed to save session", e);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('@user_session');
    setCurrentUser(null);
    setActiveTab("dashboard");
  };

  const handleDeleteAccount = async () => {
    await deleteUserAccount(currentUser.id);
    await AsyncStorage.removeItem('@user_session');
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

  const tabForBar = activeTab;

  return (
    <ThemeContext.Provider value={{ isDark: isDarkTheme, colors }}>
      {!dbReady ? (
        <SafeAreaView style={[styles.loading, { backgroundColor: colors.appBg }]}>
          <Text style={{ fontSize: 48 }}>🌾</Text>
          <Text style={{ color: colors.textLight, marginTop: 12, fontSize: 15 }}>
            Loading Rice Stress Lab...
          </Text>
        </SafeAreaView>
      ) : !currentUser ? (
        <AuthScreen onLoginSuccess={handleLoginSuccess} />
      ) : (
        <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.appBg }]}>
          <StatusBar barStyle={isDarkTheme ? "light-content" : "dark-content"} backgroundColor={colors.appBg} />

          <View style={styles.topBar}>
            <AppHeader 
              onHistoryPress={handleHistoryPress} 
              onGuidePress={() => setActiveTab("guide")}
            />
          </View>

          <View style={styles.screenContainer}>
            {renderScreen()}
          </View>

          <View style={styles.bottomBar}>
            <TabBar activeTab={tabForBar} onTabPress={setActiveTab} />
          </View>

        </SafeAreaView>
      )}
    </ThemeContext.Provider>
  );
}

const styles = StyleSheet.create({
  safeArea       : { 
    flex: 1,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 
  },
  loading        : { flex: 1, justifyContent: "center", alignItems: "center" },
  topBar         : { paddingHorizontal: 20, paddingTop: 13 },
  screenContainer: { flex: 1, paddingHorizontal: 20 },
  bottomBar      : { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8 },
});