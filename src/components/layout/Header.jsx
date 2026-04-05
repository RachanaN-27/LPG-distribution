import React from 'react'
import { useStore } from '../../stores/useStore'
import { Activity, BarChart3, AlertTriangle, Network, Settings, User } from 'lucide-react'

const tabs = [
  { id: 'twin', label: 'Digital Twin', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'crisis', label: 'Crisis Mgmt', icon: AlertTriangle },
  { id: 'network', label: 'Network', icon: Network },
  { id: 'dashboard', label: 'User Dashboard', icon: User }
]

function Header() {
  const { activeTab, setActiveTab, supplyUnits, simulationDay, simulationTime } = useStore()
  
  const primarySupply = supplyUnits?.[0]
  const supplyPercent = primarySupply ? (primarySupply.currentLevel / primarySupply.capacity) * 100 : 0
  
  const formatTime = () => {
    const minutes = Math.floor(simulationTime % 60) * 60
    const hours = 8 + Math.floor(minutes / 60) % 24
    const mins = minutes % 60
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`
  }
  
  const formatDate = () => {
    const baseDate = new Date('2026-04-04')
    baseDate.setDate(baseDate.getDate() + simulationDay - 1)
    return baseDate.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric'
    })
  }
  
  return (
    <header className="h-14 bg-[#0d1117] border-b border-[#30363d] flex items-center justify-between px-5">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#238636] flex items-center justify-center">
            <span className="text-white text-sm font-semibold">L</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-white tracking-tight">
              LPG Distribution
            </h1>
          </div>
        </div>
        
        <nav className="flex gap-0.5">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm transition-colors ${
                activeTab === id
                  ? 'bg-[#21262d] text-white'
                  : 'text-[#8b949e] hover:text-white hover:bg-[#21262d]'
              }`}
            >
              <Icon size={14} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center gap-5">
        <div className="text-right">
          <div className="text-sm text-white font-mono">
            {formatTime()}
          </div>
          <div className="text-xs text-[#8b949e]">
            Day {simulationDay} · {formatDate()}
          </div>
        </div>
        
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#21262d]">
          <div className="text-xs text-[#8b949e]">Stock</div>
          <div className="text-sm font-mono font-medium" style={{ color: supplyPercent > 20 ? '#3fb950' : '#f85149' }}>
            {supplyPercent.toFixed(0)}%
          </div>
          <div className="w-16 h-1.5 bg-[#30363d] rounded-full overflow-hidden">
            <div 
              className="h-full transition-all"
              style={{ 
                width: `${supplyPercent}%`,
                backgroundColor: supplyPercent > 50 ? '#3fb950' : supplyPercent > 20 ? '#d29922' : '#f85149'
              }}
            />
          </div>
        </div>
        
        <button className="p-1.5 rounded hover:bg-[#21262d] text-[#8b949e] hover:text-white">
          <Settings size={16} />
        </button>
      </div>
    </header>
  )
}

export default Header
