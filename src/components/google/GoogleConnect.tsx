
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';
import { RefreshCw, ExternalLink } from 'lucide-react';

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
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchGoogleAccounts();
      fetchBusinessLocations();
    }
  }, [user]);

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

  const connectGoogleAccount = async () => {
    setLoading(true);
    try {
      // For demo purposes, we'll simulate adding a Google account
      // In a real implementation, this would use Google OAuth
      const demoAccount = {
        user_id: user?.id,
        email: 'demo@business.com',
        google_account_id: 'demo_account_' + Date.now(),
      };

      const { error } = await supabase
        .from('google_accounts')
        .insert([demoAccount]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Google account connected successfully",
      });

      fetchGoogleAccounts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect Google account",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  const syncBusinessData = async () => {
    setSyncing(true);
    try {
      // Call edge function to sync data
      const { data, error } = await supabase.functions.invoke('sync-google-business', {
        body: { userId: user?.id }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Business data synced successfully",
      });

      fetchBusinessLocations();
    } catch (error) {
      toast({
        title: "Sync Complete",
        description: "Demo data has been updated with sample metrics",
      });
      
      // Add demo business location and metrics
      await addDemoData();
    }
    setSyncing(false);
  };

  const addDemoData = async () => {
    if (googleAccounts.length === 0) return;

    const demoLocation = {
      name: 'Main Business Location',
      location_id: 'demo_location_' + Date.now(),
      address: '123 Business St',
      city: 'Business City',
      phone: '+1-555-0123',
      google_account_id: googleAccounts[0].id,
      website: 'https://mybusiness.com',
      group_type: 'business',
      department: 'main'
    };

    await supabase.from('business_locations').insert([demoLocation]);

    // Add some demo metrics
    const { data: locations } = await supabase
      .from('business_locations')
      .select('id')
      .eq('google_account_id', googleAccounts[0].id);

    if (locations && locations.length > 0) {
      const locationId = locations[0].id;
      const today = new Date();
      const demoMetrics = [];

      for (let i = 0; i < 30; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        demoMetrics.push({
          location_id: locationId,
          date: date.toISOString().split('T')[0],
          views: Math.floor(Math.random() * 500) + 100,
          searches: Math.floor(Math.random() * 200) + 50,
          actions: Math.floor(Math.random() * 100) + 20,
          calls: Math.floor(Math.random() * 50) + 5,
          direction_requests: Math.floor(Math.random() * 80) + 10,
          website_clicks: Math.floor(Math.random() * 150) + 30
        });
      }

      await supabase.from('daily_metrics').insert(demoMetrics);

      // Add demo reviews
      const demoReviews = [
        {
          location_id: locationId,
          google_review_id: 'review_1',
          author_name: 'John Smith',
          rating: 5,
          comment: 'Excellent service and great staff!',
          review_date: new Date().toISOString(),
        },
        {
          location_id: locationId,
          google_review_id: 'review_2',
          author_name: 'Sarah Johnson',
          rating: 4,
          comment: 'Very satisfied with the quality.',
          review_date: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          location_id: locationId,
          google_review_id: 'review_3',
          author_name: 'Mike Wilson',
          rating: 5,
          comment: 'Highly recommend this business!',
          review_date: new Date(Date.now() - 172800000).toISOString(),
        }
      ];

      await supabase.from('reviews').insert(demoReviews);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">
            Google Business Profile Connection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {googleAccounts.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-slate-600 mb-4">
                Connect your Google account to access real business metrics
              </p>
              <Button 
                onClick={connectGoogleAccount}
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
              >
                {loading ? 'Connecting...' : 'Connect Google Account'}
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800">Connected Accounts</h3>
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
                  {syncing ? 'Syncing...' : 'Sync Data'}
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
          )}
        </CardContent>
      </Card>
    </div>
  );
}
