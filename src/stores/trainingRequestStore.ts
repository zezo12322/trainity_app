import { create } from 'zustand';
import { TrainingRequest } from '../types';
import trainingRequestService, { CreateTrainingRequestData, UpdateTrainingRequestData } from '../services/trainingRequestService';

interface TrainingRequestState {
  requests: TrainingRequest[];
  myRequests: TrainingRequest[];
  trainerRequests: TrainingRequest[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchMyRequests: () => Promise<void>;
  fetchAllRequests: () => Promise<void>;
  fetchTrainerRequests: () => Promise<void>;
  createRequest: (request: CreateTrainingRequestData) => Promise<TrainingRequest>;
  updateRequest: (id: string, updates: UpdateTrainingRequestData) => Promise<TrainingRequest>;
  deleteRequest: (id: string) => Promise<void>;
  assignTrainer: (requestId: string, trainerId: string) => Promise<TrainingRequest>;
  updateStatus: (requestId: string, status: string) => Promise<TrainingRequest>;
  getRequestById: (id: string) => Promise<TrainingRequest | null>;
  clearError: () => void;

  // Real-time subscriptions
  subscribeToMyRequests: () => () => void;
  subscribeToAllRequests: () => () => void;
}

export const useTrainingRequestStore = create<TrainingRequestState>((set, get) => ({
  requests: [],
  myRequests: [],
  trainerRequests: [],
  isLoading: false,
  error: null,

  fetchMyRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const requests = await trainingRequestService.getMyRequests();
      set({ myRequests: requests, isLoading: false });
    } catch (error) {
      console.error('Error fetching my requests:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch requests',
        isLoading: false
      });
    }
  },

  fetchAllRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const requests = await trainingRequestService.getAllRequests();
      set({ requests, isLoading: false });
    } catch (error) {
      console.error('Error fetching all requests:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch requests',
        isLoading: false
      });
    }
  },

  fetchTrainerRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const requests = await trainingRequestService.getTrainerRequests();
      set({ trainerRequests: requests, isLoading: false });
    } catch (error) {
      console.error('Error fetching trainer requests:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch trainer requests',
        isLoading: false
      });
    }
  },

  createRequest: async (requestData) => {
    set({ isLoading: true, error: null });
    try {
      const newRequest = await trainingRequestService.createRequest(requestData);

      set(state => ({
        myRequests: [newRequest, ...state.myRequests],
        requests: [newRequest, ...state.requests],
        isLoading: false
      }));

      return newRequest;
    } catch (error) {
      console.error('Error creating request:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to create request',
        isLoading: false
      });
      throw error;
    }
  },

  updateRequest: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updatedRequest = await trainingRequestService.updateRequest(id, updates);

      set(state => ({
        requests: state.requests.map(request =>
          request.id === id ? updatedRequest : request
        ),
        myRequests: state.myRequests.map(request =>
          request.id === id ? updatedRequest : request
        ),
        trainerRequests: state.trainerRequests.map(request =>
          request.id === id ? updatedRequest : request
        ),
        isLoading: false
      }));

      return updatedRequest;
    } catch (error) {
      console.error('Error updating request:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update request',
        isLoading: false
      });
      throw error;
    }
  },

  deleteRequest: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await trainingRequestService.deleteRequest(id);

      set(state => ({
        requests: state.requests.filter(request => request.id !== id),
        myRequests: state.myRequests.filter(request => request.id !== id),
        trainerRequests: state.trainerRequests.filter(request => request.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting request:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to delete request',
        isLoading: false
      });
      throw error;
    }
  },

  assignTrainer: async (requestId, trainerId) => {
    set({ isLoading: true, error: null });
    try {
      const updatedRequest = await trainingRequestService.assignTrainer(requestId, trainerId);

      set(state => ({
        requests: state.requests.map(request =>
          request.id === requestId ? updatedRequest : request
        ),
        isLoading: false
      }));

      return updatedRequest;
    } catch (error) {
      console.error('Error assigning trainer:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to assign trainer',
        isLoading: false
      });
      throw error;
    }
  },

  updateStatus: async (requestId, status) => {
    set({ isLoading: true, error: null });
    try {
      // Get current request to check approval path
      const currentRequest = await trainingRequestService.getRequestById(requestId);
      if (!currentRequest) throw new Error('Request not found');

      let finalStatus = status;

      // Handle alternative approval path (when PM is the requester)
      if (currentRequest.approval_path === 'pm_alternative') {
        // Skip PM approval step in alternative path
        if (status === 'cc_approved') {
          finalStatus = 'pm_approved'; // Skip to PM approved since PM is the requester
        }
      }

      const updatedRequest = await trainingRequestService.updateStatus(requestId, finalStatus);

      set(state => ({
        requests: state.requests.map(request =>
          request.id === requestId ? updatedRequest : request
        ),
        myRequests: state.myRequests.map(request =>
          request.id === requestId ? updatedRequest : request
        ),
        trainerRequests: state.trainerRequests.map(request =>
          request.id === requestId ? updatedRequest : request
        ),
        isLoading: false
      }));

      return updatedRequest;
    } catch (error) {
      console.error('Error updating status:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to update status',
        isLoading: false
      });
      throw error;
    }
  },

  getRequestById: async (id) => {
    try {
      return await trainingRequestService.getRequestById(id);
    } catch (error) {
      console.error('Error fetching request by ID:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch request'
      });
      return null;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  subscribeToMyRequests: () => {
    return trainingRequestService.subscribeToMyRequests((requests) => {
      set({ myRequests: requests });
    });
  },

  subscribeToAllRequests: () => {
    return trainingRequestService.subscribeToAllRequests((requests) => {
      set({ requests });
    });
  },
}));
