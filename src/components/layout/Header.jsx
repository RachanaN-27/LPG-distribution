import React from 'react'
import { useStore } from '../../stores/useStore'
import { Activity, BarChart3, AlertTriangle, Network, Settings } from 'lucide-react'

const tabs = [
  { id: 'twin', label: 'Digital Twin', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'crisis', label: 'Crisis Mgmt', icon: AlertTriangle },
  { id: 'network', label: 'Network', icon: Network }
]

function Header() {
  const { activeTab, setActiveTab, supplyUnit, simulationDay, simulationTime } = useStore()
  
  const supplyPercent = (supplyUnit.currentLevel / supplyUnit.capacity) * 100
  
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
    <header className="h-16 bg-bg-secondary border-b border-accent-primary/20 flex items-center justify-between px-6 relative z-50">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
            <span className="text-xl">🔥</span>
          </div>
          <div>
            <h1 className="font-heading text-lg font-bold text-accent-primary tracking-wider">
              LPG DIGITAL TWIN
            </h1>
            <p className="text-xs text-text-muted">Whitefield, Bangalore</p>
          </div>
        </div>
        
        <nav className="flex gap-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                activeTab === id
                  ? 'bg-accent-primary/20 text-accent-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              }`}
            >
              <Icon size={18} />
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </nav>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="font-mono text-sm text-text-primary">
            {formatTime()}
          </div>
          <div className="text-xs text-text-muted">
            Day {simulationDay} • {formatDate()}
          </div>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-bg-tertiary">
          <div className="text-right">
            <div className="text-xs text-text-muted">Central Supply</div>
            <div className="font-mono text-sm font-bold" style={{ color: supplyPercent > 20 ? '#00ff88' : '#ff3366' }}>
              {supplyPercent.toFixed(1)}%
            </div>
          </div>
          <div className="w-24 h-2 bg-bg-primary rounded-full overflow-hidden">
            <div 
              className="h-full transition-all duration-500"
              style={{ 
                width: `${supplyPercent}%`,
                backgroundColor: supplyPercent > 50 ? '#00ff88' : supplyPercent > 20 ? '#ffd000' : '#ff3366'
              }}
            />
          </div>
        </div>
        
        <button className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors text-text-secondary hover:text-text-primary">
          <Settings size={20} />
        </button>
      </div>
    </header>
  )
}

export default Header
