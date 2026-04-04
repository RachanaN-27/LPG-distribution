import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../stores/useStore'

function HeatmapPoint({ position, intensity, color }) {
  const meshRef = useRef()
  
  useFrame((state) => {
    if (meshRef.current) {
      const pulse = Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.2 + 0.8
      meshRef.current.scale.setScalar(intensity * pulse * 2)
    }
  })
  
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.3, 16, 16]} />
      <meshBasicMaterial 
        color={color} 
        transparent 
        opacity={intensity * 0.6}
      />
    </mesh>
  )
}

function HeatmapLayer() {
  const { buildings, showHeatmap } = useStore()
  
  const heatmapData = useMemo(() => {
    if (!showHeatmap) return []
    
    const points = []
    buildings.forEach(building => {
      const status = building.daysRemaining <= 5 ? 'critical' : 
                     building.daysRemaining <= 10 ? 'warning' : 
                     building.daysRemaining <= 20 ? 'caution' : 'healthy'
      
      const intensity = status === 'critical' ? 1.0 :
                       status === 'warning' ? 0.7 :
                       status === 'caution' ? 0.4 : 0.1
      
      const color = status === 'critical' ? '#ff3366' :
                   status === 'warning' ? '#ff8c00' :
                   status === 'caution' ? '#ffd000' : '#22c55e'
      
      points.push({
        position: [building.position[0], 0.5, building.position[2]],
        intensity,
        color
      })
    })
    
    return points
  }, [buildings, showHeatmap])
  
  if (!showHeatmap) return null
  
  return (
    <group>
      {heatmapData.map((point, i) => (
        <HeatmapPoint key={i} {...point} />
      ))}
      
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshBasicMaterial 
          color="#1a1a2e" 
          transparent 
          opacity={0.3}
        />
      </mesh>
    </group>
  )
}

export default HeatmapLayer
