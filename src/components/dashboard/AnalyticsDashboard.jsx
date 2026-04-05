import React, { useMemo } from 'react'
import { useStore } from '../../stores/useStore'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, BarChart, Bar
} from 'recharts'
import { 
  Users, AlertTriangle, CheckCircle, TrendingUp, Zap, Target 
} from 'lucide-react'

const CHART_COLORS = {
  primary: '#00d4ff',
  secondary: '#7b61ff',
  green: '#00ff88',
  yellow: '#ffd000',
  orange: '#ff8c00',
  red: '#ff3366'
}

function StatCard({ icon: Icon, label, value, subValue, color, trend }) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${color}20` }}>
          <Icon size={24} style={{ color }} />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-status-green' : 'text-status-red'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="font-mono text-3xl font-bold text-text-primary mb-1">{value}</div>
      <div className="text-sm text-text-secondary">{label}</div>
      {subValue && <div className="text-xs text-text-muted mt-1">{subValue}</div>}
    </div>
  )
}

function AnalyticsDashboard() {
  const { buildings, supplyUnit, statistics } = useStore()
  
  const supplyTrendData = useMemo(() => {
    const data = []
    let level = supplyUnit.capacity
    for (let i = 0; i < 24; i++) {
      const consumption = buildings.reduce((sum, b) => sum + b.consumptionRate, 0) * 0.04
      level = Math.max(0, level - consumption)
      data.push({
        hour: `${i}:00`,
        supply: (level / supplyUnit.capacity) * 100,
        demand: 85 + Math.sin(i * 0.3) * 10
      })
    }
    return data
  }, [buildings, supplyUnit])
  
  const categoryData = useMemo(() => {
    const categories = {
      hospital: { name: 'Hospitals', value: 0, color: CHART_COLORS.primary },
      household: { name: 'Households', value: 0, color: CHART_COLORS.secondary },
      commercial: { name: 'Commercial', value: 0, color: CHART_COLORS.yellow },
      industrial: { name: 'Industrial', value: 0, color: CHART_COLORS.orange },
      gas_station: { name: 'Gas Stations', value: 0, color: CHART_COLORS.green }
    }
    
    buildings.forEach(b => {
      categories[b.type].value++
    })
    
    return Object.values(categories)
  }, [buildings])
  
  const consumptionTrend = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    return days.map((day, i) => ({
      day,
      hospital: 120 + Math.random() * 30,
      household: 80 + Math.random() * 20,
      commercial: 60 + Math.random() * 15,
      industrial: 40 + Math.random() * 20
    }))
  }, [])
  
  const statusDistribution = [
    { name: 'Critical', value: statistics.criticalUnits, color: CHART_COLORS.red },
    { name: 'Warning', value: statistics.warningUnits, color: CHART_COLORS.orange },
    { name: 'Healthy', value: statistics.healthyUnits, color: CHART_COLORS.green }
  ]
  
  const supplyPercent = (supplyUnit.currentLevel / supplyUnit.capacity) * 100
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-accent-primary">Analytics Dashboard</h2>
          <p className="text-text-secondary">Real-time insights and trends</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="glass px-4 py-2 rounded-lg flex items-center gap-3">
            <span className="text-sm text-text-secondary">Supply Level</span>
            <span className="font-mono text-xl font-bold" style={{ color: supplyPercent > 50 ? CHART_COLORS.green : supplyPercent > 20 ? CHART_COLORS.yellow : CHART_COLORS.red }}>
              {supplyPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Total Consumers"
          value={statistics.totalConsumers}
          subValue="Across all categories"
          color={CHART_COLORS.primary}
        />
        <StatCard
          icon={AlertTriangle}
          label="Critical Units"
          value={statistics.criticalUnits}
          subValue={`${((statistics.criticalUnits / statistics.totalConsumers) * 100).toFixed(1)}% of total`}
          color={CHART_COLORS.red}
        />
        <StatCard
          icon={CheckCircle}
          label="Healthy Units"
          value={statistics.healthyUnits}
          subValue={`${((statistics.healthyUnits / statistics.totalConsumers) * 100).toFixed(1)}% of total`}
          color={CHART_COLORS.green}
          trend={5}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg text-text-primary">Supply vs Demand</h3>
            <span className="text-xs text-text-muted">Last 24 hours</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={supplyTrendData}>
              <defs>
                <linearGradient id="supplyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2942" />
              <XAxis dataKey="hour" stroke="#5a6380" fontSize={12} />
              <YAxis stroke="#5a6380" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141b2d', border: '1px solid #00d4ff30', borderRadius: '8px' }}
                labelStyle={{ color: '#8892b0' }}
              />
              <Area type="monotone" dataKey="supply" stroke={CHART_COLORS.primary} fill="url(#supplyGradient)" name="Supply %" />
              <Line type="monotone" dataKey="demand" stroke={CHART_COLORS.orange} strokeDasharray="5 5" name="Demand" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg text-text-primary">Category Distribution</h3>
          </div>
          <div className="flex items-center">
            <ResponsiveContainer width="50%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#141b2d', border: '1px solid #00d4ff30', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-text-secondary">{cat.name}</span>
                  </div>
                  <span className="font-mono text-text-primary">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg text-text-primary">Consumption Trends</h3>
            <span className="text-xs text-text-muted">This week (kg)</span>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={consumptionTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2942" />
              <XAxis dataKey="day" stroke="#5a6380" fontSize={12} />
              <YAxis stroke="#5a6380" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#141b2d', border: '1px solid #00d4ff30', borderRadius: '8px' }}
              />
              <Bar dataKey="hospital" stackId="a" fill={CHART_COLORS.primary} name="Hospital" />
              <Bar dataKey="household" stackId="a" fill={CHART_COLORS.secondary} name="Household" />
              <Bar dataKey="commercial" stackId="a" fill={CHART_COLORS.yellow} name="Commercial" />
              <Bar dataKey="industrial" stackId="a" fill={CHART_COLORS.orange} name="Industrial" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="glass rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading text-lg text-text-primary">Unit Status Distribution</h3>
          </div>
          <div className="flex items-center gap-8">
            <ResponsiveContainer width="50%" height={200}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#141b2d', border: '1px solid #00d4ff30', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4">
              {statusDistribution.map((status) => (
                <div key={status.name} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: status.color }} />
                  <div>
                    <div className="text-sm text-text-secondary">{status.name}</div>
                    <div className="font-mono text-lg font-bold text-text-primary">{status.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsDashboard
