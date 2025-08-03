// This is a placeholder file to prevent import errors
// In a real app, this would contain your Supabase client configuration

// Mock user data
const mockUserData = {
  id: 'demo-123',
  email: 'demo@socially.com',
  user_metadata: {
    username: 'demo',
    display_name: 'Demo User',
    avatar_url: 'https://i.pravatar.cc/150?u=demo',
    role: 'user',
  }
};

export const supabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string, password: string }) => {
      // Return mock data for demo purposes
      return { 
        error: null, 
        data: { 
          user: mockUserData,
          session: { 
            access_token: 'mock-token', 
            user: mockUserData 
          }
        } 
      };
    },
    signUp: async () => ({ error: null, data: { user: mockUserData } }),
    signOut: async () => ({ error: null }),
    signInWithOAuth: async () => ({ error: null }),
    getSession: async () => ({ 
      data: { 
        session: { 
          access_token: 'mock-token', 
          user: mockUserData 
        } 
      } 
    }),
    getUser: async () => ({ data: { user: mockUserData } }),
    onAuthStateChange: (callback: Function) => {
      // Immediately call the callback with a session to simulate a logged-in state
      setTimeout(() => {
        callback('SIGNED_IN', { 
          access_token: 'mock-token', 
          user: mockUserData 
        });
      }, 100);
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    updateUser: async () => ({ 
      error: null, 
      data: { user: mockUserData } 
    }),
  },
  from: (table: string) => ({
    select: () => ({
      eq: (field: string, value: any) => ({
        single: async () => ({ data: null, error: null }),
      }),
    }),
    insert: async () => ({ error: null, data: [{ id: 'mock-id' }] }),
    update: async () => ({ error: null }),
  }),
  storage: {
    from: (bucket: string) => ({
      upload: async () => ({ data: { path: 'mock-path' }, error: null }),
      getPublicUrl: (path: string) => ({ data: { publicUrl: 'https://example.com/mock-image.jpg' } }),
    }),
  },
  rpc: (func: string, params: any) => {
    // Mock response for get_user_analytics
    if (func === 'get_user_analytics') {
      return {
        data: {
          growthMetrics: {
            followers: { value: '1,234', change: 5.2 },
            engagementRate: { value: '3.8%', change: 0.7 },
            reach: { value: '25.4K', change: 12.3 },
            impressions: { value: '48.7K', change: 8.1 },
          },
          topPerformingContent: [],
          audienceDemographics: [],
        },
        error: null
      };
    }
    return { data: null, error: null };
  }
};