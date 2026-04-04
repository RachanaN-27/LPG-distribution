import React, { useState, useEffect, useCallback } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { AlertTriangle, Fuel, Calendar, Clock, RefreshCw, Zap, TrendingDown, Bell } from 'lucide-react'

const MOCK_CYLINDER_DATA = {
  id: 'cyl-001',
  weight: 14.5,
  full_weight: 19,
  avg_daily_usage: 0.65,
  history: [
    { time: '2026-04-05T06:00:00', weight: 18.2 },
    { time: '2026-04-05T08:00:00', weight: 17.8 },
    { time: '2026-04-05T10:00:00', weight: 17.5 },
    { time: '2026-04-05T12:00:00', weight: 17.1 },
    { time: '2026-04-05T14:00:00', weight: 16.8 },
    { time: '2026-04-05T16:00:00', weight: 16.4 },
    { time: '2026-04-05T18:00:00', weight: 16.0 },
    { time: '2026-04-05T20:00:00', weight: 15.5 },
    { time: '2026-04-05T22:00:00', weight: 15.1 },
    { time: '2026-04-06T00:00:00', weight: 14.8 },
    { time: '2026-04-06T02:00:00', weight: 14.5 },
    { time: '2026-04-06T04:00:00', weight: 14.5 },
  ],
  alerts: [
    { message: 'Low gas level detected', severity: 'warning', time: '2026-04-06T02:00:00' },
    { message: 'Unusual usage pattern detected', severity: 'critical', time: '2026-04-05T22:00:00' },
  ]
}

async function fetchCylinderData(cylinderId = 'cyl-001') {
  try {
    const response = await fetch(`/api/cylinder/${cylinderId}`)
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.log('Using mock data:', error.message)
  }
  return MOCK_CYLINDER_DATA
}

function StatusCard({ weight, fullWeight, avgDailyUsage }) {
  const percentage = ((weight / fullWeight) * 100).toFixed(1)
  const daysRemaining = Math.floor(weight / avgDailyUsage)
  
  let status = 'normal'
  let statusColor = 'text-status-green'
  let statusBg = 'bg-status-green'
  let statusText = 'Normal'
  
  if (percentage <= 20) {
    status = 'critical'
    statusColor = 'text-status-red'
    statusBg = 'bg-status-red'
    statusText = 'Critical'
  } else if (percentage <= 40) {
    status = 'low'
    statusColor = 'text-status-orange'
    statusBg = 'bg-status-orange'
    statusText = 'Low Gas'
  }
  
  return (
    <div className="bg-bg-secondary rounded-xl p-6 border border-accent-primary/20">
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${statusBg}/20`}>
          <Fuel className={statusColor} size={24} />
        </div>
        <div>
          <h3 className="text-text-secondary text-sm">Cylinder Status</h3>
          <div className={`text-2xl font-bold ${statusColor}`}>{statusText}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-bg-tertiary rounded-lg p-4">
          <div className="text-text-muted text-xs mb-1">Current Weight</div>
          <div className="text-2xl font-bold text-text-primary">{weight}<span className="text-sm font-normal text-text-muted ml-1">kg</span></div>
        </div>
        <div className="bg-bg-tertiary rounded-lg p-4">
          <div className="text-text-muted text-xs mb-1">Remaining</div>
          <div className="text-2xl font-bold text-text-primary">{percentage}%</div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="flex justify-between text-xs text-text-muted mb-1">
          <span>0 kg</span>
          <span>{fullWeight} kg</span>
        </div>
        <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${statusBg}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2 text-text-secondary">
        <Calendar size={16} />
        <span className="text-sm">
          <span className="font-semibold text-accent-primary">{daysRemaining}</span> days remaining
        </span>
      </div>
    </div>
  )
}

function UsageChart({ history }) {
  const chartData = history.map(item => ({
    time: new Date(item.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    weight: item.weight,
    date: new Date(item.time).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }))
  
  const formatXAxis = (timeStr) => timeStr
  
  return (
    <div className="bg-bg-secondary rounded-xl p-6 border border-accent-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <TrendingDown size={20} className="text-accent-primary" />
          Usage Over Time
        </h3>
      </div>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00d4ff" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2942" />
            <XAxis dataKey="time" stroke="#8892b0" fontSize={10} tick={{ fill: '#8892b0' }} />
            <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#8892b0" fontSize={10} tick={{ fill: '#8892b0' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#0d1117', border: '1px solid #1e2942', borderRadius: '8px' }}
              labelStyle={{ color: '#00d4ff' }}
              itemStyle={{ color: '#ffffff' }}
            />
            <Area 
              type="monotone" 
              dataKey="weight" 
              stroke="#00d4ff" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorWeight)" 
              name="Weight (kg)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function AlertsPanel({ alerts, anomalyDetected }) {
  const getSeverityColor = (severity) => {
    return severity === 'critical' ? 'text-status-red bg-status-red/10 border-status-red/30' : 'text-status-orange bg-status-orange/10 border-status-orange/30'
  }
  
  return (
    <div className="bg-bg-secondary rounded-xl p-6 border border-accent-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <Bell size={20} className="text-accent-primary" />
          Recent Alerts
        </h3>
        <span className="text-xs text-text-muted">{alerts.length} alerts</span>
      </div>
      
      {anomalyDetected && (
        <div className="mb-4 p-3 rounded-lg bg-status-red/10 border border-status-red/30 flex items-center gap-2">
          <AlertTriangle size={18} className="text-status-red" />
          <span className="text-status-red text-sm font-semibold">⚠️ Possible abnormal usage detected</span>
        </div>
      )}
      
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <Bell size={32} className="mx-auto mb-2 opacity-50" />
            <p>No alerts at this time</p>
          </div>
        ) : (
          alerts.map((alert, index) => (
            <div 
              key={index} 
              className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)} flex items-start gap-3`}
            >
              <AlertTriangle size={18} className="mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="font-medium">{alert.message}</div>
                <div className="text-xs opacity-70 mt-1 flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(alert.time).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function detectAnomaly(history) {
  if (!history || history.length < 3) return null
  
  const weights = history.map(h => h.weight)
  const continuousDecrease = weights.every((w, i) => i === 0 || w < weights[i - 1])
  const longDurationDecrease = continuousDecrease && weights.length > 8
  
  const now = new Date()
  const currentHour = now.getHours()
  const unusualHours = currentHour < 6 || currentHour > 22
  
  if (longDurationDecrease) {
    return { type: 'continuous', message: 'Continuous gas decrease detected over extended period' }
  } else if (unusualHours && weights[weights.length - 1] < weights[0]) {
    return { type: 'unusual_hours', message: 'Usage detected during unusual hours' }
  }
  
  return null
}

function UserDashboard() {
  const [cylinderData, setCylinderData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [error, setError] = useState(null)
  
  const loadData = useCallback(async () => {
    try {
      setError(null)
      const data = await fetchCylinderData()
      setCylinderData(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError('Failed to load cylinder data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])
  
  useEffect(() => {
    loadData()
    
    const interval = setInterval(loadData, 10000)
    
    return () => clearInterval(interval)
  }, [loadData])
  
  const anomalyInfo = cylinderData?.history ? detectAnomaly(cylinderData.history) : null
  
  if (loading && !cylinderData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary"></div>
      </div>
    )
  }
  
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">User Dashboard</h2>
          <p className="text-text-muted">Real-time LPG cylinder monitoring</p>
        </div>
        
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-text-muted">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button 
            onClick={loadData}
            className="p-2 rounded-lg bg-bg-tertiary hover:bg-accent-primary/20 text-text-secondary hover:text-accent-primary transition-colors"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>
      
      {error && (
        <div className="p-4 rounded-lg bg-status-red/10 border border-status-red/30 text-status-red">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <StatusCard 
            weight={cylinderData?.weight || 0}
            fullWeight={cylinderData?.full_weight || 19}
            avgDailyUsage={cylinderData?.avg_daily_usage || 0.65}
          />
        </div>
        
        <div className="lg:col-span-2">
          <UsageChart history={cylinderData?.history || []} />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsPanel 
          alerts={cylinderData?.alerts || []} 
          anomalyDetected={!!anomalyInfo}
        />
        
        <div className="bg-bg-secondary rounded-xl p-6 border border-accent-primary/20">
          <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2 mb-4">
            <Zap size={20} className="text-accent-primary" />
            Cylinder Info
          </h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-bg-tertiary">
              <span className="text-text-secondary">Cylinder ID</span>
              <span className="font-mono text-text-primary">{cylinderData?.id || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-bg-tertiary">
              <span className="text-text-secondary">Full Weight</span>
              <span className="text-text-primary">{cylinderData?.full_weight || 19} kg</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-bg-tertiary">
              <span className="text-text-secondary">Avg Daily Usage</span>
              <span className="text-text-primary">{cylinderData?.avg_daily_usage?.toFixed(2) || 0.65} kg/day</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-bg-tertiary">
              <span className="text-text-secondary">Refill Required</span>
              <span className={`font-semibold ${(cylinderData?.weight / cylinderData?.full_weight * 100) <= 20 ? 'text-status-red' : 'text-status-green'}`}>
                {(cylinderData?.weight / cylinderData?.full_weight * 100) <= 20 ? 'Yes - Critical' : 'No'}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-text-secondary">Next Refill Estimate</span>
              <span className="text-text-primary">
                ~{Math.floor((cylinderData?.weight || 0) / (cylinderData?.avg_daily_usage || 1))} days
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
