import { AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const volumeData = [
  { month: 'Jun', volume: 5.2 },
  { month: 'Jul', volume: 6.8 },
  { month: 'Aug', volume: 7.1 },
  { month: 'Sep', volume: 7.5 },
  { month: 'Oct', volume: 7.8 },
  { month: 'Nov', volume: 8.2 },
]

const strategiesData = [
  { week: 'W1', strategies: 250 },
  { week: 'W2', strategies: 265 },
  { week: 'W3', strategies: 280 },
  { week: 'W4', strategies: 300 },
]

const latencyData = [
  { time: '00:00', latency: 162 },
  { time: '04:00', latency: 155 },
  { time: '08:00', latency: 148 },
  { time: '12:00', latency: 152 },
  { time: '16:00', latency: 145 },
  { time: '20:00', latency: 148 },
]

const successRateData = [
  { name: 'Success', value: 91.3, color: '#10b981' },
  { name: 'Failed', value: 8.7, color: '#ef4444' },
]

const tvlData = [
  { month: 'Jun', tvl: 2.1 },
  { month: 'Jul', tvl: 2.5 },
  { month: 'Aug', tvl: 2.8 },
  { month: 'Sep', tvl: 3.0 },
  { month: 'Oct', tvl: 3.1 },
  { month: 'Nov', tvl: 3.24 },
]

const copyTradersData = [
  { week: 'W1', traders: 7200 },
  { week: 'W2', traders: 7800 },
  { week: 'W3', traders: 8400 },
  { week: 'W4', traders: 9018 },
]

export function VolumeChart() {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={volumeData}>
          <defs>
            <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#f3f4f6' }}
          />
          <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function StrategiesChart() {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={strategiesData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#f3f4f6' }}
          />
          <Bar dataKey="strategies" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function LatencyChart() {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={latencyData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#f3f4f6' }}
          />
          <Line type="monotone" dataKey="latency" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function SuccessRateChart() {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={successRateData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name}: ${value}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {successRateData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#f3f4f6' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TVLChart() {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={tvlData}>
          <defs>
            <linearGradient id="colorTVL" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#f3f4f6' }}
          />
          <Area type="monotone" dataKey="tvl" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorTVL)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export function CopyTradersChart() {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={copyTradersData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
          <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} />
          <YAxis stroke="#9ca3af" fontSize={12} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
            labelStyle={{ color: '#f3f4f6' }}
          />
          <Bar dataKey="traders" fill="#ec4899" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}



