
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/auth/AuthProvider';

export interface BusinessMetrics {
  totalViews: number;
  totalSearches: number;
  totalActions: number;
  totalCalls: number;
  totalDirections: number;
  totalWebsiteClicks: number;
  averageRating: number;
  totalReviews: number;
}

export interface DailyMetric {
  date: string;
  views: number;
  searches: number;
  actions: number;
  calls: number;
  direction_requests: number;
  website_clicks: number;
}

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  comment: string;
  review_date: string;
  response_text?: string;
}

export function useBusinessData() {
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [dailyMetrics, setDailyMetrics] = useState<DailyMetric[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchBusinessData();
    }
  }, [user]);

  const fetchBusinessData = async () => {
    try {
      setLoading(true);

      // Get user's business locations
      const { data: locations } = await supabase
        .from('business_locations')
        .select(`
          id,
          google_accounts!inner(user_id)
        `)
        .eq('google_accounts.user_id', user?.id);

      if (!locations || locations.length === 0) {
        setLoading(false);
        return;
      }

      const locationIds = locations.map(l => l.id);

      // Fetch daily metrics
      const { data: dailyData } = await supabase
        .from('daily_metrics')
        .select('*')
        .in('location_id', locationIds)
        .order('date', { ascending: false })
        .limit(30);

      if (dailyData) {
        setDailyMetrics(dailyData);

        // Calculate aggregate metrics
        const totalMetrics = dailyData.reduce(
          (acc, day) => ({
            totalViews: acc.totalViews + (day.views || 0),
            totalSearches: acc.totalSearches + (day.searches || 0),
            totalActions: acc.totalActions + (day.actions || 0),
            totalCalls: acc.totalCalls + (day.calls || 0),
            totalDirections: acc.totalDirections + (day.direction_requests || 0),
            totalWebsiteClicks: acc.totalWebsiteClicks + (day.website_clicks || 0),
          }),
          {
            totalViews: 0,
            totalSearches: 0,
            totalActions: 0,
            totalCalls: 0,
            totalDirections: 0,
            totalWebsiteClicks: 0,
          }
        );

        // Fetch reviews
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*')
          .in('location_id', locationIds)
          .order('review_date', { ascending: false });

        if (reviewData) {
          setReviews(reviewData);
          
          const averageRating = reviewData.length > 0 
            ? reviewData.reduce((sum, review) => sum + review.rating, 0) / reviewData.length
            : 0;

          setMetrics({
            ...totalMetrics,
            averageRating,
            totalReviews: reviewData.length,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching business data:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    metrics,
    dailyMetrics,
    reviews,
    loading,
    refetch: fetchBusinessData,
  };
}
