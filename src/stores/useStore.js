import { create } from 'zustand'
import { generateBuildings, generateSupplyUnits, getLPGStatus } from '../data/buildings'

const generateInitialState = () => {
  const buildings = generateBuildings()
  const supplyUnits = generateSupplyUnits()
  const supplyUnit = supplyUnits[0]
  
  const criticalCount = buildings.filter(b => b.status === 'critical').length
  const warningCount = buildings.filter(b => b.status === 'warning').length
  const cautionCount = buildings.filter(b => b.status === 'caution').length
  const healthyCount = buildings.filter(b => b.status === 'healthy').length
  
  return {
    buildings,
    supplyUnits,
    supplyUnit,
    selectedBuilding: null,
    activeTab: 'twin',
    isSimulationRunning: true,
    simulationSpeed: 1,
    simulationDay: 1,
    simulationTime: 0,
    crisisMode: false,
    alerts: [],
    maxQueueSize: 10,
    filters: {
      hospital: true,
      household: true,
      commercial: true,
      industrial: true,
      gas_station: true
    },
    activeDeliveries: [],
    deliveryQueue: [],
    currentSupplyingCategory: null,
    statistics: {
      totalConsumers: buildings.length,
      criticalUnits: criticalCount,
      warningUnits: warningCount,
      cautionUnits: cautionCount,
      healthyUnits: healthyCount,
      totalRefills: 0,
      totalConsumed: 0,
      aiAccuracy: 85
    }
  }
}

export const useStore = create((set, get) => ({
  ...generateInitialState(),
  
  setSelectedBuilding: (building) => set({ selectedBuilding: building }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  setFilters: (filters) => set({ filters }),
  setMaxQueueSize: (size) => set({ maxQueueSize: size }),
  
  toggleSimulation: () => set((state) => ({ 
    isSimulationRunning: !state.isSimulationRunning 
  })),
  
  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),
  
  updateSimulation: (deltaTime) => {
    const state = get()
    if (!state.isSimulationRunning) return
    
    const speedMultiplier = state.simulationSpeed * 2
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
  
  findNextRecipient: (excludeBuildingIds = [], supplyUnitType = null) => {
    const state = get()
    
    const activeBuildingIds = (state.activeDeliveries || []).map(d => d.buildingId)
    const allExcluded = [...excludeBuildingIds, ...activeBuildingIds]
    
    const needyBuildings = state.buildings.filter(b => 
      b.status !== 'healthy' && !allExcluded.includes(b.id)
    )
    
    if (needyBuildings.length === 0) return null
    
    const supplyUnit = supplyUnitType 
      ? state.supplyUnits.find(u => u.type === supplyUnitType)
      : state.supplyUnits[0]
    
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371
      const dLat = (lat2 - lat1) * Math.PI / 180
      const dLng = (lng2 - lng1) * Math.PI / 180
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
      return R * c
    }
    
    const getDistanceScore = (building) => {
      if (!supplyUnit) return 0
      const dist = calculateDistance(supplyUnit.lat, supplyUnit.lng, building.lat, building.lng)
      return dist
    }
    
    const priorityWeight = 10
    const distanceWeight = 1
    
    const scoredBuildings = needyBuildings.map(b => {
      const distanceScore = getDistanceScore(b)
      const priorityScore = b.priority
      const combinedScore = (priorityScore * priorityWeight) + (distanceScore * distanceWeight)
      return { ...b, combinedScore, distance: distanceScore }
    })
    
    scoredBuildings.sort((a, b) => {
      if (a.combinedScore !== b.combinedScore) {
        return a.combinedScore - b.combinedScore
      }
      const statusOrder = { critical: 1, warning: 2, caution: 3 }
      return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4)
    })
    
    return scoredBuildings[0]
  },

  startSupplyDelivery: () => {
    const state = get()
    
    const maxDeliveriesPerUnit = 1
    const currentDeliveries = state.activeDeliveries || []
    const lpgDeliveries = currentDeliveries.filter(d => d.supplyUnitType === 'lpg').length
    const biogasDeliveries = currentDeliveries.filter(d => d.supplyUnitType === 'biogas').length
    
    if (lpgDeliveries >= maxDeliveriesPerUnit && biogasDeliveries >= maxDeliveriesPerUnit) return
    
    const supplyUnits = state.supplyUnits
    const availableUnits = supplyUnits.filter(u => u.currentLevel >= 50)
    
    if (availableUnits.length === 0) return
    
    const lpgUnit = supplyUnits.find(u => u.type === 'lpg')
    const biogasUnit = supplyUnits.find(u => u.type === 'biogas')
    
    const activeBuildingIds = currentDeliveries.map(d => d.buildingId)
    
    let supplyUnit
    let recipient
    
    const lpgHasCapacity = lpgUnit && lpgUnit.currentLevel >= 50 && lpgDeliveries < maxDeliveriesPerUnit
    const biogasHasCapacity = biogasUnit && biogasUnit.currentLevel >= 50 && biogasDeliveries < maxDeliveriesPerUnit
    
    if (!lpgHasCapacity && !biogasHasCapacity) return
    
    if (lpgDeliveries < maxDeliveriesPerUnit && biogasDeliveries < maxDeliveriesPerUnit) {
      if (lpgDeliveries <= biogasDeliveries && lpgHasCapacity) {
        supplyUnit = lpgUnit
        recipient = get().findNextRecipient(activeBuildingIds, 'lpg')
        if (!recipient || recipient.priority > 2) {
          if (biogasHasCapacity) {
            supplyUnit = biogasUnit
            recipient = get().findNextRecipient(activeBuildingIds, 'biogas')
          }
        }
      } else if (biogasHasCapacity) {
        supplyUnit = biogasUnit
        recipient = get().findNextRecipient(activeBuildingIds, 'biogas')
      }
    } else if (lpgHasCapacity) {
      supplyUnit = lpgUnit
      recipient = get().findNextRecipient(activeBuildingIds, 'lpg')
    } else if (biogasHasCapacity) {
      supplyUnit = biogasUnit
      recipient = get().findNextRecipient(activeBuildingIds, 'biogas')
    }
    
    if (!supplyUnit || !recipient) return
    
    const refillPercent = (recipient.refillAmount / recipient.capacity) * 100
    const actualRefill = Math.min(
      recipient.refillAmount,
      (recipient.capacity * (100 - recipient.lpgLevel)) / 100
    )
    
    const newSupplyLevel = supplyUnit.currentLevel - actualRefill
    
    const trafficSpeed = Math.random()
    const baseDuration = 15000
    let duration
    let speedType
    if (trafficSpeed > 0.6) {
      duration = baseDuration * 0.5
      speedType = 'fast'
    } else if (trafficSpeed > 0.3) {
      duration = baseDuration
      speedType = 'normal'
    } else {
      duration = baseDuration * 1.8
      speedType = 'slow'
    }
    
    const maxQueue = state.maxQueueSize
    const topQueue = state.buildings
      .filter(b => b.status !== 'healthy' && b.id !== recipient.id)
      .sort((a, b) => {
        if (a.priority !== b.priority) return a.priority - b.priority
        const statusOrder = { critical: 1, warning: 2, caution: 3 }
        return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4)
      })
      .slice(0, maxQueue)
      .map(b => b.id)
    
    const newDelivery = {
      id: `delivery_${Date.now()}`,
      buildingId: recipient.id,
      buildingName: recipient.name,
      buildingType: recipient.type,
      status: recipient.status,
      startTime: Date.now(),
      duration: duration,
      speedType: speedType,
      priorityNum: recipient.priority,
      supplyUnitId: supplyUnit.id,
      supplyUnitType: supplyUnit.type,
      from: { lat: supplyUnit.lat, lng: supplyUnit.lng },
      to: { lat: recipient.lat, lng: recipient.lng },
      refillAmount: actualRefill,
      startLevel: recipient.lpgLevel,
      targetLevel: Math.min(100, recipient.lpgLevel + refillPercent)
    }
    
    const updatedSupplyUnits = supplyUnits.map(u => {
      if (u.id === supplyUnit.id) {
        return { ...u, currentLevel: Math.max(0, newSupplyLevel) }
      }
      return u
    })
    
    set({
      activeDeliveries: [...state.activeDeliveries, newDelivery],
      supplyUnits: updatedSupplyUnits,
      supplyUnit: updatedSupplyUnits[0],
      currentSupplyingCategory: recipient.type,
      deliveryQueue: topQueue
    })
  },
  
  completeDelivery: (deliveryId) => {
    const state = get()
    const delivery = state.activeDeliveries.find(d => d.id === deliveryId)
    if (!delivery) return
    
    const { buildingId, refillAmount } = delivery
    const building = state.buildings.find(b => b.id === buildingId)
    
    if (building) {
      const actualRefillPercent = (refillAmount / building.capacity) * 100
      const newLevel = Math.min(100, building.lpgLevel + actualRefillPercent)
      const newStatus = getLPGStatus(newLevel)
      const daysRemaining = (newLevel / 100) * building.capacity / building.dailyConsumption
      
      const topNeedy = state.buildings
        .filter(b => b.status !== 'healthy' && b.id !== buildingId)
        .sort((a, b) => {
          if (a.priority !== b.priority) return a.priority - b.priority
          const statusOrder = { critical: 1, warning: 2, caution: 3 }
          return (statusOrder[a.status] || 4) - (statusOrder[b.status] || 4)
        })
        .slice(0, 10)
        .map(b => b.id)
      
      set({
        buildings: state.buildings.map(b => 
          b.id === buildingId 
            ? { ...b, lpgLevel: newLevel, status: newStatus, daysRemaining, lastRefill: new Date() }
            : b
        ),
        activeDeliveries: state.activeDeliveries.filter(d => d.id !== deliveryId),
        currentSupplyingCategory: state.activeDeliveries.length > 1 ? state.currentSupplyingCategory : null,
        deliveryQueue: topNeedy,
        statistics: {
          ...state.statistics,
          totalRefills: state.statistics.totalRefills + 1
        }
      })
    } else {
      set({ 
        activeDeliveries: state.activeDeliveries.filter(d => d.id !== deliveryId),
        currentSupplyingCategory: state.activeDeliveries.length > 1 ? state.currentSupplyingCategory : null
      })
    }
  },
  
  cancelDelivery: (deliveryId) => {
    const state = get()
    const delivery = state.activeDeliveries.find(d => d.id === deliveryId)
    if (delivery) {
      const updatedSupplyUnits = state.supplyUnits.map(u => {
        if (u.id === delivery.supplyUnitId) {
          return {
            ...u,
            currentLevel: u.currentLevel + (delivery.refillAmount || 0)
          }
        }
        return u
      })
      set({
        activeDeliveries: state.activeDeliveries.filter(d => d.id !== deliveryId),
        supplyUnits: updatedSupplyUnits,
        supplyUnit: updatedSupplyUnits[0],
        currentSupplyingCategory: state.activeDeliveries.length > 1 ? state.currentSupplyingCategory : null
      })
    }
  },
  
  refillSupply: () => {
    set((state) => {
      const updatedSupplyUnits = state.supplyUnits.map(u => ({
        ...u,
        currentLevel: u.capacity
      }))
      return {
        supplyUnits: updatedSupplyUnits,
        supplyUnit: updatedSupplyUnits[0],
        buildings: state.buildings.map(b => {
          const newLevel = 70 + Math.random() * 20
          return {
            ...b,
            lpgLevel: newLevel,
            status: getLPGStatus(newLevel),
            daysRemaining: (newLevel / 100) * b.capacity / b.dailyConsumption
          }
        }),
        activeDeliveries: [],
        currentSupplyingCategory: null
      }
    })
  },
  
  addAlert: (alert) => set((state) => ({
    alerts: [...state.alerts, { ...alert, id: Date.now(), timestamp: new Date() }]
  })),
  
  dismissAlert: (alertId) => set((state) => ({
    alerts: state.alerts.filter(a => a.id !== alertId)
  }))
}))
