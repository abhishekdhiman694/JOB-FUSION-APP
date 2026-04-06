import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { COLORS, SPACING, ROUNDING } from '../theme';
import { LayoutGrid, ClipboardCheck, MonitorCheck, BookOpenText, UsersRound } from 'lucide-react-native';

const CATEGORIES = [
  { id: 'All', icon: LayoutGrid },
  { id: 'Surveys', icon: ClipboardCheck },
  { id: 'IT Service', icon: MonitorCheck },
  { id: 'Tuition', icon: BookOpenText },
  { id: 'Tuition2', icon: UsersRound },
];

interface CategoryScrollProps {
  selectedCategory: string;
  onSelect: (category: string) => void;
}

export const CategoryScroll: React.FC<CategoryScrollProps> = ({ selectedCategory, onSelect }) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isSelected = selectedCategory === cat.id;

        return (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onSelect(cat.id)}
            style={[styles.categoryItem, isSelected && styles.selectedCategory]}
          >
            <View style={[styles.iconContainer, isSelected && styles.selectedIconContainer]}>
              <Icon size={24} color={isSelected ? COLORS.white : COLORS.textSecondary} />
            </View>
            <Text style={[styles.categoryLabel, isSelected && styles.selectedLabel]}>{cat.id}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { paddingLeft: SPACING.lg, paddingRight: SPACING.md, paddingVertical: SPACING.md },
  categoryItem: { alignItems: 'center', marginRight: SPACING.lg },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: ROUNDING.xl,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedIconContainer: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  categoryLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  selectedLabel: { color: COLORS.primary },
});
