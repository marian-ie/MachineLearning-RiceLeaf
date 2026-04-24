import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faLeaf, faEnvelope, faLock, faEye, faEyeSlash, faUser, faRightToBracket, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { registerUser, loginUser } from "../services/database.js";
import { ThemeContext } from "../App"; // <-- Import ThemeContext

// 👇 Passed styles and colors as props
const Field = ({ icon, placeholder, value, onChangeText, secureEntry, toggleSecure, showToggle, keyboardType = "default", styles, colors }) => (
  <View style={styles.inputWrapper}>
    <View style={styles.inputIcon}>
      <FontAwesomeIcon icon={icon} size={15} color={colors.primary} />
    </View>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={colors.textLight}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureEntry}
      keyboardType={keyboardType}
      autoCapitalize="none"
    />
    {showToggle && (
      <TouchableOpacity onPress={toggleSecure} style={styles.eyeBtn}>
        <FontAwesomeIcon icon={secureEntry ? faEyeSlash : faEye} size={15} color={colors.textLight} />
      </TouchableOpacity>
    )}
  </View>
);

export default function LoginRegisterScreen({ onLoginSuccess }) {
  const { colors } = useContext(ThemeContext); // <-- Get dynamic colors
  const styles = getStyles(colors);            // <-- Generate dynamic styles

  const [activeTab, setActiveTab]         = useState("login");
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm,  setShowConfirm]    = useState(false);

  const [loginEmail,    setLoginEmail]    = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName,     setRegName]     = useState("");
  const [regEmail,    setRegEmail]    = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm,  setRegConfirm]  = useState("");

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }
    const result = await loginUser(loginEmail, loginPassword);
    if (result.success) {
      if (onLoginSuccess) onLoginSuccess(result.user);
    } else {
      Alert.alert("Login Failed", result.error);
    }
  };

  const handleRegister = async () => {
    if (!regName || !regEmail || !regPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(regEmail)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }
    if (regPassword !== regConfirm) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    const result = await registerUser(regName, regEmail, regPassword);
    
    if (result.success) {
      Alert.alert("Success", "Account created successfully!");
      if (onLoginSuccess) {
        onLoginSuccess({ id: result.userId, username: regEmail, name: regName });
      }
    } else {
      Alert.alert("Registration Failed", result.error);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.brand}>
          <View style={styles.logoBox}>
            <FontAwesomeIcon icon={faLeaf} size={32} color="#FFF" />
          </View>
          <Text style={styles.appName}>Rice Stress Lab</Text>
          <Text style={styles.appSub}>Rice plant stress analytics</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabRow}>
            <TouchableOpacity style={[styles.tab, activeTab === "login" && styles.tabActive]} onPress={() => setActiveTab("login")} activeOpacity={0.8}>
              <FontAwesomeIcon icon={faRightToBracket} size={13} color={activeTab === "login" ? "#FFF" : colors.primary} />
              <Text style={[styles.tabText, activeTab === "login" && styles.tabTextActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === "register" && styles.tabActive]} onPress={() => setActiveTab("register")} activeOpacity={0.8}>
              <FontAwesomeIcon icon={faUserPlus} size={13} color={activeTab === "register" ? "#FFF" : colors.primary} />
              <Text style={[styles.tabText, activeTab === "register" && styles.tabTextActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          {activeTab === "login" && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Welcome back</Text>
              <Text style={styles.formSub}>Sign in to continue monitoring your rice plants.</Text>
              
              {/* 👇 Passed styles and colors down to Field */}
              <Field icon={faEnvelope} placeholder="Email address" value={loginEmail} onChangeText={setLoginEmail} keyboardType="email-address" styles={styles} colors={colors} />
              <Field icon={faLock} placeholder="Password" value={loginPassword} onChangeText={setLoginPassword} secureEntry={!showPassword} showToggle toggleSecure={() => setShowPassword(p => !p)} styles={styles} colors={colors} />
              
              <TouchableOpacity style={styles.forgotBtn}><Text style={styles.forgotText}>Forgot password?</Text></TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} activeOpacity={0.85}>
                <FontAwesomeIcon icon={faRightToBracket} size={15} color="#FFF" />
                <Text style={styles.primaryBtnText}>Login</Text>
              </TouchableOpacity>
              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => setActiveTab("register")}><Text style={styles.switchLink}>Register</Text></TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === "register" && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Create account</Text>
              <Text style={styles.formSub}>Join Rice Stress Lab and start scanning your plants.</Text>
              
              {/* 👇 Passed styles and colors down to Field */}
              <Field icon={faUser} placeholder="Full name" value={regName} onChangeText={setRegName} styles={styles} colors={colors} />
              <Field icon={faEnvelope} placeholder="Email address" value={regEmail} onChangeText={setRegEmail} keyboardType="email-address" styles={styles} colors={colors} />
              <Field icon={faLock} placeholder="Password" value={regPassword} onChangeText={setRegPassword} secureEntry={!showPassword} showToggle toggleSecure={() => setShowPassword(p => !p)} styles={styles} colors={colors} />
              <Field icon={faLock} placeholder="Confirm password" value={regConfirm} onChangeText={setRegConfirm} secureEntry={!showConfirm} showToggle toggleSecure={() => setShowConfirm(p => !p)} styles={styles} colors={colors} />
              
              <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister} activeOpacity={0.85}>
                <FontAwesomeIcon icon={faUserPlus} size={15} color="#FFF" />
                <Text style={styles.primaryBtnText}>Create Account</Text>
              </TouchableOpacity>
              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => setActiveTab("login")}><Text style={styles.switchLink}>Login</Text></TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        <Text style={styles.footerNote}>By continuing you agree to our Terms of Service and Privacy Policy.</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// 👇 Converted to getStyles function to support dynamic themes
const getStyles = (colors) => StyleSheet.create({
  screen       : { flex: 1, backgroundColor: colors.appBg },
  scroll       : { paddingHorizontal: 18, paddingTop: 52, paddingBottom: 32 },
  brand        : { alignItems: "center", marginBottom: 28 },
  logoBox      : { width: 72, height: 72, borderRadius: 20, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", marginBottom: 12, shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  appName      : { fontSize: 24, fontWeight: "800", color: colors.primary, letterSpacing: 0.3 },
  appSub       : { fontSize: 13, color: colors.textLight, marginTop: 2 },
  card         : { backgroundColor: colors.cardBg, borderRadius: 20, padding: 18, marginBottom: 16 },
  tabRow       : { flexDirection: "row", backgroundColor: colors.borderLight, borderRadius: 12, padding: 4, marginBottom: 22, gap: 4 },
  tab          : { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 10, gap: 6 },
  tabActive    : { backgroundColor: colors.primary },
  tabText      : { fontSize: 14, fontWeight: "700", color: colors.primary },
  tabTextActive: { color: "#FFF" },
  form         : { gap: 12 },
  formTitle    : { fontSize: 18, fontWeight: "800", color: colors.primary },
  formSub      : { fontSize: 13, color: colors.textLight, lineHeight: 19, marginBottom: 4 },
  inputWrapper : { flexDirection: "row", alignItems: "center", backgroundColor: colors.appBg, borderRadius: 12, borderWidth: 1.5, borderColor: colors.borderLight, paddingHorizontal: 12, height: 50 },
  inputIcon    : { marginRight: 10 },
  input        : { flex: 1, fontSize: 14, color: colors.text },
  eyeBtn       : { padding: 4 },
  forgotBtn    : { alignSelf: "flex-end", marginTop: -4 },
  forgotText   : { fontSize: 12, color: colors.primary, fontWeight: "600" },
  primaryBtn   : { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4 },
  primaryBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  switchRow    : { flexDirection: "row", justifyContent: "center", marginTop: 4 },
  switchText   : { fontSize: 13, color: colors.textLight },
  switchLink   : { fontSize: 13, color: colors.primary, fontWeight: "700" },
  footerNote   : { textAlign: "center", fontSize: 11, color: colors.textLight, lineHeight: 17, paddingHorizontal: 10 },
});