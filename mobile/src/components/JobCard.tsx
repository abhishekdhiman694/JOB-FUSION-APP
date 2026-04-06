import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, SPACING, ROUNDING } from '../theme';
import { Bookmark, MapPin, Clock3, Users } from 'lucide-react-native';
import { MotiView } from 'moti';

const getSourceColor = (publisher: string) => {
  const p = publisher?.toLowerCase();
  if (p?.includes('linkedin')) return '#0077B5';
  if (p?.includes('naukri')) return '#2F3C91';
  if (p?.includes('indeed')) return '#2164f3';
  if (p?.includes('glassdoor')) return '#0caa41';
  return COLORS.textSecondary;
};

export const JobCard = ({ job, onPress, isSaved = false, onBookmark }: { job: any, onPress: () => void, isSaved?: boolean, onBookmark?: () => void }) => {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500 }}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.85} style={styles.card}>
        <View style={styles.header}>
            <View style={styles.companyRow}>
                <View style={styles.logoContainer}>
                    {job.employer_logo ? (
                        <Image source={{ uri: job.employer_logo }} style={styles.logo} />
                    ) : (
                        <View style={styles.logoPlaceholder}><Text style={styles.placeholderText}>{job.employer_name?.charAt(0)}</Text></View>
                    )}
                </View>
                <View style={styles.titleCol}>
                    <View style={styles.publisherRow}>
                      <Text style={styles.companyName} numberOfLines={1}>{job.employer_name} • 2h ago</Text>
                      {job.job_publisher && (
                        <View style={[
                          styles.sourceBadge, 
                          { backgroundColor: getSourceColor(job.job_publisher) }
                        ]}>
                          <Text style={styles.sourceText}>{job.job_publisher}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.jobTitle} numberOfLines={1}>{job.job_title}</Text>
                </View>
            </View>
            <TouchableOpacity hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} onPress={onBookmark}>
                <Bookmark size={20} color={isSaved ? COLORS.primary : COLORS.textSecondary} fill={isSaved ? COLORS.primary : 'transparent'} />
            </TouchableOpacity>
        </View>

        <View style={styles.tagsContainer}>
          <Tag text="On-site" color={COLORS.surfaceSecondary} textColor={COLORS.primary} />
          <Tag text={job.job_city || job.job_country || "Remote"} color={COLORS.surfaceSecondary} textColor={COLORS.textSecondary} />
          <Tag text={job.job_employment_type?.replace('_', ' ') || "Full-time"} color={COLORS.surfaceSecondary} textColor={COLORS.textSecondary} />
        </View>

        <View style={styles.footer}>
           <View style={styles.footerItem}>
             <Users size={14} color={COLORS.textSecondary} />
             <Text style={styles.footerText}>12 Applied</Text>
           </View>
           <Text style={styles.salaryText}>
             {job.job_salary_currency === 'USD' ? '$' : ''} {job.job_min_salary || '---'}-{job.job_max_salary || '---'}
           </Text>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
};

const Tag = ({ text, color, textColor }: { text: string, color: string, textColor: string }) => (
  <View style={[styles.tag, { backgroundColor: color }]}>
    <Text style={[styles.tagText, { color: textColor }]}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: ROUNDING.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  companyRow: { flexDirection: 'row', flex: 1, alignItems: 'center' },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: ROUNDING.md,
    backgroundColor: COLORS.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logo: { width: 28, height: 28, borderRadius: 6 },
  logoPlaceholder: { width: 28, height: 28, borderRadius: 6, backgroundColor: COLORS.primary + '20', justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: COLORS.primary, fontWeight: '800' },
  titleCol: { flex: 1 },
  publisherRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  sourceBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  sourceText: { color: COLORS.white, fontSize: 10, fontWeight: '800' },
  companyName: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },
  jobTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', marginTop: SPACING.md, gap: 8 },
  tag: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: ROUNDING.full },
  tagText: { fontSize: 11, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.md },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerText: { fontSize: 12, color: COLORS.textSecondary },
  salaryText: { fontSize: 14, fontWeight: '800', color: COLORS.text },
});
