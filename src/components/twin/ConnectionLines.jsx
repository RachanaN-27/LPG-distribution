import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function ConnectionLines({ buildings, supplyUnit }) {
  const linesRef = useRef()
  
  const lineData = useMemo(() => {
    return buildings
      .filter(b => b.type === 'hospital' || b.type === 'household')
      .slice(0, 20)
      .map(building => ({
        start: [supplyUnit.position[0], supplyUnit.position[2] + 1.5, supplyUnit.position[1]],
        end: [building.position[0], building.position[2], building.position[1] + building.dimensions[2]],
        id: building.id
      }))
  }, [buildings, supplyUnit])
  
  const { geometry, material } = useMemo(() => {
    const points = []
    
    lineData.forEach((line, index) => {
      const start = new THREE.Vector3(...line.start)
      const end = new THREE.Vector3(...line.end)
      
      const mid = new THREE.Vector3(
        (start.x + end.x) / 2,
        Math.max(start.y, end.y) + 1,
        (start.z + end.z) / 2
      )
      
      const curve = new THREE.QuadraticBezierCurve3(start, mid, end)
      const curvePoints = curve.getPoints(30)
      points.push(...curvePoints)
      
      if (index < lineData.length - 1) {
        points.push(new THREE.Vector3(99999, 99999, 99999))
      }
    })
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    const material = new THREE.LineDashedMaterial({
      color: '#00d4ff',
      dashSize: 0.3,
      gapSize: 0.2,
      transparent: true,
      opacity: 0.3
    })
    
    return { geometry, material }
  }, [lineData])
  
  useFrame((state) => {
    if (linesRef.current) {
      material.dashOffset = -state.clock.elapsedTime * 2
    }
  })
  
  return (
    <line ref={linesRef} geometry={geometry} material={material} dashOffset={0} />
  )
}

export default ConnectionLines
