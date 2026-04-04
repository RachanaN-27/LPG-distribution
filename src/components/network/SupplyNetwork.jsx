import React, { useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Text } from '@react-three/drei'
import { useStore } from '../../stores/useStore'
import * as THREE from 'three'

function SupplyNode({ position, level, maxLevel, type, name }) {
  const meshRef = React.useRef()
  const percent = (level / maxLevel) * 100
  const color = percent > 50 ? '#00ff88' : percent > 20 ? '#ffd000' : '#ff3366'
  
  useFrame((state) => {
    if (meshRef.current) {
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
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[1.3, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>
      <Text
        position={[0, 2, 0]}
        fontSize={0.3}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {name}
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

function FlowLine({ start, end, progress }) {
  const points = useMemo(() => {
    const startVec = new THREE.Vector3(...start)
    const endVec = new THREE.Vector3(...end)
    const mid = new THREE.Vector3(
      (start.x + end.x) / 2,
      Math.max(start.y, end.y) + 3,
      (start.z + end.z) / 2
    )
    
    const curve = new THREE.QuadraticBezierCurve3(startVec, mid, endVec)
    return curve.getPoints(50)
  }, [start, end])
  
  const geometry = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints(points)
  }, [points])
  
  return (
    <line geometry={geometry}>
      <lineDashedMaterial
        color="#00d4ff"
        dashSize={0.5}
        gapSize={0.3}
        transparent
        opacity={0.5}
      />
    </line>
  )
}

function NetworkVisualization() {
  const { buildings, supplyUnit } = useStore()
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
          return (
            <React.Fragment key={h.id}>
              <SupplyNode
                position={pos}
                level={h.lpgLevel}
                maxLevel={100}
                type={h.type}
                name={`H-${i + 1}`}
              />
              <FlowLine start={supplyPos} end={pos} />
            </React.Fragment>
          )
        })}
        
        {households.map((h, i) => {
          const angle = (i / households.length) * Math.PI * 2 + 0.3
          const pos = [Math.cos(angle) * 20, 0, Math.sin(angle) * 20]
          return (
            <React.Fragment key={h.id}>
              <SupplyNode
                position={pos}
                level={h.lpgLevel}
                maxLevel={100}
                type={h.type}
                name={`HH-${i + 1}`}
              />
              <FlowLine start={supplyPos} end={pos} />
            </React.Fragment>
          )
        })}
        
        {commercial.map((c, i) => {
          const angle = (i / commercial.length) * Math.PI * 2 + 0.8
          const pos = [Math.cos(angle) * 28, 0, Math.sin(angle) * 28]
          return (
            <React.Fragment key={c.id}>
              <SupplyNode
                position={pos}
                level={c.lpgLevel}
                maxLevel={100}
                type={c.type}
                name={`C-${i + 1}`}
              />
              <FlowLine start={supplyPos} end={pos} />
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
