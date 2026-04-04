import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../stores/useStore'

function SupplyUnit({ 
  id, 
  name, 
  position, 
  dimensions, 
  capacity, 
  currentLevel, 
  pressure, 
  temperature 
}) {
  const groupRef = useRef()
  const tankRef = useRef()
  const particlesRef = useRef()
  
  const supplyPercent = (currentLevel / capacity) * 100
  
  const particlePositions = useMemo(() => {
    const positions = []
    for (let i = 0; i < 50; i++) {
      positions.push([
        (Math.random() - 0.5) * 2,
        Math.random() * 2,
        (Math.random() - 0.5) * 2
      ])
    }
    return positions
  }, [])
  
  useFrame((state) => {
    if (tankRef.current) {
      const fillHeight = (currentLevel / capacity) * dimensions[2]
      tankRef.current.scale.y = fillHeight / dimensions[2]
      tankRef.current.position.y = fillHeight / 2
      
      const color = supplyPercent > 50 ? '#00ff88' : supplyPercent > 20 ? '#ffd000' : '#ff3366'
      tankRef.current.material.color.set(color)
      tankRef.current.material.emissive.set(color)
    }
    
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array
      for (let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += 0.02
        if (positions[i + 1] > 3) {
          positions[i + 1] = 0
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true
    }
    
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.1
    }
  })
  
  const [width, depth, height] = dimensions
  
  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, height / 2, 0]} castShadow>
        <cylinderGeometry args={[width / 2, width / 2, height, 32]} />
        <meshStandardMaterial
          color="#1e2942"
          metalness={0.9}
          roughness={0.2}
          transparent
          opacity={0.8}
        />
      </mesh>
      
      <mesh ref={tankRef} position={[0, dimensions[2] / 2, 0]}>
        <cylinderGeometry args={[width / 2 - 0.1, width / 2 - 0.1, height, 32]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.3}
          transparent
          opacity={0.6}
        />
      </mesh>
      
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particlePositions.length}
            array={new Float32Array(particlePositions.flat())}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.1}
          color="#00d4ff"
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>
      
      <mesh position={[0, height + 0.5, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial color={supplyPercent > 50 ? '#00ff88' : supplyPercent > 20 ? '#ffd000' : '#ff3366'} />
      </mesh>
      
      <Text
        position={[0, height + 1.5, 0]}
        fontSize={0.4}
        color="#00d4ff"
        anchorX="center"
        anchorY="middle"
      >
        CENTRAL SUPPLY
      </Text>
      
      <Text
        position={[0, height + 1, 0]}
        fontSize={0.3}
        color="#8892b0"
        anchorX="center"
        anchorY="middle"
      >
        {supplyPercent.toFixed(1)}%
      </Text>
    </group>
  )
}

export default SupplyUnit
