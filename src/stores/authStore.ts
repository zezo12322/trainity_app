import { create } from 'zustand';
import { startTransition } from 'react';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { supabase, signIn, signOut } from '../services/supabase';
import { STORAGE_KEYS } from '../constants';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
  updateUser: (userData: Partial<User>) => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await signIn(email, password);

          if (error) {
            throw new Error(error.message);
          }

          if (data.user) {
            // Fetch user profile from our profiles table
            const { data: userProfile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();

            if (profileError) {
              console.error('Profile fetch error:', profileError);
              throw new Error('Failed to fetch user profile');
            }

            if (!userProfile) {
              // Profile doesn't exist, try to create one
              console.log('Profile not found, creating new profile...');

              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: data.user.id,
                  email: data.user.email || '',
                  full_name: data.user.user_metadata?.full_name || 'مستخدم جديد',
                  role: 'trainee',
                  province: 'القاهرة',
                  center: 'المركز الرئيسي',
                  is_active: true,
                })
                .select()
                .single();

              if (createError) {
                console.error('Error creating profile:', createError);
                throw new Error('Failed to create user profile');
              }

              const user: User = {
                id: newProfile.id,
                email: newProfile.email,
                full_name: newProfile.full_name,
                role: newProfile.role,
                province: newProfile.province,
                center: newProfile.center,
                phone: newProfile.phone,
                avatar_url: newProfile.avatar_url,
                is_active: newProfile.is_active,
                created_at: newProfile.created_at,
                updated_at: newProfile.updated_at,
              };

              set({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
              return;
            }

            const user: User = {
              id: userProfile.id,
              email: userProfile.email,
              full_name: userProfile.full_name,
              role: userProfile.role,
              province: userProfile.province,
              center: userProfile.center,
              phone: userProfile.phone,
              avatar_url: userProfile.avatar_url,
              is_active: userProfile.is_active,
              created_at: userProfile.created_at,
              updated_at: userProfile.updated_at,
            };

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Login failed',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          const { error } = await signOut();

          if (error) {
            throw new Error(error.message);
          }

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Logout failed',
            isLoading: false,
          });
          throw error;
        }
      },

      loadUser: async () => {
        set({ isLoading: true });

        try {
          // Get current session first
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('Session error:', sessionError);
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
            return;
          }

          if (!session?.user) {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
            return;
          }

          const authUser = session.user;

          if (authUser) {
            // Fetch user profile from our profiles table
            const { data: userProfile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authUser.id)
              .maybeSingle();

            if (profileError) {
              console.error('Profile fetch error in loadUser:', profileError);
              throw new Error('Failed to fetch user profile');
            }

            if (!userProfile) {
              // Profile doesn't exist, try to create one
              console.log('Profile not found in loadUser, creating new profile...');

              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: authUser.id,
                  email: authUser.email || '',
                  full_name: authUser.user_metadata?.full_name || 'مستخدم جديد',
                  role: 'trainee',
                  province: 'القاهرة',
                  center: 'المركز الرئيسي',
                  is_active: true,
                })
                .select()
                .single();

              if (createError) {
                console.error('Error creating profile:', createError);
                throw new Error('Failed to create user profile');
              }

              const user: User = {
                id: newProfile.id,
                email: newProfile.email,
                full_name: newProfile.full_name,
                role: newProfile.role,
                province: newProfile.province,
                center: newProfile.center,
                phone: newProfile.phone,
                avatar_url: newProfile.avatar_url,
                is_active: newProfile.is_active,
                created_at: newProfile.created_at,
                updated_at: newProfile.updated_at,
              };

              set({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              });
              return;
            }

            const user: User = {
              id: userProfile.id,
              email: userProfile.email,
              full_name: userProfile.full_name,
              role: userProfile.role,
              province: userProfile.province,
              center: userProfile.center,
              phone: userProfile.phone,
              avatar_url: userProfile.avatar_url,
              is_active: userProfile.is_active,
              created_at: userProfile.created_at,
              updated_at: userProfile.updated_at,
            };

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            });
          }
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Failed to load user',
            isLoading: false,
            isAuthenticated: false,
            user: null,
          });
        }
      },

      clearError: () => {
        set({ error: null });
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      // Initialize auth listener
      initialize: () => {
        try {
          // Listen for auth state changes
          supabase.auth.onAuthStateChange(async (event, session) => {
            try {
              console.log('Auth state changed:', event, session?.user?.email);

              if (event === 'SIGNED_IN' && session?.user) {
                // User signed in, load their profile
                const authUser = session.user;

                const { data: userProfile, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', authUser.id)
                  .maybeSingle();

                if (profileError || !userProfile) {
                  console.warn('Profile fetch issue:', profileError);
                  // Create basic user if profile doesn't exist
                  const basicUser: User = {
                    id: authUser.id,
                    email: authUser.email || '',
                    full_name: authUser.user_metadata?.full_name || 'مستخدم',
                    role: 'trainee',
                    province: 'القاهرة',
                    center: 'المركز الرئيسي',
                    phone: null,
                    avatar_url: null,
                    is_active: true,
                    created_at: authUser.created_at,
                    updated_at: new Date().toISOString(),
                  };

                  useAuthStore.setState({
                    user: basicUser,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                  });
                  return;
                }

                const user: User = {
                  id: userProfile.id,
                  email: userProfile.email,
                  full_name: userProfile.full_name,
                  role: userProfile.role,
                  province: userProfile.province,
                  center: userProfile.center || '',
                  phone: userProfile.phone || '',
                  avatar_url: userProfile.avatar_url,
                  is_active: userProfile.is_active,
                  created_at: userProfile.created_at,
                  updated_at: userProfile.updated_at,
                };

                startTransition(() => {
                  useAuthStore.setState({
                    user,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                  });
                });
              } else if (event === 'SIGNED_OUT') {
                // User signed out
                startTransition(() => {
                  useAuthStore.setState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                  });
                });
              }
            } catch (error) {
              console.warn('Auth state change error:', error);
              // Don't crash the app, just log the error
            }
          });
        } catch (error) {
          console.warn('Auth initialization error:', error);
        }
      },
    }),
    {
      name: STORAGE_KEYS.USER_DATA,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
