import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, FlatList, TextInput, ActivityIndicator, Alert, RefreshControl } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "expo-router";
import { COLORS, SPACING, ROUNDING } from "../../src/theme";
import { RootState } from "../../src/store";
import { JobCard } from "../../src/components/JobCard";
import { CategoryScroll } from "../../src/components/CategoryScroll";
import { FeaturedJobCard } from "../../src/components/FeaturedJobCard";
import { setTrending, setRecommended, setLoading } from "../../src/store/jobsSlice";
import api from "../../src/api";
import { Bell, MapPin, Search, SlidersHorizontal, ChevronRight, Briefcase } from "lucide-react-native";
import { MotiView } from "moti";
import * as Location from "expo-location";

const LAN_IP = '192.168.1.33';

const TOP_COMPANIES = [
  { id: '1', name: 'Google', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png' },
  { id: '2', name: 'Meta', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/1200px-Meta_Platforms_Inc._logo.svg.png' },
  { id: '3', name: 'Zomato', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Zomato_logo.png/1200px-Zomato_logo.png' },
];

export default function HomeScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { trending, recommended, loading } = useSelector((state: RootState) => state.jobs);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentLocation, setCurrentLocation] = useState("India");
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async (query?: string, locationStr?: string) => {
    dispatch(setLoading(true));
    
    // Fetch Trending/Featured
    try {
      const res = await api.get("/jobs/trending");
      dispatch(setTrending(res.data));
    } catch (error) {
      console.error("Trending Jobs Error:", error);
    }

    // Fetch Recommended/Categorized across India
    try {
      const categoryQuery = selectedCategory === "All" ? "" : selectedCategory;
      const baseQuery = user?.preferences?.roles?.[0] || "Software Engineer";
      const q = query || (categoryQuery ? `${categoryQuery} jobs` : baseQuery);
      
      console.log(`[HomeScreen] Fetching National Jobs for: ${q}`);
      const res = await api.get("/jobs/search", { 
        params: { 
          query: q, 
          location: locationStr || "India" 
        } 
      });
      dispatch(setRecommended(res.data.data));
    } catch (error) {
      console.error("Recommended Jobs Error:", error);
    } finally {
      dispatch(setLoading(false));
      setRefreshing(false);
    }
  }, [selectedCategory, user]);

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          fetchData();
          return;
        }

        let loc = await Location.getCurrentPositionAsync({});
        let reverse = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });

        if (reverse.length > 0) {
          const item = reverse[0];
          const locStr = `${item.city || item.region}${item.region ? `, ${item.region}` : ''}`;
          setCurrentLocation(locStr);
          fetchData(undefined, locStr);
        } else {
          fetchData();
        }
      } catch (err) {
        console.error("Location Error:", err);
        fetchData();
      }
    })();
  }, [selectedCategory]); // Reloader on category change

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleNotification = () => {
    Alert.alert("Notifications", "You are all caught up! No new job alerts currently.");
  };

  const handleBookmark = (jobId: string) => {
    Alert.alert("Saved", "Job listing has been saved to your profile.");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.userRow} onPress={() => router.push('/(tabs)/profile')}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: user?.avatarUrl ? `http://${LAN_IP}:3000${user.avatarUrl}` : "https://i.pravatar.cc/100?u=" + user?.email }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.greeting}>Hey, {user?.name?.split(' ')[0] || 'User'} 👋</Text>
            <View style={styles.locationRow}>
              <MapPin size={12} color={COLORS.primary} />
              <Text style={styles.locationCity}>{currentLocation}</Text>
            </View>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.notificationButton} onPress={handleNotification}>
          <Bell size={22} color={COLORS.text} />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />}
      >
        <View style={styles.searchSection}>
            <TouchableOpacity 
                style={styles.searchBar}
                activeOpacity={0.8}
                onPress={() => router.push('/(tabs)/search')}
            >
                <Search size={20} color={COLORS.textSecondary} />
                <Text style={styles.searchPlaceholder}>Search "Product Designer" in India...</Text>
                <View style={styles.filterBar}>
                    <SlidersHorizontal size={16} color={COLORS.white} />
                </View>
            </TouchableOpacity>
        </View>

        <View style={styles.featuredSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Featured For You</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredHorizontal}>
                {trending.length > 0 ? (
                  trending.slice(0, 3).map((job) => (
                    <FeaturedJobCard 
                      key={job.job_id} 
                      job={job} 
                      onPress={() => router.push(`/job/${job.job_id}`)} 
                    />
                  ))
                ) : (
                  <View style={styles.featuredPlaceholder}>
                    <ActivityIndicator color={COLORS.white} />
                  </View>
                )}
            </ScrollView>
        </View>

        <View style={styles.categorySection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Specializations</Text>
                <TouchableOpacity onPress={() => setSelectedCategory("All")}>
                    <Text style={styles.seeAll}>Reset</Text>
                </TouchableOpacity>
            </View>
            <CategoryScroll selectedCategory={selectedCategory} onSelect={setSelectedCategory} />
        </View>

        <View style={styles.companiesSection}>
          <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Top Hiring Companies</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.companiesScroll}>
            {TOP_COMPANIES.map(company => (
              <TouchableOpacity key={company.id} style={styles.companyCard}>
                <Image source={{ uri: company.logo }} style={styles.companyLogo} />
                <Text style={styles.companyNameText}>{company.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.recommendedSection}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{selectedCategory === "All" ? "Recommended For You" : `${selectedCategory} Roles`}</Text>
                <TouchableOpacity onPress={() => router.push('/(tabs)/search')}>
                  <Text style={styles.seeAll}>View All</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.listContainer}>
              {loading && recommended.length === 0 ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />
              ) : recommended.length > 0 ? (
                recommended.map((job) => (
                  <JobCard
                    key={job.job_id}
                    job={job}
                    onPress={() => router.push(`/job/${job.job_id}`)}
                    onBookmark={() => handleBookmark(job.job_id)}
                  />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <Briefcase size={40} color={COLORS.border} />
                  <Text style={styles.emptyText}>No {selectedCategory} jobs found in your area.</Text>
                </View>
              )}
            </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 60 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 20,
  },
  userRow: { flexDirection: "row", alignItems: "center" },
  avatarContainer: { width: 50, height: 50, borderRadius: 18, overflow: "hidden", marginRight: 15, borderWidth: 2, borderColor: COLORS.white },
  avatar: { width: "100%", height: "100%" },
  headerText: { justifyContent: "center" },
  greeting: { fontSize: 13, color: COLORS.textSecondary, fontWeight: "500" },
  locationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  locationCity: { fontSize: 16, fontWeight: "800", color: COLORS.text },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  notificationDot: { position: "absolute", top: 12, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, borderWidth: 2, borderColor: COLORS.white },
  searchSection: { paddingHorizontal: 25, marginBottom: 25 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, height: 60, borderRadius: 20, paddingHorizontal: 20, borderWidth: 1, borderColor: COLORS.border },
  searchPlaceholder: { flex: 1, marginLeft: 15, fontSize: 14, color: COLORS.textSecondary, fontWeight: "500" },
  filterBar: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.text, justifyContent: "center", alignItems: "center" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: "900", color: COLORS.text },
  seeAll: { fontSize: 13, color: COLORS.primary, fontWeight: "700" },
  featuredSection: { marginBottom: 30 },
  featuredHorizontal: { paddingHorizontal: 25, gap: 20 },
  featuredPlaceholder: { width: 300, height: 180, backgroundColor: COLORS.primary, borderRadius: 32, justifyContent: "center", alignItems: "center" },
  categorySection: { marginBottom: 30 },
  companiesSection: { marginBottom: 30 },
  companiesScroll: { paddingHorizontal: 25, gap: 15 },
  companyCard: { alignItems: 'center', backgroundColor: COLORS.white, padding: 15, borderRadius: 24, borderWidth: 1, borderColor: COLORS.border, minWidth: 100 },
  companyLogo: { width: 40, height: 40, resizeMode: 'contain', marginBottom: 8 },
  companyNameText: { fontSize: 12, fontWeight: '700', color: COLORS.text },
  recommendedSection: { paddingHorizontal: 0 },
  listContainer: { paddingHorizontal: 25 },
  emptyContainer: { alignItems: 'center', marginTop: 40, opacity: 0.5 },
  emptyText: { marginTop: 12, fontSize: 14, fontWeight: '600', color: COLORS.textSecondary, textAlign: 'center' },
});
