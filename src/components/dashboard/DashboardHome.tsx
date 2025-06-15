
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star, TrendingUp, Users, Calendar } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { FilterBar } from "./FilterBar";
import { ReviewChart } from "./charts/ReviewChart";
import { RatingDistribution } from "./charts/RatingDistribution";
import { PerformanceTrends } from "./charts/PerformanceTrends";

export function DashboardHome() {
  const [dateRange, setDateRange] = useState("7d");
  const [selectedLocation, setSelectedLocation] = useState("all");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">Dashboard Overview</h1>
            <p className="text-slate-600">Monitor your Google Business Profile performance</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="w-4 h-4" />
            Last updated: 2 minutes ago
          </div>
        </div>
        
        <FilterBar 
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          selectedLocation={selectedLocation}
          onLocationChange={setSelectedLocation}
        />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Listings"
          value="24"
          change="+2"
          changeType="positive"
          icon={MapPin}
          trend={[12, 15, 18, 22, 24]}
        />
        <MetricCard
          title="Average Rating"
          value="4.3"
          change="+0.2"
          changeType="positive"
          icon={Star}
          trend={[4.1, 4.2, 4.1, 4.3, 4.3]}
        />
        <MetricCard
          title="Total Reviews"
          value="1,248"
          change="+156"
          changeType="positive"
          icon={Users}
          trend={[890, 1020, 1150, 1200, 1248]}
        />
        <MetricCard
          title="Performance Score"
          value="87%"
          change="+5%"
          changeType="positive"
          icon={TrendingUp}
          trend={[78, 82, 85, 84, 87]}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-800">Review Volume Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ReviewChart />
          </CardContent>
        </Card>

        <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl">
          <CardHeader>
            <CardTitle className="text-slate-800">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <RatingDistribution />
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-slate-800">Performance Trends</CardTitle>
        </CardHeader>
        <CardContent>
          <PerformanceTrends />
        </CardContent>
      </Card>
    </div>
  );
}
