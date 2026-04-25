import React, { useState, useContext, useEffect, useRef } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Animated, Image } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faLeaf, faEnvelope, faLock, faEye, faEyeSlash, faUser, faRightToBracket, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { registerUser, loginUser, resetPasswordViaEmail } from "../services/database.js";
import { ThemeContext } from "../ThemeContext"; 

const Field = ({ icon, placeholder, value, onChangeText, secureEntry, toggleSecure, showToggle, keyboardType = "default", styles, colors }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  const animatedIsFloating = useRef(new Animated.Value(value ? 1 : 0)).current;
  const animatedIsFocused = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedIsFloating, {
      toValue: (isFocused || value !== "") ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();

    Animated.timing(animatedIsFocused, {
      toValue: isFocused ? 1 : 0,
      duration: 150,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelTop = animatedIsFloating.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 4], 
  });

  const labelFontSize = animatedIsFloating.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 10], 
  });

  const labelColor = animatedIsFocused.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.textLight, colors.primary], 
  });

  const borderColor = animatedIsFocused.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.borderLight, colors.primary],
  });

  return (
    <Animated.View style={[styles.inputWrapper, { borderColor }]}>
      <View style={styles.inputIcon}>
        <FontAwesomeIcon icon={icon} size={15} color={isFocused ? colors.primary : colors.textLight} />
      </View>
      
      <View style={styles.inputContainer}>
        <Animated.Text style={[styles.floatingLabel, { top: labelTop, fontSize: labelFontSize, color: labelColor }]}>
          {placeholder}
        </Animated.Text>
        
        <TextInput
          style={[styles.input, (isFocused || value !== "") && { paddingTop: 14 }]} 
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>

      {showToggle && (
        <TouchableOpacity onPress={toggleSecure} style={styles.eyeBtn}>
          <FontAwesomeIcon icon={secureEntry ? faEyeSlash : faEye} size={15} color={colors.textLight} />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

export default function LoginRegisterScreen({ onLoginSuccess }) {
  const { colors } = useContext(ThemeContext); 
  const styles = getStyles(colors);            

  const [activeTab, setActiveTab]         = useState("login");
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm,  setShowConfirm]    = useState(false);
  const [isLoading, setIsLoading]         = useState(false);

  const [forgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotEmail, setForgotEmail]               = useState("");
  const [forgotNewPassword, setForgotNewPassword]   = useState("");
  const [showForgotPw, setShowForgotPw]             = useState(false);

  const [loginEmail,    setLoginEmail]    = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regFirstName,  setRegFirstName]  = useState("");
  const [regMiddleName, setRegMiddleName] = useState("");
  const [regLastName,   setRegLastName]   = useState("");
  const [regSuffix,     setRegSuffix]     = useState("");
  
  const [regEmail,      setRegEmail]      = useState("");
  const [regPassword,   setRegPassword]   = useState("");
  const [regConfirm,    setRegConfirm]    = useState("");

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }
    
    setIsLoading(true);
    const result = await loginUser(loginEmail, loginPassword);
    setIsLoading(false);
    
    if (result.success) {
      if (onLoginSuccess) onLoginSuccess(result.user);
    } else {
      Alert.alert("Login Failed", result.error);
    }
  };

  const handleRegister = async () => {
    if (!regFirstName || !regLastName || !regEmail || !regPassword) {
      Alert.alert("Error", "Please fill in all required fields (First Name, Last Name, Email, Password).");
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

    setIsLoading(true); 

    const fullName = [
      regFirstName.trim(), 
      regMiddleName.trim(), 
      regLastName.trim(), 
      regSuffix.trim()
    ].filter(Boolean).join(" "); 

    const result = await registerUser(fullName, regEmail, regPassword);
    
    setIsLoading(false); 
    
    if (result.success) {
      Alert.alert("Success", "Registration Successfully!");
      
      setRegFirstName("");
      setRegMiddleName("");
      setRegLastName("");
      setRegSuffix("");
      setRegPassword("");
      setRegConfirm("");
      
      setLoginEmail(regEmail);
      setRegEmail("");
      
      setActiveTab("login");
      
    } else {
      Alert.alert("Registration Failed", result.error);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail || !forgotNewPassword) {
      Alert.alert("Error", "Please enter your email and a new password.");
      return;
    }
    if (forgotNewPassword.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    const result = await resetPasswordViaEmail(forgotEmail, forgotNewPassword);
    setIsLoading(false);

    if (result.success) {
      Alert.alert("Success", "Your password has been reset successfully. Please log in.");
      setForgotModalVisible(false);
      setForgotEmail("");
      setForgotNewPassword("");

      setLoginEmail(forgotEmail); 
    } else {
      Alert.alert("Reset Failed", result.error);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView 
        contentContainerStyle={styles.scroll} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.brand}>
          
          <Image 
            source={require('../assets/logo.jpg')} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
          
          <Text style={styles.appName}>Rice Stress Lab</Text>
          <Text style={styles.appSub}>Rice plant stress analytics</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.tabRow}>
            <TouchableOpacity style={[styles.tab, activeTab === "login" && styles.tabActive]} onPress={() => setActiveTab("login")} activeOpacity={0.8} disabled={isLoading}>
              <FontAwesomeIcon icon={faRightToBracket} size={13} color={activeTab === "login" ? "#FFF" : colors.primary} />
              <Text style={[styles.tabText, activeTab === "login" && styles.tabTextActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.tab, activeTab === "register" && styles.tabActive]} onPress={() => setActiveTab("register")} activeOpacity={0.8} disabled={isLoading}>
              <FontAwesomeIcon icon={faUserPlus} size={13} color={activeTab === "register" ? "#FFF" : colors.primary} />
              <Text style={[styles.tabText, activeTab === "register" && styles.tabTextActive]}>Register</Text>
            </TouchableOpacity>
          </View>

          {activeTab === "login" && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Welcome back</Text>
              <Text style={styles.formSub}>Sign in to continue monitoring your rice plants.</Text>
              
              <Field icon={faEnvelope} placeholder="Email address" value={loginEmail} onChangeText={setLoginEmail} keyboardType="email-address" styles={styles} colors={colors} />
              <Field icon={faLock} placeholder="Password" value={loginPassword} onChangeText={setLoginPassword} secureEntry={!showPassword} showToggle toggleSecure={() => setShowPassword(p => !p)} styles={styles} colors={colors} />
              
              <TouchableOpacity style={styles.forgotBtn} onPress={() => setForgotModalVisible(true)} disabled={isLoading}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} activeOpacity={0.85} disabled={isLoading}>
                {isLoading ? (
                   <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faRightToBracket} size={15} color="#FFF" />
                    <Text style={styles.primaryBtnText}>Login</Text>
                  </>
                )}
              </TouchableOpacity>

              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => setActiveTab("register")} disabled={isLoading}><Text style={styles.switchLink}>Register</Text></TouchableOpacity>
              </View>
            </View>
          )}

          {activeTab === "register" && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Create account</Text>
              <Text style={styles.formSub}>Join Rice Stress Lab and start scanning your plants.</Text>
              
              <Field icon={faUser} placeholder="First Name" value={regFirstName} onChangeText={setRegFirstName} styles={styles} colors={colors} />
              <Field icon={faUser} placeholder="Middle Name (Optional)" value={regMiddleName} onChangeText={setRegMiddleName} styles={styles} colors={colors} />
              <Field icon={faUser} placeholder="Last Name" value={regLastName} onChangeText={setRegLastName} styles={styles} colors={colors} />
              <Field icon={faUser} placeholder="Suffix (Optional, e.g., Jr.)" value={regSuffix} onChangeText={setRegSuffix} styles={styles} colors={colors} />
              
              <Field icon={faEnvelope} placeholder="Email address" value={regEmail} onChangeText={setRegEmail} keyboardType="email-address" styles={styles} colors={colors} />
              <Field icon={faLock} placeholder="Password" value={regPassword} onChangeText={setRegPassword} secureEntry={!showPassword} showToggle toggleSecure={() => setShowPassword(p => !p)} styles={styles} colors={colors} />
              <Field icon={faLock} placeholder="Confirm password" value={regConfirm} onChangeText={setRegConfirm} secureEntry={!showConfirm} showToggle toggleSecure={() => setShowConfirm(p => !p)} styles={styles} colors={colors} />
              
              <TouchableOpacity style={styles.primaryBtn} onPress={handleRegister} activeOpacity={0.85} disabled={isLoading}>
                 {isLoading ? (
                   <ActivityIndicator color="#FFF" size="small" />
                ) : (
                  <>
                    <FontAwesomeIcon icon={faUserPlus} size={15} color="#FFF" />
                    <Text style={styles.primaryBtnText}>Create Account</Text>
                  </>
                )}
              </TouchableOpacity>
              
              <View style={styles.switchRow}>
                <Text style={styles.switchText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => setActiveTab("login")} disabled={isLoading}><Text style={styles.switchLink}>Login</Text></TouchableOpacity>
              </View>
            </View>
          )}
        </View>
        <Text style={styles.footerNote}>By continuing you agree to our Terms of Service and Privacy Policy.</Text>
      </ScrollView>

      <Modal visible={forgotModalVisible} transparent animationType="slide" onRequestClose={() => setForgotModalVisible(false)}>
        <KeyboardAvoidingView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: "flex-end" }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={{ backgroundColor: colors.cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: Platform.OS === "ios" ? 40 : 36, gap: 14 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: colors.primary }}>Reset Password</Text>
            <Text style={{ fontSize: 13, color: colors.textLight, marginBottom: 8 }}>Enter your registered email address and your new password.</Text>
            
            <Field icon={faEnvelope} placeholder="Registered Email" value={forgotEmail} onChangeText={setForgotEmail} keyboardType="email-address" styles={styles} colors={colors} />
            <Field icon={faLock} placeholder="New Password" value={forgotNewPassword} onChangeText={setForgotNewPassword} secureEntry={!showForgotPw} showToggle toggleSecure={() => setShowForgotPw(p => !p)} styles={styles} colors={colors} />
            
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1, backgroundColor: colors.borderLight, height: 48 }]} onPress={() => setForgotModalVisible(false)} disabled={isLoading}>
                <Text style={{ color: colors.primary, fontWeight: "700" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.primaryBtn, { flex: 1, height: 48 }]} onPress={handleForgotPassword} disabled={isLoading}>
                 {isLoading ? <ActivityIndicator color="#FFF" size="small" /> : <Text style={styles.primaryBtnText}>Reset Password</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
    </KeyboardAvoidingView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  screen       : { flex: 1, backgroundColor: colors.appBg },
  scroll       : { paddingHorizontal: 18, paddingTop: 52, paddingBottom: 120 }, 
  brand        : { alignItems: "center", marginBottom: 28 },
  
  logoImage    : { width: 120, height: 120, borderRadius: 24, marginBottom: 12, backgroundColor: "#FFF" },
  
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
  
  inputWrapper : { flexDirection: "row", alignItems: "center", backgroundColor: colors.appBg, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 12, height: 54 },
  inputIcon    : { marginRight: 10 },
  inputContainer: { flex: 1, height: "100%", justifyContent: "center" },
  floatingLabel: { position: "absolute", left: 0, fontWeight: "500" },
  input        : { flex: 1, fontSize: 14, color: colors.text, paddingVertical: 0 },
  
  eyeBtn       : { padding: 4, marginLeft: 8 },
  forgotBtn    : { alignSelf: "flex-end", marginTop: -4 },
  forgotText   : { fontSize: 12, color: colors.primary, fontWeight: "600" },
  primaryBtn   : { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 4, height: 54 }, 
  primaryBtnText: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  switchRow    : { flexDirection: "row", justifyContent: "center", marginTop: 4 },
  switchText   : { fontSize: 13, color: colors.textLight },
  switchLink   : { fontSize: 13, color: colors.primary, fontWeight: "700" },
  footerNote   : { textAlign: "center", fontSize: 11, color: colors.textLight, lineHeight: 17, paddingHorizontal: 10 },
});