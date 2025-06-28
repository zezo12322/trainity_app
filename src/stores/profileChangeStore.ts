import { create } from 'zustand';
import profileChangeService, { 
  ProfileChangeRequest, 
  CreateChangeRequestData, 
  UpdateChangeRequestData 
} from '../services/profileChangeService';

interface ProfileChangeState {
  myRequests: ProfileChangeRequest[];
  allRequests: ProfileChangeRequest[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchMyRequests: () => Promise<void>;
  fetchAllRequests: () => Promise<void>;
  createChangeRequest: (request: CreateChangeRequestData) => Promise<ProfileChangeRequest>;
  updateRequestStatus: (requestId: string, data: UpdateChangeRequestData) => Promise<ProfileChangeRequest>;
  deleteRequest: (requestId: string) => Promise<void>;
  hasPendingRequest: (fieldName: string) => Promise<boolean>;
  clearError: () => void;
  
  // Real-time subscriptions
  subscribeToMyRequests: () => () => void;
  subscribeToAllRequests: () => () => void;
}

export const useProfileChangeStore = create<ProfileChangeState>((set, get) => ({
  myRequests: [],
  allRequests: [],
  isLoading: false,
  error: null,

  fetchMyRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const requests = await profileChangeService.getMyChangeRequests();
      set({ myRequests: requests, isLoading: false });
    } catch (error) {
      console.error('Error fetching my change requests:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch change requests',
        isLoading: false 
      });
    }
  },

  fetchAllRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const requests = await profileChangeService.getAllChangeRequests();
      set({ allRequests: requests, isLoading: false });
    } catch (error) {
      console.error('Error fetching all change requests:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch change requests',
        isLoading: false 
      });
    }
  },

  createChangeRequest: async (requestData) => {
    set({ isLoading: true, error: null });
    try {
      const newRequest = await profileChangeService.createChangeRequest(requestData);
      
      set(state => ({
        myRequests: [newRequest, ...state.myRequests],
        allRequests: [newRequest, ...state.allRequests],
        isLoading: false
      }));
      
      return newRequest;
    } catch (error) {
      console.error('Error creating change request:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create change request',
        isLoading: false 
      });
      throw error;
    }
  },

  updateRequestStatus: async (requestId, data) => {
    set({ isLoading: true, error: null });
    try {
      const updatedRequest = await profileChangeService.updateChangeRequestStatus(requestId, data);
      
      set(state => ({
        myRequests: state.myRequests.map(req => 
          req.id === requestId ? updatedRequest : req
        ),
        allRequests: state.allRequests.map(req => 
          req.id === requestId ? updatedRequest : req
        ),
        isLoading: false
      }));
      
      return updatedRequest;
    } catch (error) {
      console.error('Error updating request status:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update request status',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteRequest: async (requestId) => {
    set({ isLoading: true, error: null });
    try {
      await profileChangeService.deleteChangeRequest(requestId);
      
      set(state => ({
        myRequests: state.myRequests.filter(req => req.id !== requestId),
        allRequests: state.allRequests.filter(req => req.id !== requestId),
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

  hasPendingRequest: async (fieldName) => {
    try {
      return await profileChangeService.hasPendingRequest(fieldName);
    } catch (error) {
      console.error('Error checking pending request:', error);
      return false;
    }
  },

  clearError: () => set({ error: null }),

  subscribeToMyRequests: () => {
    return profileChangeService.subscribeToMyRequests((requests) => {
      set({ myRequests: requests });
    });
  },

  subscribeToAllRequests: () => {
    return profileChangeService.subscribeToAllRequests((requests) => {
      set({ allRequests: requests });
    });
  },
}));
