
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

interface GoogleAccount {
  id: string;
  email: string;
  google_account_id: string;
  access_token: string;
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
  const [authError, setAuthError] = useState<string | null>(null);
  const { user, session, signInWithGoogle } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      initializeGoogleAccount();
    }
  }, [user, session]);

  const initializeGoogleAccount = async () => {
    try {
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
    setAuthError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('sync-google-business', {
        body: { userId: user?.id },
      });

      if (error) throw error;

      if (data?.requiresReauth) {
        setAuthError(data.error);
        toast({
          title: "Re-authentication Required",
          description: "Please sign out and sign back in with Google to refresh your access tokens.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: data.message || "Business data synced successfully",
      });

      // Refresh the business locations
      await fetchBusinessLocations();
    } catch (error) {
      console.error('Sync error:', error);
      
      if (error.message?.includes('requiresReauth') || error.message?.includes('401')) {
        setAuthError("Your Google authentication has expired. Please sign out and sign back in.");
        toast({
          title: "Authentication Expired",
          description: "Please sign out and sign back in with Google to refresh your access.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Sync Error",
          description: error.message || "Failed to sync business data. Make sure you have Google Business Profile access.",
          variant: "destructive",
        });
      }
    }
    setSyncing(false);
  };

  const handleReAuthenticate = async () => {
    try {
      // Sign out first
      await supabase.auth.signOut();
      
      // Redirect to auth page
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error during re-authentication:', error);
      toast({
        title: "Error",
        description: "Failed to initiate re-authentication. Please try refreshing the page.",
        variant: "destructive",
      });
    }
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

  // Check if user has valid Google tokens
  const hasValidTokens = googleAccounts.length > 0 && googleAccounts.some(account => account.access_token);

  return (
    <div className="space-y-6">
      <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">
            Google Business Profile Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!hasValidTokens ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Google Tokens Missing</span>
              </div>
              <p className="mt-2 text-yellow-600 text-sm">
                No valid Google access tokens found. Please sign out and sign back in with Google to grant proper permissions.
              </p>
              <Button 
                onClick={handleReAuthenticate}
                variant="outline"
                size="sm"
                className="mt-3 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
              >
                Re-authenticate with Google
              </Button>
            </div>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Google Connection Active</span>
              </div>
              <p className="mt-2 text-green-600 text-sm">
                Valid Google access tokens found. You can now sync your business data.
              </p>
            </div>
          )}

          {authError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Authentication Issue</span>
              </div>
              <p className="mt-2 text-red-600 text-sm">{authError}</p>
              <Button 
                onClick={handleReAuthenticate}
                variant="outline"
                size="sm"
                className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
              >
                Re-authenticate with Google
              </Button>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-800">Connected Google Account</h3>
                {googleAccounts.map((account) => (
                  <div key={account.id} className="flex items-center gap-2 mt-2">
                    <Badge variant="secondary">{account.email}</Badge>
                    <Badge variant="outline" className={hasValidTokens ? "text-green-600" : "text-red-600"}>
                      {hasValidTokens ? "Connected" : "No Tokens"}
                    </Badge>
                  </div>
                ))}
                {googleAccounts.length === 0 && (
                  <p className="text-sm text-slate-500 mt-2">No Google account connected</p>
                )}
              </div>
              <Button
                onClick={syncBusinessData}
                disabled={syncing || !hasValidTokens}
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
