import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, Dimensions, Share, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, ROUNDING } from '../../src/theme';
import api from '../../src/api';
import { ArrowLeft, Bookmark, Share2, Briefcase, MapPin, Globe, DollarSign, Clock } from 'lucide-react-native';
import { MotiView } from 'moti';
import * as WebBrowser from "expo-web-browser";

const { width } = Dimensions.get('window');

export default function JobDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get(`/jobs/details/${id}`);
        setJob(res.data);
      } catch (error) {
        console.error('Fetch Job Error:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [id]);

  const handleApply = async () => {
    const link = job?.job_google_link || job?.job_apply_link;
    if (link) {
      // Record action for Real Data Dashboard
      try {
        await api.post('/dashboard/record-action', {
          jobId: job.job_id,
          jobTitle: job.job_title,
          employerName: job.employer_name,
          employerLogo: job.employer_logo,
          jobCity: job.job_city,
          jobCountry: job.job_country,
          actionType: 'apply',
          salaryMax: job.job_max_salary,
          salaryCurrency: job.job_salary_currency
        });
      } catch (e) {
        console.error('Failed to record job action:', e);
      }

      await WebBrowser.openBrowserAsync(link);
    } else {
      Alert.alert("Link Unavailable", "The original application link could not be found for this listing.");
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this ${job?.job_title} role at ${job?.employer_name} on JobFusion! Here is the link: ${job?.job_google_link || job?.job_apply_link}`,
        title: `Job at ${job?.employer_name}`,
      });
    } catch (error: any) {
      console.error("Share Error:", error.message);
    }
  };

  if (loading) {
    return <View style={styles.center}><Text>Loading...</Text></View>;
  }

  if (!job) {
    return <View style={styles.center}><Text>Job not found</Text></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Share2 size={20} color={COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton}>
            <Bookmark size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          style={styles.logoSection}
        >
          <View style={styles.logoContainer}>
            {job.employer_logo ? (
              <Image source={{ uri: job.employer_logo }} style={styles.logo} />
            ) : (
              <Briefcase size={32} color={COLORS.primary} />
            )}
          </View>
          <Text style={styles.title}>{job.job_title}</Text>
          <Text style={styles.companyName}>{job.employer_name} • {job.job_publisher}</Text>
          
          <View style={styles.metaRow}>
            <InfoChip icon={<MapPin size={14} color={COLORS.primary} />} text={job.job_city || job.job_country || 'Remote'} />
            <InfoChip icon={<Clock size={14} color={COLORS.primary} />} text={job.job_employment_type || 'Full Time'} />
          </View>
        </MotiView>

        <View style={styles.statsContainer}>
          <StatBox label="Salary" value={job.job_min_salary ? `${job.job_salary_currency || '$'}${job.job_min_salary}-${job.job_max_salary}` : 'Negotiable'} />
          <StatBox label="Job Type" value={job.job_employment_type || 'Remote'} />
          <StatBox label="Experience" value="3-5 Years" />
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Job Description</Text>
          <Text style={styles.description}>{job.job_description}</Text>
        </View>
        
        {job.job_required_skills && job.job_required_skills.length > 0 && (
          <View style={styles.contentSection}>
            <Text style={styles.sectionTitle}>Required Skills</Text>
            <View style={styles.skillsContainer}>
              {job.job_required_skills.map((skill: string, i: number) => (
                <View key={i} style={styles.skillTag}><Text style={styles.skillText}>{skill}</Text></View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
          <Text style={styles.applyText}>Apply Now on {job.job_publisher || 'Platform'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const InfoChip = ({ icon, text }: { icon: any, text: string }) => (
  <View style={styles.chip}>
    {icon}
    <Text style={styles.chipText}>{text}</Text>
  </View>
);

const StatBox = ({ label, value }: { label: string, value: string }) => (
  <View style={styles.statBox}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
  headerActions: { flexDirection: 'row', gap: 12 },
  actionButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 100 },
  logoSection: { alignItems: 'center', paddingVertical: SPACING.xl },
  logoContainer: { width: 80, height: 80, borderRadius: 20, backgroundColor: COLORS.white, justifyContent: 'center', alignItems: 'center', marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.border },
  logo: { width: 50, height: 50, borderRadius: 10 },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.text, textAlign: 'center', paddingHorizontal: SPACING.xl },
  companyName: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: COLORS.white, paddingHorizontal: 12, paddingVertical: 6, borderRadius: ROUNDING.full, borderWidth: 1, borderColor: COLORS.border },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  statBox: { width: (width - SPACING.lg * 2 - 24) / 3, backgroundColor: COLORS.white, padding: 12, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: COLORS.border },
  statLabel: { fontSize: 11, color: COLORS.textSecondary, marginBottom: 4 },
  statValue: { fontSize: 13, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  contentSection: { paddingHorizontal: SPACING.lg, marginBottom: SPACING.xl },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginBottom: 12 },
  description: { fontSize: 15, lineHeight: 24, color: COLORS.textSecondary },
  skillsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  skillTag: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: COLORS.primary + '10' },
  skillText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  footer: { position: 'absolute', bottom: 0, width: '100%', backgroundColor: COLORS.background, padding: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border },
  applyButton: { backgroundColor: COLORS.primary, height: 56, borderRadius: ROUNDING.xl, justifyContent: 'center', alignItems: 'center' },
  applyText: { color: COLORS.white, fontSize: 16, fontWeight: '700' },
});
