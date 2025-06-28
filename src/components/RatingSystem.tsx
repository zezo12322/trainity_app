import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { COLORS, SIZES } from '../constants';
import { RTLView, useRTL } from './RTLText';

interface RatingData {
  rating: number;
  comment?: string;
  aspects?: {
    content: number;
    delivery: number;
    materials: number;
    interaction: number;
  };
}

interface RatingSystemProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (rating: RatingData) => void;
  title: string;
  subtitle?: string;
  showDetailedRating?: boolean;
  initialRating?: RatingData;
}

export const RatingSystem: React.FC<RatingSystemProps> = ({
  visible,
  onClose,
  onSubmit,
  title,
  subtitle,
  showDetailedRating = false,
  initialRating,
}) => {
  const { t } = useTranslation();
  const { isRTL: rtl } = useRTL();

  const [overallRating, setOverallRating] = useState(initialRating?.rating || 0);
  const [comment, setComment] = useState(initialRating?.comment || '');
  const [aspects, setAspects] = useState({
    content: initialRating?.aspects?.content || 0,
    delivery: initialRating?.aspects?.delivery || 0,
    materials: initialRating?.aspects?.materials || 0,
    interaction: initialRating?.aspects?.interaction || 0,
  });

  const handleSubmit = () => {
    if (overallRating === 0) {
      Alert.alert(t('common.error'), t('rating.pleaseSelectRating'));
      return;
    }

    const ratingData: RatingData = {
      rating: overallRating,
      comment: comment.trim(),
    };

    if (showDetailedRating) {
      ratingData.aspects = aspects;
    }

    onSubmit(ratingData);
    handleClose();
  };

  const handleClose = () => {
    setOverallRating(initialRating?.rating || 0);
    setComment(initialRating?.comment || '');
    setAspects({
      content: initialRating?.aspects?.content || 0,
      delivery: initialRating?.aspects?.delivery || 0,
      materials: initialRating?.aspects?.materials || 0,
      interaction: initialRating?.aspects?.interaction || 0,
    });
    onClose();
  };

  const renderStars = (
    rating: number,
    onPress: (star: number) => void,
    size: number = 32
  ) => {
    return (
      <RTLView style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => onPress(star)}
            style={styles.starButton}
            activeOpacity={0.7}
          >
            <Ionicons
              name={star <= rating ? 'star' : 'star-outline'}
              size={size}
              color={star <= rating ? COLORS.warning : COLORS.light.textSecondary}
            />
          </TouchableOpacity>
        ))}
      </RTLView>
    );
  };

  const updateAspectRating = (aspect: keyof typeof aspects, rating: number) => {
    setAspects(prev => ({ ...prev, [aspect]: rating }));
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1: return t('rating.poor');
      case 2: return t('rating.fair');
      case 3: return t('rating.good');
      case 4: return t('rating.veryGood');
      case 5: return t('rating.excellent');
      default: return t('rating.notRated');
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Ionicons name="close" size={24} color={COLORS.light.text} />
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
          </View>

          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Overall Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('rating.overallRating')}</Text>
            {renderStars(overallRating, setOverallRating, 40)}
            <Text style={styles.ratingText}>{getRatingText(overallRating)}</Text>
          </View>

          {/* Detailed Ratings */}
          {showDetailedRating && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('rating.detailedRating')}</Text>

              {/* Content Quality */}
              <View style={styles.aspectContainer}>
                <Text style={styles.aspectTitle}>{t('rating.contentQuality')}</Text>
                {renderStars(aspects.content, (rating) => updateAspectRating('content', rating), 24)}
              </View>

              {/* Delivery */}
              <View style={styles.aspectContainer}>
                <Text style={styles.aspectTitle}>{t('rating.delivery')}</Text>
                {renderStars(aspects.delivery, (rating) => updateAspectRating('delivery', rating), 24)}
              </View>

              {/* Materials */}
              <View style={styles.aspectContainer}>
                <Text style={styles.aspectTitle}>{t('rating.materials')}</Text>
                {renderStars(aspects.materials, (rating) => updateAspectRating('materials', rating), 24)}
              </View>

              {/* Interaction */}
              <View style={styles.aspectContainer}>
                <Text style={styles.aspectTitle}>{t('rating.interaction')}</Text>
                {renderStars(aspects.interaction, (rating) => updateAspectRating('interaction', rating), 24)}
              </View>
            </View>
          )}

          {/* Comment */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('rating.comments')}</Text>
            <TextInput
              style={[styles.commentInput, rtl && styles.commentInputRTL]}
              placeholder={t('rating.commentsPlaceholder')}
              placeholderTextColor={COLORS.light.textSecondary}
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleClose}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <Text style={styles.submitButtonText}>{t('rating.submitRating')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Simple star display component
export const StarRating: React.FC<{
  rating: number;
  size?: number;
  showText?: boolean;
  style?: any;
}> = ({ rating, size = 16, showText = false, style }) => {
  const { t } = useTranslation();

  return (
    <View style={[styles.starDisplay, style]}>
      <RTLView style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? 'star' : 'star-outline'}
            size={size}
            color={star <= rating ? COLORS.warning : COLORS.light.textSecondary}
          />
        ))}
      </RTLView>
      {showText ? (
        <Text style={styles.ratingDisplayText}>
          {rating.toFixed(1)} ({t('rating.outOfFive')})
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.light.border,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: SIZES.h4,
    fontWeight: 'bold',
    color: COLORS.light.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: SIZES.body,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.xs,
  },
  placeholder: {
    width: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: SIZES.lg,
  },
  section: {
    marginVertical: SIZES.lg,
  },
  sectionTitle: {
    fontSize: SIZES.h5,
    fontWeight: '600',
    color: COLORS.light.text,
    marginBottom: SIZES.md,
  },
  starsContainer: {
    gap: SIZES.xs,
    justifyContent: 'center',
  },
  starButton: {
    padding: SIZES.xs,
  },
  ratingText: {
    fontSize: SIZES.body,
    color: COLORS.light.textSecondary,
    textAlign: 'center',
    marginTop: SIZES.sm,
  },
  aspectContainer: {
    marginBottom: SIZES.md,
  },
  aspectTitle: {
    fontSize: SIZES.body,
    fontWeight: '500',
    color: COLORS.light.text,
    marginBottom: SIZES.sm,
  },
  commentInput: {
    backgroundColor: COLORS.light.surface,
    borderRadius: SIZES.radiusMedium,
    padding: SIZES.md,
    fontSize: SIZES.body,
    color: COLORS.light.text,
    borderWidth: 1,
    borderColor: COLORS.light.border,
    minHeight: 100,
  },
  commentInputRTL: {
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.lg,
    paddingVertical: SIZES.md,
    gap: SIZES.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.light.border,
  },
  button: {
    flex: 1,
    paddingVertical: SIZES.md,
    borderRadius: SIZES.radiusMedium,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.light.surface,
    borderWidth: 1,
    borderColor: COLORS.light.border,
  },
  cancelButtonText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: COLORS.light.text,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  submitButtonText: {
    fontSize: SIZES.body,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  starDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SIZES.sm,
  },
  ratingDisplayText: {
    fontSize: SIZES.caption,
    color: COLORS.light.textSecondary,
  },
});
