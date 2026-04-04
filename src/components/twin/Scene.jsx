import React, { Suspense, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Stars, Html } from '@react-three/drei'
import { useStore } from '../../stores/useStore'
import Building from './Building'
import Ground from './Ground'
import SupplyUnit from './SupplyUnit'
import ConnectionLines from './ConnectionLines'
import HeatmapLayer from './HeatmapLayer'
import { getTypeConfig, getStatusColor } from '../../data/buildings'

function CameraController() {
  const controlsRef = useRef()
  
  return (
    <>
      <PerspectiveCamera makeDefault position={[25, 20, 25]} fov={55} />
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={8}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2.1}
        target={[0, 0, 0]}
        panSpeed={0.8}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
      />
    </>
  )
}

function Lighting() {
  const sunRef = useRef()
  
  useFrame((state) => {
    if (sunRef.current) {
      sunRef.current.position.x = Math.cos(state.clock.elapsedTime * 0.1) * 30
      sunRef.current.position.z = Math.sin(state.clock.elapsedTime * 0.1) * 30
    }
  })
  
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        ref={sunRef}
        position={[20, 40, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={150}
        shadow-camera-left={-60}
        shadow-camera-right={60}
        shadow-camera-top={60}
        shadow-camera-bottom={-60}
        shadow-bias={-0.0001}
      />
      <pointLight position={[-30, 15, -30]} intensity={0.6} color="#00d4ff" />
      <pointLight position={[30, 10, 30]} intensity={0.4} color="#a855f7" />
      <pointLight position={[0, 30, 0]} intensity={0.3} color="#ffffff" />
    </>
  )
}

function SceneContent() {
  const { buildings, supplyUnit, showHeatmap, filters, maxQueueSize, activeDelivery, deliveryQueue } = useStore()
  
  const filteredBuildings = useMemo(() => {
    return buildings.filter(building => {
      if (filters.hospital && building.type === 'hospital') return true
      if (filters.household && building.type === 'household') return true
      if (filters.commercial && building.type === 'commercial') return true
      if (filters.industrial && building.type === 'industrial') return true
      if (filters.gas_station && building.type === 'gas_station') return true
      return false
    })
  }, [buildings, filters, activeDelivery, deliveryQueue])
  
  return (
    <>
      <CameraController />
      <Lighting />
      
      <Stars 
        radius={150} 
        depth={80} 
        count={3000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={0.3}
      />
      
      <fog attach="fog" args={['#0a0e17', 40, 120]} />
      
      <Ground />
      <SupplyUnit {...supplyUnit} />
      <HeatmapLayer />
      
      {filteredBuildings.map(building => (
        <Building key={building.id} {...building} />
      ))}
      
      <ConnectionLines buildings={filteredBuildings} supplyUnit={supplyUnit} />
    </>
  )
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="#00d4ff" wireframe />
    </mesh>
  )
}

function FilterPanel() {
  const { filters, setFilters, maxQueueSize, setMaxQueueSize } = useStore()
  
  const toggleFilter = (type) => {
    setFilters({
      ...filters,
      [type]: !filters[type]
    })
  }
  
  return (
    <div className="absolute top-4 right-4 glass px-4 py-3 rounded-lg">
      <div className="text-xs text-text-muted mb-2 font-semibold">FILTERS</div>
      <div className="space-y-2">
        {[
          { type: 'hospital', label: 'Hospitals', color: '#00d4ff', icon: '🏥' },
          { type: 'household', label: 'Households', color: '#e8e8e8', icon: '🏠' },
          { type: 'commercial', label: 'Commercial', color: '#a855f7', icon: '🏪' },
          { type: 'industrial', label: 'Industrial', color: '#f97316', icon: '🏭' },
          { type: 'gas_station', label: 'Gas Stations', color: '#22c55e', icon: '⛽' }
        ].map(({ type, label, color, icon }) => (
          <label key={type} className="flex items-center gap-2 cursor-pointer group">
            <input
              type="checkbox"
              checked={filters[type]}
              onChange={() => toggleFilter(type)}
              className="sr-only"
            />
            <div 
              className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
                filters[type] 
                  ? 'bg-accent-primary/30 border-accent-primary' 
                  : 'border-text-muted/30 group-hover:border-text-muted'
              }`}
            >
              {filters[type] && (
                <svg className="w-3 h-3 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
              {icon} {label}
            </span>
          </label>
        ))}
      </div>
    </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-xs text-text-muted">Queue Size</span>
        <input type="range" min={1} max={50} value={maxQueueSize} onChange={(e) => setMaxQueueSize(parseInt(e.target.value, 10))} className="w-28" />
        <span className="text-xs text-text-secondary">{maxQueueSize}</span>
      </div>
  )
}

function HeatmapToggle() {
  const { showHeatmap, setShowHeatmap } = useStore()
  
  return (
    <div className="absolute top-4 right-64 glass px-4 py-3 rounded-lg">
      <label className="flex items-center gap-2 cursor-pointer group">
        <input
          type="checkbox"
          checked={showHeatmap}
          onChange={() => setShowHeatmap(!showHeatmap)}
          className="sr-only"
        />
        <div 
          className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${
            showHeatmap 
              ? 'bg-status-red/30 border-status-red' 
              : 'border-text-muted/30 group-hover:border-text-muted'
          }`}
        >
          {showHeatmap && (
            <svg className="w-3 h-3 text-status-red" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
        <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
          🔥 Heatmap
        </span>
      </label>
    </div>
  )
}

function ComprehensiveLegend() {
  const { statistics } = useStore()
  
  return (
    <div className="absolute bottom-4 left-4 flex flex-col gap-3">
      <div className="glass px-4 py-3 rounded-lg">
        <div className="text-xs text-text-muted mb-2 font-semibold">LPG STATUS</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-status-red relative">
              <div className="absolute inset-0 rounded-sm animate-pulse bg-status-red/50" />
            </div>
            <span className="text-xs text-text-secondary">Critical (0-5 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-status-orange" />
            <span className="text-xs text-text-secondary">Warning (5-10 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-status-yellow" />
            <span className="text-xs text-text-secondary">Caution (10-20 days)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-status-green" />
            <span className="text-xs text-text-secondary">Healthy (20+ days)</span>
          </div>
        </div>
      </div>
      
      <div className="glass px-4 py-3 rounded-lg">
        <div className="text-xs text-text-muted mb-2 font-semibold">BUILDING TYPES</div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-[#00d4ff]" />
            <span className="text-xs text-text-secondary">🏥 Hospital</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-[#e8e8e8]" />
            <span className="text-xs text-text-secondary">🏠 Household</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-[#a855f7]" />
            <span className="text-xs text-text-secondary">🏪 Commercial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-[#f97316]" />
            <span className="text-xs text-text-secondary">🏭 Industrial</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-sm bg-[#22c55e]" />
            <span className="text-xs text-text-secondary">⛽ Gas Station</span>
          </div>
        </div>
      </div>
      
      <div className="glass px-4 py-3 rounded-lg">
        <div className="text-xs text-text-muted mb-2 font-semibold">LIVE STATS</div>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-status-red">{statistics.criticalUnits}</div>
            <div className="text-[10px] text-text-muted">Critical</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-status-orange">{statistics.warningUnits}</div>
            <div className="text-[10px] text-text-muted">Warning</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-mono font-bold text-status-green">{statistics.healthyUnits}</div>
            <div className="text-[10px] text-text-muted">Healthy</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ControlsHelp() {
  return (
    <div className="absolute top-4 left-4 glass px-4 py-2 rounded-lg">
      <div className="text-[10px] text-text-muted">
        <span className="text-accent-primary">Click</span> building for details • 
        <span className="text-accent-primary"> Scroll</span> zoom • 
        <span className="text-accent-primary"> Drag</span> rotate • 
        <span className="text-accent-primary"> Right-drag</span> pan
      </div>
    </div>
  )
}

function Scene() {
  const [isLoaded, setIsLoaded] = useState(false)
  
  return (
    <div className="w-full h-full bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
      <Canvas
        shadows
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance'
        }}
        dpr={[1, 2]}
        onCreated={() => setIsLoaded(true)}
      >
        <Suspense fallback={<LoadingFallback />}>
          <SceneContent />
        </Suspense>
      </Canvas>
      
      {isLoaded && (
        <>
          <ControlsHelp />
          <FilterPanel />
          <HeatmapToggle />
          <ComprehensiveLegend />
        </>
      )}
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-primary">
          <div className="text-accent-primary font-heading text-xl animate-pulse">
            Loading Digital Twin...
          </div>
        </div>
      )}
    </div>
  )
}

export default Scene
