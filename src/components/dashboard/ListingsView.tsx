
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Phone, Globe, Calendar, MoreVertical } from "lucide-react";
import { FilterBar } from "./FilterBar";

const mockListings = [
  {
    id: "1",
    name: "Downtown Coffee Shop",
    address: "123 Main St, New York, NY",
    rating: 4.5,
    reviewCount: 187,
    lastUpdate: "2024-01-15",
    status: "active",
    phone: "+1 (555) 123-4567",
    website: "https://downtowncoffee.com"
  },
  {
    id: "2",
    name: "Sunset Restaurant",
    address: "456 Ocean Ave, Los Angeles, CA",
    rating: 4.2,
    reviewCount: 342,
    lastUpdate: "2024-01-14",
    status: "active",
    phone: "+1 (555) 987-6543",
    website: "https://sunsetrestaurant.com"
  },
  {
    id: "3",
    name: "Tech Repair Center",
    address: "789 Tech Blvd, Chicago, IL",
    rating: 3.8,
    reviewCount: 95,
    lastUpdate: "2024-01-10",
    status: "inactive",
    phone: "+1 (555) 456-7890",
    website: "https://techrepair.com"
  }
];

export function ListingsView() {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedLocation, setSelectedLocation] = useState("all");

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Business Listings</h1>
          <p className="text-slate-600">Manage your Google Business Profile listings</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl px-6 py-3 hover:shadow-lg transition-all duration-300">
          Add New Listing
        </Button>
      </div>

      <FilterBar 
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
      />

      <div className="grid gap-6">
        {mockListings.map((listing) => (
          <Card key={listing.id} className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-slate-800 mb-2">{listing.name}</h3>
                      <div className="flex items-center gap-2 text-slate-600 mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{listing.address}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={listing.status === 'active' ? 'default' : 'secondary'}
                        className={`rounded-full px-3 py-1 ${
                          listing.status === 'active' 
                            ? 'bg-green-100 text-green-700 border-green-200' 
                            : 'bg-red-100 text-red-700 border-red-200'
                        }`}
                      >
                        {listing.status}
                      </Badge>
                      <Button variant="ghost" size="sm" className="rounded-xl">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 p-3 bg-white/30 rounded-2xl">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-slate-800">{listing.rating}</span>
                      <span className="text-sm text-slate-600">({listing.reviewCount} reviews)</span>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-white/30 rounded-2xl">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span className="text-sm text-slate-700">{listing.phone}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-white/30 rounded-2xl">
                      <Globe className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-slate-700 truncate">{listing.website}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 p-3 bg-white/30 rounded-2xl">
                      <Calendar className="w-4 h-4 text-purple-500" />
                      <span className="text-sm text-slate-700">{listing.lastUpdate}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl bg-white/50 border-white/20 hover:bg-white/70">
                      View Details
                    </Button>
                    <Button variant="outline" className="rounded-xl bg-white/50 border-white/20 hover:bg-white/70">
                      Edit Listing
                    </Button>
                    <Button variant="outline" className="rounded-xl bg-white/50 border-white/20 hover:bg-white/70">
                      View Analytics
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
