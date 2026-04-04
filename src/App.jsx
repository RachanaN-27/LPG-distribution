import React, { useEffect, useRef } from 'react'
import { useStore } from './stores/useStore'
import Header from './components/layout/Header'
import ControlBar from './components/layout/ControlBar'
import MapView from './components/map/MapView'
import DetailPanel from './components/panel/DetailPanel'
import AnalyticsDashboard from './components/dashboard/AnalyticsDashboard'
import CrisisPanel from './components/crisis/CrisisPanel'
import SupplyNetwork from './components/network/SupplyNetwork'

function App() {
  const { 
    activeTab, 
    selectedBuilding, 
    crisisMode,
    isSimulationRunning,
    updateSimulation,
    activeDelivery,
    startSupplyDelivery,
    completeDelivery,
    supplyUnit
  } = useStore()
  
  const lastTimeRef = useRef(Date.now())
  const supplyTimerRef = useRef(0)
  const supplyInProgressRef = useRef(false)
  
  useEffect(() => {
    let animationId
    
    const animate = () => {
      const currentTime = Date.now()
      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime
      
      if (isSimulationRunning) {
        updateSimulation(deltaTime)
        
        if (activeDelivery) {
          const elapsed = currentTime - activeDelivery.startTime
          if (elapsed >= activeDelivery.duration) {
            completeDelivery()
            supplyInProgressRef.current = false
          }
        } else {
          supplyTimerRef.current += deltaTime
          
          if (supplyTimerRef.current >= 4000) {
            supplyTimerRef.current = 0
            
            if (supplyUnit.currentLevel >= 50) {
              startSupplyDelivery()
            }
          }
        }
      }
      
      animationId = requestAnimationFrame(animate)
    }
    
    animationId = requestAnimationFrame(animate)
    
    return () => cancelAnimationFrame(animationId)
  }, [isSimulationRunning, updateSimulation, activeDelivery, completeDelivery, startSupplyDelivery, supplyUnit.currentLevel])
  
  return (
    <div className="w-full h-full bg-bg-primary overflow-hidden">
      <Header />
      
      <main className="h-[calc(100vh-64px)] flex">
        {activeTab === 'twin' && (
          <div className="flex-1 relative">
            <MapView />
            {selectedBuilding && <DetailPanel />}
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="w-full p-6 overflow-auto">
            <AnalyticsDashboard />
          </div>
        )}
        
        {activeTab === 'crisis' && (
          <div className="w-full p-6 overflow-auto">
            <CrisisPanel />
          </div>
        )}
        
        {activeTab === 'network' && (
          <div className="flex-1 relative">
            <SupplyNetwork />
          </div>
        )}
      </main>
      
      <ControlBar />
      
      {crisisMode && activeTab === 'twin' && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="glass px-6 py-3 rounded-lg border border-status-red/50 bg-status-red/20 flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-status-red animate-pulse"></div>
            <span className="text-status-red font-semibold">CRISIS MODE</span>
            <button 
              onClick={() => useStore.setState({ activeTab: 'crisis' })}
              className="ml-4 px-3 py-1 bg-status-red/30 hover:bg-status-red/50 rounded text-sm transition-colors"
            >
              View Details
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
