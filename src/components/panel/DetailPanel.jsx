import React from 'react'
import { useStore } from '../../stores/useStore'
import { 
  X, Droplets, TrendingDown, Calendar, Clock, Activity, 
  AlertCircle, CheckCircle, Users, Fuel, MapPin, Building2
} from 'lucide-react'
import { getStatusLabel, getTypeConfig } from '../../data/buildings'

function DetailPanel() {
  const { selectedBuilding, setSelectedBuilding, supplyUnit } = useStore()
  
  if (!selectedBuilding) return null
  
  const {
    id, name, type, lpgLevel, daysRemaining, 
    consumptionRate, capacity, status, statusColor,
    area, familySize, staff, beds, employees, category
  } = selectedBuilding
  
  const typeConfig = getTypeConfig(type)
  const supplyPercent = (supplyUnit.currentLevel / supplyUnit.capacity) * 100
  
  const getBuildingIcon = () => {
    switch (type) {
      case 'hospital': return '🏥'
      case 'household': return '🏠'
      case 'commercial': return '🏪'
      case 'industrial': return '🏭'
      case 'gas_station': return '⛽'
      default: return '🏢'
    }
  }
  
  const getAdditionalInfo = () => {
    switch (type) {
      case 'hospital':
        return (
          <>
            <div className="flex justify-between items-center py-2 border-b border-bg-tertiary">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <Users size={14} /> Staff
              </span>
              <span className="font-mono text-text-primary">{staff || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-bg-tertiary">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <Building2 size={14} /> Beds
              </span>
              <span className="font-mono text-text-primary">{beds || 'N/A'}</span>
            </div>
          </>
        )
      case 'household':
        return (
          <>
            <div className="flex justify-between items-center py-2 border-b border-bg-tertiary">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <Users size={14} /> Family Size
              </span>
              <span className="font-mono text-text-primary">{familySize || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-bg-tertiary">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <MapPin size={14} /> Floors
              </span>
              <span className="font-mono text-text-primary">{selectedBuilding.floors || 'N/A'}</span>
            </div>
          </>
        )
      case 'commercial':
        return (
          <>
            <div className="flex justify-between items-center py-2 border-b border-bg-tertiary">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <Building2 size={14} /> Category
              </span>
              <span className="font-mono text-text-primary capitalize">{category || 'General'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-bg-tertiary">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <Users size={14} /> Employees
              </span>
              <span className="font-mono text-text-primary">{employees || 'N/A'}</span>
            </div>
          </>
        )
      case 'industrial':
        return (
          <>
            <div className="flex justify-between items-center py-2 border-b border-bg-tertiary">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <Users size={14} /> Workforce
              </span>
              <span className="font-mono text-text-primary">{employees || 'N/A'}</span>
            </div>
          </>
        )
      case 'gas_station':
        return (
          <>
            <div className="flex justify-between items-center py-2 border-b border-bg-tertiary">
              <span className="text-sm text-text-secondary flex items-center gap-2">
                <Fuel size={14} /> Storage Cap.
              </span>
              <span className="font-mono text-text-primary">{capacity} kg</span>
            </div>
          </>
        )
      default:
        return null
    }
  }
  
  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-bg-secondary/95 backdrop-blur-md border-l border-accent-primary/20 animate-slide-in overflow-y-auto z-40">
      <div className="sticky top-0 bg-bg-secondary z-10 border-b border-accent-primary/20 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{getBuildingIcon()}</span>
          <div>
            <h2 className="font-heading text-sm text-text-muted">{typeConfig.label.toUpperCase()}</h2>
            <p className="font-mono text-xs text-text-muted">ID: {id}</p>
          </div>
        </div>
        <button
          onClick={() => setSelectedBuilding(null)}
          className="p-2 rounded-lg hover:bg-bg-tertiary transition-colors text-text-secondary hover:text-text-primary"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        <div>
          <h3 className="font-heading text-xl font-bold text-text-primary mb-1">{name}</h3>
          {area && <p className="text-sm text-text-secondary flex items-center gap-1"><MapPin size={12} /> {area}</p>}
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Droplets size={18} className="text-accent-primary" />
            <h4 className="font-semibold text-text-primary">LPG Level</h4>
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-text-secondary">Current Level</span>
              <span className="font-mono font-bold text-lg" style={{ color: statusColor }}>
                {lpgLevel.toFixed(1)}%
              </span>
            </div>
            <div className="h-4 bg-bg-primary rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 rounded-full relative"
                style={{ 
                  width: `${Math.min(100, Math.max(0, lpgLevel))}%`,
                  backgroundColor: statusColor
                }}
              >
                <div className="absolute inset-0 bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg-primary/50 rounded-lg p-3">
              <div className="text-xs text-text-muted mb-1">Days Left</div>
              <div className="font-mono text-lg font-bold" style={{ color: statusColor }}>
                {daysRemaining > 0 ? daysRemaining.toFixed(1) : '0'}
                <span className="text-xs text-text-muted ml-1">days</span>
              </div>
            </div>
            <div className="bg-bg-primary/50 rounded-lg p-3">
              <div className="text-xs text-text-muted mb-1">Capacity</div>
              <div className="font-mono text-lg font-bold text-text-primary">
                {capacity}
                <span className="text-xs text-text-muted ml-1">kg</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Activity size={18} className="text-accent-secondary" />
            <h4 className="font-semibold text-text-primary">Consumption</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-bg-tertiary">
              <span className="text-sm text-text-secondary">Daily Rate</span>
              <span className="font-mono text-text-primary">
                {consumptionRate.toFixed(2)} kg/day
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-bg-tertiary">
              <span className="text-sm text-text-secondary">Status</span>
              <span className="flex items-center gap-2">
                {status === 'healthy' ? (
                  <CheckCircle size={16} className="text-status-green" />
                ) : (
                  <AlertCircle size={16} style={{ color: statusColor }} />
                )}
                <span className="text-sm font-medium" style={{ color: statusColor }}>
                  {getStatusLabel(status)}
                </span>
              </span>
            </div>
            {getAdditionalInfo()}
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={18} className="text-status-yellow" />
            <h4 className="font-semibold text-text-primary">Predictions</h4>
          </div>
          
          <div className="space-y-3">
            <div className="bg-bg-primary/50 rounded-lg p-3">
              <div className="text-xs text-text-muted mb-2">Estimated Depletion</div>
              <div className="font-mono text-lg font-bold" style={{ color: statusColor }}>
                {daysRemaining > 0 
                  ? `${daysRemaining.toFixed(1)} days`
                  : '⚠️ IMMINENT'
                }
              </div>
            </div>
            
            {daysRemaining <= 5 && (
              <div className="bg-status-red/10 border border-status-red/30 rounded-lg p-3">
                <div className="flex items-center gap-2 text-status-red mb-1">
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">Priority Refill Required</span>
                </div>
                <p className="text-xs text-text-secondary">
                  This unit is in the priority queue for next supply delivery.
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calendar size={18} className="text-accent-primary" />
            <h4 className="font-semibold text-text-primary">History</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Last Refill</span>
              <span className="text-text-secondary">{Math.floor(Math.random() * 5) + 1} days ago</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">Refill Freq.</span>
              <span className="text-text-secondary">Every {Math.floor(daysRemaining)} days</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-text-muted">AI Confidence</span>
              <span className="text-status-green">92%</span>
            </div>
          </div>
        </div>
        
        <div className="glass rounded-xl p-4 bg-bg-primary/30">
          <div className="text-xs text-text-muted mb-3">CENTRAL SUPPLY STATUS</div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
                <div 
                  className="h-full transition-all duration-500 rounded-full"
                  style={{ 
                    width: `${supplyPercent}%`,
                    backgroundColor: supplyPercent > 50 ? '#00ff88' : supplyPercent > 20 ? '#ffd000' : '#ff3366'
                  }}
                />
              </div>
            </div>
            <span className="font-mono text-sm font-bold" style={{ 
              color: supplyPercent > 50 ? '#00ff88' : supplyPercent > 20 ? '#ffd000' : '#ff3366'
            }}>
              {supplyPercent.toFixed(1)}%
            </span>
          </div>
        </div>
        
        <button className="w-full py-3 rounded-xl bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 transition-colors font-semibold flex items-center justify-center gap-2">
          <Fuel size={18} />
          Request Refill
        </button>
      </div>
    </div>
  )
}

export default DetailPanel
