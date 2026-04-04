import React, { useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useStore } from '../../stores/useStore'
import * as THREE from 'three'

function SupplyNode({ position, level, maxLevel, type, name, id }) {
  const meshRef = React.useRef()
  const percent = (level / maxLevel) * 100
  const color = percent > 50 ? '#00ff88' : percent > 20 ? '#ffd000' : '#ff3366'
  
  const { activeDelivery, deliveryQueue } = useStore()
  
  const isActiveSupplying = activeDelivery?.buildingId === id
  const isInQueue = deliveryQueue && Array.isArray(deliveryQueue) && deliveryQueue.includes(id)
  const opacity = isActiveSupplying ? 1 : isInQueue ? 0.6 : 0.1
  
  useFrame((state) => {
    if (meshRef.current) {
      const scale = isActiveSupplying ? 1.2 : 1
      meshRef.current.scale.setScalar(scale + Math.sin(state.clock.elapsedTime * 2) * 0.05)
      meshRef.current.rotation.y += 0.01
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1
    }
  })
  
  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isActiveSupplying ? 0.8 : 0.5}
          transparent
          opacity={opacity}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={opacity * 0.2} />
      </mesh>
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color={isActiveSupplying ? '#ff0000' : isInQueue ? '#ffd000' : '#ffffff'}
        anchorX="center"
        anchorY="middle"
      >
        {isActiveSupplying ? '🚨 ' + name : isInQueue ? '⏳ ' + name : name}
      </Text>
      <Text
        position={[0, 1.5, 0]}
        fontSize={0.2}
        color="#8892b0"
        anchorX="center"
        anchorY="middle"
      >
        {percent.toFixed(0)}%
      </Text>
    </group>
  )
}

const ROAD_GRID_SIZE = 25
const ROAD_SPACING = 5

function getRoads() {
  const roads = { vertical: [], horizontal: [] }
  
  for (let i = -ROAD_GRID_SIZE; i <= ROAD_GRID_SIZE; i += ROAD_SPACING) {
    roads.vertical.push({ x: i })
    roads.horizontal.push({ z: i })
  }
  
  return roads
}

function snapToRoad(coordinate, roadCoordinates) {
  let closest = roadCoordinates[0]
  let minDist = Math.abs(coordinate - closest)
  
  for (const road of roadCoordinates) {
    const dist = Math.abs(coordinate - road)
    if (dist < minDist) {
      minDist = dist
      closest = road
    }
  }
  
  return closest
}

function findRoadPath(startPos, endPos) {
  const roads = getRoads()
  const roadX = roads.vertical.map(r => r.x)
  const roadZ = roads.horizontal.map(r => r.z)
  
  const startX = startPos[0]
  const startZ = startPos[2]
  const endX = endPos[0]
  const endZ = endPos[2]
  
  const nearestStartX = snapToRoad(startX, roadX)
  const nearestStartZ = snapToRoad(startZ, roadZ)
  const nearestEndX = snapToRoad(endX, roadX)
  const nearestEndZ = snapToRoad(endZ, roadZ)
  
  const points = []
  points.push(new THREE.Vector3(startX, 0.15, startZ))
  
  if (Math.abs(startX - nearestStartX) > 0.5) {
    points.push(new THREE.Vector3(nearestStartX, 0.15, startZ))
  }
  if (Math.abs(startZ - nearestStartZ) > 0.5) {
    points.push(new THREE.Vector3(nearestStartX, 0.15, nearestStartZ))
  }
  
  if (nearestStartX !== nearestEndX) {
    points.push(new THREE.Vector3(nearestEndX, 0.15, nearestStartZ))
  }
  if (nearestStartZ !== nearestEndZ) {
    points.push(new THREE.Vector3(nearestEndX, 0.15, nearestEndZ))
  }
  
  if (Math.abs(endX - nearestEndX) > 0.5) {
    points.push(new THREE.Vector3(nearestEndX, 0.15, endZ))
  }
  points.push(new THREE.Vector3(endX, 0.15, endZ))
  
  return points
}

function FlowLine({ start, end, progress, isActive, isInQueue }) {
  const points = useMemo(() => {
    try {
      const pathPoints = findRoadPath(start, end)
      if (!pathPoints || pathPoints.length < 2) {
        return [new THREE.Vector3(...start), new THREE.Vector3(...end)]
      }
      return pathPoints
    } catch (e) {
      return [new THREE.Vector3(...start), new THREE.Vector3(...end)]
    }
  }, [start, end])
  
  const geometry = useMemo(() => {
    try {
      const geo = new THREE.BufferGeometry().setFromPoints(points)
      geo.computeLineDistances()
      return geo
    } catch (e) {
      return new THREE.BufferGeometry()
    }
  }, [points])
  
  const lineOpacity = isActive ? 0.8 : isInQueue ? 0.4 : 0.1
  const lineColor = isActive ? '#ff0000' : isInQueue ? '#ffd000' : '#00d4ff'
  
  return (
    <line geometry={geometry}>
      <lineDashedMaterial
        color={lineColor}
        dashSize={0.5}
        gapSize={0.3}
        transparent
        opacity={lineOpacity}
      />
    </line>
  )
}

function NetworkVisualization() {
  const { buildings, supplyUnit, activeDelivery, deliveryQueue } = useStore()
  const groupRef = React.useRef()
  
  const hospitals = buildings.filter(b => b.type === 'hospital').slice(0, 4)
  const households = buildings.filter(b => b.type === 'household').slice(0, 8)
  const commercial = buildings.filter(b => b.type === 'commercial').slice(0, 4)
  
  const supplyPos = [0, 0, 0]
  
  return (
    <>
      <OrbitControls enablePan enableZoom enableRotate />
      <ambientLight intensity={0.5} />
      <pointLight position={[20, 30, 10]} intensity={1} />
      <pointLight position={[-20, 20, -20]} intensity={0.5} color="#00d4ff" />
      
      <group ref={groupRef}>
        <SupplyNode
          position={supplyPos}
          level={supplyUnit.currentLevel}
          maxLevel={supplyUnit.capacity}
          type="supply"
          name="CENTRAL HUB"
        />
        
        {hospitals.map((h, i) => {
          const angle = (i / hospitals.length) * Math.PI * 2
          const pos = [Math.cos(angle) * 12, 0, Math.sin(angle) * 12]
          const isActive = activeDelivery?.buildingId === h.id
          const isInQueue = deliveryQueue && Array.isArray(deliveryQueue) && deliveryQueue.includes(h.id)
          return (
            <React.Fragment key={h.id}>
              <SupplyNode
                id={h.id}
                position={pos}
                level={h.lpgLevel}
                maxLevel={100}
                type={h.type}
                name={`H-${i + 1}`}
              />
              <FlowLine start={supplyPos} end={pos} isActive={isActive} isInQueue={isInQueue} />
            </React.Fragment>
          )
        })}
        
        {households.map((h, i) => {
          const angle = (i / households.length) * Math.PI * 2 + 0.3
          const pos = [Math.cos(angle) * 20, 0, Math.sin(angle) * 20]
          const isActive = activeDelivery?.buildingId === h.id
          const isInQueue = deliveryQueue && Array.isArray(deliveryQueue) && deliveryQueue.includes(h.id)
          return (
            <React.Fragment key={h.id}>
              <SupplyNode
                id={h.id}
                position={pos}
                level={h.lpgLevel}
                maxLevel={100}
                type={h.type}
                name={`HH-${i + 1}`}
              />
              <FlowLine start={supplyPos} end={pos} isActive={isActive} isInQueue={isInQueue} />
            </React.Fragment>
          )
        })}
        
        {commercial.map((c, i) => {
          const angle = (i / commercial.length) * Math.PI * 2 + 0.8
          const pos = [Math.cos(angle) * 28, 0, Math.sin(angle) * 28]
          const isActive = activeDelivery?.buildingId === c.id
          const isInQueue = deliveryQueue && Array.isArray(deliveryQueue) && deliveryQueue.includes(c.id)
          return (
            <React.Fragment key={c.id}>
              <SupplyNode
                id={c.id}
                position={pos}
                level={c.lpgLevel}
                maxLevel={100}
                type={c.type}
                name={`C-${i + 1}`}
              />
              <FlowLine start={supplyPos} end={pos} isActive={isActive} isInQueue={isInQueue} />
            </React.Fragment>
          )
        })}
      </group>
      
      <gridHelper args={[60, 30, '#1e2942', '#1e2942']} position={[0, -1, 0]} />
    </>
  )
}

function SupplyNetwork() {
  return (
    <div className="w-full h-full bg-gradient-to-b from-bg-primary via-bg-secondary to-bg-primary">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="glass px-6 py-3 rounded-lg">
          <h2 className="font-heading text-lg text-accent-primary text-center">Supply Distribution Network</h2>
          <p className="text-xs text-text-muted text-center">Real-time flow visualization</p>
        </div>
      </div>
      
      <Canvas camera={{ position: [40, 30, 40], fov: 50 }}>
        <NetworkVisualization />
      </Canvas>
      
      <div className="absolute bottom-4 left-4 glass px-4 py-3 rounded-lg">
        <div className="text-xs text-text-muted mb-2">Priority Flow</div>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#00d4ff]" />
            <span className="text-xs text-text-secondary">Hospital</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#7b61ff]" />
            <span className="text-xs text-text-secondary">Household</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ffd000]" />
            <span className="text-xs text-text-secondary">Commercial</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SupplyNetwork
