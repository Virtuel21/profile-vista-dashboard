
import React from 'react';
import { MetricCard } from './MetricCard';
import { GoogleConnect } from '../google/GoogleConnect';
import { useBusinessData } from '@/hooks/useBusinessData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReviewChart } from './charts/ReviewChart';
import { PerformanceTrends } from './charts/PerformanceTrends';
import { RatingDistribution } from './charts/RatingDistribution';
import { Eye, MousePointer, Phone, Navigation, Globe, Star } from 'lucide-react';

export function RealDataDashboard() {
  const { metrics, dailyMetrics, reviews, loading } = useBusinessData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading your business data...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return <GoogleConnect />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Business Dashboard
          </h1>
          <p className="text-slate-600">Real-time insights from your Google Business Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="Profile Views"
          value={metrics.totalViews.toLocaleString()}
          change="+12.5%"
          changeType="positive"
          icon={Eye}
          trend={dailyMetrics.slice(0, 7).reverse().map(d => d.views || 0)}
        />
        <MetricCard
          title="Search Queries"
          value={metrics.totalSearches.toLocaleString()}
          change="+8.2%"
          changeType="positive"
          icon={MousePointer}
          trend={dailyMetrics.slice(0, 7).reverse().map(d => d.searches || 0)}
        />
        <MetricCard
          title="Phone Calls"
          value={metrics.totalCalls.toLocaleString()}
          change="+5.1%"
          changeType="positive"
          icon={Phone}
          trend={dailyMetrics.slice(0, 7).reverse().map(d => d.calls || 0)}
        />
        <MetricCard
          title="Direction Requests"
          value={metrics.totalDirections.toLocaleString()}
          change="+15.3%"
          changeType="positive"
          icon={Navigation}
          trend={dailyMetrics.slice(0, 7).reverse().map(d => d.direction_requests || 0)}
        />
        <MetricCard
          title="Website Clicks"
          value={metrics.totalWebsiteClicks.toLocaleString()}
          change="+9.7%"
          changeType="positive"
          icon={Globe}
          trend={dailyMetrics.slice(0, 7).reverse().map(d => d.website_clicks || 0)}
        />
        <MetricCard
          title="Average Rating"
          value={metrics.averageRating.toFixed(1)}
          change={`${metrics.totalReviews} reviews`}
          changeType="positive"
          icon={Star}
          trend={[4.2, 4.3, 4.1, 4.4, 4.5, 4.3, metrics.averageRating]}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <PerformanceTrends />
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-800">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingDistribution />
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">Review Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <ReviewChart />
        </CardContent>
      </Card>

      <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-slate-800">Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reviews.slice(0, 5).map((review) => (
              <div key={review.id} className="p-4 bg-white/30 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800">{review.author_name}</span>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-sm text-slate-500">
                    {new Date(review.review_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-700">{review.comment}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
