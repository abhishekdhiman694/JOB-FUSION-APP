import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { COLORS, SPACING, ROUNDING } from '../theme';
import { MapPin, Briefcase, Zap } from 'lucide-react-native';
import { MotiView } from 'moti';

const { width } = Dimensions.get('window');

export const FeaturedJobCard = ({ job, onPress }: { job: any, onPress: () => void }) => {
  if (!job) return null;

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 600 }}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Zap size={12} color={COLORS.white} fill={COLORS.white} />
            <Text style={styles.badgeText}>Featured Opportunity</Text>
          </View>
          <Text style={styles.salary}>{job.job_salary_currency === 'USD' ? '$' : '₹'}{job.job_min_salary || '15k'}/mo</Text>
        </View>

        <Text style={styles.title} numberOfLines={2}>{job.job_title}</Text>
        
        <View style={styles.companyRow}>
          <View style={styles.logoContainer}>
            {job.employer_logo ? (
              <Image source={{ uri: job.employer_logo }} style={styles.logo} />
            ) : (
              <Briefcase size={20} color={COLORS.white} />
            )}
          </View>
          <View>
            <Text style={styles.companyName}>{job.employer_name}</Text>
            <View style={styles.locationRow}>
              <MapPin size={12} color="rgba(255,255,255,0.7)" />
              <Text style={styles.locationText}>{job.job_city || 'India'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.tag}><Text style={styles.tagText}>{job.job_employment_type?.replace('_', ' ') || "Full-time"}</Text></View>
          <View style={styles.applyNow}>
            <Text style={styles.applyText}>Apply Now</Text>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width - SPACING.lg * 2,
    backgroundColor: COLORS.primary,
    borderRadius: 32,
    padding: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100, gap: 6 },
  badgeText: { color: COLORS.white, fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  salary: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
  title: { fontSize: 22, fontWeight: '900', color: COLORS.white, marginBottom: 20, lineHeight: 28 },
  companyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  logoContainer: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  logo: { width: 30, height: 30, borderRadius: 6 },
  companyName: { color: COLORS.white, fontSize: 15, fontWeight: '700' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  locationText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '500' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  tag: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
  tagText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
  applyNow: { backgroundColor: COLORS.white, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 14 },
  applyText: { color: COLORS.primary, fontWeight: '800', fontSize: 14 },
});
