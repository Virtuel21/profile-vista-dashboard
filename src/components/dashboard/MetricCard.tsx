
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  trend: number[];
}

export function MetricCard({ title, value, change, changeType, icon: Icon, trend }: MetricCardProps) {
  const trendData = trend.map((value, index) => ({ value, index }));
  
  const changeColor = {
    positive: 'text-emerald-600',
    negative: 'text-red-500',
    neutral: 'text-slate-500'
  }[changeType];

  const trendColor = {
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#64748b'
  }[changeType];

  return (
    <Card className="bg-white/50 backdrop-blur-xl border-white/20 shadow-xl rounded-3xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-slate-800">{value}</p>
              <span className={`text-sm font-medium ${changeColor}`}>
                {change}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="w-16 h-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke={trendColor} 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
