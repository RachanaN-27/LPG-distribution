import React, { useMemo } from 'react'
import { useStore } from '../../stores/useStore'
import { 
  AlertTriangle, MapPin, Zap, Phone, Clock, ArrowRight,
  Building2, Home, Utensils, Fuel
} from 'lucide-react'

function CrisisPanel() {
  const { buildings, supplyUnit, crisisMode, statistics } = useStore()
  
  const supplyPercent = (supplyUnit.currentLevel / supplyUnit.capacity) * 100
  
  const criticalBuildings = useMemo(() => {
    return buildings
      .filter(b => b.daysRemaining <= 0)
      .sort((a, b) => {
        const priority = { hospital: 0, household: 1, commercial: 2, industrial: 3, gas_station: 4 }
        return priority[a.type] - priority[b.type]
      })
      .slice(0, 10)
  }, [buildings])
  
  const alternatives = [
    {
      id: 1,
      name: 'Biogas Station - ITPL',
      distance: '2.3 km',
      address: 'Whitefield Main Road',
      capacity: '500 kg/day',
      type: 'biogas',
      icon: Fuel,
      color: '#00ff88'
    },
    {
      id: 2,
      name: 'Electric Cooking Center',
      distance: '1.5 km',
      address: 'Brookfield Area',
      capacity: '200 meals/day',
      type: 'electric',
      icon: Zap,
      color: '#ffd000'
    },
    {
      id: 3,
      name: 'Community Kitchen - AECS',
      distance: '0.8 km',
      address: 'AECS Layout',
      capacity: '500 meals/day',
      type: 'community',
      icon: Utensils,
      color: '#7b61ff'
    },
    {
      id: 4,
      name: 'Emergency Reserve - BEML',
      distance: '3.1 km',
      address: 'BEML Layout',
      capacity: '1000 kg available',
      type: 'reserve',
      icon: Building2,
      color: '#00d4ff'
    }
  ]
  
  const getTypeIcon = (type) => {
    const icons = {
      hospital: '🏥',
      household: '🏠',
      commercial: '🏪',
      industrial: '🏭',
      gas_station: '⛽'
    }
    return icons[type] || '🏢'
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-2xl text-accent-primary">Crisis Management</h2>
          <p className="text-text-secondary">Shortage alerts and alternative resources</p>
        </div>
        {crisisMode && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-status-red/20 border border-status-red/50 animate-pulse">
            <AlertTriangle size={20} className="text-status-red" />
            <span className="text-status-red font-semibold">CRISIS MODE ACTIVE</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className={`glass rounded-xl p-6 ${crisisMode ? 'border-status-red/50 animate-pulse-glow' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className={`p-3 rounded-lg ${crisisMode ? 'bg-status-red/20' : 'bg-status-yellow/20'}`}>
                <AlertTriangle size={24} className={crisisMode ? 'text-status-red' : 'text-status-yellow'} />
              </div>
              <div>
                <h3 className="font-heading text-xl text-text-primary">
                  {crisisMode ? 'Supply Crisis Alert' : 'Low Supply Warning'}
                </h3>
                <p className="text-sm text-text-secondary">
                  Current supply at {supplyPercent.toFixed(1)}% capacity
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-bg-primary/50 rounded-lg p-4">
                <div className="text-xs text-text-muted mb-1">Supply Remaining</div>
                <div className="font-mono text-2xl font-bold" style={{ color: supplyPercent > 20 ? '#00ff88' : '#ff3366' }}>
                  {supplyPercent.toFixed(1)}%
                </div>
              </div>
              <div className="bg-bg-primary/50 rounded-lg p-4">
                <div className="text-xs text-text-muted mb-1">Critical Units</div>
                <div className="font-mono text-2xl font-bold text-status-red">
                  {statistics.criticalUnits}
                </div>
              </div>
              <div className="bg-bg-primary/50 rounded-lg p-4">
                <div className="text-xs text-text-muted mb-1">Est. Shortage</div>
                <div className="font-mono text-2xl font-bold text-status-orange">
                  ~48 hrs
                </div>
              </div>
            </div>
            
            <div className="bg-bg-primary/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-accent-primary" />
                <span className="text-sm font-medium text-text-primary">Prediction</span>
              </div>
              <p className="text-sm text-text-secondary">
                {statistics.criticalUnits} households and {Math.floor(statistics.criticalUnits * 0.3)} hospitals will exhaust LPG within the next 48 hours. 
                Next scheduled supply delivery is expected in 2 days.
              </p>
            </div>
          </div>
          
          <div className="glass rounded-xl p-6">
            <h3 className="font-heading text-lg text-text-primary mb-4">Critical Units</h3>
            <div className="space-y-3">
              {criticalBuildings.map((building) => (
                <div 
                  key={building.id}
                  className="flex items-center justify-between p-3 bg-bg-primary/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getTypeIcon(building.type)}</span>
                    <div>
                      <div className="font-medium text-text-primary">{building.name}</div>
                      <div className="text-xs text-text-muted font-mono">{building.id}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-status-red">EXHAUSTED</div>
                    <div className="text-xs text-text-muted">
                      {building.consumptionRate.toFixed(1)} kg/day
                    </div>
                  </div>
                </div>
              ))}
              {criticalBuildings.length === 0 && (
                <div className="text-center py-8 text-text-muted">
                  No critical units at the moment
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="glass rounded-xl p-6">
            <h3 className="font-heading text-lg text-text-primary mb-4">Available Alternatives</h3>
            <div className="space-y-4">
              {alternatives.map((alt) => {
                const IconComponent = alt.icon
                return (
                  <div 
                    key={alt.id}
                    className="bg-bg-primary/50 rounded-lg p-4 hover:bg-bg-tertiary/50 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-start gap-3 mb-2">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: `${alt.color}20` }}
                      >
                        <IconComponent size={18} style={{ color: alt.color }} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-text-primary">{alt.name}</div>
                        <div className="text-xs text-text-muted">{alt.type}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-text-secondary mb-2">
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {alt.distance}
                      </span>
                      <span>{alt.address}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-text-muted">
                        Capacity: {alt.capacity}
                      </span>
                      <button className="text-xs text-accent-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        Contact <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          
          <div className="glass rounded-xl p-6">
            <h3 className="font-heading text-lg text-text-primary mb-4">Emergency Actions</h3>
            <div className="space-y-3">
              <button className="w-full py-3 px-4 rounded-lg bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 transition-colors font-medium flex items-center justify-center gap-2">
                <Phone size={18} />
                Request Emergency Supply
              </button>
              <button className="w-full py-3 px-4 rounded-lg bg-status-green/20 text-status-green hover:bg-status-green/30 transition-colors font-medium flex items-center justify-center gap-2">
                <Zap size={18} />
                Activate Alternatives
              </button>
              <button className="w-full py-3 px-4 rounded-lg bg-bg-tertiary text-text-secondary hover:bg-bg-primary transition-colors font-medium">
                Notify All Consumers
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CrisisPanel
