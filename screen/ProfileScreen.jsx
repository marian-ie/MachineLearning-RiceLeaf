import React, { useState, useContext } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Switch, Modal, KeyboardAvoidingView, Platform, Alert, Image } from "react-native";
import { FontAwesomeIcon } from "@fortawesome/react-native-fontawesome";
import { faUser, faEnvelope, faLock, faEye, faEyeSlash, faRightFromBracket, faSun, faMoon, faTrash, faChevronRight, faShield, faCircleXmark, faFloppyDisk, faCamera } from "@fortawesome/free-solid-svg-icons";
import { changeUserPassword, updateProfilePic } from "../services/database.js";
import { ThemeContext } from "../App";
import * as ImagePicker from 'expo-image-picker';

const PwField = ({ icon, placeholder, value, onChangeText, secure, toggle, styles, colors }) => (
  <View style={styles.inputWrapper}>
    <View style={styles.inputIcon}>
      <FontAwesomeIcon icon={icon} size={14} color={colors.primary} />
    </View>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={colors.textLight}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secure}
      autoCapitalize="none"
    />
    <TouchableOpacity onPress={toggle} style={styles.eyeBtn}>
      <FontAwesomeIcon icon={secure ? faEyeSlash : faEye} size={14} color={colors.textLight} />
    </TouchableOpacity>
  </View>
);

const SettingRow = ({ icon, iconColor, label, sublabel, right, onPress, danger, styles, colors }) => (
  <TouchableOpacity style={styles.settingRow} onPress={onPress} activeOpacity={onPress ? 0.7 : 1} disabled={!onPress}>
    <View style={[styles.settingIcon, { backgroundColor: danger ? colors.pestBg : colors.borderLight }]}>
      <FontAwesomeIcon icon={icon} size={14} color={danger ? colors.pestBorder : iconColor} />
    </View>
    <View style={styles.settingMeta}>
      <Text style={[styles.settingLabel, danger && { color: colors.pestBorder }]}>{label}</Text>
      {sublabel ? <Text style={styles.settingSubLabel}>{sublabel}</Text> : null}
    </View>
    <View style={styles.settingRight}>{right}</View>
  </TouchableOpacity>
);

export default function ProfileScreen({ user, isDark, onToggleTheme, onLogout, onDeleteAccount }) {
  const { colors } = useContext(ThemeContext);
  const styles = getStyles(colors);

  // Load the saved picture if they have one, otherwise null
  const [profilePic,   setProfilePic]   = useState(user?.profilePic || null);

  const [pwModal,      setPwModal]      = useState(false);
  const [currentPw,    setCurrentPw]    = useState("");
  const [newPw,        setNewPw]        = useState("");
  const [confirmPw,    setConfirmPw]    = useState("");
  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);

  const [deleteModal,  setDeleteModal]  = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [logoutModal,  setLogoutModal]  = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : "??";

  const handleUpdatePicture = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "You need to allow access to your photos to change your profile picture.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, 
        aspect: [1, 1],
        quality: 0.5, 
      });

      if (!result.canceled) {
        const newImageUri = result.assets[0].uri;
        
        // 1. Update the UI instantly
        setProfilePic(newImageUri); 
        
        // 2. Update the user session object so it doesn't disappear when navigating tabs
        if (user) user.profilePic = newImageUri; 

        // 3. Save it permanently to the database
        const dbResult = await updateProfilePic(user.id, newImageUri);
        if (!dbResult.success) {
          Alert.alert("Notice", "Profile picture updated, but failed to save to database: " + dbResult.error);
        }
      }
    } catch (error) {
      console.error("Image Picker Error: ", error);
      Alert.alert("Error", "Something went wrong while trying to select an image.");
    }
  };

  const handleSavePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) { Alert.alert("Missing fields", "Please fill in all password fields."); return; }
    if (newPw !== confirmPw) { Alert.alert("Mismatch", "New password and confirmation do not match."); return; }
    if (newPw.length < 6) { Alert.alert("Too short", "Password must be at least 6 characters."); return; }
    
    const result = await changeUserPassword(user.id, currentPw, newPw);
    if (result.success) {
      setPwModal(false);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      Alert.alert("Success", "Password changed successfully.");
    } else {
      Alert.alert("Error", result.error);
    }
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText.trim().toLowerCase() !== "delete") {
      Alert.alert("Incorrect", 'Please type "delete" to confirm.'); return;
    }
    setDeleteModal(false);
    if (onDeleteAccount) onDeleteAccount();
  };

  return (
    <ScrollView style={styles.screen} showsVerticalScrollIndicator={false}>
      <View style={styles.profileCard}>
        
        {/* Avatar Container with Floating Camera Icon */}
        <View style={styles.avatarContainer}>
          {profilePic ? (
            <Image source={{ uri: profilePic }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
          
          <TouchableOpacity style={styles.editBadge} onPress={handleUpdatePicture} activeOpacity={0.8}>
            <FontAwesomeIcon icon={faCamera} size={12} color="#FFF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{user?.name}</Text>
        <View style={styles.emailRow}>
          <FontAwesomeIcon icon={faEnvelope} size={12} color={colors.textLight} />
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account Info</Text>
        <View style={styles.infoRow}>
          <View style={styles.settingIcon}>
            <FontAwesomeIcon icon={faUser} size={14} color={colors.primary} />
          </View>
          <View style={styles.settingMeta}>
            <Text style={styles.settingSubLabel}>Full Name</Text>
            <Text style={styles.settingLabel}>{user?.name}</Text>
          </View>
        </View>
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <View style={styles.settingIcon}>
            <FontAwesomeIcon icon={faEnvelope} size={14} color={colors.primary} />
          </View>
          <View style={styles.settingMeta}>
            <Text style={styles.settingSubLabel}>Email</Text>
            <Text style={styles.settingLabel}>{user?.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <SettingRow icon={faShield} iconColor={colors.primary} label="Change Password" sublabel="Update your login credentials" onPress={() => setPwModal(true)} right={<FontAwesomeIcon icon={faChevronRight} size={12} color={colors.textLight} />} styles={styles} colors={colors} />
        <View style={styles.divider} />
        <SettingRow icon={isDark ? faMoon : faSun} iconColor={colors.primary} label="Theme" sublabel={isDark ? "Dark mode is on" : "Light mode is on"} right={<Switch value={isDark} onValueChange={onToggleTheme} trackColor={{ false: colors.borderLight, true: colors.primary }} thumbColor={colors.white} />} styles={styles} colors={colors} />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Account Setting</Text>
        <SettingRow icon={faTrash} label="Delete Account" sublabel="Permanently remove your data" danger onPress={() => setDeleteModal(true)} right={<FontAwesomeIcon icon={faChevronRight} size={12} color={colors.pestBorder} />} styles={styles} colors={colors} />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => setLogoutModal(true)} activeOpacity={0.85}>
        <FontAwesomeIcon icon={faRightFromBracket} size={15} color={colors.white} />
        <Text style={styles.logoutBtnText}>Log Out</Text>
      </TouchableOpacity>
      <Text style={styles.version}>Rice Stress Lab v1.0.0</Text>

      {/* Change Password Modal */}
      <Modal visible={pwModal} transparent animationType="slide" onRequestClose={() => setPwModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <FontAwesomeIcon icon={faShield} size={16} color={colors.primary} />
                <Text style={styles.modalTitle}>Change Password</Text>
              </View>
              <TouchableOpacity onPress={() => setPwModal(false)}>
                <FontAwesomeIcon icon={faCircleXmark} size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Enter your current password then choose a new one.</Text>
            
            <PwField icon={faLock} placeholder="Current password" value={currentPw} onChangeText={setCurrentPw} secure={!showCurrent} toggle={() => setShowCurrent(p => !p)} styles={styles} colors={colors} />
            <PwField icon={faLock} placeholder="New password" value={newPw} onChangeText={setNewPw} secure={!showNew} toggle={() => setShowNew(p => !p)} styles={styles} colors={colors} />
            <PwField icon={faLock} placeholder="Confirm new password" value={confirmPw} onChangeText={setConfirmPw} secure={!showConfirm} toggle={() => setShowConfirm(p => !p)} styles={styles} colors={colors} />
            
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setPwModal(false)} activeOpacity={0.8}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSavePassword} activeOpacity={0.85}><FontAwesomeIcon icon={faFloppyDisk} size={14} color={colors.white} /><Text style={styles.saveBtnText}>Save</Text></TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Delete Account Modal */}
      <Modal visible={deleteModal} transparent animationType="slide" onRequestClose={() => setDeleteModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <FontAwesomeIcon icon={faTrash} size={16} color={colors.pestBorder} />
                <Text style={[styles.modalTitle, { color: colors.pestBorder }]}>Delete Account</Text>
              </View>
              <TouchableOpacity onPress={() => setDeleteModal(false)}>
                <FontAwesomeIcon icon={faCircleXmark} size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>This will permanently delete your account and all scan history. This action <Text style={{ fontWeight: "700", color: colors.pestBorder }}>cannot be undone.</Text></Text>
            <View style={styles.deleteWarningBox}><Text style={styles.deleteWarningText}>Type <Text style={{ fontWeight: "800" }}>"delete"</Text> below to confirm.</Text></View>
            <View style={styles.inputWrapper}>
              <TextInput style={[styles.input, { paddingLeft: 4 }]} placeholder='Type "delete" to confirm' placeholderTextColor={colors.textLight} value={deleteConfirmText} onChangeText={setDeleteConfirmText} autoCapitalize="none" />
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => { setDeleteModal(false); setDeleteConfirmText(""); }} activeOpacity={0.8}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount} activeOpacity={0.85}><FontAwesomeIcon icon={faTrash} size={14} color={colors.white} /><Text style={styles.deleteBtnText}>Delete</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Modal */}
      <Modal visible={logoutModal} transparent animationType="fade" onRequestClose={() => setLogoutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { paddingBottom: 22 }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <FontAwesomeIcon icon={faRightFromBracket} size={16} color={colors.primary} />
                <Text style={styles.modalTitle}>Log Out</Text>
              </View>
              <TouchableOpacity onPress={() => setLogoutModal(false)}>
                <FontAwesomeIcon icon={faCircleXmark} size={20} color={colors.textLight} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Are you sure you want to log out of Rice Stress Lab?</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setLogoutModal(false)} activeOpacity={0.8}><Text style={styles.cancelBtnText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={() => { setLogoutModal(false); if (onLogout) onLogout(); }} activeOpacity={0.85}><FontAwesomeIcon icon={faRightFromBracket} size={14} color={colors.white} /><Text style={styles.saveBtnText}>Log Out</Text></TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const getStyles = (colors) => StyleSheet.create({
  screen          : { flex: 1, backgroundColor: colors.appBg },
  profileCard     : { backgroundColor: colors.cardBg, borderRadius: 20, padding: 24, marginHorizontal: 18, marginTop: 18, marginBottom: 14, alignItems: "center", gap: 6 },
  
  avatarContainer : { position: "relative", marginBottom: 6 },
  avatarImage     : { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.primary },
  avatar          : { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center", shadowColor: colors.primary, shadowOpacity: 0.35, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 },
  editBadge       : { position: "absolute", bottom: 0, right: -4, backgroundColor: colors.primary, width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: colors.cardBg, elevation: 6, shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  
  avatarText      : { fontSize: 28, fontWeight: "800", color: "#FFF" },
  userName        : { fontSize: 20, fontWeight: "800", color: colors.primary },
  emailRow        : { flexDirection: "row", alignItems: "center", gap: 5 },
  userEmail       : { fontSize: 13, color: colors.textLight },
  sectionCard     : { backgroundColor: colors.cardBg, borderRadius: 16, padding: 18, marginHorizontal: 18, marginBottom: 14 },
  sectionTitle    : { fontSize: 14, fontWeight: "700", color: colors.primary, marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.6 },
  infoRow         : { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderColor: colors.borderLight },
  settingRow      : { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  settingIcon     : { width: 34, height: 34, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: colors.borderLight },
  settingMeta     : { flex: 1 },
  settingLabel    : { fontSize: 14, fontWeight: "600", color: colors.text },
  settingSubLabel : { fontSize: 11, color: colors.textLight, marginTop: 1 },
  settingRight    : { alignItems: "flex-end" },
  divider         : { height: 1, backgroundColor: colors.borderLight, marginVertical: 2 },
  logoutBtn       : { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 18, marginBottom: 10 },
  logoutBtnText   : { color: colors.white, fontWeight: "700", fontSize: 15 },
  version         : { textAlign: "center", fontSize: 11, color: colors.textLight, marginBottom: 30 },
  modalOverlay    : { flex: 1, backgroundColor: colors.modalOverlay, justifyContent: "flex-end" },
  modalCard       : { backgroundColor: colors.cardBg, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 22, gap: 14 },
  modalHeader     : { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  modalTitleRow   : { flexDirection: "row", alignItems: "center", gap: 8 },
  modalTitle      : { fontSize: 17, fontWeight: "800", color: colors.primary },
  modalSub        : { fontSize: 13, color: colors.textLight, lineHeight: 20 },
  inputWrapper    : { flexDirection: "row", alignItems: "center", backgroundColor: colors.appBg, borderRadius: 12, borderWidth: 1.5, borderColor: colors.borderLight, paddingHorizontal: 12, height: 50 },
  inputIcon       : { marginRight: 10 },
  input           : { flex: 1, fontSize: 14, color: colors.text },
  eyeBtn          : { padding: 4 },
  deleteWarningBox: { backgroundColor: colors.pestBg, borderRadius: 10, padding: 12 },
  deleteWarningText: { fontSize: 13, color: colors.pestBorder, lineHeight: 19 },
  modalActions    : { flexDirection: "row", gap: 10, marginTop: 4 },
  cancelBtn       : { flex: 1, borderRadius: 12, paddingVertical: 13, alignItems: "center", justifyContent: "center", backgroundColor: colors.borderLight },
  cancelBtnText   : { fontWeight: "700", fontSize: 14, color: colors.primary },
  saveBtn         : { flex: 1, borderRadius: 12, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: colors.primary },
  saveBtnText     : { fontWeight: "700", fontSize: 14, color: colors.white },
  deleteBtn       : { flex: 1, borderRadius: 12, paddingVertical: 13, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, backgroundColor: colors.pestBorder },
  deleteBtnText   : { fontWeight: "700", fontSize: 14, color: "#fff" },
});