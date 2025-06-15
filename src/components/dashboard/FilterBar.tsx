
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Filter } from "lucide-react";

interface FilterBarProps {
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  selectedLocation: string;
  onLocationChange: (location: string) => void;
}

export function FilterBar({ dateRange, onDateRangeChange, selectedLocation, onLocationChange }: FilterBarProps) {
  const dateRanges = [
    { value: "7d", label: "Last 7 days" },
    { value: "30d", label: "Last 30 days" },
    { value: "90d", label: "Last 3 months" },
    { value: "1y", label: "Last year" }
  ];

  const locations = [
    { value: "all", label: "All Locations" },
    { value: "new-york", label: "New York Store" },
    { value: "los-angeles", label: "Los Angeles Branch" },
    { value: "chicago", label: "Chicago Office" }
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-white/30 backdrop-blur-xl rounded-2xl border border-white/20">
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-600" />
        <span className="text-sm font-medium text-slate-700">Filters:</span>
      </div>
      
      <Select value={dateRange} onValueChange={onDateRangeChange}>
        <SelectTrigger className="w-40 bg-white/50 border-white/20 rounded-xl">
          <Calendar className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent className="bg-white/90 backdrop-blur-xl border-white/20 rounded-xl">
          {dateRanges.map((range) => (
            <SelectItem key={range.value} value={range.value} className="rounded-lg">
              {range.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedLocation} onValueChange={onLocationChange}>
        <SelectTrigger className="w-48 bg-white/50 border-white/20 rounded-xl">
          <MapPin className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Select location" />
        </SelectTrigger>
        <SelectContent className="bg-white/90 backdrop-blur-xl border-white/20 rounded-xl">
          {locations.map((location) => (
            <SelectItem key={location.value} value={location.value} className="rounded-lg">
              {location.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" className="bg-white/50 border-white/20 rounded-xl hover:bg-white/70">
        Export Data
      </Button>
    </div>
  );
}
