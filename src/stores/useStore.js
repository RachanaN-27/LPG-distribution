import { create } from 'zustand'
import { generateBuildings, generateSupplyUnit, getLPGStatus, CATEGORY_PRIORITY, STATUS_PRIORITY } from '../data/buildings'

const generateInitialState = () => {
  const buildings = generateBuildings()
  const supplyUnit = generateSupplyUnit()
  
  const criticalCount = buildings.filter(b => b.status === 'critical').length
  const warningCount = buildings.filter(b => b.status === 'warning').length
  const cautionCount = buildings.filter(b => b.status === 'caution').length
  const healthyCount = buildings.filter(b => b.status === 'healthy').length
  
  return {
    buildings,
    supplyUnit,
    selectedBuilding: null,
    hoveredBuilding: null,
    activeTab: 'twin',
    isSimulationRunning: true,
    simulationSpeed: 1,
    currentTime: new Date('2026-04-04T08:00:00'),
    dayNumber: 1,
    crisisMode: false,
    alerts: [],
    showHeatmap: false,
    filters: {
      hospital: true,
      household: true,
      commercial: true,
      industrial: true,
      gas_station: true
    },
    activeDelivery: null,
    supplyQueue: [],
    statistics: {
      totalConsumers: buildings.length,
      criticalUnits: criticalCount,
      warningUnits: warningCount,
      cautionUnits: cautionCount,
      healthyUnits: healthyCount,
      supplyEfficiency: 100,
      aiAccuracy: 91,
      totalRefills: 0,
      totalConsumed: 0
    }
  }
}

export const useStore = create((set, get) => ({
  ...generateInitialState(),
  
  setSelectedBuilding: (building) => set({ selectedBuilding: building }),
  setHoveredBuilding: (building) => set({ hoveredBuilding: building }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setShowHeatmap: (show) => set({ showHeatmap: show }),
  setFilters: (filters) => set({ filters }),
  
  toggleSimulation: () => set((state) => ({ 
    isSimulationRunning: !state.isSimulationRunning 
  })),
  
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  
  updateSimulation: (deltaTime) => {
    const state = get()
    if (!state.isSimulationRunning) return
    
    const speedMultiplier = state.simulationSpeed * 0.5
    const timeAdvanceSeconds = (deltaTime / 1000) * speedMultiplier
    const simulatedDays = timeAdvanceSeconds / 60
    
    set((state) => {
      const newBuildings = state.buildings.map(building => {
        const consumptionPerDay = building.dailyConsumption || 1
        const consumptionForPeriod = consumptionPerDay * simulatedDays
        const consumptionPercent = (consumptionForPeriod / building.capacity) * 100
        
        const newLevel = Math.max(0, building.lpgLevel - consumptionPercent)
        const newStatus = getLPGStatus(newLevel)
        const daysRemaining = newLevel > 0 ? (newLevel / 100) * building.capacity / consumptionPerDay : 0
        
        return {
          ...building,
          lpgLevel: newLevel,
          status: newStatus,
          daysRemaining: daysRemaining
        }
      })
      
      const totalConsumption = newBuildings.reduce((sum, b) => sum + (b.dailyConsumption || 0), 0)
      const supplyUsed = totalConsumption * simulatedDays
      const newSupplyLevel = Math.max(0, state.supplyUnit.currentLevel - supplyUsed)
      const supplyPercent = (newSupplyLevel / state.supplyUnit.capacity) * 100
      
      const criticalCount = newBuildings.filter(b => b.status === 'critical').length
      const warningCount = newBuildings.filter(b => b.status === 'warning').length
      const cautionCount = newBuildings.filter(b => b.status === 'caution').length
      const healthyCount = newBuildings.filter(b => b.status === 'healthy').length
      
      const newTime = new Date(state.currentTime)
      newTime.setSeconds(newTime.getSeconds() + timeAdvanceSeconds)
      const newDay = Math.max(1, Math.floor(simulatedDays) + state.dayNumber)
      
      const crisisMode = supplyPercent < 15 || criticalCount > newBuildings.length * 0.08
      
      return {
        buildings: newBuildings,
        supplyUnit: { ...state.supplyUnit, currentLevel: newSupplyLevel },
        currentTime: newTime,
        dayNumber: newDay,
        crisisMode,
        statistics: {
          ...state.statistics,
          criticalUnits: criticalCount,
          warningUnits: warningCount,
          cautionUnits: cautionCount,
          healthyUnits: healthyCount,
          supplyEfficiency: Math.round((newSupplyLevel / state.supplyUnit.capacity) * 100),
          totalConsumed: state.statistics.totalConsumed + supplyUsed
        }
      }
    })
  },
  
  selectNextRecipient: () => {
    const state = get()
    
    const needyBuildings = state.buildings.filter(b => 
      b.status === 'warning' || b.status === 'critical' || b.status === 'caution'
    )
    
    if (needyBuildings.length === 0) return null
    
    needyBuildings.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority
      }
      const statusOrder = { critical: 1, warning: 2, caution: 3 }
      return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4)
    })
    
    return needyBuildings[0]
  },
  
  startDelivery: (buildingId) => {
    const state = get()
    const building = state.buildings.find(b => b.id === buildingId)
    
    if (!building || state.activeDelivery) return
    
    if (state.supplyUnit.currentLevel < building.refillAmount) return
    
    const supplyNeeded = building.refillAmount
    const newSupplyLevel = state.supplyUnit.currentLevel - supplyNeeded
    
    set({
      activeDelivery: {
        buildingId: building.id,
        startTime: Date.now(),
        duration: 4000,
        from: [state.supplyUnit.lat, state.supplyUnit.lng],
        to: [building.lat, building.lng],
        refillAmount: supplyNeeded,
        targetBuilding: building
      },
      supplyUnit: { ...state.supplyUnit, currentLevel: newSupplyLevel }
    })
  },
  
  completeDelivery: () => {
    const state = get()
    if (!state.activeDelivery) return
    
    const { buildingId, refillAmount } = state.activeDelivery
    const building = state.buildings.find(b => b.id === buildingId)
    
    if (building) {
      const refillPercent = (refillAmount / building.capacity) * 100
      const newLevel = Math.min(100, building.lpgLevel + refillPercent)
      const newStatus = getLPGStatus(newLevel)
      const daysRemaining = (newLevel / 100) * building.capacity / building.dailyConsumption
      
      set({
        buildings: state.buildings.map(b => 
          b.id === buildingId 
            ? { ...b, lpgLevel: newLevel, status: newStatus, daysRemaining, lastRefill: new Date() }
            : b
        ),
        activeDelivery: null,
        statistics: {
          ...state.statistics,
          totalRefills: state.statistics.totalRefills + 1
        }
      })
    } else {
      set({ activeDelivery: null })
    }
  },
  
  cancelDelivery: () => {
    const state = get()
    if (state.activeDelivery) {
      const refundAmount = state.activeDelivery.refillAmount
      set({
        activeDelivery: null,
        supplyUnit: { ...state.supplyUnit, currentLevel: state.supplyUnit.currentLevel + refundAmount }
      })
    }
  },
  
  refillSupply: () => {
    set((state) => ({
      supplyUnit: {
        ...state.supplyUnit,
        currentLevel: state.supplyUnit.capacity
      },
      buildings: state.buildings.map(b => ({
        ...b,
        lpgLevel: 70 + Math.random() * 20,
        status: 'healthy',
        daysRemaining: (70 + Math.random() * 20) / 100 * b.capacity / b.dailyConsumption
      }))
    }))
  },
  
  addAlert: (alert) => set((state) => ({
    alerts: [...state.alerts, { ...alert, id: Date.now(), timestamp: new Date() }]
  })),
  
  dismissAlert: (alertId) => set((state) => ({
    alerts: state.alerts.filter(a => a.id !== alertId)
  }))
}))
