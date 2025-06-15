
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Star } from 'lucide-react';

const data = [
  { rating: '5★', count: 450, percentage: 60 },
  { rating: '4★', count: 180, percentage: 24 },
  { rating: '3★', count: 75, percentage: 10 },
  { rating: '2★', count: 30, percentage: 4 },
  { rating: '1★', count: 15, percentage: 2 },
];

export function RatingDistribution() {
  return (
    <div className="space-y-4">
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.3)" />
            <XAxis 
              type="number"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis 
              type="category"
              dataKey="rating"
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
            <Bar 
              dataKey="count" 
              fill="url(#ratingGradient)"
              radius={[0, 8, 8, 0]}
            />
            <defs>
              <linearGradient id="ratingGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f59e0b" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="grid grid-cols-5 gap-2">
        {data.map((item) => (
          <div key={item.rating} className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-medium text-slate-600">{item.rating.charAt(0)}</span>
            </div>
            <div className="text-sm font-bold text-slate-800">{item.count}</div>
            <div className="text-xs text-slate-500">{item.percentage}%</div>
          </div>
        ))}
      </div>
    </div>
  );
}
