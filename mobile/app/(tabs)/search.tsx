import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, SafeAreaView, FlatList, ActivityIndicator, TouchableOpacity, Modal, ScrollView, Keyboard } from "react-native";
import { CustomInput } from "../../src/components/CustomInput";
import { JobCard } from "../../src/components/JobCard";
import { COLORS, SPACING, ROUNDING } from "../../src/theme";
import { Search, SlidersHorizontal, ArrowLeft, X } from "lucide-react-native";
import api from "../../src/api";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { MotiView } from "moti";

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Filter States
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [filterType, setFilterType] = useState("");
  const [filterExperience, setFilterExperience] = useState("");
  const [filterRemote, setFilterRemote] = useState("");
  const [filterNationwide, setFilterNationwide] = useState(true);

  const JOB_TYPES = ["FULLTIME", "PARTTIME", "CONTRACTOR", "INTERN"];
  const EXP_LEVELS = ["Entry Level", "Mid Level", "Senior", "Executive"];
  const WORK_SETUPS = ["On-site", "Remote", "Hybrid"];

  const [currentLocation, setCurrentLocation] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      try {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') return;
        let loc = await Location.getCurrentPositionAsync({});
        let reverse = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
        if (reverse.length > 0) {
          const item = reverse[0];
          setCurrentLocation(`${item.city || item.region}${item.region ? `, ${item.region}` : ''}`);
        }
      } catch (err) {
        console.error("Location Error:", err);
      }
    })();
  }, []);

  const handleSearch = async () => {
    if (!query && !filterType && !filterExperience && !filterRemote) return;
    
    Keyboard.dismiss();
    setResults([]); // Instant visual feedback: clear previous list
    setLoading(true);
    setFilterModalVisible(false); // smoothly close modal while loading
    
    try {
      let finalQuery = query || "jobs";
      
      // Smart injection
      if (filterRemote === "Remote") finalQuery += " remote";
      if (filterExperience) finalQuery += ` ${filterExperience}`;

      const response = await api.get("/jobs/search", { 
        params: { 
          query: finalQuery,
          location: filterNationwide ? "India" : (currentLocation || undefined),
          jobType: filterType || undefined
        } 
      });
      setResults(response.data.data || []);
      setSearched(true);
    } catch (error) {
      console.error("Search Error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterType("");
    setFilterExperience("");
    setFilterRemote("");
    setFilterNationwide(false);
  };

  const FilterChip = ({ label, selected, onSelect }: any) => (
      <TouchableOpacity 
          style={[styles.chip, selected && styles.chipActive]} 
          onPress={() => onSelect(selected ? "" : label)}
      >
          <Text style={[styles.chipText, selected && styles.chipTextActive]}>{label}</Text>
      </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.searchRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color={COLORS.text} />
          </TouchableOpacity>
          <View style={styles.inputWrapper}>
             <CustomInput
               placeholder="Search jobs..."
               value={query}
               onChangeText={setQuery}
               icon={<Search size={20} color={COLORS.textSecondary} />}
               containerStyle={styles.inputContainer}
               onSubmitEditing={handleSearch}
               returnKeyType="search"
             />
          </View>
        </View>
        <View style={styles.filterRow}>
           <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
             <SlidersHorizontal size={18} color={COLORS.primary} />
             <Text style={styles.filterText}>Filters</Text>
             {(filterType || filterExperience || filterRemote) && (
                 <View style={styles.filterBadge} />
             )}
           </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={[styles.emptySubtitle, { marginTop: 12, fontWeight: '700', color: COLORS.primary }]}>
            Scanning 5+ platforms across India...
          </Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.job_id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={10}
          windowSize={5}
          renderItem={({ item, index }) => (
            <MotiView
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 300, delay: index * 50 }}
            >
                <JobCard
                  job={item}
                  onPress={() => router.push(`/job/${item.job_id}`)}
                />
            </MotiView>
          )}
          ListEmptyComponent={searched ? (
            <View style={styles.centered}>
              <Text style={styles.emptyTitle}>No results found</Text>
              <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
            </View>
          ) : (
             <View style={styles.centered}>
               <Search size={64} color={COLORS.border} strokeWidth={1} />
               <Text style={styles.emptySubtitle}>Search for your next opportunity</Text>
             </View>
          )}
        />
      )}

      {/* Advanced Filter Modal */}
      <Modal visible={filterModalVisible} animationType="slide" transparent={true} onRequestClose={() => setFilterModalVisible(false)}>
          <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                      <Text style={styles.modalTitle}>Search Filters</Text>
                      <TouchableOpacity onPress={() => setFilterModalVisible(false)} style={styles.closeBtn}>
                          <X size={24} color={COLORS.text} />
                      </TouchableOpacity>
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
                      <Text style={styles.sectionTitle}>Geo Coverage</Text>
                      <View style={styles.chipRow}>
                          <TouchableOpacity 
                            style={[styles.chip, filterNationwide && styles.chipActive]} 
                            onPress={() => setFilterNationwide(!filterNationwide)}
                          >
                              <Text style={[styles.chipText, filterNationwide && styles.chipTextActive]}>
                                {filterNationwide ? "✓ Nationwide (All India)" : "Search Nationwide (All India)"}
                              </Text>
                          </TouchableOpacity>
                      </View>

                      <Text style={styles.sectionTitle}>Job Type</Text>
                      <View style={styles.chipRow}>
                          {JOB_TYPES.map(t => <FilterChip key={t} label={t} selected={filterType === t} onSelect={setFilterType} />)}
                      </View>

                      <Text style={styles.sectionTitle}>Experience Level</Text>
                      <View style={styles.chipRow}>
                          {EXP_LEVELS.map(e => <FilterChip key={e} label={e} selected={filterExperience === e} onSelect={setFilterExperience} />)}
                      </View>

                      <Text style={styles.sectionTitle}>Work Setup</Text>
                      <View style={styles.chipRow}>
                          {WORK_SETUPS.map(w => <FilterChip key={w} label={w} selected={filterRemote === w} onSelect={setFilterRemote} />)}
                      </View>
                  </ScrollView>

                  <View style={styles.modalFooter}>
                      <TouchableOpacity style={styles.resetBtn} onPress={clearFilters}>
                          <Text style={styles.resetText}>Reset</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.applyBtn} onPress={handleSearch}>
                          <Text style={styles.applyText}>Apply Filters</Text>
                      </TouchableOpacity>
                  </View>
              </View>
          </View>
      </Modal>

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
  searchRow: { flexDirection: "row", alignItems: "center" },
  backButton: { marginRight: SPACING.md },
  inputWrapper: { flex: 1 },
  inputContainer: { marginBottom: 0 },
  filterRow: { marginTop: SPACING.md },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: ROUNDING.full,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingRight: 16,
  },
  filterText: { marginLeft: 8, color: COLORS.primary, fontWeight: "600", fontSize: 14 },
  filterBadge: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EB5757', marginLeft: 8 },
  listContent: { padding: SPACING.lg },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary },
  
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', padding: SPACING.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
  modalTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  closeBtn: { padding: 4, backgroundColor: COLORS.background, borderRadius: 16 },
  modalScroll: { paddingBottom: SPACING.xl },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text, marginTop: SPACING.md, marginBottom: SPACING.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: SPACING.md },
  chip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 100, backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border },
  chipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  chipTextActive: { color: COLORS.white },
  modalFooter: { flexDirection: 'row', gap: SPACING.md, marginTop: SPACING.md },
  resetBtn: { flex: 1, paddingVertical: 16, borderRadius: ROUNDING.xl, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  resetText: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  applyBtn: { flex: 2, paddingVertical: 16, borderRadius: ROUNDING.xl, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  applyText: { fontSize: 16, fontWeight: '700', color: COLORS.white },
});
