import React, { useRef, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'

function Roads() {
  const roadsRef = useRef()
  
  const roadLines = useMemo(() => {
    const lines = []
    const gridSize = 25
    const spacing = 5
    
    for (let i = -gridSize; i <= gridSize; i += spacing) {
      lines.push({
        start: [i, 0.05, -gridSize],
        end: [i, 0.05, gridSize],
        key: `road-v-${i}`
      })
      lines.push({
        start: [-gridSize, 0.05, i],
        end: [gridSize, 0.05, i],
        key: `road-h-${i}`
      })
    }
    
    return lines
  }, [])
  
  return (
    <group>
      {roadLines.map(({ start, end, key }) => (
        <mesh key={key} start={start} end={end}>
          <boxGeometry args={[0.3, 0.05, Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[2] - start[2], 2))]} />
          <meshStandardMaterial color="#2a2a3e" />
        </mesh>
      ))}
    </group>
  )
}

function ParkAreas() {
  const parks = useMemo(() => [
    { position: [15, 0.02, 15], size: [4, 4] },
    { position: [-20, 0.02, 10], size: [3, 5] },
    { position: [8, 0.02, -18], size: [5, 3] },
    { position: [-15, 0.02, -15], size: [4, 4] },
  ], [])
  
  return (
    <group>
      {parks.map((park, i) => (
        <mesh key={i} position={park.position} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={park.size} />
          <meshStandardMaterial color="#1a3a2a" />
        </mesh>
      ))}
    </group>
  )
}

function WaterBodies() {
  const waterRef = useRef()
  
  useFrame((state) => {
    if (waterRef.current) {
      waterRef.current.material.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })
  
  return (
    <group>
      <mesh ref={waterRef} position={[-25, 0.01, 25]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 8]} />
        <meshStandardMaterial 
          color="#0066aa" 
          transparent 
          opacity={0.6}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

function GridOverlay() {
  const gridRef = useRef()
  
  useFrame((state) => {
    if (gridRef.current) {
      gridRef.current.material.opacity = 0.15 + Math.sin(state.clock.elapsedTime * 0.3) * 0.05
    }
  })
  
  return (
    <gridHelper 
      ref={gridRef}
      args={[100, 50, '#00d4ff', '#1e2942']} 
      position={[0, 0.02, 0]}
    />
  )
}

function Ground() {
  const groundRef = useRef()
  
  useFrame((state) => {
    if (groundRef.current) {
      groundRef.current.material.emissiveIntensity = 0.02 + Math.sin(state.clock.elapsedTime * 0.2) * 0.01
    }
  })
  
  return (
    <group>
      <mesh 
        ref={groundRef}
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.02, 0]} 
        receiveShadow
      >
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial 
          color="#0d1117" 
          metalness={0.9}
          roughness={0.3}
          emissive="#00d4ff"
          emissiveIntensity={0.02}
        />
      </mesh>
      
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshBasicMaterial 
          color="#141b2d" 
          transparent 
          opacity={0.8}
        />
      </mesh>
      
      <GridOverlay />
      <Roads />
      <ParkAreas />
      <WaterBodies />
    </group>
  )
}

export default Ground
