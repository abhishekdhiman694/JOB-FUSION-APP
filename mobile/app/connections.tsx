import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image, ActivityIndicator, Alert } from "react-native";
import { COLORS, SPACING, ROUNDING } from "../src/theme";
import { ArrowLeft, CheckCircle2, ChevronRight, Linkedin, Globe, Briefcase, Link as LinkedinIcon } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../src/store";
import { updateUser } from "../src/store/authSlice";
import * as WebBrowser from "expo-web-browser";
import api from "../src/api";

const PLATFORMS = [
  { id: "linkedin", name: "LinkedIn", icon: <LinkedinIcon size={24} color="#0077B5" />, color: "#0077B5", loginUrl: "https://www.linkedin.com/login" },
  { id: "naukri", name: "Naukri", icon: <Briefcase size={24} color="#2F3C91" />, color: "#2F3C91", loginUrl: "https://www.naukri.com/nlogin/login" },
  { id: "indeed", name: "Indeed", icon: <Globe size={24} color="#2164f3" />, color: "#2164f3", loginUrl: "https://www.indeed.com/account/login" },
  { id: "google", name: "Google Jobs", icon: <Globe size={24} color="#34A853" />, color: "#34A853", loginUrl: "https://accounts.google.com/ServiceLogin" },
];

export default function ConnectionsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState<string | null>(null);

  const toggleConnection = async (platformId: string) => {
    const platform = PLATFORMS.find(p => p.id === platformId);
    const isConnected = user?.connectedAccounts?.includes(platformId);

    setLoading(platformId);
    try {
      // Step 1: Handle Login Portal for NEW connections
      if (!isConnected && platform?.loginUrl) {
         const result = await WebBrowser.openBrowserAsync(platform.loginUrl);
         if (result.type !== 'opened') {
            setLoading(null);
            return;
         }
      }

      // Step 2: Update Backend
      let newAccounts = [...(user?.connectedAccounts || [])];
      if (isConnected) {
        newAccounts = newAccounts.filter(a => a !== platformId);
      } else {
        newAccounts.push(platformId);
      }

      const res = await api.put("/users/profile", { connectedAccounts: newAccounts });
      dispatch(updateUser(res.data));
      
      Alert.alert(
        isConnected ? "Disconnected" : "Connected!",
        `Successfully ${isConnected ? 'unlinked' : 'linked'} your ${platformId.charAt(0).toUpperCase() + platformId.slice(1)} account.`
      );
    } catch (error) {
      console.error("Connection Toggle Error:", error);
      Alert.alert("Error", "Failed to update account connection.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Connected Accounts</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Unified Search Power</Text>
          <Text style={styles.infoText}>
            Link your professional accounts to unlock automated multi-source job aggregation. 
            Search across all platforms simultaneously.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Available Platforms</Text>
        
        {PLATFORMS.map((platform) => {
          const isConnected = user?.connectedAccounts?.includes(platform.id);
          return (
            <TouchableOpacity 
              key={platform.id} 
              style={styles.platformCard}
              onPress={() => toggleConnection(platform.id)}
            >
              <View style={[styles.iconBox, { backgroundColor: platform.color + '15' }]}>
                {platform.icon}
              </View>
              <View style={styles.platformInfo}>
                <Text style={styles.platformName}>{platform.name}</Text>
                <Text style={styles.platformStatus}>
                  {isConnected ? "Connected & Syncing" : "Not connected"}
                </Text>
              </View>
              <View style={styles.actionArea}>
                {loading === platform.id ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : isConnected ? (
                  <CheckCircle2 size={24} color={COLORS.success} />
                ) : (
                  <View style={styles.linkButton}>
                    <Text style={styles.linkText}>Link</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.syncAllButton} onPress={() => Alert.alert("Syncing", "Universal platform synchronization initiated...")}>
          <Text style={styles.syncAllText}>Sync All Platforms</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text },
  content: { padding: SPACING.lg },
  infoBox: {
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.lg,
    borderRadius: ROUNDING.xl,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  infoTitle: { fontSize: 18, fontWeight: "800", color: COLORS.primary, marginBottom: 8 },
  infoText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 20 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: COLORS.text, marginBottom: SPACING.md },
  platformCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: ROUNDING.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  platformInfo: { flex: 1 },
  platformName: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  platformStatus: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  actionArea: { paddingHorizontal: 4 },
  linkButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: ROUNDING.full,
  },
  linkText: { color: COLORS.white, fontSize: 12, fontWeight: "700" },
  footer: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  syncAllButton: {
    backgroundColor: COLORS.text,
    paddingVertical: 16,
    borderRadius: ROUNDING.xl,
    alignItems: "center",
  },
  syncAllText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
