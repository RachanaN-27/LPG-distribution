import { MapContainer, TileLayer, CircleMarker, Popup, Polyline } from 'react-leaflet'
import { useStore } from '../../stores/useStore'
import { getLPGStatus, getStatusColor, getTypeConfig } from '../../data/buildings'
import { useEffect, useState, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

const SupplyHubMarker = ({ position, isActive }) => {
  const [pulse, setPulse] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(p => (p + 1) % 4)
    }, 800)
    return () => clearInterval(interval)
  }, [])
  
  const pulseRadius = isActive ? [30, 40, 35, 30][pulse] : [25, 30, 25, 20][pulse]
  
  return (
    <>
      <CircleMarker
        center={position}
        radius={pulseRadius}
        pathOptions={{
          color: '#0066cc',
          fillColor: isActive ? '#00aa00' : '#0066cc',
          fillOpacity: isActive ? 0.3 + pulse * 0.05 : 0.15,
          weight: 2
        }}
      />
      <CircleMarker
        center={position}
        radius={12}
        pathOptions={{
          color: isActive ? '#00aa00' : '#0066cc',
          fillColor: '#ffffff',
          fillOpacity: 1,
          weight: 4
        }}
      >
        <Popup>
          <div className="min-w-[180px] p-3 text-center">
            <div className="font-bold text-base text-black">Central Supply Hub</div>
            <div className="text-xs text-gray-600 mt-1">LPG Distribution Center</div>
            {isActive && (
              <div className="mt-2 text-green-600 font-bold text-sm animate-pulse">
                DELIVERING...
              </div>
            )}
          </div>
        </Popup>
      </CircleMarker>
    </>
  )
}

const AnimatedSupplyLine = ({ from, to, progress, isActive }) => {
  if (!from || !to) return null
  
  const lat1 = from[0], lng1 = from[1]
  const lat2 = to[0], lng2 = to[1]
  
  if (!isActive) {
    return (
      <Polyline
        positions={[[lat1, lng1], [lat2, lng2]]}
        pathOptions={{
          color: '#888888',
          weight: 2,
          opacity: 0.3,
          dashArray: '8, 8'
        }}
      />
    )
  }
  
  const currentLat = lat1 + (lat2 - lat1) * progress
  const currentLng = lng1 + (lng2 - lng1) * progress
  
  const lineProgress = Math.min(1, progress)
  const linePositions = []
  const steps = 20
  for (let i = 0; i <= steps * lineProgress; i++) {
    const t = i / steps
    linePositions.push([
      lat1 + (lat2 - lat1) * t,
      lng1 + (lng2 - lng1) * t
    ])
  }
  
  return (
    <>
      <Polyline
        positions={linePositions}
        pathOptions={{
          color: '#00aa00',
          weight: 4,
          opacity: 0.8,
          lineCap: 'round',
          lineJoin: 'round'
        }}
      />
      <Polyline
        positions={linePositions}
        pathOptions={{
          color: '#88ff88',
          weight: 2,
          opacity: 0.6,
          dashArray: '4, 8'
        }}
      />
      {progress < 1 && progress > 0.1 && (
        <CircleMarker
          center={[currentLat, currentLng]}
          radius={10}
          pathOptions={{
            color: '#ffffff',
            fillColor: '#00ff00',
            fillOpacity: 1,
            weight: 3
          }}
        >
          <Popup>
            <div className="text-center text-black font-medium text-sm">
              LPG Delivery in Progress
            </div>
          </Popup>
        </CircleMarker>
      )}
    </>
  )
}

const BuildingMarker = ({ building, onSelect, selected, isBeingDelivered }) => {
  const status = getLPGStatus(building.lpgLevel)
  const statusColor = getStatusColor(status)
  
  const baseRadius = building.type === 'household' ? 10 : building.type === 'gas_station' ? 8 : 14
  const radius = isBeingDelivered ? baseRadius * 1.6 : selected ? baseRadius * 1.3 : baseRadius
  
  const isPulsing = status === 'critical' || isBeingDelivered
  
  return (
    <CircleMarker
      center={[building.lat, building.lng]}
      radius={radius}
      pathOptions={{
        color: isBeingDelivered ? '#00ff00' : statusColor,
        fillColor: isBeingDelivered ? '#00ff00' : statusColor,
        fillOpacity: isBeingDelivered ? 1 : 0.85,
        weight: isBeingDelivered ? 4 : selected ? 3 : 2,
        className: isPulsing ? 'animate-pulse' : ''
      }}
      eventHandlers={{
        click: () => onSelect(building)
      }}
    >
      <Popup>
        <div className="min-w-[220px] p-3">
          <div className="font-bold text-base mb-1" style={{ color: statusColor }}>
            {building.name}
            {isBeingDelivered && <span className="ml-2 text-green-600 animate-pulse">✓</span>}
          </div>
          <div className="text-xs text-gray-600 mb-2 font-medium">
            {getTypeConfig(building.type).label}
          </div>
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">LPG Level:</span>
                <span className="font-bold text-black">{building.lpgLevel?.toFixed(1) || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500"
                  style={{ 
                    width: `${building.lpgLevel || 0}%`,
                    backgroundColor: statusColor
                  }}
                />
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Days Left:</span>
              <span className="font-bold text-black">{(building.daysRemaining || 0).toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Daily Use:</span>
              <span className="font-medium text-black">{(building.dailyConsumption || 0).toFixed(1)} kg</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status:</span>
              <span className="font-bold" style={{ color: statusColor }}>{status.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </Popup>
    </CircleMarker>
  )
}

const Legend = () => {
  const { statistics } = useStore()
  
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 rounded-lg shadow-lg p-4 border-2 border-gray-400">
      <div className="font-bold text-sm mb-3 text-black">LPG Status Levels</div>
      <div className="space-y-2 text-sm text-black">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#ff0000]"></div>
          <span className="font-medium">Critical (0-30%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#ff8c00]"></div>
          <span className="font-medium">Warning (31-70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#ffd000]"></div>
          <span className="font-medium">Caution (31-70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-[#00cc00]"></div>
          <span className="font-medium">Healthy (71-100%)</span>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-300 text-xs text-black">
        <div className="flex justify-between">
          <span>Total:</span>
          <span className="font-bold">{statistics.totalConsumers}</span>
        </div>
      </div>
    </div>
  )
}

const SupplyInfo = () => {
  const { supplyUnit, statistics } = useStore()
  const percent = (supplyUnit.currentLevel / supplyUnit.capacity) * 100
  const barColor = percent < 15 ? '#ff0000' : percent < 40 ? '#ff8c00' : percent < 70 ? '#ffd000' : '#00cc00'
  
  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white/95 rounded-lg shadow-lg p-4 border-2 border-gray-400 min-w-[240px]">
      <div className="font-bold text-black mb-3 flex items-center gap-2">
        <span className="text-lg">🏭</span>
        Central Supply Hub
      </div>
      <div className="space-y-2">
        <div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-700 font-medium">Stock:</span>
            <span className="font-bold text-black">{Math.round(supplyUnit.currentLevel).toLocaleString()} kg</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mt-1 overflow-hidden">
            <div 
              className="h-3 rounded-full transition-all duration-500"
              style={{ 
                width: `${percent}%`,
                backgroundColor: barColor
              }}
            />
          </div>
          <div className="text-xs text-gray-500 mt-1 text-right">{percent.toFixed(1)}%</div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <span className="text-gray-700 font-medium">Capacity:</span>
            <div className="font-bold text-black">{supplyUnit.capacity.toLocaleString()} kg</div>
          </div>
          <div>
            <span className="text-gray-700 font-medium">Refills:</span>
            <div className="font-bold text-black">{statistics.totalRefills}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

const Filters = () => {
  const { filters, setFilters } = useStore()
  
  const toggleFilter = (type) => {
    setFilters({ ...filters, [type]: !filters[type] })
  }
  
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white/95 rounded-lg shadow-lg p-4 border-2 border-gray-400">
      <div className="font-bold text-sm mb-3 text-black">Building Types</div>
      <div className="space-y-2 text-sm">
        {Object.entries(filters).map(([type, enabled]) => {
          const config = getTypeConfig(type)
          return (
            <label key={type} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => toggleFilter(type)}
                className="w-4 h-4 rounded"
              />
              <span className="text-black font-medium">{config.label}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

const LiveStatus = () => {
  const { isSimulationRunning, activeDelivery, buildings, statistics } = useStore()
  const [time, setTime] = useState(new Date())
  
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])
  
  const deliveryBuilding = activeDelivery 
    ? buildings.find(b => b.id === activeDelivery.buildingId) 
    : null
  
  return (
    <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 rounded-lg shadow-lg p-3 border-2 border-gray-400">
      <div className="text-xs text-gray-600 font-medium mb-1">Live Simulation</div>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-3 h-3 rounded-full ${isSimulationRunning ? 'bg-[#00cc00] animate-pulse' : 'bg-gray-400'}`}></div>
        <span className="text-sm text-black font-medium">
          {isSimulationRunning ? 'RUNNING' : 'PAUSED'}
        </span>
      </div>
      <div className="text-xs text-gray-600 mb-1">{time.toLocaleTimeString()}</div>
      
      {activeDelivery && deliveryBuilding && (
        <div className="mt-2 pt-2 border-t border-gray-300">
          <div className="text-xs text-green-600 font-bold animate-pulse">
            ▶ DELIVERING TO:
          </div>
          <div className="text-xs text-black font-medium mt-1">
            {deliveryBuilding.name}
          </div>
          <div className="text-xs text-gray-600">
            +{activeDelivery.refillAmount} kg
          </div>
        </div>
      )}
      
      <div className="mt-2 pt-2 border-t border-gray-300 text-xs text-gray-600">
        <div>Critical: <span className="font-bold text-red-600">{statistics.criticalUnits}</span></div>
        <div>Warning: <span className="font-bold text-orange-500">{statistics.warningUnits}</span></div>
      </div>
    </div>
  )
}

const SupplyConnections = ({ buildings, supplyUnit }) => {
  const priorityBuildings = buildings
    .filter(b => b.status !== 'healthy')
    .slice(0, 8)
  
  return (
    <>
      {priorityBuildings.map(building => (
        <Polyline
          key={`line-${building.id}`}
          positions={[
            [supplyUnit.lat, supplyUnit.lng],
            [building.lat, building.lng]
          ]}
          pathOptions={{
            color: getStatusColor(building.status),
            weight: 1.5,
            opacity: 0.4,
            dashArray: '6, 6'
          }}
        />
      ))}
    </>
  )
}

export default function MapView() {
  const { buildings, selectedBuilding, setSelectedBuilding, filters, supplyUnit, activeDelivery } = useStore()
  
  const center = [12.98, 77.73]
  const zoom = 14
  
  const filteredBuildings = buildings.filter(b => filters[b.type])
  
  const deliveryProgress = activeDelivery 
    ? Math.min(1, (Date.now() - activeDelivery.startTime) / activeDelivery.duration)
    : 0
  
  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
        doubleClickZoom={true}
        dragging={true}
        touchZoom={true}
      >
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution='&copy; Esri'
          maxZoom={19}
          minZoom={10}
        />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png"
          attribution='&copy; CartoDB'
          maxZoom={19}
          minZoom={10}
          opacity={0.7}
        />
        
        <SupplyHubMarker 
          position={[supplyUnit.lat, supplyUnit.lng]} 
          isActive={!!activeDelivery}
        />
        
        <SupplyConnections buildings={buildings} supplyUnit={supplyUnit} />
        
        {activeDelivery && (
          <AnimatedSupplyLine
            from={activeDelivery.from}
            to={activeDelivery.to}
            progress={deliveryProgress}
            isActive={true}
          />
        )}
        
        {filteredBuildings.map(building => (
          <BuildingMarker
            key={building.id}
            building={building}
            onSelect={setSelectedBuilding}
            selected={selectedBuilding?.id === building.id}
            isBeingDelivered={activeDelivery?.buildingId === building.id}
          />
        ))}
      </MapContainer>
      
      <Legend />
      <SupplyInfo />
      <Filters />
      <LiveStatus />
    </div>
  )
}
