import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { TrainingRating, TrainerStats, RatingsSummary } from '../types';

interface RatingsState {
  ratings: TrainingRating[];
  trainerStats: Record<string, TrainerStats>;
  isLoading: boolean;
  error: string | null;

  // Actions
  submitRating: (rating: Omit<TrainingRating, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  getRatingsForTrainer: (trainerId: string) => Promise<TrainingRating[]>;
  getRatingsForTraining: (trainingRequestId: string) => Promise<TrainingRating[]>;
  getTrainerStats: (trainerId: string) => Promise<TrainerStats | null>;
  getRatingsSummary: (trainerId: string) => Promise<RatingsSummary>;
  updateRating: (ratingId: string, updates: Partial<TrainingRating>) => Promise<void>;
  deleteRating: (ratingId: string) => Promise<void>;
  approveRating: (ratingId: string) => Promise<void>;
  loadRatings: () => Promise<void>;
  clearError: () => void;
}

export const useRatingsStore = create<RatingsState>((set, get) => ({
  ratings: [],
  trainerStats: {},
  isLoading: false,
  error: null,

  submitRating: async (ratingData) => {
    try {
      set({ isLoading: true, error: null });

      const { data: rating, error } = await supabase
        .from('training_ratings')
        .insert({
          ...ratingData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select(`
          *,
          training_request:training_requests(*),
          trainer:users!training_ratings_trainer_id_fkey(*),
          trainee:users!training_ratings_trainee_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      // Add to local state
      set(state => ({
        ratings: [...state.ratings, rating],
        isLoading: false,
      }));

      // Update trainer stats
      await get().updateTrainerStats(ratingData.trainer_id);

    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to submit rating',
        isLoading: false 
      });
      throw error;
    }
  },

  getRatingsForTrainer: async (trainerId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data: ratings, error } = await supabase
        .from('training_ratings')
        .select(`
          *,
          training_request:training_requests(*),
          trainer:users!training_ratings_trainer_id_fkey(*),
          trainee:users!training_ratings_trainee_id_fkey(*)
        `)
        .eq('trainer_id', trainerId)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ isLoading: false });
      return ratings || [];

    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load trainer ratings',
        isLoading: false 
      });
      return [];
    }
  },

  getRatingsForTraining: async (trainingRequestId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { data: ratings, error } = await supabase
        .from('training_ratings')
        .select(`
          *,
          training_request:training_requests(*),
          trainer:users!training_ratings_trainer_id_fkey(*),
          trainee:users!training_ratings_trainee_id_fkey(*)
        `)
        .eq('training_request_id', trainingRequestId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ isLoading: false });
      return ratings || [];

    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load training ratings',
        isLoading: false 
      });
      return [];
    }
  },

  getTrainerStats: async (trainerId: string) => {
    try {
      const { data: stats, error } = await supabase
        .from('trainer_stats')
        .select('*')
        .eq('trainer_id', trainerId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (stats) {
        set(state => ({
          trainerStats: {
            ...state.trainerStats,
            [trainerId]: stats
          }
        }));
        return stats;
      }

      return null;

    } catch (error: any) {
      console.error('Error loading trainer stats:', error);
      return null;
    }
  },

  getRatingsSummary: async (trainerId: string) => {
    try {
      const ratings = await get().getRatingsForTrainer(trainerId);
      
      if (ratings.length === 0) {
        return {
          total_ratings: 0,
          average_rating: 0,
          rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
          recent_reviews: []
        };
      }

      const totalRatings = ratings.length;
      const averageRating = ratings.reduce((sum, r) => sum + r.overall_rating, 0) / totalRatings;
      
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      ratings.forEach(rating => {
        const rounded = Math.round(rating.overall_rating) as keyof typeof distribution;
        distribution[rounded]++;
      });

      return {
        total_ratings: totalRatings,
        average_rating: averageRating,
        rating_distribution: distribution,
        recent_reviews: ratings.slice(0, 5) // Last 5 reviews
      };

    } catch (error: any) {
      console.error('Error getting ratings summary:', error);
      return {
        total_ratings: 0,
        average_rating: 0,
        rating_distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        recent_reviews: []
      };
    }
  },

  updateRating: async (ratingId: string, updates: Partial<TrainingRating>) => {
    try {
      set({ isLoading: true, error: null });

      const { data: rating, error } = await supabase
        .from('training_ratings')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', ratingId)
        .select(`
          *,
          training_request:training_requests(*),
          trainer:users!training_ratings_trainer_id_fkey(*),
          trainee:users!training_ratings_trainee_id_fkey(*)
        `)
        .single();

      if (error) throw error;

      // Update local state
      set(state => ({
        ratings: state.ratings.map(r => r.id === ratingId ? rating : r),
        isLoading: false,
      }));

    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to update rating',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteRating: async (ratingId: string) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from('training_ratings')
        .delete()
        .eq('id', ratingId);

      if (error) throw error;

      // Remove from local state
      set(state => ({
        ratings: state.ratings.filter(r => r.id !== ratingId),
        isLoading: false,
      }));

    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to delete rating',
        isLoading: false 
      });
      throw error;
    }
  },

  approveRating: async (ratingId: string) => {
    await get().updateRating(ratingId, { is_approved: true });
  },

  loadRatings: async () => {
    try {
      set({ isLoading: true, error: null });

      const { data: ratings, error } = await supabase
        .from('training_ratings')
        .select(`
          *,
          training_request:training_requests(*),
          trainer:users!training_ratings_trainer_id_fkey(*),
          trainee:users!training_ratings_trainee_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({ 
        ratings: ratings || [],
        isLoading: false 
      });

    } catch (error: any) {
      set({ 
        error: error.message || 'Failed to load ratings',
        isLoading: false 
      });
    }
  },

  updateTrainerStats: async (trainerId: string) => {
    try {
      // This would typically be handled by a database function/trigger
      // For now, we'll calculate stats on the client side
      const ratings = await get().getRatingsForTrainer(trainerId);
      
      if (ratings.length === 0) return;

      const stats: TrainerStats = {
        trainer_id: trainerId,
        total_ratings: ratings.length,
        average_overall_rating: ratings.reduce((sum, r) => sum + r.overall_rating, 0) / ratings.length,
        average_content_quality: ratings.reduce((sum, r) => sum + r.content_quality, 0) / ratings.length,
        average_delivery_quality: ratings.reduce((sum, r) => sum + r.delivery_quality, 0) / ratings.length,
        average_interaction_quality: ratings.reduce((sum, r) => sum + r.interaction_quality, 0) / ratings.length,
        average_organization_quality: ratings.reduce((sum, r) => sum + r.organization_quality, 0) / ratings.length,
        total_trainings_completed: ratings.length, // Simplified
        total_hours_trained: 0, // Would need to calculate from training requests
        last_updated: new Date().toISOString(),
      };

      set(state => ({
        trainerStats: {
          ...state.trainerStats,
          [trainerId]: stats
        }
      }));

    } catch (error) {
      console.error('Error updating trainer stats:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
