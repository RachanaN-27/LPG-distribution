import { MapContainer, TileLayer, CircleMarker, Popup, Polyline, Circle } from 'react-leaflet'
import { useStore } from '../../stores/useStore'
import { getLPGStatus, getStatusColor, getTypeConfig } from '../../data/buildings'
import { useEffect, useState, useMemo } from 'react'
import 'leaflet/dist/leaflet.css'

const NEIGHBORHOODS = {
  ITPL: { center: [12.9845, 77.7265], radius: 0.012 },
  Brookfield: { center: [12.9745, 77.7235], radius: 0.014 },
  WhitefieldMain: { center: [12.9785, 77.7315], radius: 0.016 },
  Kadugodi: { center: [12.9930, 77.7060], radius: 0.012 },
  Hoodi: { center: [12.9890, 77.7090], radius: 0.011 },
  Sadarmatt: { center: [12.9770, 77.7140], radius: 0.010 },
  Siddapura: { center: [12.9820, 77.7390], radius: 0.011 },
  ITPB: { center: [12.9910, 77.7330], radius: 0.009 },
  Bommasandra: { center: [12.9520, 77.6980], radius: 0.015 },
  ElectronicCity: { center: [12.9200, 77.6700], radius: 0.018 },
  Sarjapur: { center: [12.9080, 77.6900], radius: 0.014 },
  Bellandur: { center: [12.9355, 77.6745], radius: 0.012 }
}

const WHITEFIELD_ROADS = {
  vertical: [
    { lng: 77.70, latMin: 12.92, latMax: 13.02 },
    { lng: 77.71, latMin: 12.92, latMax: 13.02 },
    { lng: 77.72, latMin: 12.92, latMax: 13.02 },
    { lng: 77.73, latMin: 12.92, latMax: 13.02 },
    { lng: 77.735, latMin: 12.92, latMax: 13.02 },
    { lng: 77.74, latMin: 12.92, latMax: 13.02 },
  ],
  horizontal: [
    { lat: 12.92, lngMin: 77.68, lngMax: 77.75 },
    { lat: 12.94, lngMin: 77.68, lngMax: 77.75 },
    { lat: 12.96, lngMin: 77.68, lngMax: 77.75 },
    { lat: 12.975, lngMin: 77.68, lngMax: 77.75 },
    { lat: 12.98, lngMin: 77.68, lngMax: 77.75 },
    { lat: 12.99, lngMin: 77.68, lngMax: 77.75 },
    { lat: 13.00, lngMin: 77.68, lngMax: 77.75 },
  ]
}

function snapToRoadLat(lat, roadLats) {
  let closest = roadLats[0]
  let minDist = Math.abs(lat - closest)
  for (const road of roadLats) {
    const dist = Math.abs(lat - road)
    if (dist < minDist) {
      minDist = dist
      closest = road
    }
  }
  return closest
}

function snapToRoadLng(lng, roadLngs) {
  let closest = roadLngs[0]
  let minDist = Math.abs(lng - closest)
  for (const road of roadLngs) {
    const dist = Math.abs(lng - road)
    if (dist < minDist) {
      minDist = dist
      closest = road
    }
  }
  return closest
}

async function getRealRoadPath(startLat, startLng, endLat, endLng) {
  try {
    const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.routes && data.routes.length > 0) {
      const geojson = data.routes[0].geometry.coordinates
      return geojson.map(([lng, lat]) => [lat, lng])
    }
  } catch (e) {
    console.log('OSRM routing failed, using straight line:', e.message)
  }
  return [[startLat, startLng], [endLat, endLng]]
}

function getStraightPath(startLat, startLng, endLat, endLng) {
  return [[startLat, startLng], [endLat, endLng]]
}

const SupplyHubMarker = ({ position, isActive, supplyPercent, name, type }) => {
  const hubColor = supplyPercent < 20 ? '#ff3333' : supplyPercent < 50 ? '#ff9900' : type === 'biogas' ? '#22c55e' : '#00aa00'
  const displayName = name || 'Supply Hub'
  
  return (
    <CircleMarker
      center={position}
      radius={18}
      pathOptions={{
        color: hubColor,
        fillColor: hubColor,
        fillOpacity: 0.9,
        weight: 4
      }}
    >
      <Popup>
        <div className="text-center p-2">
          <div className="font-bold text-base text-black">{displayName}</div>
          <div className="text-sm text-gray-600 mt-1">
            Stock: {Math.round(supplyPercent)}%
          </div>
          {isActive && (
            <div className="text-green-600 font-bold text-sm mt-2 animate-pulse">
              DELIVERING...
            </div>
          )}
        </div>
      </Popup>
    </CircleMarker>
  )
}

const AnimatedDelivery = ({ delivery, progress, color = '#00ff00' }) => {
  const [roadPath, setRoadPath] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    if (!delivery || !delivery.from || !delivery.to) return
    
    const fetchPath = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const path = await getRealRoadPath(delivery.from.lat, delivery.from.lng, delivery.to.lat, delivery.to.lng)
        setRoadPath(path)
      } catch (err) {
        setError(err.message)
        console.error('Route fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchPath()
  }, [delivery?.from?.lat, delivery?.from?.lng, delivery?.to?.lat, delivery?.to?.lng])
  
  if (!delivery || !delivery.from || !delivery.to) return null
  
  const { from, to } = delivery
  const lat1 = from.lat, lng1 = from.lng
  const lat2 = to.lat, lng2 = to.lng
  
  const path = roadPath || getStraightPath(lat1, lng1, lat2, lng2)
  
  const pathIndex = Math.floor(progress * (path.length - 1))
  const nextIndex = Math.min(pathIndex + 1, path.length - 1)
  const localT = (progress * (path.length - 1)) - pathIndex
  
  const currentLat = path[pathIndex][0] + (path[nextIndex][0] - path[pathIndex][0]) * localT
  const currentLng = path[pathIndex][1] + (path[nextIndex][1] - path[pathIndex][1]) * localT
  
  const linePositions = []
  const steps = 30
  for (let i = 0; i <= steps * progress; i++) {
    const t = i / steps
    const posIndex = Math.floor(t * (path.length - 1))
    const nextPosIndex = Math.min(posIndex + 1, path.length - 1)
    const posLocalT = (t * (path.length - 1)) - posIndex
    
    const lat = path[posIndex][0] + (path[nextPosIndex][0] - path[posIndex][0]) * posLocalT
    const lng = path[posIndex][1] + (path[nextPosIndex][1] - path[posIndex][1]) * posLocalT
    linePositions.push([lat, lng])
  }
  
  return (
    <>
      <Polyline
        positions={linePositions}
        pathOptions={{
          color: color,
          weight: 5,
          opacity: 0.9,
          lineCap: 'round'
        }}
      />
      <Polyline
        positions={linePositions}
        pathOptions={{
          color: color,
          weight: 2,
          opacity: 0.7,
          dashArray: '8, 12'
        }}
      />
      <CircleMarker
        center={[currentLat, currentLng]}
        radius={8}
        pathOptions={{
          color: '#ffffff',
          fillColor: color,
          fillOpacity: 1,
          weight: 2
        }}
      />
    </>
  )
}

const CriticalBuildingMarker = ({ building, onSelect, isActive }) => {
  const statusColor = getStatusColor(building.status)
  const baseRadius = building.type === 'hospital' ? 16 : building.type === 'commercial' ? 10 : 8
  
  return (
    <CircleMarker
      center={[building.lat, building.lng]}
      radius={isActive ? baseRadius * 1.8 : baseRadius}
      pathOptions={{
        color: statusColor,
        fillColor: statusColor,
        fillOpacity: isActive ? 1 : 0.7,
        weight: isActive ? 4 : 2
      }}
      eventHandlers={{
        click: () => onSelect(building)
      }}
    >
      <Popup>
        <div className="min-w-[200px] p-3">
          <div className="font-bold text-base mb-1" style={{ color: statusColor }}>
            {building.name}
          </div>
          <div className="text-xs text-gray-500 mb-2">
            {getTypeConfig(building.type).label} • {building.area}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">LPG Level:</span>
              <span className="font-bold text-black">{building.lpgLevel?.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full"
                style={{ width: `${building.lpgLevel}%`, backgroundColor: statusColor }}
              />
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-600">Status:</span>
              <span className="font-bold uppercase" style={{ color: statusColor }}>
                {building.status}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Daily Use:</span>
              <span className="text-black">{building.dailyConsumption?.toFixed(1)} kg</span>
            </div>
          </div>
          {isActive && (
            <div className="mt-2 text-center text-green-600 font-bold text-sm animate-pulse">
              ⬆ RECEIVING SUPPLY
            </div>
          )}
        </div>
      </Popup>
    </CircleMarker>
  )
}

const DemandZone = ({ position, stats, radius }) => {
  const { criticalUnits, warningUnits, healthyUnits } = stats
  const total = criticalUnits + warningUnits + healthyUnits
  
  let zoneColor = '#00cc00'
  let intensity = 0.15
  
  if (criticalUnits > 0) {
    zoneColor = '#ff0000'
    intensity = Math.min(0.4, 0.1 + (criticalUnits / total) * 0.3)
  } else if (warningUnits > total * 0.3) {
    zoneColor = '#ff8800'
    intensity = 0.2
  } else if (warningUnits > 0) {
    zoneColor = '#ffcc00'
    intensity = 0.15
  }
  
  return (
    <Circle
      center={position}
      radius={radius}
      pathOptions={{
        color: zoneColor,
        fillColor: zoneColor,
        fillOpacity: intensity,
        weight: 2,
        dashArray: '4, 4'
      }}
    />
  )
}

const Legend = () => {
  const { statistics } = useStore()
  
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 rounded-xl shadow-xl p-4 border border-gray-200">
      <div className="font-bold text-black mb-3 text-sm">LPG Status</div>
      <div className="space-y-2 text-sm text-black">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#ff0000]"></div>
          <span className="font-medium">Critical: {statistics.criticalUnits}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#ff8c00]"></div>
          <span className="font-medium">Warning: {statistics.warningUnits}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#ffd000]"></div>
          <span className="font-medium">Caution: {statistics.cautionUnits}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#00cc00]"></div>
          <span className="font-medium">Healthy: {statistics.healthyUnits}</span>
        </div>
      </div>
      <div className="mt-3 pt-2 border-t border-gray-200 text-xs text-gray-500">
        Total: {statistics.totalConsumers} buildings
      </div>
    </div>
  )
}

const SupplyStatusPanel = () => {
  const { supplyUnits, statistics, activeDeliveries, currentSupplyingCategory } = useStore()
  
  return (
    <div className="absolute top-4 left-4 z-[1000] bg-white/95 rounded-xl shadow-xl p-4 border border-gray-200 min-w-[260px]">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#00aa00' }}>
          <span className="text-xl">🏭</span>
        </div>
        <div>
          <div className="font-bold text-black">Supply Hubs</div>
          <div className="text-xs text-gray-500">Distribution Centers</div>
        </div>
      </div>
      
      <div className="space-y-3">
        {supplyUnits && supplyUnits.map(unit => {
          const percent = (unit.currentLevel / unit.capacity) * 100
          const barColor = percent < 20 ? '#ff3333' : percent < 50 ? '#ff9900' : unit.type === 'biogas' ? '#22c55e' : '#00cc00'
          
          return (
            <div key={unit.id} className="border-b border-gray-100 pb-2 last:border-0">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600 font-medium">{unit.name}</span>
                <span className="font-bold text-black">{Math.round(percent)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ width: `${percent}%`, backgroundColor: barColor }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-1 text-right">
                {Math.round(unit.currentLevel).toLocaleString()} / {unit.capacity.toLocaleString()} kg
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t border-gray-100">
        <div>
          <span className="text-gray-500 text-xs">Total Refills</span>
          <div className="font-bold text-black">{statistics.totalRefills}</div>
        </div>
        <div>
          <span className="text-gray-500 text-xs">Active</span>
          <div className="font-bold text-black">{activeDeliveries?.length || 0}</div>
        </div>
      </div>
      
      {activeDeliveries && activeDeliveries.length > 0 && (
        <div className="mt-3 space-y-2">
          {activeDeliveries.map(delivery => {
            const isBiogas = delivery.supplyUnitType === 'biogas'
            const speedLabel = delivery.speedType === 'fast' ? '🚀 Fast' : delivery.speedType === 'slow' ? '🐢 Slow' : '🚗 Normal'
            const speedColor = delivery.speedType === 'fast' ? 'text-green-600' : delivery.speedType === 'slow' ? 'text-orange-600' : 'text-blue-600'
            return (
              <div key={delivery.id} className={`p-2 rounded-lg border ${isBiogas ? 'bg-green-50 border-green-200' : 'bg-green-50 border-green-200'}`}>
                <div className="flex justify-between items-center mb-1">
                  <div className="text-xs text-green-600 font-bold">
                    {isBiogas ? '🌱' : '⬆'} DELIVERING:
                  </div>
                  <div className={`text-xs ${speedColor} font-medium`}>
                    {speedLabel}
                  </div>
                </div>
                <div className="text-sm text-black font-medium">{delivery.buildingName}</div>
                <div className="text-xs text-gray-600">
                  {getTypeConfig(delivery.buildingType)?.label} • 
                  <span className="font-bold" style={{ color: getStatusColor(delivery.status) }}>
                    {' '}{delivery.status.toUpperCase()}
                  </span>
                </div>
                <div className="text-xs text-green-600 mt-1">
                  +{delivery.refillAmount?.toFixed(1)} kg
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const SimulationTime = () => {
  const { simulationDay, simulationTime, isSimulationRunning } = useStore()
  const [displayTime, setDisplayTime] = useState('08:00')
  
  useEffect(() => {
    const interval = setInterval(() => {
      const minutes = Math.floor(simulationTime % 60) * 60
      const hours = 8 + Math.floor(minutes / 60) % 24
      const mins = minutes % 60
      setDisplayTime(`${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [simulationTime])
  
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white/95 rounded-xl shadow-xl p-3 border border-gray-200">
      <div className="text-xs text-gray-500 mb-1">Simulation</div>
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isSimulationRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
        <span className="font-bold text-black text-lg">Day {simulationDay}</span>
      </div>
      <div className="text-sm text-gray-600">{displayTime}</div>
    </div>
  )
}

const FilterPanel = () => {
  const { filters, setFilters, buildings } = useStore()
  
  const counts = {
    hospital: buildings.filter(b => b.type === 'hospital' && b.status !== 'healthy').length,
    household: buildings.filter(b => b.type === 'household' && b.status !== 'healthy').length,
    commercial: buildings.filter(b => b.type === 'commercial' && b.status !== 'healthy').length,
    industrial: buildings.filter(b => b.type === 'industrial' && b.status !== 'healthy').length,
    gas_station: buildings.filter(b => b.type === 'gas_station' && b.status !== 'healthy').length
  }
  
  const toggleFilter = (type) => {
    setFilters({ ...filters, [type]: !filters[type] })
  }
  
  return (
    <div className="absolute top-32 right-4 z-[1000] bg-white/95 rounded-xl shadow-xl p-4 border border-gray-200">
      <div className="font-bold text-sm text-black mb-3">Show Needy</div>
      <div className="space-y-2 text-sm">
        {Object.entries(filters).map(([type, enabled]) => {
          const config = getTypeConfig(type)
          const count = counts[type] || 0
          return (
            <label key={type} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={enabled}
                onChange={() => toggleFilter(type)}
                className="w-4 h-4"
              />
              <span className="text-black font-medium">{config.label}</span>
              {count > 0 && (
                <span className="ml-auto bg-red-100 text-red-600 px-2 py-0.5 rounded text-xs font-bold">
                  {count}
                </span>
              )}
            </label>
          )
        })}
      </div>
    </div>
  )
}

export default function MapView() {
  const { 
    buildings, 
    selectedBuilding, 
    setSelectedBuilding, 
    filters, 
    supplyUnits,
    activeDeliveries,
    deliveryQueue
  } = useStore()
  
  const center = [12.975, 77.72]
  const zoom = 13
  
  const criticalBuildings = useMemo(() => {
    return buildings.filter(b => {
      const isActive = activeDeliveries?.some(d => d.buildingId === b.id)
      const isInQueue = deliveryQueue && Array.isArray(deliveryQueue) && deliveryQueue.includes(b.id)
      const isHighlighted = isActive || isInQueue
      return isHighlighted && filters[b.type]
    })
  }, [buildings, filters, activeDeliveries, deliveryQueue])
  
  const neighborhoodStats = useMemo(() => {
    const stats = {}
    Object.keys(NEIGHBORHOODS).forEach(name => {
      stats[name] = { critical: 0, warning: 0, caution: 0, healthy: 0 }
    })
    
    buildings.forEach(b => {
      Object.entries(NEIGHBORHOODS).forEach(([name, area]) => {
        const dist = Math.sqrt(
          Math.pow((b.lat - area.center[0]) * 111, 2) + 
          Math.pow((b.lng - area.center[1]) * 111 * Math.cos(area.center[0] * Math.PI / 180), 2)
        )
        if (dist < area.radius * 111) {
          stats[name][b.status]++
        }
      })
    })
    
    return stats
  }, [buildings])
  
  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
        zoomControl={true}
        dragging={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
          maxZoom={19}
          minZoom={10}
        />
        
        {supplyUnits && supplyUnits.map(unit => {
          const isBiogas = unit.type === 'biogas'
          return (
            <CircleMarker
              key={unit.id}
              center={[unit.lat, unit.lng]}
              radius={6}
              pathOptions={{
                color: '#000000',
                fillColor: isBiogas ? '#22c55e' : '#00aa00',
                fillOpacity: 1,
                weight: 2
              }}
            >
              <Popup>
                <div className="text-center p-2">
                  <div className="font-bold text-base text-black">{unit.name}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Stock: {Math.round((unit.currentLevel / unit.capacity) * 100)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {isBiogas ? '🌱 Biogas' : '🔥 LPG'}
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
        
        {activeDeliveries && activeDeliveries.map(delivery => {
          const progress = Math.min(1, (Date.now() - delivery.startTime) / delivery.duration)
          const isBiogas = delivery.supplyUnitType === 'biogas'
          let routeColor
          if (isBiogas) {
            if (delivery.priorityNum >= 3) {
              routeColor = '#3b82f6'
            } else {
              routeColor = '#22c55e'
            }
          } else {
            routeColor = '#00ff00'
          }
          return (
            <AnimatedDelivery 
              key={delivery.id}
              delivery={delivery}
              progress={progress}
              color={routeColor}
            />
          )
        })}
        
        {criticalBuildings.map(building => (
          <CriticalBuildingMarker
            key={building.id}
            building={building}
            onSelect={setSelectedBuilding}
            isActive={activeDeliveries?.some(d => d.buildingId === building.id)}
          />
        ))}
      </MapContainer>
      
      <Legend />
      <SupplyStatusPanel />
      <SimulationTime />
      <FilterPanel />
    </div>
  )
}
