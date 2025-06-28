import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  showHalfStars?: boolean;
  color?: string;
  emptyColor?: string;
  style?: any;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = 24,
  onRatingChange,
  readonly = false,
  showHalfStars = true,
  color = COLORS.warning,
  emptyColor = COLORS.light.border,
  style,
}) => {
  const handleStarPress = (starIndex: number) => {
    if (readonly || !onRatingChange) return;

    const newRating = starIndex + 1;
    onRatingChange(newRating);
  };

  const renderStar = (starIndex: number) => {
    const starValue = starIndex + 1;
    let iconName: keyof typeof Ionicons.glyphMap = 'star-outline';
    let starColor = emptyColor;

    if (rating >= starValue) {
      // Full star
      iconName = 'star';
      starColor = color;
    } else if (showHalfStars && rating >= starValue - 0.5) {
      // Half star
      iconName = 'star-half';
      starColor = color;
    }

    if (readonly) {
      return (
        <View key={starIndex} style={styles.starContainer}>
          <Ionicons
            name={iconName}
            size={size}
            color={starColor}
          />
        </View>
      );
    }

    return (
      <TouchableOpacity
        key={starIndex}
        style={styles.starContainer}
        onPress={() => handleStarPress(starIndex)}
        activeOpacity={0.7}
      >
        <Ionicons
          name={iconName}
          size={size}
          color={starColor}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {Array.from({ length: maxRating }, (_, index) => renderStar(index))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starContainer: {
    marginHorizontal: 2,
  },
});

// Helper component for displaying rating with text
interface RatingDisplayProps {
  rating: number;
  totalRatings?: number;
  size?: 'small' | 'medium' | 'large';
  showText?: boolean;
  style?: any;
}

export const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  totalRatings,
  size = 'medium',
  showText = true,
  style,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'large': return 32;
      default: return 24;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small': return SIZES.sm;
      case 'large': return SIZES.lg;
      default: return SIZES.md;
    }
  };

  return (
    <View style={[styles.ratingDisplay, style]}>
      <StarRating
        rating={rating}
        size={getSize()}
        readonly
        showHalfStars
      />
      {showText && (
        <View style={styles.ratingText}>
          <Text style={[styles.ratingValue, { fontSize: getFontSize() }]}>
            {rating.toFixed(1)}
          </Text>
          {totalRatings !== undefined && (
            <Text style={[styles.totalRatings, { fontSize: getFontSize() - 2 }]}>
              ({totalRatings})
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

const ratingDisplayStyles = StyleSheet.create({
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: SIZES.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingValue: {
    fontWeight: '600',
    color: COLORS.light.text,
    marginRight: SIZES.xs,
  },
  totalRatings: {
    color: COLORS.light.textSecondary,
  },
});

// Merge styles
Object.assign(styles, ratingDisplayStyles);
