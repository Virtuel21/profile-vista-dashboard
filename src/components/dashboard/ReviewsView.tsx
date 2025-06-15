
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Calendar, User } from "lucide-react";
import { FilterBar } from "./FilterBar";

const mockReviews = [
  {
    id: "1",
    authorName: "Sarah Johnson",
    rating: 5,
    comment: "Amazing coffee and fantastic service! The baristas are very knowledgeable and the atmosphere is perfect for working.",
    reviewDate: "2024-01-15",
    businessName: "Downtown Coffee Shop",
    responseText: "Thank you so much for the wonderful review, Sarah! We're delighted you enjoyed your experience.",
    responseDate: "2024-01-16"
  },
  {
    id: "2",
    authorName: "Mike Chen",
    rating: 4,
    comment: "Great food and ambiance. The sunset view is incredible. Service was a bit slow but worth the wait.",
    reviewDate: "2024-01-14",
    businessName: "Sunset Restaurant",
    responseText: null,
    responseDate: null
  },
  {
    id: "3",
    authorName: "Emily Davis",
    rating: 2,
    comment: "Disappointed with the repair service. Took longer than promised and the issue wasn't fully resolved.",
    reviewDate: "2024-01-12",
    businessName: "Tech Repair Center",
    responseText: null,
    responseDate: null
  }
];

export function ReviewsView() {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star 
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-yellow-500 fill-yellow-500' 
            : 'text-gray-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'bg-green-100 text-green-700 border-green-200';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Customer Reviews</h1>
          <p className="text-slate-600">Monitor and respond to customer feedback</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl bg-white/50 border-white/20">
            Export Reviews
          </Button>
          <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl px-6 py-3 hover:shadow-lg transition-all duration-300">
            Bulk Response
          </Button>
        </div>
      </div>

      <FilterBar 
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
      />

      <div className="grid gap-6">
        {mockReviews.map((review) => (
          <Card key={review.id} className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Review Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-800">{review.authorName}</h3>
                      <p className="text-sm text-slate-600">{review.businessName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={`rounded-full px-3 py-1 ${getRatingColor(review.rating)}`}>
                      {review.rating} stars
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-slate-500">
                      <Calendar className="w-4 h-4" />
                      {review.reviewDate}
                    </div>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1">
                  {renderStars(review.rating)}
                </div>

                {/* Review Content */}
                <div className="bg-white/30 rounded-2xl p-4">
                  <p className="text-slate-700 leading-relaxed">{review.comment}</p>
                </div>

                {/* Response Section */}
                {review.responseText ? (
                  <div className="bg-blue-50/50 rounded-2xl p-4 border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Business Response</span>
                      <span className="text-xs text-slate-500">{review.responseDate}</span>
                    </div>
                    <p className="text-slate-700">{review.responseText}</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Respond to Review
                    </Button>
                    <Button variant="outline" className="rounded-xl bg-white/50 border-white/20">
                      Mark as Addressed
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
