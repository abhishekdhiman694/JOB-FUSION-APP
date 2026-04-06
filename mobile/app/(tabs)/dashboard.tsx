import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Image, ActivityIndicator, RefreshControl } from "react-native";
import { useSelector } from "react-redux";
import { COLORS, SPACING, ROUNDING } from "../../src/theme";
import { RootState } from "../../src/store";
import { CircularProgress } from "../../src/components/CircularProgress";
import { JobCard } from "../../src/components/JobCard";
import { Bell, MoreHorizontal, Briefcase, Star, TrendingUp, ChevronRight, Inbox } from "lucide-react-native";
import { MotiView } from "moti";
import api from "../../src/api";
import { useRouter } from "expo-router";

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState("All jobs");
  const [stats, setStats] = useState({ appliedCount: 0, totalPotentialIncome: 0, profileCompletion: 0, avgRating: 4.8 });
  const [history, setHistory] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const TABS = ["All jobs", "Applied", "Saved"];

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, historyRes, savedRes] = await Promise.all([
        api.get("/dashboard/stats"),
        api.get("/dashboard/history"),
        api.get("/saved-jobs")
      ]);
      setStats(statsRes.data);
      setHistory(historyRes.data);
      setSavedJobs(savedRes.data);
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const getFilteredJobs = () => {
    if (activeTab === "Saved") return savedJobs.map(sj => sj.jobData); // SavedJobs schema stores jobData
    if (activeTab === "Applied") return history.filter(h => h.actionType === 'apply').map(h => ({
        job_id: h.jobId,
        job_title: h.jobTitle,
        employer_name: h.employerName,
        employer_logo: h.employerLogo,
        job_city: h.jobCity,
        job_country: h.jobCountry,
        job_max_salary: h.salaryMax,
        job_salary_currency: h.salaryCurrency,
        job_publisher: 'Applied'
    }));
    
    // Combine for 'All jobs'
    const combined = [...savedJobs.map(s => s.jobData)];
    history.forEach(h => {
        if (!combined.find(c => c.job_id === h.jobId)) {
            combined.push({
                job_id: h.jobId,
                job_title: h.jobTitle,
                employer_name: h.employerName,
                employer_logo: h.employerLogo,
                job_city: h.jobCity,
                job_country: h.jobCountry,
                job_max_salary: h.salaryMax,
                job_salary_currency: h.salaryCurrency,
                job_publisher: h.actionType === 'apply' ? 'Applied' : 'Viewed'
            });
        }
    });
    return combined;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity style={styles.notificationButton} onPress={() => router.push('/(tabs)/profile')}>
          <Bell size={22} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 600 }}
          style={styles.overviewSection}
        >
          <View style={styles.overviewHeader}>
            <Text style={styles.overviewTitle}>Overview</Text>
            <TouchableOpacity><MoreHorizontal size={20} color={COLORS.textSecondary} /></TouchableOpacity>
          </View>
          
          <View style={styles.statsRow}>
            <View style={styles.chartCard}>
              <View style={styles.badge}>
                <TrendingUp size={12} color="#EB5757" />
                <Text style={styles.badgeText}>You’re on top 15%</Text>
              </View>
              <CircularProgress size={120} strokeWidth={12} percentage={stats.profileCompletion || 0} />
              <Text style={styles.chartLabel}>Profile Strenght</Text>
            </View>

            <View style={styles.infoCol}>
                <View style={styles.infoCard}>
                    <View style={[styles.infoIcon, { backgroundColor: '#F2994A20' }]}>
                        <Briefcase size={18} color="#F2994A" />
                    </View>
                    <View>
                        <Text style={styles.infoValue}>{stats.appliedCount} Jobs</Text>
                        <Text style={styles.infoLabel}>Applications</Text>
                    </View>
                </View>
                <View style={styles.infoCard}>
                    <View style={[styles.infoIcon, { backgroundColor: '#FFD70020' }]}>
                        <Star size={18} color="#FFD700" fill="#FFD700" />
                    </View>
                    <View>
                        <Text style={styles.infoValue}>{stats.avgRating}</Text>
                        <Text style={styles.infoLabel}>Avg. Rating</Text>
                    </View>
                </View>
            </View>
          </View>

          <TouchableOpacity style={styles.incomeCard}>
             <View style={styles.incomeInfo}>
                <View style={[styles.infoIcon, { backgroundColor: '#EB575720' }]}>
                    <TrendingUp size={20} color="#EB5757" />
                </View>
                <View>
                    <Text style={styles.infoLabel}>Potential Earnings (Yearly)</Text>
                    <Text style={styles.incomeValue}>${stats.totalPotentialIncome?.toLocaleString() || '0'}</Text>
                </View>
             </View>
             <ChevronRight size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </MotiView>

        <View style={styles.tabsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={[styles.tab, activeTab === tab && styles.activeTab]}
              >
                <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.listContainer}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
          ) : getFilteredJobs().length > 0 ? (
            getFilteredJobs().map((job) => (
              <JobCard
                key={job.job_id}
                job={job}
                onPress={() => router.push(`/job/${job.job_id}`)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
                <Inbox size={48} color={COLORS.border} strokeWidth={1.5} />
                <Text style={styles.emptyText}>No {activeTab.toLowerCase()} to show yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  headerTitle: { fontSize: 24, fontWeight: "900", color: COLORS.text, textAlign: "center", flex: 1, marginLeft: 44 },
  notificationButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: COLORS.border },
  scrollContent: { paddingBottom: 40 },
  overviewSection: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    padding: SPACING.md,
    borderRadius: ROUNDING.xxl,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.xl,
  },
  overviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.lg },
  overviewTitle: { fontSize: 18, fontWeight: "800", color: COLORS.text },
  statsRow: { flexDirection: "row", gap: SPACING.md, marginBottom: SPACING.lg },
  chartCard: { flex: 1.2, backgroundColor: COLORS.background, padding: SPACING.md, borderRadius: ROUNDING.xl, alignItems: "center" },
  badge: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 16, gap: 4 },
  badgeText: { fontSize: 10, fontWeight: "700", color: "#EB5757" },
  chartLabel: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary, marginTop: 12 },
  infoCol: { flex: 1, gap: SPACING.md },
  infoCard: { backgroundColor: COLORS.background, padding: SPACING.md, borderRadius: ROUNDING.xl, flex: 1, justifyContent: "center", alignItems: "center" },
  infoIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 6 },
  infoValue: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  infoLabel: { fontSize: 11, color: COLORS.textSecondary, fontWeight: "600" },
  incomeCard: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.background, padding: SPACING.md, borderRadius: ROUNDING.xl },
  incomeInfo: { flexDirection: "row", alignItems: "center", gap: 12 },
  incomeValue: { fontSize: 20, fontWeight: "800", color: COLORS.text },
  tabsContainer: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.lg },
  tab: { marginRight: 24, paddingVertical: 8 },
  activeTab: { borderBottomWidth: 2, borderBottomColor: COLORS.primary },
  tabText: { fontSize: 15, fontWeight: "600", color: COLORS.textSecondary },
  activeTabText: { color: COLORS.primary },
  listContainer: { paddingHorizontal: SPACING.lg },
  emptyContainer: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
  emptyText: { marginTop: 12, fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, textAlign: 'center' },
});
