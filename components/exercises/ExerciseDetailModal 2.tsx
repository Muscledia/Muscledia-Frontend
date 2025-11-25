import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Image, Linking, useColorScheme } from 'react-native';
import { X, Target, Package, Video, Clock, Repeat, TrendingUp } from 'lucide-react-native';
import { Colors, getThemeColors } from '@/constants/Colors';
import { Exercise } from '@/types/api';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  visible: boolean;
  onClose: () => void;
}

export default function ExerciseDetailModal({ exercise, visible, onClose }: ExerciseDetailModalProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = getThemeColors(isDark);

  if (!exercise) return null;

  const handleOpenVideo = () => {
    if (exercise.videoUrl) {
      Linking.openURL(exercise.videoUrl);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Exercise Details</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Image */}
          {exercise.imageUrl ? (
            <Image
              source={{ uri: exercise.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: theme.surface }]}>
              <Target size={48} color={theme.textMuted} />
            </View>
          )}

          {/* Title & Difficulty */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: theme.text }]}>{exercise.name}</Text>
            <View style={[styles.badge, { backgroundColor: theme.accent + '20' }]}>
              <Text style={[styles.badgeText, { color: theme.accent }]}>
                {exercise.difficulty}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {exercise.description}
          </Text>

          {/* Meta Info */}
          <View style={[styles.metaContainer, { backgroundColor: theme.surface }]}>
            {/* Muscle Groups */}
            <View style={styles.metaRow}>
              <View style={styles.metaLabelRow}>
                <Target size={16} color={theme.accent} />
                <Text style={[styles.metaLabel, { color: theme.text }]}>Targets</Text>
              </View>
              <View style={styles.tagsContainer}>
                {exercise.muscleGroups?.map((muscle, index) => (
                  <Text key={index} style={[styles.tag, { color: theme.textSecondary }]}>
                    {muscle}{index < (exercise.muscleGroups?.length || 0) - 1 ? ', ' : ''}
                  </Text>
                ))}
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            {/* Equipment */}
            <View style={styles.metaRow}>
              <View style={styles.metaLabelRow}>
                <Package size={16} color={theme.textMuted} />
                <Text style={[styles.metaLabel, { color: theme.text }]}>Equipment</Text>
              </View>
              <Text style={[styles.metaValue, { color: theme.textSecondary }]}>
                {exercise.equipment?.join(', ') || 'None'}
              </Text>
            </View>
          </View>

          {/* Default Sets/Reps if available */}
          {(exercise.sets || exercise.reps || exercise.restTime) && (
            <View style={[styles.statsContainer, { backgroundColor: theme.surface }]}>
              {exercise.sets && (
                <View style={styles.statItem}>
                  <Repeat size={20} color={theme.accent} />
                  <Text style={[styles.statValue, { color: theme.text }]}>{exercise.sets}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Sets</Text>
                </View>
              )}
              {exercise.reps && (
                <View style={styles.statItem}>
                  <TrendingUp size={20} color={theme.accent} />
                  <Text style={[styles.statValue, { color: theme.text }]}>{exercise.reps}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Reps</Text>
                </View>
              )}
              {exercise.restTime && (
                <View style={styles.statItem}>
                  <Clock size={20} color={theme.accent} />
                  <Text style={[styles.statValue, { color: theme.text }]}>{exercise.restTime}s</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Rest</Text>
                </View>
              )}
            </View>
          )}

          {/* Video Link */}
          {exercise.videoUrl && (
            <TouchableOpacity
              style={[styles.videoButton, { backgroundColor: theme.accent }]}
              onPress={handleOpenVideo}
            >
              <Video size={20} color="#fff" />
              <Text style={styles.videoButtonText}>Watch Tutorial</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
  },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  metaContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  metaRow: {
    marginBottom: 12,
  },
  metaLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  metaLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 24,
  },
  tag: {
    fontSize: 14,
  },
  metaValue: {
    fontSize: 14,
    marginLeft: 24,
  },
  divider: {
    height: 1,
    marginVertical: 12,
    opacity: 0.1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
  },
  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  videoButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

