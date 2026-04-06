import React, { useState } from "react";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useDispatch } from "react-redux";
import { CustomButton } from "../../src/components/CustomButton";
import { CustomInput } from "../../src/components/CustomInput";
import { COLORS, SPACING, ROUNDING } from "../../src/theme";
import { Mail, Lock, LogIn } from "lucide-react-native";
import api from "../../src/api";
import { setAuth } from "../../src/store/authSlice";
import * as SecureStore from "expo-secure-store";

export default function LoginScreen() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/login", { email, password });
      const { access_token, user } = response.data;
      
      await SecureStore.setItemAsync("auth_token", access_token);
      dispatch(setAuth({ user, token: access_token }));
      
      router.replace("/(tabs)");
    } catch (error: any) {
      Alert.alert("Login Failed", error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <LogIn size={40} color={COLORS.white} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue your job search</Text>
          </View>

          <View style={styles.form}>
            <CustomInput
              label="Email Address"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              icon={<Mail size={20} color={COLORS.textSecondary} />}
            />
            <CustomInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              icon={<Lock size={20} color={COLORS.textSecondary} />}
            />

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>

            <CustomButton title="Sign In" onPress={handleLogin} loading={loading} style={styles.loginButton} />

            <View style={styles.divider}>
              <View style={styles.line} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.socialContainer}>
               {/* Add Social Login Buttons Here */}
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: SPACING.xl },
  header: {
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  title: { fontSize: 28, fontWeight: "800", color: COLORS.white, marginBottom: 8 },
  subtitle: { fontSize: 16, color: "rgba(255,255,255,0.8)" },
  form: { padding: SPACING.lg, marginTop: -30, backgroundColor: COLORS.background, marginHorizontal: SPACING.lg, borderRadius: ROUNDING.xl, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  forgotPassword: { alignSelf: "flex-end", marginBottom: SPACING.lg },
  forgotPasswordText: { color: COLORS.primary, fontWeight: "600" },
  loginButton: { marginTop: SPACING.sm },
  divider: { flexDirection: "row", alignItems: "center", marginVertical: SPACING.xl },
  line: { flex: 1, height: 1, backgroundColor: COLORS.border },
  dividerText: { marginHorizontal: SPACING.md, color: COLORS.textSecondary, fontWeight: "600" },
  socialContainer: { gap: SPACING.md },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: SPACING.xl },
  footerText: { color: COLORS.textSecondary },
  signupLink: { color: COLORS.primary, fontWeight: "700" },
});
