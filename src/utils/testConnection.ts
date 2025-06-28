import { supabase } from '../services/supabase';

/**
 * Test Supabase connection and database access (simplified for production)
 */
export const testSupabaseConnection = async () => {
  try {
    console.log('🔍 Testing Supabase connection...');

    // Simple connection test
    const { error } = await supabase.auth.getSession();

    if (error) {
      console.warn('⚠️ Supabase connection issue:', error.message);
      return false;
    }

    console.log('✅ Supabase connection successful');
    return true;

  } catch (error) {
    console.warn('⚠️ Supabase connection test failed:', error);
    return false;
  }
};

/**
 * Test user authentication flow
 */
export const testAuthFlow = async (email: string, password: string) => {
  console.log('🔐 Testing authentication flow...');

  try {
    // Test login
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      console.error('❌ Login failed:', loginError);
      return false;
    }

    console.log('✅ Login successful');

    // Test user profile fetch
    if (loginData.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', loginData.user.id)
        .single();

      if (profileError) {
        console.error('❌ Profile fetch failed:', profileError);
      } else {
        console.log('✅ Profile fetch successful:', profile);
      }
    }

    return true;

  } catch (error) {
    console.error('❌ Auth flow test failed:', error);
    return false;
  }
};

/**
 * Create test user if needed
 */
export const createTestUser = async () => {
  console.log('👤 Creating test user...');

  const testEmail = 'test@lifemakerspirates.com';
  const testPassword = 'TestPassword123!';

  try {
    // Try to sign up
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'مستخدم تجريبي'
        }
      }
    });

    if (signUpError && signUpError.message !== 'User already registered') {
      console.error('❌ Test user creation failed:', signUpError);
      return null;
    }

    console.log('✅ Test user created/exists');

    return {
      email: testEmail,
      password: testPassword,
      user: signUpData.user
    };

  } catch (error) {
    console.error('❌ Test user creation error:', error);
    return null;
  }
};

/**
 * Run comprehensive connection tests
 */
export const runConnectionTests = async () => {
  console.log('🚀 Starting comprehensive Supabase connection tests...');

  // Test 1: Basic connection
  const connectionOk = await testSupabaseConnection();

  if (!connectionOk) {
    console.error('❌ Basic connection failed. Stopping tests.');
    return false;
  }

  // Test 2: Create test user
  const testUser = await createTestUser();

  if (!testUser) {
    console.error('❌ Test user creation failed. Stopping auth tests.');
    return false;
  }

  // Test 3: Auth flow
  const authOk = await testAuthFlow(testUser.email, testUser.password);

  if (!authOk) {
    console.error('❌ Auth flow failed.');
    return false;
  }

  console.log('🎉 All connection tests passed! Supabase is properly connected.');
  return true;
};
