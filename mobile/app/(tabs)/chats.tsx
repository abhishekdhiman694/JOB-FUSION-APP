import React from "react";
import { View, Text, StyleSheet, SafeAreaView, FlatList, Image, TouchableOpacity } from "react-native";
import { COLORS, SPACING, ROUNDING } from "../../src/theme";
import { Search, MoreVertical } from "lucide-react-native";

const CHATS = [
  { id: '1', name: 'Zainab Ahmed', message: 'Hello! I saw your profile and...', time: '2m ago', active: true },
  { id: '2', name: 'John Doe', message: 'The interview is scheduled for tomorrow.', time: '1h ago', active: false },
  { id: '3', name: 'Sarah Wilson', message: 'Thank you for the update!', time: '3h ago', active: false },
];

export default function ChatsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity style={styles.searchButton}><Search size={24} color={COLORS.text} /></TouchableOpacity>
      </View>

      <FlatList
        data={CHATS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.chatItem}>
             <View style={styles.avatarContainer}>
                <Image source={{ uri: `https://i.pravatar.cc/100?u=${item.id}` }} style={styles.avatar} />
                {item.active && <View style={styles.activeDot} />}
             </View>
             <View style={styles.chatInfo}>
                <View style={styles.nameRow}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.time}>{item.time}</Text>
                </View>
                <Text style={styles.message} numberOfLines={1}>{item.message}</Text>
             </View>
             <TouchableOpacity><MoreVertical size={20} color={COLORS.textSecondary} /></TouchableOpacity>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: SPACING.lg },
  headerTitle: { fontSize: 24, fontWeight: "900", color: COLORS.text },
  searchButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.white, justifyContent: "center", alignItems: "center" },
  listContent: { paddingHorizontal: SPACING.lg },
  chatItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  avatarContainer: { width: 56, height: 56, borderRadius: 28, marginRight: 16 },
  avatar: { width: "100%", height: "100%", borderRadius: 28 },
  activeDot: { position: "absolute", bottom: 2, right: 2, width: 14, height: 14, borderRadius: 7, backgroundColor: COLORS.success, borderWidth: 3, borderColor: COLORS.white },
  chatInfo: { flex: 1 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  name: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  time: { fontSize: 12, color: COLORS.textSecondary },
  message: { fontSize: 14, color: COLORS.textSecondary },
});
