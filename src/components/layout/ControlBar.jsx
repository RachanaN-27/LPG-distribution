import React from 'react'
import { useStore } from '../../stores/useStore'
import { Play, Pause, RotateCcw, Zap, Clock } from 'lucide-react'

const speedOptions = [1, 2, 5, 10, 100]

function ControlBar() {
  const { 
    isSimulationRunning, 
    simulationSpeed,
    toggleSimulation, 
    setSimulationSpeed,
    refillSupply,
    dayNumber
  } = useStore()
  
  return (
    <div className="h-14 bg-bg-secondary border-t border-accent-primary/20 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSimulation}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
              isSimulationRunning
                ? 'bg-status-red/20 text-status-red hover:bg-status-red/30'
                : 'bg-status-green/20 text-status-green hover:bg-status-green/30'
            }`}
          >
            {isSimulationRunning ? <Pause size={18} /> : <Play size={18} />}
            {isSimulationRunning ? 'Pause' : 'Play'}
          </button>
          
          <button
            onClick={() => {
              toggleSimulation()
              setTimeout(() => toggleSimulation(), 100)
            }}
            className="p-2 rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw size={18} />
          </button>
        </div>
        
        <div className="h-8 w-px bg-bg-tertiary mx-2" />
        
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-text-muted" />
          <span className="text-sm text-text-secondary">Speed:</span>
          <div className="flex gap-1">
            {speedOptions.map(speed => (
              <button
                key={speed}
                onClick={() => setSimulationSpeed(speed)}
                className={`px-3 py-1 rounded text-sm font-mono transition-all ${
                  simulationSpeed === speed
                    ? 'bg-accent-primary/20 text-accent-primary'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-bg-tertiary">
          <Zap size={16} className="text-status-yellow" />
          <span className="text-sm text-text-secondary">
            Day <span className="font-mono font-bold text-text-primary">{dayNumber}</span>
          </span>
        </div>
        
        <button
          onClick={refillSupply}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-secondary/20 text-accent-secondary hover:bg-accent-secondary/30 transition-colors"
        >
          <Zap size={18} />
          <span className="font-medium">Emergency Refill</span>
        </button>
      </div>
    </div>
  )
}

export default ControlBar
