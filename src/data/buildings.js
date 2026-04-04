export const WHITEFIELD_LOCATIONS = {
  hospitals: [
    { name: 'Manipal Hospital', area: 'ITPL Main Road', lat: 12.9875, lng: 77.7275, staff: 450, beds: 350 },
    { name: 'Columbia Asia Hospital', area: 'Sadarmatt Palya', lat: 12.9789, lng: 77.7123, staff: 280, beds: 200 },
    { name: 'Narayana Health City', area: 'Bommasandra', lat: 12.9542, lng: 77.6989, staff: 1200, beds: 800 },
    { name: 'Whitefield Hospital', area: 'ITPB Road', lat: 12.9912, lng: 77.7356, staff: 180, beds: 150 },
    { name: 'RxDX Hospital', area: 'Siddapura', lat: 12.9834, lng: 77.7412, staff: 120, beds: 100 },
    { name: 'Sri Sathya Sai Hospital', area: 'Brookfield', lat: 12.9767, lng: 77.7245, staff: 200, beds: 180 },
    { name: 'Dental Care Hospital', area: 'ITPL', lat: 12.9855, lng: 77.7290, staff: 80, beds: 50 },
    { name: 'Mother Child Hospital', area: 'Kadugodi', lat: 12.9940, lng: 77.7070, staff: 150, beds: 120 },
    { name: 'Eye Care Center', area: 'Whitefield Main', lat: 12.9795, lng: 77.7320, staff: 60, beds: 30 },
    { name: 'Ortho Plus Hospital', area: 'Brookfield', lat: 12.9730, lng: 77.7220, staff: 100, beds: 80 }
  ],
  gasStations: [
    { name: 'HP Gas Agency', area: 'Whitefield Main Road', lat: 12.9775, lng: 77.7300 },
    { name: 'Bharat Petroleum', area: 'ITPL Junction', lat: 12.9850, lng: 77.7265 },
    { name: 'Indian Oil Dealer', area: 'Brookfield', lat: 12.9750, lng: 77.7245 },
    { name: 'Reliance Fuel', area: 'Hoodi Road', lat: 12.9890, lng: 77.7100 },
    { name: 'BPCL Gas Point', area: 'Kadugodi Cross', lat: 12.9930, lng: 77.7050 },
    { name: 'Essar Petrol Pump', area: 'Hoskote Road', lat: 13.0050, lng: 77.7200 },
    { name: 'Shell Station', area: 'Sarjapur Junction', lat: 12.9100, lng: 77.6980 },
    { name: 'HP Petrol Pump', area: 'Old Madras Road', lat: 12.9680, lng: 77.6950 }
  ]
}

const CATEGORY_PRIORITY = {
  hospital: 1,
  household: 2,
  commercial: 3,
  industrial: 4,
  gas_station: 5
}

const STATUS_PRIORITY = {
  critical: 1,
  warning: 2,
  caution: 3,
  healthy: 4
}

const REFILL_AMOUNTS = {
  hospital: 50,
  household: 14,
  commercial: 30,
  industrial: 80,
  gas_station: 40
}

const CAPACITY = {
  hospital: 200,
  household: 14.2,
  commercial: 100,
  industrial: 300,
  gas_station: 200
}

const AREAS = {
  ITPL: { center: [12.9845, 77.7265], radius: 0.008, density: 0.9 },
  Brookfield: { center: [12.9745, 77.7235], radius: 0.01, density: 0.85 },
  WhitefieldMain: { center: [12.9785, 77.7315], radius: 0.012, density: 0.95 },
  Kadugodi: { center: [12.9930, 77.7060], radius: 0.009, density: 0.7 },
  Hoodi: { center: [12.9890, 77.7090], radius: 0.008, density: 0.75 },
  Sadarmatt: { center: [12.9770, 77.7140], radius: 0.007, density: 0.8 },
  Siddapura: { center: [12.9820, 77.7390], radius: 0.008, density: 0.7 },
  ITPB: { center: [12.9910, 77.7330], radius: 0.006, density: 0.6 },
  Balacekere: { center: [12.9690, 77.7200], radius: 0.007, density: 0.65 },
  AECS: { center: [12.9610, 77.7245], radius: 0.005, density: 0.7 },
  BEML: { center: [12.9730, 77.7040], radius: 0.006, density: 0.6 },
  HAL: { center: [12.9760, 77.7010], radius: 0.005, density: 0.55 },
  Channasandra: { center: [12.9630, 77.7170], radius: 0.006, density: 0.65 },
  Immadihalli: { center: [12.9650, 77.7220], radius: 0.005, density: 0.6 },
  Kundalahalli: { center: [12.9680, 77.7060], radius: 0.006, density: 0.7 },
  TinFactory: { center: [12.9700, 77.7150], radius: 0.004, density: 0.5 },
  Sarjapur: { center: [12.9080, 77.6900], radius: 0.01, density: 0.5 },
  ElectronicCity: { center: [12.9200, 77.6700], radius: 0.012, density: 0.45 },
  Bellandur: { center: [12.9355, 77.6745], radius: 0.008, density: 0.5 }
}

const APARTMENT_NAMES = [
  'Prestige', 'Brigade', 'Sobha', 'Godrej', 'DLF', 'Purva', 'Mahindra', 'Tata', 'Embassy', 'Adarsh',
  'Provident', 'SJR', 'Vajra', 'Garden', 'Greenfield', 'Sunshine', 'Rose', 'Vijayalakshmi', 'Neeladri',
  'Lakshmi', 'Vinayaka', 'Munnappa', 'Ambedkar', 'Sadarmatt', 'Benniganahalli', 'Hagadur', 'Nallurhalli',
  'AECS', 'BEML', 'HAL', 'Residency', 'Sai Baba', 'Omega', 'Sigma', 'Delta', 'Omega', 'Rainbow',
  'Sunrise', 'Sunset', 'Moonlight', 'Starlight', 'Skyline', 'Horizon', 'Valley', 'Hill', 'Lake', 'Park'
]

const STREET_NAMES = [
  'Main Road', '1st Cross', '2nd Cross', '3rd Cross', '4th Cross', '5th Cross',
  'MG Road', 'ITPL Road', 'Outer Ring Road', 'Sarjapur Road', 'Hoodi Road',
  'Brookfield Road', 'Whitefield Road', 'Kadugodi Road', 'Hoskote Road',
  'Old Madras Road', 'Golf Course Road', 'ITPB Road', 'SPI Road', 'Metro Road'
]

const RESIDENTIAL_SUFFIXES = [
  'Apartments', 'Residency', 'Enclave', 'Homes', 'Villas', 'Layout', 'Colony', 'Nagar',
  'Block A', 'Block B', 'Block C', 'Phase 1', 'Phase 2', 'Phase 3', 'Extension'
]

const safeRandom = (min, max) => {
  const result = min + Math.random() * (max - min)
  return isNaN(result) || !isFinite(result) ? (min + max) / 2 : result
}

const getRandomFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)]

const getDailyConsumption = (type, data) => {
  switch (type) {
    case 'household': {
      const familySize = data.familySize || 4
      return (familySize * 0.3) + safeRandom(0.1, 0.3)
    }
    case 'hospital':
      return (data.beds || 100) * 0.2 + safeRandom(5, 10)
    case 'commercial':
      return data.dailyUsage || 15
    case 'industrial':
      return data.dailyUsage || 50
    case 'gas_station':
      return data.dailyUsage || 25
    default:
      return 1
  }
}

const generatePositionInArea = (area) => {
  const angle = Math.random() * 2 * Math.PI
  const r = Math.sqrt(Math.random()) * area.radius
  const lat = area.center[0] + r * Math.cos(angle)
  const lng = area.center[1] + r * Math.sin(angle)
  return [lat, lng]
}

const generateBuildingsInArea = (areaName, area, type, count, extraData = {}) => {
  const buildings = []
  
  for (let i = 0; i < count; i++) {
    const [lat, lng] = generatePositionInArea(area)
    
    if (type === 'household') {
      const familySize = Math.floor(safeRandom(3, 8))
      const capacity = CAPACITY.household
      const dailyConsumption = getDailyConsumption('household', { familySize })
      const initialLevel = safeRandom(15, 95)
      
      buildings.push({
        name: `${getRandomFromArray(APARTMENT_NAMES)} ${getRandomFromArray(RESIDENTIAL_SUFFIXES)}`,
        area: areaName,
        lat,
        lng,
        type: 'household',
        familySize,
        floors: Math.floor(safeRandom(2, 15)),
        buildingType: Math.random() > 0.3 ? 'apartment' : (Math.random() > 0.5 ? 'villa' : 'independent'),
        capacity,
        dailyConsumption,
        initialLevel
      })
    } else if (type === 'commercial') {
      const categories = ['shop', 'office', 'restaurant', 'cafe', 'clinic', 'salon', 'gym', 'pharmacy', 'bank']
      const category = extraData.category || getRandomFromArray(categories)
      const capacity = CAPACITY.commercial
      const dailyConsumption = category === 'restaurant' ? safeRandom(5, 12) :
                              category === 'cafe' ? safeRandom(2, 5) :
                              category === 'office' ? safeRandom(8, 20) :
                              safeRandom(3, 8)
      const initialLevel = safeRandom(25, 90)
      
      buildings.push({
        name: `${areaName} ${getRandomFromArray(categories).charAt(0).toUpperCase()}${getRandomFromArray(categories).slice(1)} ${Math.floor(Math.random() * 100) + 1}`,
        area: areaName,
        lat,
        lng,
        type: 'commercial',
        category,
        capacity,
        dailyConsumption,
        initialLevel
      })
    }
  }
  
  return buildings
}

export const generateBuildings = () => {
  const buildings = []
  let idCounter = 1
  
  const hospitals = WHITEFIELD_LOCATIONS.hospitals
  hospitals.forEach((loc) => {
    const capacity = CAPACITY.hospital
    const dailyConsumption = getDailyConsumption('hospital', loc)
    const initialLevel = safeRandom(40, 90)

    buildings.push({
      id: `H-${String(idCounter).padStart(4, '0')}`,
      name: loc.name,
      type: 'hospital',
      area: loc.area,
      lat: loc.lat,
      lng: loc.lng,
      lpgLevel: initialLevel,
      capacity: capacity,
      dailyConsumption: dailyConsumption,
      consumptionRate: dailyConsumption / 24,
      daysRemaining: (initialLevel / 100) * capacity / dailyConsumption,
      lastRefill: new Date(Date.now() - Math.random() * 5 * 24 * 60 * 60 * 1000),
      staff: loc.staff,
      beds: loc.beds,
      priority: CATEGORY_PRIORITY.hospital,
      refillAmount: REFILL_AMOUNTS.hospital,
      status: 'healthy'
    })
    idCounter++
  })
  
  const householdCounts = {
    ITPL: 120,
    Brookfield: 140,
    WhitefieldMain: 160,
    Kadugodi: 80,
    Hoodi: 90,
    Sadarmatt: 85,
    Siddapura: 75,
    ITPB: 50,
    Balacekere: 70,
    AECS: 80,
    BEML: 60,
    HAL: 55,
    Channasandra: 65,
    Immadihalli: 60,
    Kundalahalli: 70,
    TinFactory: 40,
    Sarjapur: 45,
    ElectronicCity: 30,
    Bellandur: 35
  }
  
  Object.entries(householdCounts).forEach(([areaName, count]) => {
    const area = AREAS[areaName]
    const generated = generateBuildingsInArea(areaName, area, 'household', count)
    
    generated.forEach(data => {
      buildings.push({
        id: `HH-${String(idCounter).padStart(4, '0')}`,
        name: data.name,
        type: 'household',
        area: data.area,
        lat: data.lat,
        lng: data.lng,
        lpgLevel: data.initialLevel,
        capacity: data.capacity,
        dailyConsumption: data.dailyConsumption,
        consumptionRate: data.dailyConsumption / 24,
        daysRemaining: (data.initialLevel / 100) * data.capacity / data.dailyConsumption,
        lastRefill: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
        familySize: data.familySize,
        floors: data.floors,
        buildingType: data.buildingType,
        priority: CATEGORY_PRIORITY.household,
        refillAmount: REFILL_AMOUNTS.household,
        status: 'healthy'
      })
      idCounter++
    })
  })
  
  const commercialCounts = {
    ITPL: 60,
    Brookfield: 70,
    WhitefieldMain: 90,
    Kadugodi: 30,
    Hoodi: 35,
    Sadarmatt: 40,
    Siddapura: 25,
    ITPB: 30,
    Balacekere: 25,
    AECS: 30,
    BEML: 20,
    HAL: 15,
    Channasandra: 20,
    Immadihalli: 15,
    Kundalahalli: 25,
    TinFactory: 15
  }
  
  Object.entries(commercialCounts).forEach(([areaName, count]) => {
    const area = AREAS[areaName]
    const generated = generateBuildingsInArea(areaName, area, 'commercial', count)
    
    generated.forEach(data => {
      buildings.push({
        id: `C-${String(idCounter).padStart(4, '0')}`,
        name: data.name,
        type: 'commercial',
        area: data.area,
        lat: data.lat,
        lng: data.lng,
        lpgLevel: data.initialLevel,
        capacity: data.capacity,
        dailyConsumption: data.dailyConsumption,
        consumptionRate: data.dailyConsumption / 24,
        daysRemaining: (data.initialLevel / 100) * data.capacity / data.dailyConsumption,
        lastRefill: new Date(Date.now() - Math.random() * 4 * 24 * 60 * 60 * 1000),
        category: data.category,
        employees: Math.floor(safeRandom(5, 50)),
        priority: CATEGORY_PRIORITY.commercial,
        refillAmount: REFILL_AMOUNTS.commercial,
        status: 'healthy'
      })
      idCounter++
    })
  })
  
  const industrialData = [
    { name: 'Infosys Campus', area: 'Electronic City', lat: 12.9200, lng: 77.6700, employees: 12000, dailyUsage: 150 },
    { name: 'Wipro Technologies', area: 'Sarjapur Road', lat: 12.8980, lng: 77.6850, employees: 8000, dailyUsage: 100 },
    { name: 'TCS IT Hub', area: 'ITPL', lat: 12.9848, lng: 77.7260, employees: 10000, dailyUsage: 120 },
    { name: 'Mindtree Research', area: 'Domlur', lat: 12.9520, lng: 77.6790, employees: 3500, dailyUsage: 45 },
    { name: 'Flipkart Sorting', area: 'Bommasandra', lat: 12.9520, lng: 77.6940, employees: 2000, dailyUsage: 60 },
    { name: 'Amazon Fulfillment', area: 'Hoskote', lat: 13.0150, lng: 77.7350, employees: 3000, dailyUsage: 80 },
    { name: 'Intel India', area: 'ITPL', lat: 12.9860, lng: 77.7250, employees: 1500, dailyUsage: 30 },
    { name: 'Qualcomm India', area: 'Bellandur', lat: 12.9370, lng: 77.6760, employees: 1200, dailyUsage: 25 },
    { name: 'Samsung R&D', area: 'Whitefield', lat: 12.9830, lng: 77.7280, employees: 800, dailyUsage: 20 },
    { name: 'SAP Labs', area: 'Sarjapur', lat: 12.9080, lng: 77.6900, employees: 2500, dailyUsage: 35 },
    { name: 'Biocon Facility', area: 'Electronic City', lat: 12.9160, lng: 77.6650, employees: 2000, dailyUsage: 40 },
    { name: 'Genpact Center', area: 'Electronic City', lat: 12.9220, lng: 77.6720, employees: 3000, dailyUsage: 35 },
    { name: 'Accenture Tech Park', area: 'Electronic City', lat: 12.9180, lng: 77.6680, employees: 5000, dailyUsage: 55 },
    { name: 'Tech Mahindra', area: 'Electronic City', lat: 12.9240, lng: 77.6740, employees: 4000, dailyUsage: 45 },
    { name: 'HCL Technologies', area: 'Electronic City', lat: 12.9150, lng: 77.6670, employees: 3500, dailyUsage: 40 }
  ]
  
  industrialData.forEach((loc) => {
    const capacity = CAPACITY.industrial
    const dailyConsumption = loc.dailyUsage
    const initialLevel = safeRandom(35, 85)

    buildings.push({
      id: `I-${String(idCounter).padStart(4, '0')}`,
      name: loc.name,
      type: 'industrial',
      area: loc.area,
      lat: loc.lat,
      lng: loc.lng,
      lpgLevel: initialLevel,
      capacity: capacity,
      dailyConsumption: dailyConsumption,
      consumptionRate: dailyConsumption / 24,
      daysRemaining: (initialLevel / 100) * capacity / dailyConsumption,
      lastRefill: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
      employees: loc.employees,
      priority: CATEGORY_PRIORITY.industrial,
      refillAmount: REFILL_AMOUNTS.industrial,
      status: 'healthy'
    })
    idCounter++
  })
  
  WHITEFIELD_LOCATIONS.gasStations.forEach((loc) => {
    const capacity = CAPACITY.gas_station
    const dailyConsumption = getDailyConsumption('gas_station', loc)
    const initialLevel = safeRandom(45, 90)

    buildings.push({
      id: `GS-${String(idCounter).padStart(4, '0')}`,
      name: loc.name,
      type: 'gas_station',
      area: loc.area,
      lat: loc.lat,
      lng: loc.lng,
      lpgLevel: initialLevel,
      capacity: capacity,
      dailyConsumption: dailyConsumption,
      consumptionRate: dailyConsumption / 24,
      daysRemaining: (initialLevel / 100) * capacity / dailyConsumption,
      lastRefill: new Date(Date.now() - Math.random() * 2 * 24 * 60 * 60 * 1000),
      priority: CATEGORY_PRIORITY.gas_station,
      refillAmount: REFILL_AMOUNTS.gas_station,
      status: 'healthy'
    })
    idCounter++
  })
  
  return buildings.map(b => ({
    ...b,
    status: getLPGStatus(b.lpgLevel)
  }))
}

export const generateSupplyUnit = () => {
  return {
    id: 'central_supply',
    name: 'Whitefield LPG Distribution Hub',
    lat: 12.98,
    lng: 77.73,
    capacity: 100000,
    currentLevel: 85000,
    pressure: 3.5,
    temperature: 28,
    flowRate: 250
  }
}

export const getLPGStatus = (lpgLevel) => {
  if (lpgLevel <= 0) return 'critical'
  if (lpgLevel <= 30) return 'warning'
  if (lpgLevel <= 70) return 'caution'
  return 'healthy'
}

export const getStatusColor = (status) => {
  const colors = {
    critical: '#ff0000',
    warning: '#ff8c00',
    caution: '#ffd000',
    healthy: '#00cc00'
  }
  return colors[status] || colors.healthy
}

export const getStatusLabel = (status) => {
  const labels = {
    critical: 'Critical',
    warning: 'Warning',
    caution: 'Caution',
    healthy: 'Healthy'
  }
  return labels[status] || labels.healthy
}

export const getTypeConfig = (type) => {
  const configs = {
    hospital: { color: '#00d4ff', label: 'Hospital', priority: 1 },
    household: { color: '#888888', label: 'Household', priority: 2 },
    commercial: { color: '#a855f7', label: 'Commercial', priority: 3 },
    industrial: { color: '#f97316', label: 'Industrial', priority: 4 },
    gas_station: { color: '#22c55e', label: 'Gas Station', priority: 5 }
  }
  return configs[type] || configs.household
}

export { CATEGORY_PRIORITY, STATUS_PRIORITY, REFILL_AMOUNTS, CAPACITY }
