import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, SafeAreaView, Dimensions } from "react-native";
import { useRouter } from "expo-router";
import { COLORS, SPACING, ROUNDING } from "../src/theme";
import { MotiView } from "moti";
import { ArrowRight } from "lucide-react-native";

const { width, height } = Dimensions.get("window");

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MotiView
          from={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "timing", duration: 1000 }}
          style={styles.imageContainer}
        >
          {/* Using the generated image path from previous step */}
          <Image
            source={require("../assets/onboarding.png")}
            style={styles.image}
            resizeMode="cover"
          />
        </MotiView>

        <View style={styles.footer}>
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 800, delay: 500 }}
          >
            <Text style={styles.title}>Find works {"\n"}that fits you</Text>
            <Text style={styles.subtitle}>
              Pick jobs you like, work when you want, {"\n"}and get paid fast.
            </Text>
          </MotiView>

          <MotiView
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: "timing", duration: 800, delay: 800 }}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.replace("/(auth)/login")}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
            
            <View style={styles.indicatorContainer}>
                <View style={[styles.dot, styles.activeDot]} />
                <View style={styles.dot} />
                <View style={styles.dot} />
            </View>
          </MotiView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1 },
  imageContainer: {
    width: width,
    height: height * 0.55,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    overflow: "hidden",
    backgroundColor: COLORS.surfaceSecondary,
  },
  image: { width: "100%", height: "100%" },
  footer: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    justifyContent: "space-between",
    paddingBottom: SPACING.xxl,
  },
  title: {
    fontSize: 48,
    fontWeight: "900",
    color: COLORS.text,
    lineHeight: 52,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    lineHeight: 24,
  },
  button: {
    backgroundColor: COLORS.primary,
    height: 64,
    borderRadius: ROUNDING.xl,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "800",
  },
  indicatorContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.xl,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
  },
  activeDot: {
    width: 24,
    backgroundColor: COLORS.primary,
  },
});
