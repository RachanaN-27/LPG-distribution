import React, { useRef, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../stores/useStore'
import { getLPGStatus, getStatusColor, getTypeConfig } from '../../data/buildings'

function WindowGrid({ width, height, depth, floors }) {
  const windows = useMemo(() => {
    const result = []
    const windowHeight = 0.15
    const windowWidth = 0.15
    const spacing = 0.4
    
    for (let floor = 0; floor < Math.floor(floors); floor++) {
      const y = floor * 0.5 + 0.3
      let x = -width / 2 + 0.2
      while (x < width / 2 - 0.2) {
        result.push({ x, y, w: windowWidth, h: windowHeight, side: 'front' })
        x += spacing
      }
    }
    
    return result
  }, [width, floors])

  return (
    <group>
      {windows.map((win, i) => (
        <mesh key={i} position={[win.x, win.y, depth / 2 + 0.01]}>
          <planeGeometry args={[win.w, win.h]} />
          <meshBasicMaterial color="#1a1a2e" transparent opacity={0.8} />
        </mesh>
      ))}
    </group>
  )
}

function Building3D({ 
  id, 
  name, 
  type, 
  position, 
  dimensions, 
  color, 
  lpgLevel, 
  daysRemaining,
  consumptionRate,
  area,
  familySize,
  staff,
  category
}) {
  const groupRef = useRef()
  const glowRef = useRef()
  const labelRef = useRef()
  const [hovered, setHovered] = useState(false)
  
  const { setSelectedBuilding, setHoveredBuilding, selectedBuilding, activeDelivery, deliveryQueue } = useStore()
  
  const status = getLPGStatus({ daysRemaining })
  const statusColor = getStatusColor(status)
  const typeConfig = getTypeConfig(type)
  
  const isSelected = selectedBuilding?.id === id
  const isCritical = status === 'critical'
  const isWarning = status === 'warning'
  
  const isActiveSupplying = activeDelivery?.buildingId === id
  const isInQueue = deliveryQueue && Array.isArray(deliveryQueue) && deliveryQueue.includes(id)
  
  const opacity = isActiveSupplying ? 1 : isInQueue ? 0.6 : 0.1
  
  const [width, depth, height] = dimensions
  const heightPos = height / 2 + 0.1
  const floors = Math.floor(height / 0.5)
  
  const buildingColor = useMemo(() => {
    const baseColor = new THREE.Color(color)
    const statusThreeColor = new THREE.Color(statusColor)
    const blendFactor = status === 'critical' ? 0.6 : status === 'warning' ? 0.4 : 0.2
    const c = baseColor.lerp(statusThreeColor, blendFactor)
    c.multiplyScalar(opacity)
    return c
  }, [color, statusColor, status, opacity])

  useFrame((state) => {
    const time = state.clock.elapsedTime
    
    const pulse = isCritical ? Math.sin(time * 5) * 0.3 + 0.7 : 0.5
    
    if (groupRef.current) {
      const targetScale = isActiveSupplying ? 1.2 : (hovered || isSelected ? 1.05 : 1)
      groupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, 1, targetScale),
        0.1
      )
      
      if (isCritical) {
        const pulse = Math.sin(time * 5) * 0.5 + 0.5
        groupRef.current.position.y = pulse * 0.15
      } else if (isWarning) {
        const pulse = Math.sin(time * 2) * 0.5 + 0.5
        groupRef.current.position.y = pulse * 0.1
      }
    }
    
    if (glowRef.current) {
      const pulse = isCritical ? Math.sin(time * 5) * 0.3 + 0.7 : Math.sin(time * (isCritical ? 3 : 1.5)) * 0.5 + 0.5
      const baseOpacity = isCritical ? 0.4 : isWarning ? 0.25 : 0.15
      glowRef.current.material.opacity = (baseOpacity + pulse * 0.15) * opacity
    }
    
    if (labelRef.current && (hovered || isSelected)) {
      labelRef.current.lookAt(state.camera.position)
    }
  })
  
  const handleClick = (e) => {
    e.stopPropagation()
    setSelectedBuilding({
      id, name, type, position, dimensions, color, lpgLevel, daysRemaining, consumptionRate,
      area, familySize, staff, category, status, statusColor
    })
  }
  
  const handlePointerOver = (e) => {
    e.stopPropagation()
    setHovered(true)
    setHoveredBuilding({ id, name, type, lpgLevel: lpgLevel.toFixed(1), daysRemaining: daysRemaining.toFixed(1) })
    document.body.style.cursor = 'pointer'
  }
  
  const handlePointerOut = () => {
    setHovered(false)
    setHoveredBuilding(null)
    document.body.style.cursor = 'default'
  }

  const renderBuilding = () => {
    switch (type) {
      case 'hospital':
        return (
          <group>
            <mesh
              position={[0, heightPos, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial
                color={buildingColor}
                emissive={statusColor}
                emissiveIntensity={isCritical ? (0.3 + pulse * 0.4) : 0.1}
                metalness={0.2}
                roughness={0.8}
                transparent
                opacity={opacity}
              />
            </mesh>
            <mesh position={[0, height + 0.8, 0]}>
              <cylinderGeometry args={[0.3, 0.5, 0.6, 4]} />
              <meshStandardMaterial color="#ffffff" transparent opacity={opacity} />
            </mesh>
            <mesh position={[0, height + 1.2, 0]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshBasicMaterial color="#ff0000" transparent opacity={opacity} />
            </mesh>
            <Text
              position={[0, height + 1.8, 0]}
              fontSize={0.4}
              color="#00d4ff"
              anchorX="center"
              anchorY="middle"
            >
              +
            </Text>
          </group>
        )

      case 'industrial':
        return (
          <group>
            <mesh
              position={[0, heightPos, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial
                color={buildingColor}
                emissive={statusColor}
                emissiveIntensity={isCritical ? (pulse * 0.4) : 0.1}
                metalness={0.4}
                roughness={0.6}
                transparent
                opacity={opacity}
              />
            </mesh>
            <mesh position={[width / 2 + 0.3, heightPos - 0.5, 0]} castShadow>
              <cylinderGeometry args={[0.5, 0.5, 2, 8]} />
              <meshStandardMaterial color="#555555" metalness={0.6} roughness={0.4} transparent opacity={opacity} />
            </mesh>
          </group>
        )

      case 'gas_station':
        return (
          <group>
            <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
              <boxGeometry args={[width * 1.5, 0.2, depth * 1.5]} />
              <meshStandardMaterial color="#333333" transparent opacity={opacity} />
            </mesh>
            <mesh position={[0, 0.5, -depth * 0.5]} castShadow>
              <boxGeometry args={[width * 1.5, 0.8, 0.1]} />
              <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={0.3} transparent opacity={opacity} />
            </mesh>
            <mesh position={[0, 0.8, depth * 0.3]} castShadow>
              <boxGeometry args={[width * 1.5, 0.4, depth * 0.6]} />
              <meshStandardMaterial color={buildingColor} emissive={statusColor} emissiveIntensity={isCritical ? (pulse * 0.4) : 0.2} transparent opacity={opacity} />
            </mesh>
          </group>
        )

      default:
        return (
          <group>
            <mesh
              position={[0, heightPos, 0]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[width, height, depth]} />
              <meshStandardMaterial
                color={buildingColor}
                emissive={statusColor}
                emissiveIntensity={isCritical ? (pulse * 0.4) : 0.05}
                metalness={0.1}
                roughness={0.9}
                transparent
                opacity={opacity}
              />
            </mesh>
            {type === 'household' && (
              <WindowGrid width={width} height={height} depth={depth} floors={floors} />
            )}
          </group>
        )
    }
  }

  return (
    <group 
      ref={groupRef} 
      position={position}
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      {renderBuilding()}
      
      <mesh
        ref={glowRef}
        position={[0, heightPos, 0]}
      >
        <boxGeometry args={[width + 0.3, height + 0.3, depth + 0.3]} />
        <meshBasicMaterial
          color={statusColor}
          transparent
          opacity={opacity * 0.2}
          side={THREE.BackSide}
        />
      </mesh>
      
      {(hovered || isSelected) && (
        <group ref={labelRef} position={[0, height + 2, 0]}>
          <Html
            center
            distanceFactor={15}
            style={{
              pointerEvents: 'none'
            }}
          >
            <div className="bg-bg-secondary/95 backdrop-blur-md px-3 py-2 rounded-lg border border-accent-primary/30 shadow-xl whitespace-nowrap">
              <div className="text-accent-primary font-heading text-xs font-bold">{typeConfig.icon} {typeConfig.label}</div>
              <div className="text-text-primary text-xs font-semibold truncate max-w-[150px]">{name}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-16 h-1.5 bg-bg-primary rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{ 
                      width: `${Math.min(100, Math.max(0, lpgLevel))}%`,
                      backgroundColor: statusColor
                    }}
                  />
                </div>
                <span className="text-[10px] font-mono" style={{ color: statusColor }}>
                  {lpgLevel.toFixed(1)}%
                </span>
              </div>
            </div>
          </Html>
        </group>
      )}
      
      {isActiveSupplying && (
        <group position={[0, height + 2.5, 0]}>
          <Html
            center
            distanceFactor={15}
            style={{
              pointerEvents: 'none'
            }}
          >
            <div className="bg-status-red/90 backdrop-blur-md px-3 py-1.5 rounded-lg border-2 border-status-red shadow-xl whitespace-nowrap animate-pulse">
              <span className="text-white font-heading text-xs font-bold">🚨 SUPPLYING</span>
            </div>
          </Html>
        </group>
      )}
      
      {isInQueue && !isActiveSupplying && (
        <group position={[0, height + 2.5, 0]}>
          <Html
            center
            distanceFactor={15}
            style={{
              pointerEvents: 'none'
            }}
          >
            <div className="bg-status-yellow/80 backdrop-blur-md px-2 py-1 rounded border border-status-yellow shadow-xl whitespace-nowrap">
              <span className="text-black font-heading text-xs font-bold">⏳ NEXT</span>
            </div>
          </Html>
        </group>
      )}
    </group>
  )
}

export default Building3D
