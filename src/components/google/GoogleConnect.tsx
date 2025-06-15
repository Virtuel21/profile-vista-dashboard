
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { RefreshCw } from 'lucide-react';

interface GoogleAccount {
  id: string;
  email: string;
  google_account_id: string;
  created_at: string;
}

interface BusinessLocation {
  id: string;
  name: string;
  location_id: string;
  address: string;
  city: string;
  phone: string;
}

export function GoogleConnect() {
  const [googleAccounts, setGoogleAccounts] = useState<GoogleAccount[]>([]);
  const [businessLocations, setBusinessLocations] = useState<BusinessLocation[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const { user, session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      initializeGoogleAccount();
    }
  }, [user]);

  const initializeGoogleAccount = async () => {
    try {
      // Check if Google account already exists
      const { data: existingAccounts } = await supabase
        .from('google_accounts')
        .select('*')
        .eq('user_id', user?.id);

      if (!existingAccounts || existingAccounts.length === 0) {
        // Create Google account record automatically since user signed in with Google
        const googleAccountData = {
          user_id: user?.id,
          email: user?.email || '',
          google_account_id: user?.user_metadata?.sub || user?.id || '',
        };

        const { error } = await supabase
          .from('google_accounts')
          .insert([googleAccountData]);

        if (error) {
          console.error('Error creating Google account:', error);
        } else {
          console.log('Google account created successfully');
        }
      }

      await fetchGoogleAccounts();
      await fetchBusinessLocations();
    } catch (error) {
      console.error('Error initializing Google account:', error);
    } finally {
      setInitializing(false);
    }
  };

  const fetchGoogleAccounts = async () => {
    const { data, error } = await supabase
      .from('google_accounts')
      .select('*')
      .eq('user_id', user?.id);

    if (error) {
      console.error('Error fetching Google accounts:', error);
    } else {
      setGoogleAccounts(data || []);
    }
  };

  const fetchBusinessLocations = async () => {
    const { data, error } = await supabase
      .from('business_locations')
      .select('*');

    if (error) {
      console.error('Error fetching business locations:', error);
    } else {
      setBusinessLocations(data || []);
    }
  };

  const syncBusinessData = async () => {
    setSyncing(true);
    try {
      // Get the session token for authorization
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (!currentSession?.access_token) {
        throw new Error('No valid session found');
      }

      // Call edge function with authorization header
      const { data, error } = await supabase.functions.invoke('sync-google-business', {
        body: { userId: user?.id },
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: data.message || "Business data synced successfully",
      });

      // Refresh the business locations
      await fetchBusinessLocations();
    } catch (error) {
      console.error('Sync error:', error);
      toast({
        title: "Sync Error",
        description: error.message || "Failed to sync business data. Make sure you have Google Business Profile access.",
        variant: "destructive",
      });
    }
    setSyncing(false);
  };

  if (initializing) {
    return (
      <div className="space-y-6">
        <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Setting up your Google Business Profile connection...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">
            Google Business Profile Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">Connected Google Account</h3>
                {googleAccounts.map((account) => (
                  <div key={account.id} className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{account.email}</Badge>
                    <Badge variant="outline" className="text-green-600">Connected</Badge>
                  </div>
                ))}
              </div>
              <Button
                onClick={syncBusinessData}
                disabled={syncing}
                variant="outline"
                size="sm"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Real Data'}
              </Button>
            </div>

            {businessLocations.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-slate-700 mb-2">Business Locations</h4>
                <div className="space-y-2">
                  {businessLocations.map((location) => (
                    <div key={location.id} className="p-3 bg-white/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-slate-800">{location.name}</p>
                          <p className="text-sm text-slate-600">{location.address}, {location.city}</p>
                        </div>
                        <Badge variant="outline" className="text-blue-600">Active</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
