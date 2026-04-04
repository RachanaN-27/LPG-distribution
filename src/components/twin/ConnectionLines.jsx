import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ROAD_GRID_SIZE = 25
const ROAD_SPACING = 5

const REF_LAT = 12.98
const REF_LNG = 77.73
const SCALE = 30

function latLngToScene(lat, lng) {
  const x = (lng - REF_LNG) * SCALE
  const z = (lat - REF_LAT) * SCALE
  return [x, 0, z]
}

function getRoads() {
  const roads = { vertical: [], horizontal: [] }
  
  for (let i = -ROAD_GRID_SIZE; i <= ROAD_GRID_SIZE; i += ROAD_SPACING) {
    roads.vertical.push({ x: i, zMin: -ROAD_GRID_SIZE, zMax: ROAD_GRID_SIZE })
    roads.horizontal.push({ z: i, xMin: -ROAD_GRID_SIZE, xMax: ROAD_GRID_SIZE })
  }
  
  return roads
}

function snapToRoad(coordinate, roadCoordinates, axis) {
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
  
  const nearestStartX = snapToRoad(startX, roadX, 'x')
  const nearestStartZ = snapToRoad(startZ, roadZ, 'z')
  const nearestEndX = snapToRoad(endX, roadX, 'x')
  const nearestEndZ = snapToRoad(endZ, roadZ, 'z')
  
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

function ConnectionLines({ buildings, supplyUnit }) {
  const linesRef = useRef()
  
  const lineData = useMemo(() => {
    const filtered = buildings
      .filter(b => b.type === 'hospital' || b.type === 'household')
      .slice(0, 20)
    
    const supplyPos = latLngToScene(supplyUnit.lat, supplyUnit.lng)
    
    return filtered.map(building => {
      const endPos = latLngToScene(building.lat, building.lng)
      return {
        start: supplyPos,
        end: endPos,
        id: building.id
      }
    })
  }, [buildings, supplyUnit])
  
  const { geometry, material } = useMemo(() => {
    const points = []
    
    lineData.forEach((line, index) => {
      const pathPoints = findRoadPath(
        [line.start[0], line.start[2]],
        [line.end[0], line.end[2]]
      )
      
      points.push(...pathPoints)
      
      if (index < lineData.length - 1) {
        points.push(new THREE.Vector3(99999, 99999, 99999))
      }
    })
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points)
    geometry.computeLineDistances()
    const material = new THREE.LineDashedMaterial({
      color: '#00d4ff',
      dashSize: 0.5,
      gapSize: 0.3,
      transparent: true,
      opacity: 0.4
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
