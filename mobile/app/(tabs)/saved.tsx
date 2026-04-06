import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { COLORS, SPACING, ROUNDING } from "../../src/theme";
import { RootState } from "../../src/store";
import { JobCard } from "../../src/components/JobCard";
import { setSavedJobs, setLoading } from "../../src/store/jobsSlice";
import api from "../../src/api";
import { useRouter } from "expo-router";
import { Bookmark } from "lucide-react-native";

export default function SavedJobsScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { savedJobs, loading } = useSelector((state: RootState) => state.jobs);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSavedJobs = async () => {
    dispatch(setLoading(true));
    try {
      const response = await api.get("/saved-jobs");
      dispatch(setSavedJobs(response.data.map(job => ({
        ...job,
        id: job.externalJobId
      }))));
    } catch (error) {
      console.error("Fetch Saved Jobs Error:", error);
    } finally {
      dispatch(setLoading(false));
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSavedJobs();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Saved Jobs</Text>
        <Text style={styles.subtitle}>{savedJobs.length} jobs bookmarked</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={savedJobs}
          keyExtractor={(item) => item.id || item.originalLink}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              isSaved={true}
              onPress={() => router.push(`/job/${item.id || encodeURIComponent(item.originalLink)}`)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.centered}>
              <View style={styles.iconCircle}>
                <Bookmark size={40} color={COLORS.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>Your bookmarks are empty</Text>
              <Text style={styles.emptySubtitle}>Save jobs you're interested in to apply later.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: { fontSize: 24, fontWeight: "800", color: COLORS.text },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  listContent: { padding: SPACING.lg },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.lg,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: "center", paddingHorizontal: 40 },
});
