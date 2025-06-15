
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { date: 'Jan 1', reviews: 12 },
  { date: 'Jan 8', reviews: 18 },
  { date: 'Jan 15', reviews: 24 },
  { date: 'Jan 22', reviews: 32 },
  { date: 'Jan 29', reviews: 28 },
  { date: 'Feb 5', reviews: 45 },
  { date: 'Feb 12', reviews: 38 },
];

export function ReviewChart() {
  return (
    <div className="h-64">
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
          <Line 
            type="monotone" 
            dataKey="reviews" 
            stroke="url(#reviewGradient)" 
            strokeWidth={3}
            dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#1d4ed8' }}
          />
          <defs>
            <linearGradient id="reviewGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#6366f1" />
            </linearGradient>
          </defs>
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
