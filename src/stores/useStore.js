import { create } from 'zustand'
import { generateBuildings, generateSupplyUnit, getLPGStatus } from '../data/buildings'

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
    activeTab: 'twin',
    isSimulationRunning: true,
    simulationSpeed: 1,
    simulationDay: 1,
    simulationTime: 0,
    crisisMode: false,
    alerts: [],
    filters: {
      hospital: true,
      household: true,
      commercial: true,
      industrial: true,
      gas_station: true
    },
    activeDelivery: null,
    deliveryQueue: [],
    currentSupplyingCategory: null,
    statistics: {
      totalConsumers: buildings.length,
      criticalUnits: criticalCount,
      warningUnits: warningCount,
      cautionUnits: cautionCount,
      healthyUnits: healthyCount,
      totalRefills: 0,
      totalConsumed: 0
    }
  }
}

export const useStore = create((set, get) => ({
  ...generateInitialState(),
  
  setSelectedBuilding: (building) => set({ selectedBuilding: building }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFilters: (filters) => set({ filters }),
  
  toggleSimulation: () => set((state) => ({ 
    isSimulationRunning: !state.isSimulationRunning 
  })),
  
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  
  updateSimulation: (deltaTime) => {
    const state = get()
    if (!state.isSimulationRunning) return
    
    const speedMultiplier = state.simulationSpeed * 0.3
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
      
      const criticalCount = newBuildings.filter(b => b.status === 'critical').length
      const warningCount = newBuildings.filter(b => b.status === 'warning').length
      const cautionCount = newBuildings.filter(b => b.status === 'caution').length
      const healthyCount = newBuildings.filter(b => b.status === 'healthy').length
      
      const newSimulationTime = state.simulationTime + timeAdvanceSeconds
      const newDay = Math.floor(newSimulationTime / 60) + 1
      
      const crisisMode = criticalCount > newBuildings.length * 0.05
      
      return {
        buildings: newBuildings,
        simulationTime: newSimulationTime,
        simulationDay: newDay,
        crisisMode,
        statistics: {
          ...state.statistics,
          criticalUnits: criticalCount,
          warningUnits: warningCount,
          cautionUnits: cautionCount,
          healthyUnits: healthyCount
        }
      }
    })
  },
  
  findNextRecipient: () => {
    const state = get()
    
    const needyBuildings = state.buildings.filter(b => 
      b.status !== 'healthy'
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
  
  startSupplyDelivery: () => {
    const state = get()
    
    if (state.activeDelivery) return
    if (state.supplyUnit.currentLevel < 50) return
    
    const recipient = get().findNextRecipient()
    if (!recipient) return
    
    const refillPercent = (recipient.refillAmount / recipient.capacity) * 100
    const actualRefill = Math.min(
      recipient.refillAmount,
      (recipient.capacity * (100 - recipient.lpgLevel)) / 100
    )
    
    const newSupplyLevel = state.supplyUnit.currentLevel - actualRefill
    
    set({
      activeDelivery: {
        buildingId: recipient.id,
        buildingName: recipient.name,
        buildingType: recipient.type,
        status: recipient.status,
        startTime: Date.now(),
        duration: 3000,
        from: { lat: state.supplyUnit.lat, lng: state.supplyUnit.lng },
        to: { lat: recipient.lat, lng: recipient.lng },
        refillAmount: actualRefill,
        startLevel: recipient.lpgLevel,
        targetLevel: Math.min(100, recipient.lpgLevel + refillPercent)
      },
      supplyUnit: { ...state.supplyUnit, currentLevel: Math.max(0, newSupplyLevel) },
      currentSupplyingCategory: recipient.type,
      deliveryQueue: state.deliveryQueue.filter(id => id !== recipient.id)
    })
  },
  
  completeDelivery: () => {
    const state = get()
    if (!state.activeDelivery) return
    
    const { buildingId, refillAmount } = state.activeDelivery
    const building = state.buildings.find(b => b.id === buildingId)
    
    if (building) {
      const actualRefillPercent = (refillAmount / building.capacity) * 100
      const newLevel = Math.min(100, building.lpgLevel + actualRefillPercent)
      const newStatus = getLPGStatus(newLevel)
      const daysRemaining = (newLevel / 100) * building.capacity / building.dailyConsumption
      
      set({
        buildings: state.buildings.map(b => 
          b.id === buildingId 
            ? { ...b, lpgLevel: newLevel, status: newStatus, daysRemaining, lastRefill: new Date() }
            : b
        ),
        activeDelivery: null,
        currentSupplyingCategory: null,
        statistics: {
          ...state.statistics,
          totalRefills: state.statistics.totalRefills + 1
        }
      })
    } else {
      set({ activeDelivery: null, currentSupplyingCategory: null })
    }
  },
  
  cancelDelivery: () => {
    const state = get()
    if (state.activeDelivery) {
      set({
        activeDelivery: null,
        currentSupplyingCategory: null,
        supplyUnit: { 
          ...state.supplyUnit, 
          currentLevel: state.supplyUnit.currentLevel + (state.activeDelivery.refillAmount || 0)
        }
      })
    }
  },
  
  refillSupply: () => {
    set((state) => ({
      supplyUnit: { ...state.supplyUnit, currentLevel: state.supplyUnit.capacity },
      buildings: state.buildings.map(b => {
        const newLevel = 70 + Math.random() * 20
        return {
          ...b,
          lpgLevel: newLevel,
          status: getLPGStatus(newLevel),
          daysRemaining: (newLevel / 100) * b.capacity / b.dailyConsumption
        }
      }),
      activeDelivery: null,
      currentSupplyingCategory: null
    }))
  },
  
  addAlert: (alert) => set((state) => ({
    alerts: [...state.alerts, { ...alert, id: Date.now(), timestamp: new Date() }]
  })),
  
  dismissAlert: (alertId) => set((state) => ({
    alerts: state.alerts.filter(a => a.id !== alertId)
  }))
}))
