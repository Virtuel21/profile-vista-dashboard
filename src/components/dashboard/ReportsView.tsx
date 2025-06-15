
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, BarChart3, PieChart } from "lucide-react";
import { FilterBar } from "./FilterBar";
import { useState } from "react";

export function ReportsView() {
  const [dateRange, setDateRange] = useState("30d");
  const [selectedLocation, setSelectedLocation] = useState("all");

  const reports = [
    {
      title: "Performance Summary",
      description: "Complete overview of all listings performance metrics",
      icon: TrendingUp,
      formats: ["PDF", "Excel"]
    },
    {
      title: "Review Analytics",
      description: "Detailed analysis of customer reviews and ratings",
      icon: BarChart3,
      formats: ["PDF", "CSV"]
    },
    {
      title: "Location Insights",
      description: "Individual location performance and comparison",
      icon: PieChart,
      formats: ["PDF", "Excel", "CSV"]
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Reports & Analytics</h1>
          <p className="text-slate-600">Generate detailed reports and export your data</p>
        </div>
      </div>

      <FilterBar 
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report, index) => (
          <Card key={index} className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10">
                  <report.icon className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-slate-800">{report.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-600 text-sm leading-relaxed">
                {report.description}
              </p>
              
              <div className="flex flex-wrap gap-2">
                {report.formats.map((format) => (
                  <Button
                    key={format}
                    variant="outline"
                    size="sm"
                    className="rounded-xl bg-white/50 border-white/20 hover:bg-white/70"
                  >
                    <Download className="w-3 h-3 mr-2" />
                    {format}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Export Section */}
      <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl">
        <CardHeader>
          <CardTitle className="text-slate-800">Quick Data Export</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-4 h-auto flex-col gap-2">
              <Download className="w-5 h-5" />
              <span>All Listings CSV</span>
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-4 h-auto flex-col gap-2">
              <Download className="w-5 h-5" />
              <span>Reviews Export</span>
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-2xl p-4 h-auto flex-col gap-2">
              <Download className="w-5 h-5" />
              <span>Analytics Data</span>
            </Button>
            <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl p-4 h-auto flex-col gap-2">
              <Download className="w-5 h-5" />
              <span>Full Report PDF</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
