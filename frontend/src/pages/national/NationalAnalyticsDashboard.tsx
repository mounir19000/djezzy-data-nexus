import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const incidentData = [
  { name: 'Mon', power: 4, cooling: 2, network: 1 },
  { name: 'Tue', power: 3, cooling: 5, network: 0 },
  { name: 'Wed', power: 2, cooling: 3, network: 2 },
  { name: 'Thu', power: 6, cooling: 2, network: 1 },
  { name: 'Fri', power: 1, cooling: 4, network: 0 },
  { name: 'Sat', power: 0, cooling: 1, network: 0 },
  { name: 'Sun', power: 2, cooling: 2, network: 1 },
];

const healthTrendData = [
  { name: 'Week 1', score: 92 },
  { name: 'Week 2', score: 91.5 },
  { name: 'Week 3', score: 93 },
  { name: 'Week 4', score: 94.2 },
];

const NationalAnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Incident Trends Chart */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
          <h3 className="text-lg font-sans font-medium text-on-surface mb-6">Incident Trends (Last 7 Days)</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#e2e2e8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#e2e2e8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#242932', borderColor: '#334155', color: '#e2e2e8' }}
                  itemStyle={{ color: '#e2e2e8' }}
                />
                <Legend />
                <Bar dataKey="power" name="Power/UPS" stackId="a" fill="#EF4444" radius={[0, 0, 4, 4]} />
                <Bar dataKey="cooling" name="Cooling" stackId="a" fill="#F59E0B" />
                <Bar dataKey="network" name="Network" stackId="a" fill="#22C55E" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Health Trend */}
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6">
          <h3 className="text-lg font-sans font-medium text-on-surface mb-6">Network Health Score Trend</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={healthTrendData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffd200" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffd200" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#e2e2e8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={['dataMin - 2', 100]} stroke="#e2e2e8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#242932', borderColor: '#334155', color: '#e2e2e8' }}
                />
                <Area type="monotone" dataKey="score" stroke="#ffd200" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NationalAnalyticsDashboard;
