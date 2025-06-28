import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { COLORS, SIZES, FONTS } from '../constants';
import { StarRating, RatingDisplay } from '../components/StarRating';
import { RTLView, RTLText } from '../components/RTLText';
import { useRatingsStore } from '../stores/ratingsStore';
import { TrainingRating, RatingsSummary } from '../types';

interface RouteParams {
  trainerId: string;
  trainerName: string;
}

export const ViewRatingsScreen: React.FC = () => {
  const route = useRoute();
  const { t } = useTranslation();
  const { trainerId, trainerName } = route.params as RouteParams;
  const { getRatingsForTrainer, getRatingsSummary, isLoading } = useRatingsStore();

  const [ratings, setRatings] = useState<TrainingRating[]>([]);
  const [summary, setSummary] = useState<RatingsSummary | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [trainerId]);

  const loadData = async () => {
    try {
      const [ratingsData, summaryData] = await Promise.all([
        getRatingsForTrainer(trainerId),
        getRatingsSummary(trainerId),
      ]);
      
      setRatings(ratingsData);
      setSummary(summaryData);
    } catch (error) {
      console.error('Error loading ratings:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const renderRatingItem = ({ item }: { item: TrainingRating }) => (
    <View style={styles.ratingItem}>
      <RTLView style={styles.ratingHeader}>
        <View style={styles.ratingInfo}>
          <RTLText style={styles.reviewerName}>
            {item.is_anonymous ? t('ratings.anonymous') : item.trainee?.full_name}
          </RTLText>
          <Text style={styles.reviewDate}>
            {formatDate(item.created_at)}
          </Text>
        </View>
        <RatingDisplay
          rating={item.overall_rating}
          size="small"
          showText={false}
        />
      </RTLView>

      <View style={styles.detailedRatings}>
        <RTLView style={styles.ratingRow}>
          <RTLText style={styles.ratingLabel}>{t('ratings.contentQuality')}:</RTLText>
          <StarRating rating={item.content_quality} size={16} readonly />
        </RTLView>
        <RTLView style={styles.ratingRow}>
          <RTLText style={styles.ratingLabel}>{t('ratings.deliveryQuality')}:</RTLText>
          <StarRating rating={item.delivery_quality} size={16} readonly />
        </RTLView>
        <RTLView style={styles.ratingRow}>
          <RTLText style={styles.ratingLabel}>{t('ratings.interactionQuality')}:</RTLText>
          <StarRating rating={item.interaction_quality} size={16} readonly />
        </RTLView>
        <RTLView style={styles.ratingRow}>
          <RTLText style={styles.ratingLabel}>{t('ratings.organizationQuality')}:</RTLText>
          <StarRating rating={item.organization_quality} size={16} readonly />
        </RTLView>
      </View>

      {item.review_text && (
        <RTLText style={styles.reviewText}>
          {item.review_text}
        </RTLText>
      )}

      {item.training_request && (
        <RTLText style={styles.trainingTitle}>
          {item.training_request.title}
        </RTLText>
      )}
    </View>
  );

  const renderRatingDistribution = () => {
    if (!summary) return null;

    return (
      <View style={styles.distributionContainer}>
        <RTLText style={styles.sectionTitle}>
          {t('ratings.ratingDistribution')}
        </RTLText>
        {[5, 4, 3, 2, 1].map((star) => (
          <RTLView key={star} style={styles.distributionRow}>
            <View style={styles.starLabel}>
              <Text style={styles.starNumber}>{star}</Text>
              <StarRating rating={1} size={16} readonly maxRating={1} />
            </View>
            <View style={styles.distributionBar}>
              <View
                style={[
                  styles.distributionFill,
                  {
                    width: summary.total_ratings > 0
                      ? `${(summary.rating_distribution[star as keyof typeof summary.rating_distribution] / summary.total_ratings) * 100}%`
                      : '0%'
                  }
                ]}
              />
            </View>
            <Text style={styles.distributionCount}>
              {summary.rating_distribution[star as keyof typeof summary.rating_distribution]}
            </Text>
          </RTLView>
        ))}
      </View>
    );
  };

  if (!summary) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>
          {t('common.loading')}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <RTLView style={styles.header}>
          <RTLText style={styles.trainerName}>
            {trainerName}
          </RTLText>
          <RTLText style={styles.headerSubtitle}>
            {t('ratings.viewRatings')}
          </RTLText>
        </RTLView>

        {/* Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryMain}>
            <Text style={styles.averageRating}>
              {summary.average_rating.toFixed(1)}
            </Text>
            <StarRating
              rating={summary.average_rating}
              size={24}
              readonly
              showHalfStars
            />
            <Text style={styles.totalRatings}>
              {t('ratings.totalRatings')}: {summary.total_ratings}
            </Text>
          </View>
        </View>

        {/* Rating Distribution */}
        {renderRatingDistribution()}

        {/* Reviews List */}
        <View style={styles.reviewsContainer}>
          <RTLText style={styles.sectionTitle}>
            {t('ratings.reviews')}
          </RTLText>
          
          {ratings.length === 0 ? (
            <RTLText style={styles.noRatings}>
              {t('ratings.noRatings')}
            </RTLText>
          ) : (
            <FlatList
              data={ratings}
              renderItem={renderRatingItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: SIZES.md,
    color: COLORS.light.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: SIZES.md,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
  },
  trainerName: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.light.text,
  },
  headerSubtitle: {
    fontSize: SIZES.md,
    color: COLORS.light.textSecondary,
    marginTop: SIZES.xs,
  },
  summaryContainer: {
    backgroundColor: COLORS.white,
    padding: SIZES.lg,
    margin: SIZES.md,
    borderRadius: SIZES.sm,
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryMain: {
    alignItems: 'center',
  },
  averageRating: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SIZES.sm,
  },
  totalRatings: {
    fontSize: SIZES.md,
    color: COLORS.light.textSecondary,
    marginTop: SIZES.sm,
  },
  distributionContainer: {
    backgroundColor: COLORS.white,
    margin: SIZES.md,
    padding: SIZES.md,
    borderRadius: SIZES.sm,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.light.text,
    marginBottom: SIZES.md,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  starLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 40,
  },
  starNumber: {
    fontSize: SIZES.sm,
    color: COLORS.light.text,
    marginRight: SIZES.xs,
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.light.border,
    borderRadius: 4,
    marginHorizontal: SIZES.sm,
  },
  distributionFill: {
    height: '100%',
    backgroundColor: COLORS.warning,
    borderRadius: 4,
  },
  distributionCount: {
    fontSize: SIZES.sm,
    color: COLORS.light.textSecondary,
    width: 30,
    textAlign: 'right',
  },
  reviewsContainer: {
    margin: SIZES.md,
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
  ratingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.sm,
  },
  ratingInfo: {
    flex: 1,
  },
  reviewerName: {
    fontSize: SIZES.md,
    fontWeight: '600',
    color: COLORS.light.text,
  },
  reviewDate: {
    fontSize: SIZES.sm,
    color: COLORS.light.textSecondary,
    marginTop: SIZES.xs,
  },
  detailedRatings: {
    marginBottom: SIZES.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.xs,
  },
  ratingLabel: {
    fontSize: SIZES.sm,
    color: COLORS.light.textSecondary,
    flex: 1,
  },
  reviewText: {
    fontSize: SIZES.md,
    color: COLORS.light.text,
    lineHeight: 20,
    marginBottom: SIZES.sm,
  },
  trainingTitle: {
    fontSize: SIZES.sm,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  noRatings: {
    fontSize: SIZES.md,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.xl,
  },
});
