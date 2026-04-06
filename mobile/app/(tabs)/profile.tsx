import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, TextInput } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { COLORS, SPACING, ROUNDING } from "../../src/theme";
import { RootState } from "../../src/store";
import { logout, setAuth } from "../../src/store/authSlice";
import { useRouter } from "expo-router";
import { User, Settings, LogOut, ChevronRight, Briefcase, Award, MapPin, FileText, Share2, Camera, Check, X, UploadCloud, Trash2, Link as LinkIcon } from "lucide-react-native";
import { MotiView } from "moti";
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Linking from 'expo-linking';
import api from "../../src/api";

const LAN_IP = '192.168.1.33';

export default function ProfileScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user, token } = useSelector((state: RootState) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Local state for edits
  const [profileData, setProfileData] = useState({
      name: "",
      location: "",
      experience: "",
      role: ""
  });

  useEffect(() => {
    if (user) {
        setProfileData({
            name: user.name || "",
            location: user.preferences?.locations?.[0] || "",
            experience: user.experienceLevel || "",
            role: user.preferences?.roles?.[0] || ""
        });
    }
  }, [user]);

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => {
        dispatch(logout());
        router.replace("/(auth)/login");
      }},
    ]);
  };

  const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: 'images',
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.5,
          base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
          uploadFileBase64(result.assets[0].base64, 'avatar', 'jpg');
      }
  };

  const pickDocument = async () => {
      const result = await DocumentPicker.getDocumentAsync({
          type: 'application/pdf',
          copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0].name) {
          uploadFile(result.assets[0].uri, 'resume', result.assets[0].name);
      }
  };

  const uploadFile = async (uri: string, type: 'resume', fileName?: string) => {
      setLoading(true);
      try {
          const formData = new FormData();
          const fileUri = uri.startsWith('file://') ? uri : `file://${uri}`;
          
          formData.append('file', {
              uri: fileUri,
              name: fileName || 'resume.pdf',
              type: 'application/pdf',
          } as any);

          const res = await api.post('/users/resume', formData, {
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
          });

          if (token) dispatch(setAuth({ user: res.data, token }));
          Alert.alert("Success", "Resume uploaded successfully!");
      } catch (error) {
          console.error("Upload Error:", error);
          Alert.alert("Error", `Failed to upload resume.`);
      } finally {
          setLoading(false);
      }
  };

  const uploadFileBase64 = async (base64String: string, type: 'avatar', extension: string) => {
      setLoading(true);
      try {
          const endpoint = '/users/avatar-base64';
          const res = await api.post(endpoint, { base64: base64String, extension });

          if (token) dispatch(setAuth({ user: res.data, token }));
          Alert.alert("Success", `Profile picture uploaded successfully!`);
      } catch (error) {
          console.error("Upload Error:", error);
          Alert.alert("Error", `Failed to upload avatar.`);
      } finally {
          setLoading(false);
      }
  };

    const deleteResumeUrl = async (url: string) => {
        Alert.alert("Delete Resume", "Are you sure you want to remove this resume?", [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                setLoading(true);
                try {
                    const res = await api.delete('/users/resume', { data: { resumeUrl: url } });
                    if (token) dispatch(setAuth({ user: res.data, token }));
                    Alert.alert("Success", "Resume removed successfully.");
                } catch(e) {
                    Alert.alert("Error", "Failed to delete resume.");
                } finally {
                    setLoading(false);
                }
            }}
        ]);
    };

  const saveProfile = async () => {
      setLoading(true);
      try {
          const res = await api.put('/users/profile', {
              name: profileData.name,
              experienceLevel: profileData.experience,
              preferences: {
                  locations: [profileData.location],
                  roles: [profileData.role]
              }
          });
          if (token) dispatch(setAuth({ user: res.data, token }));
          setIsEditing(false);
          Alert.alert("Success", "Profile updated! Name is now: " + res.data.name);
      } catch (error) {
          Alert.alert("Error", "Failed to update profile.");
      } finally {
          setLoading(false);
      }
  };

  const avatarUri = user?.avatarUrl 
    ? `http://${LAN_IP}:3000${user.avatarUrl}` 
    : "https://i.pravatar.cc/150?u=" + user?.email;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
                {isEditing ? <X size={24} color={COLORS.error} /> : <Settings size={24} color={COLORS.text} />}
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isEditing ? "Edit Profile" : "Profile"}</Text>
            {isEditing ? (
                <TouchableOpacity onPress={saveProfile} style={styles.saveHeaderButton}>
                    <Check size={20} color={COLORS.white} />
                </TouchableOpacity>
            ) : (
                <TouchableOpacity hitSlop={15}><Share2 size={24} color={COLORS.text} /></TouchableOpacity>
            )}
        </View>

        <MotiView 
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={styles.profileCard}
        >
            <TouchableOpacity style={styles.avatarWrapper} onPress={pickImage} disabled={loading}>
                <Image 
                    key={user?.avatarUrl}
                    source={{ uri: avatarUri, cache: "reload" }} 
                    style={[styles.avatar, { width: 100, height: 100 }]} 
                    resizeMode="cover"
                    onError={(e) => console.log("Image Load Error:", e.nativeEvent.error)}
                />
                <View style={styles.editBadge}>
                    <Camera size={12} color={COLORS.white} />
                </View>
            </TouchableOpacity>
            
            {isEditing ? (
                <TextInput 
                    style={styles.nameInput} 
                    value={profileData.name} 
                    onChangeText={(t) => setProfileData({...profileData, name: t})}
                    placeholder="Your Name"
                />
            ) : (
                <Text style={styles.userName}>{user?.name || "Professional Seeker"}</Text>
            )}
            
            {isEditing ? (
                <TextInput 
                    style={styles.roleInput} 
                    value={profileData.role} 
                    onChangeText={(t) => setProfileData({...profileData, role: t})}
                    placeholder="Job Role"
                />
            ) : (
                <Text style={styles.userRole}>{user?.preferences?.roles?.[0] || "Update Role"}</Text>
            )}
            
            <View style={styles.statsRow}>
                <StatItem label="Applied" value="24" />
                <View style={styles.statDivider} />
                <StatItem label="Reviewed" value="12" />
                <View style={styles.statDivider} />
                <StatItem label="Interviews" value="3" />
            </View>
        </MotiView>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>
            {isEditing ? (
                <View style={styles.editForm}>
                    <EditField 
                        icon={<Briefcase size={18} color={COLORS.primary} />} 
                        label="Preferred Role" 
                        value={profileData.role}
                        onChange={(t) => setProfileData({...profileData, role: t})}
                    />
                    <EditField 
                        icon={<MapPin size={18} color={COLORS.primary} />} 
                        label="Location" 
                        value={profileData.location}
                        onChange={(t) => setProfileData({...profileData, location: t})}
                    />
                    <EditField 
                        icon={<Award size={18} color={COLORS.primary} />} 
                        label="Experience" 
                        value={profileData.experience}
                        onChange={(t) => setProfileData({...profileData, experience: t})}
                    />
                </View>
            ) : (
                <>
                    <ProfileItem icon={<Briefcase size={20} color={COLORS.primary} />} label="Preferred Role" value={user?.preferences?.roles?.[0] || "Not Set"} />
                    <ProfileItem icon={<MapPin size={20} color={COLORS.primary} />} label="Location" value={user?.preferences?.locations?.[0] || "Not Set"} />
                    <ProfileItem icon={<Award size={20} color={COLORS.primary} />} label="Experience" value={user?.experienceLevel || "Not Set"} />
                </>
            )}
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Integration</Text>
            <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.profileItem, { backgroundColor: COLORS.white, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 }]} 
                onPress={() => router.push('/connections')}
            >
                <View style={styles.itemLeft}>
                    <View style={[styles.iconBox, { backgroundColor: COLORS.primary + '15' }]}>
                        <LinkIcon size={22} color={COLORS.primary} />
                    </View>
                    <View>
                        <Text style={styles.itemLabel}>Linked Accounts</Text>
                        <Text style={styles.itemValue}>
                            {user?.connectedAccounts?.length || 0} Platforms Connected
                        </Text>
                    </View>
                </View>
                <ChevronRight size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
        </View>

        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resumes ({(user?.resumeUrls || []).length}/2)</Text>
            
            {(user?.resumeUrls || []).map((url, index) => (
                <View key={url + index} style={[styles.resumeCard, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }]}>
                    <TouchableOpacity 
                        style={[styles.resumeInfo, { flex: 1, marginRight: 10 }]} 
                        onPress={() => Linking.openURL(`http://${LAN_IP}:3000${url}`)}
                    >
                        <View style={styles.fileIcon}><FileText size={24} color="#EB5757" /></View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
                                {url.split('/').pop() || `resume-${index+1}.pdf`}
                            </Text>
                            <Text style={styles.fileSize}>Tap to view PDF</Text>
                        </View>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={{ width: 36, height: 36, backgroundColor: '#FFEBEB', borderRadius: 8, justifyContent: 'center', alignItems: 'center' }} 
                        onPress={() => deleteResumeUrl(url)} 
                        disabled={loading}
                    >
                        {loading ? <ActivityIndicator size="small" color="#EB5757" /> : <Trash2 size={18} color="#EB5757" />}
                    </TouchableOpacity>
                </View>
            ))}

            {(user?.resumeUrls || []).length < 2 && (
                <TouchableOpacity style={styles.resumeCard} onPress={pickDocument} disabled={loading}>
                    <View style={styles.resumeInfo}>
                        <View style={styles.fileIcon}><UploadCloud size={24} color={COLORS.primary} /></View>
                        <View>
                            <Text style={styles.fileName}>Upload Resume</Text>
                            <Text style={styles.fileSize}>PDF format preferred</Text>
                        </View>
                    </View>
                    {loading ? <ActivityIndicator color={COLORS.primary} /> : <ChevronRight size={20} color={COLORS.textSecondary} />}
                </TouchableOpacity>
            )}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Logout Session</Text>
        </TouchableOpacity>
      </ScrollView>
      {loading && <View style={styles.loadingOverlay}><Text style={styles.loadingText}>Updating...</Text></View>}
    </SafeAreaView>
  );
}

const StatItem = ({ label, value }: { label: string, value: string }) => (
    <View style={styles.statBox}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

const EditField = ({ icon, label, value, onChange }: { icon: any, label: string, value: string, onChange: (t: string) => void }) => (
    <View style={styles.editField}>
        <View style={styles.iconBoxSmall}>{icon}</View>
        <View style={{ flex: 1 }}>
            <Text style={styles.itemLabel}>{label}</Text>
            <TextInput style={styles.fieldInput} value={value} onChangeText={onChange} />
        </View>
    </View>
);

const ProfileItem = ({ icon, label, value }: { icon: any, label: string, value: string }) => (
    <TouchableOpacity style={styles.profileItem}>
        <View style={styles.itemLeft}>
            <View style={styles.iconBox}>{icon}</View>
            <View>
                <Text style={styles.itemLabel}>{label}</Text>
                <Text style={styles.itemValue}>{value}</Text>
            </View>
        </View>
        <ChevronRight size={20} color={COLORS.textSecondary} />
    </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 100 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 25 },
  headerTitle: { fontSize: 20, fontWeight: "900", color: COLORS.text },
  saveHeaderButton: { backgroundColor: COLORS.primary, width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  profileCard: { 
    backgroundColor: COLORS.white, 
    marginHorizontal: 25, 
    borderRadius: 40, 
    padding: 30, 
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5
  },
  avatarWrapper: { position: "relative", marginBottom: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50, borderWidth: 4, borderColor: COLORS.surfaceSecondary },
  editBadge: { position: "absolute", bottom: 0, right: 0, backgroundColor: COLORS.primary, width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: COLORS.white, justifyContent: "center", alignItems: "center" },
  userName: { fontSize: 22, fontWeight: "900", color: COLORS.text },
  userRole: { fontSize: 14, color: COLORS.textSecondary, fontWeight: "600", marginTop: 4 },
  nameInput: { fontSize: 20, fontWeight: "800", color: COLORS.text, borderBottomWidth: 1, borderBottomColor: COLORS.primary, paddingVertical: 4, textAlign: "center", width: "100%" },
  roleInput: { fontSize: 14, color: COLORS.textSecondary, borderBottomWidth: 1, borderBottomColor: COLORS.primary + '40', paddingVertical: 2, textAlign: "center", width: "80%", marginTop: 8 },
  statsRow: { flexDirection: "row", marginTop: 25, width: "100%", justifyContent: "space-between", alignItems: "center" },
  statBox: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 18, fontWeight: "900", color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "600", marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: COLORS.border },
  section: { marginTop: 35, paddingHorizontal: 25 },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text, marginBottom: 20 },
  profileItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  itemLeft: { flexDirection: "row", alignItems: "center", gap: 15 },
  iconBox: { width: 44, height: 44, borderRadius: 14, backgroundColor: COLORS.surfaceSecondary, justifyContent: "center", alignItems: "center" },
  iconBoxSmall: { width: 36, height: 36, borderRadius: 10, backgroundColor: COLORS.surfaceSecondary, justifyContent: "center", alignItems: "center", marginRight: 12 },
  itemLabel: { fontSize: 12, color: COLORS.textSecondary, fontWeight: "600" },
  itemValue: { fontSize: 15, fontWeight: "700", color: COLORS.text, marginTop: 2 },
  editForm: { backgroundColor: COLORS.white, padding: 15, borderRadius: 20, marginBottom: 10 },
  editField: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  fieldInput: { fontSize: 15, fontWeight: "700", color: COLORS.text, borderBottomWidth: 1, borderBottomColor: COLORS.border, paddingVertical: 4 },
  resumeCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.white, padding: 20, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border },
  resumeInfo: { flexDirection: "row", alignItems: "center", gap: 15 },
  fileIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: COLORS.surfaceSecondary, justifyContent: "center", alignItems: "center" },
  fileName: { fontSize: 15, fontWeight: "700", color: COLORS.text },
  fileSize: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  logoutButton: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, marginTop: 40, marginHorizontal: 25, paddingVertical: 18, borderRadius: 20, backgroundColor: COLORS.error + '10' },
  logoutText: { color: COLORS.error, fontWeight: "800", fontSize: 16 },
  loadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.7)', justifyContent: "center", alignItems: "center", zIndex: 100 },
  loadingText: { marginTop: 10, fontWeight: "700", color: COLORS.primary }
});
