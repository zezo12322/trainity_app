import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS, SIZES, FONTS } from '../constants';
import { StarRating } from '../components/StarRating';
import { Button } from '../components/Button';
import { TextInput } from '../components/TextInput';
// import { RTLView, RTLText } from '../components/RTLText';
import { useRatingsStore } from '../stores/ratingsStore';
import { useAuthStore } from '../stores/authStore';
import { TrainingRequest } from '../types';

interface RouteParams {
  trainingRequest: TrainingRequest;
}

export const RateTrainingScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { trainingRequest } = route.params as RouteParams;
  const { submitRating, isLoading } = useRatingsStore();
  const { user } = useAuthStore();

  const [ratings, setRatings] = useState({
    overall_rating: 0,
    content_quality: 0,
    delivery_quality: 0,
    interaction_quality: 0,
    organization_quality: 0,
  });

  const [reviewText, setReviewText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const handleRatingChange = (category: keyof typeof ratings, value: number) => {
    setRatings(prev => ({
      ...prev,
      [category]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validation
    if (ratings.overall_rating === 0) {
      Alert.alert(
        t('ratings.error'),
        t('ratings.overallRatingRequired')
      );
      return;
    }

    if (Object.values(ratings).some(rating => rating === 0)) {
      Alert.alert(
        t('ratings.error'),
        t('ratings.allRatingsRequired')
      );
      return;
    }

    try {
      await submitRating({
        training_request_id: trainingRequest.id,
        trainer_id: trainingRequest.assigned_trainer_id!,
        trainee_id: user!.id,
        ...ratings,
        review_text: reviewText.trim() || null,
        is_anonymous: isAnonymous,
        is_approved: true, // Auto-approve for now
      });

      Alert.alert(
        t('ratings.success'),
        t('ratings.thankYou'),
        [
          {
            text: t('common.ok'),
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        t('ratings.error'),
        t('ratings.submitError')
      );
    }
  };

  const ratingCategories = [
    {
      key: 'overall_rating' as const,
      title: t('ratings.overallRating'),
      description: t('ratings.overallDescription'),
    },
    {
      key: 'content_quality' as const,
      title: t('ratings.contentQuality'),
      description: t('ratings.contentDescription'),
    },
    {
      key: 'delivery_quality' as const,
      title: t('ratings.deliveryQuality'),
      description: t('ratings.deliveryDescription'),
    },
    {
      key: 'interaction_quality' as const,
      title: t('ratings.interactionQuality'),
      description: t('ratings.interactionDescription'),
    },
    {
      key: 'organization_quality' as const,
      title: t('ratings.organizationQuality'),
      description: t('ratings.organizationDescription'),
    },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>
            {t('ratings.rateTraining')}
          </Text>
          <Text style={styles.subtitle}>
            {trainingRequest.title}
          </Text>
          <Text style={styles.trainerName}>
            {t('ratings.trainer')}: {trainingRequest.assigned_trainer?.full_name}
          </Text>
        </View>

        <View style={styles.ratingsSection}>
          {ratingCategories.map((category) => (
            <View key={category.key} style={styles.ratingItem}>
              <Text style={styles.ratingTitle}>
                {category.title}
              </Text>
              <Text style={styles.ratingDescription}>
                {category.description}
              </Text>
              <View style={styles.starsContainer}>
                <StarRating
                  rating={ratings[category.key]}
                  onRatingChange={(value) => handleRatingChange(category.key, value)}
                  size={32}
                  readonly={false}
                  showHalfStars={false}
                />
                <Text style={styles.ratingValue}>
                  {ratings[category.key]}/5
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>
            {t('ratings.writeReview')}
          </Text>
          <TextInput
            value={reviewText}
            onChangeText={setReviewText}
            placeholder={t('ratings.reviewPlaceholder')}
            multiline
            numberOfLines={4}
            style={styles.reviewInput}
          />
        </View>

        <View style={styles.optionsSection}>
          <TouchableOpacity
            style={styles.anonymousOption}
            onPress={() => setIsAnonymous(!isAnonymous)}
          >
            <View style={[styles.checkbox, isAnonymous && styles.checkboxChecked]}>
              {isAnonymous && (
                <Ionicons name="checkmark" size={16} color={COLORS.white} />
              )}
            </View>
            <Text style={styles.anonymousText}>
              {t('ratings.submitAnonymously')}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title={t('ratings.submitRating')}
            onPress={handleSubmit}
            loading={isLoading}
            disabled={ratings.overall_rating === 0}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  scrollView: {
    flex: 1,
    padding: SIZES.md,
  },
  header: {
    marginBottom: SIZES.xl,
  },
  title: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.light.text,
    marginBottom: SIZES.sm,
  },
  subtitle: {
    fontSize: SIZES.lg,
    color: COLORS.primary,
    marginBottom: SIZES.xs,
  },
  trainerName: {
    fontSize: SIZES.md,
    color: COLORS.light.textSecondary,
  },
  ratingsSection: {
    marginBottom: SIZES.xl,
  },
  ratingItem: {
    backgroundColor: COLORS.white,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    marginBottom: SIZES.md,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  ratingTitle: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.light.text,
    marginBottom: SIZES.xs,
  },
  ratingDescription: {
    fontSize: SIZES.sm,
    color: COLORS.light.textSecondary,
    marginBottom: SIZES.md,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingValue: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.primary,
  },
  reviewSection: {
    marginBottom: SIZES.xl,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.light.text,
    marginBottom: SIZES.md,
  },
  reviewInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  optionsSection: {
    marginBottom: SIZES.xl,
  },
  anonymousOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: COLORS.light.border,
    borderRadius: 4,
    marginRight: SIZES.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  anonymousText: {
    fontSize: SIZES.md,
    color: COLORS.light.text,
  },
  buttonContainer: {
    marginBottom: SIZES.xl,
  },
});
