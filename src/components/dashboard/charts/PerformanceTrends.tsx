
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { date: 'Week 1', views: 1200, clicks: 180, calls: 25, directions: 45 },
  { date: 'Week 2', views: 1350, clicks: 220, calls: 32, directions: 52 },
  { date: 'Week 3', views: 1180, clicks: 195, calls: 28, directions: 48 },
  { date: 'Week 4', views: 1480, clicks: 285, calls: 38, directions: 65 },
  { date: 'Week 5', views: 1620, clicks: 310, calls: 42, directions: 71 },
  { date: 'Week 6', views: 1580, clicks: 295, calls: 45, directions: 68 },
];

export function PerformanceTrends() {
  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <YAxis 
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(12px)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="views" 
            stroke="#3b82f6" 
            strokeWidth={2}
            name="Views"
            dot={{ fill: '#3b82f6', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="clicks" 
            stroke="#10b981" 
            strokeWidth={2}
            name="Website Clicks"
            dot={{ fill: '#10b981', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="calls" 
            stroke="#f59e0b" 
            strokeWidth={2}
            name="Phone Calls"
            dot={{ fill: '#f59e0b', r: 3 }}
          />
          <Line 
            type="monotone" 
            dataKey="directions" 
            stroke="#8b5cf6" 
            strokeWidth={2}
            name="Direction Requests"
            dot={{ fill: '#8b5cf6', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
