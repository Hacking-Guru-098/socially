import React, { createContext, useState, useContext, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';
import { supabase } from '../lib/supabase'; // Assuming supabase client is initialized here
import { decode } from 'base64-arraybuffer'; // Needed for base64 uploads
import { Session, User } from '@supabase/supabase-js';

// Define types for user and auth context
type User = {
  id: string;
  email: string;
  user_metadata?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    website?: string;
    role?: string;
  };
};

// Define a basic type for Post data (adjust fields as needed based on your DB schema)
export type Post = {
  user_id: string;
  media_url?: string;
  caption?: string;
  platform: string;
  status: 'draft' | 'scheduled' | 'posting' | 'posted' | 'failed';
  scheduled_at?: string | null;
  // Add other relevant fields like hashtags, location, etc.
};

// Define types for Analytics Data
export type GrowthMetric = {
  value: string;
  change: number;
};

export type ContentPerformance = {
  id: string;
  type: 'photo' | 'video' | 'story';
  thumbnail: string;
  metric: string; // e.g., Likes, Views, Shares
  value: number;
};

export type AudienceDemographic = {
  label: string; // e.g., Age Group, Gender, Location
  value: string;
  percentage: number;
};

export type AnalyticsData = {
  growthMetrics: {
    followers: GrowthMetric;
    engagementRate: GrowthMetric;
    reach: GrowthMetric;
    impressions: GrowthMetric;
  };
  topPerformingContent: ContentPerformance[];
  audienceDemographics: AudienceDemographic[];
  // Add more fields as needed, e.g., bestPostingTimes
};

// Define types for Business Data
export type BrandDeal = {
  id: string;
  brandName: string;
  logo: string;
  status: 'active' | 'completed' | 'pending' | 'negotiating';
  dueDate?: string | null;
  amount: number;
  deliverables: string[];
};

export type FinancialOverview = {
  totalEarnings: number;
  pendingPayments: number;
  monthlyBreakdown: { month: string; earnings: number }[];
};

// Define type for Rate Card items
export type RateCardItem = {
  id: string;
  service: string; // e.g., Instagram Post, YouTube Video
  rate: number;
  description?: string;
};

export type BusinessData = {
  brandDeals: BrandDeal[];
  financialOverview: FinancialOverview;
  rateCard: RateCardItem[]; // Add rateCard
};

// Define Expense type (matching DB)
export type Expense = {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description?: string | null;
  expense_date: string; // ISO string
  created_at: string;
};

// Update the AuthContextType to include new properties
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: object) => Promise<void>;
  signOut: () => Promise<void>;
  twoFactorEnabled: boolean;
  updateUserMetadata: (metadata: { [key: string]: any }) => Promise<void>;
  uploadMedia: (fileUri: string) => Promise<string>;
  createPost: (postData: Omit<Post, 'user_id'>) => Promise<void>;
  fetchAnalyticsData: (period: '7d' | '30d' | '90d') => Promise<AnalyticsData>;
  fetchBusinessData: () => Promise<BusinessData>;
  fetchDealById: (dealId: string) => Promise<BrandDeal | null>;
  updateRateCard: (items: RateCardItem[]) => Promise<void>;
  fetchExpenses: () => Promise<Expense[]>;
  addExpense: (expenseData: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => Promise<Expense>;
  deleteExpense: (expenseId: string) => Promise<void>;
  updateExpense: (expenseId: string, expenseData: Omit<Expense, 'id' | 'user_id' | 'created_at'>) => Promise<Expense>;
  createDeal: (dealData: Omit<BrandDeal, 'id'>) => Promise<BrandDeal>;
  updateDeal: (dealId: string, dealData: Partial<Omit<BrandDeal, 'id'>>) => Promise<BrandDeal>;
  // 2FA / MFA
  enrollMfaFactor: () => Promise<any>; // Returns QR code info etc.
  challengeMfaFactor: (factorId: string) => Promise<any>; // Returns challenge ID
  verifyMfaChallenge: (factorId: string, challengeId: string, code: string) => Promise<any>; // Returns session
  unenrollMfaFactor: (factorId: string) => Promise<void>;
  listMfaFactors: () => Promise<any[]>; // Returns list of enrolled factors
  signInWithGoogle: () => Promise<void>; // New
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock database of users for demo
const mockUsers = [
  {
    id: 'demo-123',
    email: 'demo@socially.com',
    password: 'Demo123!',
    user_metadata: {
      username: 'demo',
      display_name: 'Demo User',
      avatar_url: 'https://i.pravatar.cc/150?u=demo',
      role: 'user',
    }
  },
  {
    id: 'admin-123',
    email: 'admin',
    password: 'admin',
    user_metadata: {
      username: 'admin',
      display_name: 'Admin User',
      avatar_url: 'https://i.pravatar.cc/150?u=admin',
      role: 'admin',
    }
  },
  {
    id: 'user-123',
    email: 'user@example.com',
    password: 'password123',
    user_metadata: {
      username: 'user',
      display_name: 'Regular User',
      avatar_url: 'https://i.pravatar.cc/150?u=user',
      role: 'user',
    }
  }
];

// Provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorPending, setTwoFactorPending] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<Array<any>>([]);

  // Initialize: check if user is logged in
  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
      setUser(session?.user ?? null);
        
        // Load 2FA state
        const twoFactorState = await SecureStore.getItemAsync('twoFactorEnabled');
        setTwoFactorEnabled(twoFactorState === 'true');

        // Load registered users from storage
        const registeredUsersStr = await SecureStore.getItemAsync('registeredUsers');
        if (registeredUsersStr) {
          setRegisteredUsers(JSON.parse(registeredUsersStr));
        } else {
          // Initialize with mock users if no registered users exist
          await SecureStore.setItemAsync('registeredUsers', JSON.stringify(mockUsers));
          setRegisteredUsers(mockUsers);
        }
      } catch (error) {
        console.error('Error loading user from storage:', error);
        setSession(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();

    // Auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AuthProvider: Auth state changed', _event);
      setSession(session);
      setUser(session?.user ?? null);
      // TODO: Update 2FA status on change
    });

    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('AuthProvider: Sign in error:', error.message);
      throw error;
    }
    console.log('AuthProvider: Sign in successful');
    // State update handled by onAuthStateChange listener
  };

  // Sign up function
  const signUp = async (email: string, password: string, metadata: object = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata, // e.g., { display_name: 'Initial Name' }
      },
    });
    if (error) {
      console.error('AuthProvider: Sign up error:', error.message);
      throw error;
    }
    console.log('AuthProvider: Sign up successful, user:', data.user);
    // State update handled by onAuthStateChange listener
    // Note: Might need email confirmation depending on Supabase settings
  };

  // Sign out function
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('AuthProvider: Sign out error:', error.message);
      throw error;
    }
    
    // Explicitly clear session and user state
    setSession(null);
    setUser(null);
    
    console.log('AuthProvider: Sign out successful');
    // Additional state update handled by onAuthStateChange listener
  };

  // Function to update user metadata (already exists, ensure it's correct)
  const updateUserMetadata = async (metadata: { [key: string]: any }) => {
    if (!user) throw new Error('User not authenticated');
    const { data, error } = await supabase.auth.updateUser({ data: metadata });
    if (error) {
       console.error('AuthProvider: Update metadata error:', error.message);
       throw error;
    }
    console.log('AuthProvider: Metadata updated, refreshing user state...');
    // Trigger a refresh of the session/user state locally if needed
    // The onAuthStateChange listener might not fire for metadata updates
    const { data: refreshedSessionData } = await supabase.auth.refreshSession();
    if(refreshedSessionData.user) setUser(refreshedSessionData.user);
    else {
        // Fallback if refresh doesn't update user immediately
        const { data: { user: updatedUser } } = await supabase.auth.getUser();
        setUser(updatedUser ?? null);
    }
  };

  // Function to upload media to Supabase Storage
  const uploadMedia = async (fileUri: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    if (!fileUri) throw new Error('No file URI provided for upload.');

    try {
      // Create a readable stream or blob for upload 
      // (Using fetch/blob is common for React Native)
      const response = await fetch(fileUri);
      const blob = await response.blob();
      
      // Generate a unique file path
      const fileExt = fileUri.split('.').pop() || 'jpg'; // Default extension
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const bucketName = 'posts'; // Ensure this bucket exists and has correct policies

      console.log(`AuthProvider: Uploading media to ${bucketName}/${filePath}`);
      
      // Upload the file
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false, 
          contentType: blob.type || 'image/jpeg', // Pass content type
        });

      if (error) {
        console.error('AuthProvider: Supabase upload error:', error);
        throw new Error(`Upload failed: ${error.message}`);
      }
      console.log('AuthProvider: Supabase upload successful:', data);

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Failed to get public URL for uploaded media.');
      }

      console.log('AuthProvider: Media public URL:', urlData.publicUrl);
      return urlData.publicUrl;

    } catch (error) {
      console.error('AuthProvider: Upload process error:', error);
      // Ensure error is an instance of Error before re-throwing
      if (error instanceof Error) throw error;
      else throw new Error('An unknown upload error occurred');
    }
  };

  // Function to create a post record in the database
  const createPost = async (postData: Omit<Post, 'user_id'>) => {
    if (!user) throw new Error('User not authenticated');

    // Ensure required fields are present and set defaults if necessary
    const postToInsert = {
        user_id: user.id,
        media_url: postData.media_url || null,
        caption: postData.caption || null,
        platform: postData.platform || 'instagram', // Default platform if not provided
        status: postData.status || 'posted', // Default to 'posted' if not provided
        scheduled_at: postData.scheduled_at || null, // Use null if undefined
    };
    
    // Basic validation: if status is scheduled, scheduled_at must be provided
    if (postToInsert.status === 'scheduled' && !postToInsert.scheduled_at) {
        throw new Error('Scheduled posts must have a scheduled_at date.');
    }
    // Basic validation: if status is not scheduled, scheduled_at should be null
    if (postToInsert.status !== 'scheduled' && postToInsert.scheduled_at) {
        console.warn('AuthProvider: scheduled_at provided for non-scheduled post. Setting to null.');
        postToInsert.scheduled_at = null;
    }
    
    console.log('AuthProvider: Creating post with data:', postToInsert);

    try {
      const { data, error } = await supabase
        .from('posts') 
        .insert([postToInsert]) 
        .select();

      if (error) {
        console.error('AuthProvider: Error creating post:', error);
        throw new Error(`Failed to create post: ${error.message}`);
      }

      console.log('AuthProvider: Post created/saved successfully:', data);

    } catch (error) {
      console.error('AuthProvider: Create post process error:', error);
      if (error instanceof Error) throw error;
      else throw new Error('An unknown error occurred while creating post');
    }
  };

  // Function to fetch analytics data (MOCK)
  const fetchAnalyticsData = async (period: '7d' | '30d' | '90d' = '30d'): Promise<AnalyticsData> => {
    if (!user) throw new Error('User not authenticated');
    console.log(`AuthProvider: Fetching analytics data for period: ${period}`);

    try {
      const { data, error } = await supabase.rpc('get_user_analytics', { 
         p_user_id: user.id,
         p_period: period // Pass period to the function
      });

      if (error) {
        console.error('AuthProvider: Error calling get_user_analytics RPC:', error);
        throw new Error(`Failed to fetch analytics: ${error.message}`);
      }

      console.log('AuthProvider: Analytics data received from RPC:', data);
      if (!data) {
          throw new Error('No analytics data returned from function.');
      }
      
      return data as AnalyticsData; 

    } catch (error) {
      console.error('AuthProvider: Fetch Analytics Data Error:', error);
      if (error instanceof Error) throw error;
      else throw new Error('An unknown error occurred fetching analytics data');
    }
  };

  // Function to fetch business data (MOCK)
  const fetchBusinessData = async (): Promise<BusinessData> => {
    if (!user) throw new Error('User not authenticated');
    console.log('AuthProvider: Fetching real business data for user:', user.id);

    try {
      const currentYear = new Date().getFullYear();
      const firstDayOfYear = new Date(currentYear, 0, 1).toISOString();
      const lastDayOfYear = new Date(currentYear, 11, 31, 23, 59, 59, 999).toISOString();

      // --- Fetch Deals and Expenses in Parallel --- 
      const [dealsResult, expensesResult, rateCardResult] = await Promise.all([
          supabase
            .from('deals')
            .select('id, brand_name, logo_url, status, due_date, amount, deliverables, created_at, updated_at')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('expenses')
            .select('amount, expense_date')
            .eq('user_id', user.id)
            .gte('expense_date', firstDayOfYear)
            .lte('expense_date', lastDayOfYear),
          supabase
            .from('rate_card_items')
            .select('id, service, rate, description')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
      ]);

      // Check for errors after parallel fetch
      if (dealsResult.error) throw new Error(`Deals fetch failed: ${dealsResult.error.message}`);
      if (expensesResult.error) throw new Error(`Expenses fetch failed: ${expensesResult.error.message}`);
      if (rateCardResult.error) throw new Error(`Rate card fetch failed: ${rateCardResult.error.message}`);
      
      const dealsData = dealsResult.data || [];
      const expensesData = expensesResult.data || [];
      const rateCardData = rateCardResult.data || [];

      // --- Calculate Financial Overview --- 
      let totalEarningsYTD = 0;
      let pendingPayments = 0;
      const monthlyTotals: { [key: string]: { earnings: number; expenses: number } } = {};
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      // Initialize monthly totals
      for (let i = 0; i < 12; i++) {
        monthlyTotals[monthNames[i]] = { earnings: 0, expenses: 0 };
      }

      // Process deals for YTD Earnings, Pending Payments, and Monthly Earnings
      dealsData.forEach(deal => {
          const dealCompletedDate = deal.status === 'completed' && deal.updated_at ? new Date(deal.updated_at) : null;
          const dealCompletedYear = dealCompletedDate?.getFullYear();
          const dealCompletedMonthIndex = dealCompletedDate?.getMonth(); // 0-11
          
          if (dealCompletedYear === currentYear && dealCompletedMonthIndex !== undefined) {
             totalEarningsYTD += deal.amount || 0;
             const monthName = monthNames[dealCompletedMonthIndex];
             monthlyTotals[monthName].earnings += deal.amount || 0;
          }
          if (deal.status === 'active' || deal.status === 'pending') {
             pendingPayments += deal.amount || 0;
          }
      });

      // Process expenses for Monthly Expenses
      expensesData.forEach(expense => {
          const expenseDate = new Date(expense.expense_date);
          const expenseMonthIndex = expenseDate.getMonth(); // 0-11
          const monthName = monthNames[expenseMonthIndex];
          monthlyTotals[monthName].expenses += expense.amount || 0;
      });
      
      // Format monthly breakdown (could filter for only months with activity)
      const monthlyBreakdown = monthNames.map(month => ({
          month,
          // You might want net income (earnings - expenses) or just earnings here
          earnings: monthlyTotals[month].earnings, 
          // expenses: monthlyTotals[month].expenses // Optionally include expenses
      })).filter(m => m.earnings > 0 || monthlyTotals[m.month].expenses > 0); // Filter empty months
      
      const financialOverview: FinancialOverview = {
        totalEarnings: totalEarningsYTD,
        pendingPayments: pendingPayments,
        monthlyBreakdown: monthlyBreakdown.length > 0 ? monthlyBreakdown : [], // Return empty array if no activity
      };
      // --- End Financial Overview Calculation --- 
      
      // --- Format Deals and Rate Card --- 
      const formattedDeals: BrandDeal[] = dealsData.map(deal => ({
          id: deal.id,
          brandName: deal.brand_name,
          logo: deal.logo_url || 'logo_url',
          status: deal.status as BrandDeal['status'],
          dueDate: deal.due_date,
          amount: deal.amount,
          deliverables: deal.deliverables || [],
      }));
      
      const formattedRateCard: RateCardItem[] = rateCardData.map(item => ({
          id: item.id,
          service: item.service,
          rate: item.rate,
          description: item.description,
      }));

      return {
        brandDeals: formattedDeals,
        financialOverview: financialOverview, // Use fully calculated overview
        rateCard: formattedRateCard,
      };

    } catch (error) {
      console.error('AuthProvider: Fetch Business Data Error:', error);
      if (error instanceof Error) throw error;
      else throw new Error('An unknown error occurred fetching business data');
    }
  };

  // Function to fetch a single deal by ID (MOCK)
  const fetchDealById = async (dealId: string): Promise<BrandDeal | null> => {
    if (!user) throw new Error('User not authenticated');
    if (!dealId) return null;
    console.log(`AuthProvider: Fetching real deal data for ID: ${dealId}`);

    try {
      const { data, error } = await supabase
        .from('deals')
        .select('id, brand_name, logo_url, status, due_date, amount, deliverables')
        .eq('id', dealId)
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle() to return null if not found

      if (error) {
        console.error('AuthProvider: Error fetching deal by ID:', error);
        throw new Error(`Failed to fetch deal: ${error.message}`);
      }

      if (!data) return null;

      // Map data
       const formattedDeal: BrandDeal = {
          id: data.id,
          brandName: data.brand_name,
          logo: data.logo_url || 'https://picsum.photos/seed/defaultlogo/50',
          status: data.status as BrandDeal['status'],
          dueDate: data.due_date,
          amount: data.amount,
          deliverables: data.deliverables || [],
      };
      
      return formattedDeal;

    } catch (error) {
      console.error('AuthProvider: Fetch Deal By ID Error:', error);
      if (error instanceof Error) throw error;
      else throw new Error('An unknown error occurred fetching deal by ID');
    }
  };

  // Function to update the user's rate card (MOCK IMPLEMENTATION)
  const updateRateCard = async (items: RateCardItem[]) => {
    if (!user) throw new Error('User not authenticated');
    console.log(`AuthProvider: Updating rate card for user: ${user.id}`);

    try {
        // Delete existing items for the user
        const { error: deleteError } = await supabase
            .from('rate_card_items')
            .delete()
            .eq('user_id', user.id);

        if (deleteError) {
            console.error('AuthProvider: Error deleting old rate card items:', deleteError);
            throw new Error(`Failed to delete old rate card items: ${deleteError.message}`);
        }

        // Prepare new items for insertion (ensure user_id is added)
        const itemsToInsert = items.map(({ id, ...item }) => ({ // Exclude frontend temp ID if it exists
            ...item,
            user_id: user.id,
        }));
        
        // Only insert if there are items to insert
        if (itemsToInsert.length > 0) {
            const { error: insertError } = await supabase
                .from('rate_card_items')
                .insert(itemsToInsert);

            if (insertError) {
                console.error('AuthProvider: Error inserting new rate card items:', insertError);
                throw new Error(`Failed to insert new rate card items: ${insertError.message}`);
            }
        }
        
        console.log('AuthProvider: Rate card updated successfully.');
        // Consider triggering a refetch of businessData if needed elsewhere immediately

    } catch (error) {
       console.error('AuthProvider: Update Rate Card Error:', error);
       if (error instanceof Error) throw error;
       else throw new Error('An unknown error occurred updating rate card');
    }
  };

  // --- NEW Expense Functions --- 
  const fetchExpenses = async (): Promise<Expense[]> => {
      if (!user) throw new Error('User not authenticated');
      console.log(`AuthProvider: Fetching expenses for user: ${user.id}`);
      try {
          const { data, error } = await supabase
              .from('expenses')
              .select('id, user_id, amount, category, description, expense_date, created_at')
              .eq('user_id', user.id)
              .order('expense_date', { ascending: false });

          if (error) {
              console.error('AuthProvider: Error fetching expenses:', error);
              throw new Error(`Failed to fetch expenses: ${error.message}`);
          }
          console.log(`AuthProvider: Fetched ${data?.length || 0} expenses.`);
          return data as Expense[] || []; // Ensure return type is correct
      } catch (error) {
          console.error('AuthProvider: Fetch Expenses Error:', error);
          if (error instanceof Error) throw error;
          else throw new Error('An unknown error occurred fetching expenses');
      }
  };

  const addExpense = async (expenseData: Omit<Expense, 'id' | 'user_id' | 'created_at'>): Promise<Expense> => {
      if (!user) throw new Error('User not authenticated');
      console.log(`AuthProvider: Adding expense for user: ${user.id}`);
      const expenseToInsert = {
          ...expenseData,
          user_id: user.id,
      };
      try {
          const { data, error } = await supabase
              .from('expenses')
              .insert([expenseToInsert])
              .select()
              .single(); // Expecting a single row back

          if (error) {
              console.error('AuthProvider: Error adding expense:', error);
              throw new Error(`Failed to add expense: ${error.message}`);
          }
          if (!data) {
              throw new Error('Failed to add expense, no data returned.');
          }
          console.log('AuthProvider: Expense added successfully:', data);
          return data as Expense;
      } catch (error) {
          console.error('AuthProvider: Add Expense Error:', error);
          if (error instanceof Error) throw error;
          else throw new Error('An unknown error occurred adding expense');
      }
  };
  
  const deleteExpense = async (expenseId: string): Promise<void> => {
      if (!user) throw new Error('User not authenticated');
      console.log(`AuthProvider: Deleting expense ID: ${expenseId} for user: ${user.id}`);
      try {
          const { error } = await supabase
              .from('expenses')
              .delete()
              .eq('id', expenseId)
              .eq('user_id', user.id); // Ensure user can only delete their own

          if (error) {
              console.error('AuthProvider: Error deleting expense:', error);
              throw new Error(`Failed to delete expense: ${error.message}`);
          }
          console.log(`AuthProvider: Expense ${expenseId} deleted successfully.`);
      } catch (error) {
          console.error('AuthProvider: Delete Expense Error:', error);
          if (error instanceof Error) throw error;
          else throw new Error('An unknown error occurred deleting expense');
      }
  };

  // --- NEW Update Expense Function ---
  const updateExpense = async (expenseId: string, expenseData: Omit<Expense, 'id' | 'user_id' | 'created_at'>): Promise<Expense> => {
      if (!user) throw new Error('User not authenticated');
      console.log(`AuthProvider: Updating expense ID: ${expenseId} for user: ${user.id}`);
      
      const expenseToUpdate = {
          ...expenseData,
          updated_at: new Date().toISOString(), // Add updated_at timestamp
      };
      
      try {
          const { data, error } = await supabase
              .from('expenses')
              .update(expenseToUpdate)
              .eq('id', expenseId)
              .eq('user_id', user.id) // Ensure user owns the expense
              .select()
              .single(); // Expect a single row back

          if (error) {
              console.error('AuthProvider: Error updating expense:', error);
              throw new Error(`Failed to update expense: ${error.message}`);
          }
          if (!data) {
              throw new Error('Failed to update expense, no data returned.');
          }
          console.log('AuthProvider: Expense updated successfully:', data);
          return data as Expense;
      } catch (error) {
          console.error('AuthProvider: Update Expense Error:', error);
          if (error instanceof Error) throw error;
          else throw new Error('An unknown error occurred updating expense');
      }
  };
  // --- End Expense Functions --- 

  // --- NEW Deal Management Functions ---
  const createDeal = async (dealData: Omit<BrandDeal, 'id'>): Promise<BrandDeal> => {
      if (!user) throw new Error('User not authenticated');
      console.log(`AuthProvider: Creating new deal for user: ${user.id}`);
      
      // Map frontend BrandDeal type to backend deals table columns
      const dealToInsert = {
          user_id: user.id,
          brand_name: dealData.brandName,
          logo_url: dealData.logo, // Assume logo is a URL
          status: dealData.status || 'pending', // Default status
          due_date: dealData.dueDate,
          amount: dealData.amount || 0,
          deliverables: dealData.deliverables || [],
      };
      
      try {
          const { data, error } = await supabase
              .from('deals')
              .insert([dealToInsert])
              .select('id, brand_name, logo_url, status, due_date, amount, deliverables') // Select columns matching BrandDeal
              .single();

          if (error) {
              console.error('AuthProvider: Error creating deal:', error);
              throw new Error(`Failed to create deal: ${error.message}`);
          }
          if (!data) {
              throw new Error('Failed to create deal, no data returned.');
          }
          console.log('AuthProvider: Deal created successfully:', data);
          // Map back to BrandDeal type
          return {
              id: data.id,
              brandName: data.brand_name,
              logo: data.logo_url || '',
              status: data.status as BrandDeal['status'],
              dueDate: data.due_date,
              amount: data.amount,
              deliverables: data.deliverables
          };
      } catch (error) {
          console.error('AuthProvider: Create Deal Error:', error);
          if (error instanceof Error) throw error;
          else throw new Error('An unknown error occurred creating deal');
      }
  };

  const updateDeal = async (dealId: string, dealData: Partial<Omit<BrandDeal, 'id'>>): Promise<BrandDeal> => {
      if (!user) throw new Error('User not authenticated');
      console.log(`AuthProvider: Updating deal ID: ${dealId} for user: ${user.id}`);

      // Map partial frontend BrandDeal type to backend deals table columns
      const dealToUpdate: { [key: string]: any } = {
           updated_at: new Date().toISOString(), // Always update timestamp
      };
      if (dealData.brandName !== undefined) dealToUpdate.brand_name = dealData.brandName;
      if (dealData.logo !== undefined) dealToUpdate.logo_url = dealData.logo;
      if (dealData.status !== undefined) dealToUpdate.status = dealData.status;
      if (dealData.dueDate !== undefined) dealToUpdate.due_date = dealData.dueDate;
      if (dealData.amount !== undefined) dealToUpdate.amount = dealData.amount;
      if (dealData.deliverables !== undefined) dealToUpdate.deliverables = dealData.deliverables;
      
      // Prevent updating if no fields are provided (except updated_at)
      if (Object.keys(dealToUpdate).length <= 1) {
           console.warn('AuthProvider: Update Deal called with no data to update.');
           // Optionally fetch and return the existing deal
           const existingDeal = await fetchDealById(dealId);
           if (!existingDeal) throw new Error ('Deal not found for update');
           return existingDeal;
      }
      
      try {
          const { data, error } = await supabase
              .from('deals')
              .update(dealToUpdate)
              .eq('id', dealId)
              .eq('user_id', user.id)
              .select('id, brand_name, logo_url, status, due_date, amount, deliverables')
              .single();

          if (error) {
              console.error('AuthProvider: Error updating deal:', error);
              throw new Error(`Failed to update deal: ${error.message}`);
          }
          if (!data) {
              throw new Error('Failed to update deal, no data returned.');
          }
          console.log('AuthProvider: Deal updated successfully:', data);
          // Map back to BrandDeal type
          return {
              id: data.id,
              brandName: data.brand_name,
              logo: data.logo_url || '',
              status: data.status as BrandDeal['status'],
              dueDate: data.due_date,
              amount: data.amount,
              deliverables: data.deliverables
          };
      } catch (error) {
          console.error('AuthProvider: Update Deal Error:', error);
          if (error instanceof Error) throw error;
          else throw new Error('An unknown error occurred updating deal');
      }
  };
  // --- End Deal Management Functions ---

  // --- NEW MFA/2FA Functions (Stubs/Implementations) ---
  const enrollMfaFactor = async () => {
      if (!user) throw new Error('User not authenticated');
      console.log('AuthProvider: Enrolling new MFA factor...');
      try {
          const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
          if (error) throw error;
          console.log('AuthProvider: MFA Enrollment initiated:', data);
          // data contains { id, factorType, status, friendlyName, totp: { qr_code, secret, uri } }
          // Frontend needs to show QR code (data.totp.qr_code) and prompt user to verify
          return data;
      } catch (error) {
          console.error('AuthProvider: MFA Enroll Error:', error);
          if (error instanceof Error) throw error;
          else throw new Error('An unknown error occurred during MFA enrollment.');
      }
  };

  const challengeMfaFactor = async (factorId: string) => {
      if (!user) throw new Error('User not authenticated');
      console.log(`AuthProvider: Creating MFA challenge for factor: ${factorId}...`);
      try {
          const { data, error } = await supabase.auth.mfa.challenge({ factorId });
          if (error) throw error;
          console.log('AuthProvider: MFA Challenge created:', data);
          // data contains { id (challengeId), factorId, createdAt, verified, ipAddress }
          return data; // Return challenge ID (data.id)
      } catch (error) {
          console.error('AuthProvider: MFA Challenge Error:', error);
          if (error instanceof Error) throw error;
          else throw new Error('An unknown error occurred creating MFA challenge.');
      }
  };

  const verifyMfaChallenge = async (factorId: string, challengeId: string, code: string) => {
      if (!user) throw new Error('User not authenticated');
      console.log(`AuthProvider: Verifying MFA challenge for factor: ${factorId}...`);
      try {
          const { data, error } = await supabase.auth.mfa.verify({ factorId, challengeId, code });
          if (error) throw error;
          console.log('AuthProvider: MFA Verification successful, session:', data);
          // On successful verification AFTER enrollment, the factor is enabled.
          // On successful verification DURING sign-in, data contains the session.
          // We might need to update local session state here if needed.
          // setSession(data.session); // Example if verifying during login
          return data; 
      } catch (error) {
          console.error('AuthProvider: MFA Verify Error:', error);
          if (error instanceof Error) throw error;
          else throw new Error('An unknown error occurred verifying MFA challenge.');
      }
  };

  const unenrollMfaFactor = async (factorId: string) => {
      if (!user) throw new Error('User not authenticated');
      console.log(`AuthProvider: Unenrolling MFA factor: ${factorId}...`);
      try {
          const { data, error } = await supabase.auth.mfa.unenroll({ factorId });
          if (error) throw error;
          console.log('AuthProvider: MFA Unenroll successful:', data); // data is { id } of unenrolled factor
      } catch (error) {
          console.error('AuthProvider: MFA Unenroll Error:', error);
          if (error instanceof Error) throw error;
          else throw new Error('An unknown error occurred during MFA unenrollment.');
      }
  };

  const listMfaFactors = async (): Promise<any[]> => {
      if (!user) throw new Error('User not authenticated');
      console.log('AuthProvider: Listing MFA factors...');
      try {
          const { data, error } = await supabase.auth.mfa.listFactors();
          if (error) throw error;
          console.log('AuthProvider: MFA factors retrieved:', data);
          // data contains { all: Factor[], totp: Factor[] }
          return data.all || []; // Return all enrolled factors
      } catch (error) {
          console.error('AuthProvider: MFA List Factors Error:', error);
          if (error instanceof Error) throw error;
          else throw new Error('An unknown error occurred listing MFA factors.');
      }
  };
  // --- End MFA/2FA Functions ---

  // --- NEW Social Login Functions ---
  const signInWithGoogle = async () => {
    console.log('AuthProvider: Attempting Google Sign-in...');
    try {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                // Add options like redirect URL if needed for web
                // redirectTo: 'yourapp://callback' 
                // For Expo Go / Dev Client, deep linking setup is required
                // For standalone apps, configure custom URL schemes
                queryParams: {
                   access_type: 'offline',
                   prompt: 'consent',
                },
            },
        });
        
        if (error) {
           console.error('AuthProvider: Google Sign-in error:', error);
           throw error;
        }
        
        // On mobile, Supabase handles the redirect and session update via deep linking
        // The onAuthStateChange listener should pick up the new session
        console.log('AuthProvider: Google Sign-in initiated. Waiting for redirect/callback.', data);
        // data object contains { provider, url }
        // You might use the url with react-native-web-browser or similar if needed manually

    } catch (error) {
        console.error('AuthProvider: Google Sign-in process error:', error);
        if (error instanceof Error) throw error;
        else throw new Error('An unknown error occurred during Google Sign-in.');
    }
  };
  // --- End Social Login Functions ---

  const value = {
    session,
    user,
    isLoading,
    signIn,
    signUp,
    signOut,
    twoFactorEnabled,
    updateUserMetadata,
    uploadMedia,
    createPost,
    fetchAnalyticsData,
    fetchBusinessData,
    fetchDealById,
    updateRateCard,
    fetchExpenses,
    addExpense,
    deleteExpense,
    updateExpense,
    createDeal,
    updateDeal,
    enrollMfaFactor,
    challengeMfaFactor,
    verifyMfaChallenge,
    unenrollMfaFactor,
    listMfaFactors,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}