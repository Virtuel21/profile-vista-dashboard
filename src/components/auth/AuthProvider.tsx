
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle Google OAuth tokens when user signs in
        if (event === 'SIGNED_IN' && session?.user && session?.provider_token) {
          console.log('Google sign-in detected, storing tokens...');
          // Store tokens in background without blocking the auth flow
          storeGoogleTokens(session).catch(error => {
            console.error('Failed to store Google tokens:', error);
            // Don't block the auth flow even if token storage fails
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const storeGoogleTokens = async (session: Session) => {
    try {
      if (!session.user || !session.provider_token) {
        console.log('No user or provider token found');
        return;
      }

      console.log('Starting Google token storage process...');

      // Set a timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Token storage timeout')), 10000); // 10 second timeout
      });

      const storagePromise = (async () => {
        // Check if Google account already exists
        const { data: existingAccount, error: fetchError } = await supabase
          .from('google_accounts')
          .select('*')
          .eq('user_id', session.user.id)
          .maybeSingle(); // Use maybeSingle to avoid errors when no record found

        if (fetchError) {
          console.error('Error fetching existing Google account:', fetchError);
          throw fetchError;
        }

        const googleAccountData = {
          user_id: session.user.id,
          email: session.user.email || '',
          google_account_id: session.user.user_metadata?.sub || session.user.id,
          access_token: session.provider_token,
          refresh_token: session.provider_refresh_token || null,
          token_expires_at: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
          updated_at: new Date().toISOString()
        };

        if (existingAccount) {
          console.log('Updating existing Google account with new tokens');
          // Update existing account with new tokens
          const { error } = await supabase
            .from('google_accounts')
            .update(googleAccountData)
            .eq('id', existingAccount.id);

          if (error) {
            console.error('Error updating Google account tokens:', error);
            throw error;
          } else {
            console.log('Successfully updated Google account tokens');
          }
        } else {
          console.log('Creating new Google account record');
          // Create new Google account record
          const { error } = await supabase
            .from('google_accounts')
            .insert([googleAccountData]);

          if (error) {
            console.error('Error creating Google account:', error);
            throw error;
          } else {
            console.log('Successfully created Google account with tokens');
          }
        }
      })();

      // Race between storage and timeout
      await Promise.race([storagePromise, timeoutPromise]);
      
    } catch (error) {
      console.error('Error storing Google tokens:', error);
      // Don't rethrow - we don't want to block the auth flow
    }
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        scopes: 'openid email profile https://www.googleapis.com/auth/business.manage https://www.googleapis.com/auth/plus.business.manage',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    signInWithGoogle,
    signOut,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
