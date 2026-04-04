# AI-Powered Digital Twin for LPG Distribution System
## Whitefield, Bangalore - Urban Infrastructure Management

---

## 1. Concept & Vision

A **living, breathing digital replica** of Whitefield's LPG ecosystem that transforms mundane gas management into an immersive 3D experience. The interface feels like a mission control center for urban energy—where buildings pulse with life, supply lines flow like arteries, and AI predictions surface before crises emerge. It's not just visualization; it's **urban foresight**.

---

## 2. Design Language

### Aesthetic Direction
**Cyberpunk Command Center** meets **Clean Urban Dashboard**—dark backgrounds with vibrant data overlays, holographic-style UI elements, and a sense of technological sophistication. Think Bloomberg Terminal meets sci-fi HUD.

### Color Palette
- **Background Primary**: `#0a0e17` (Deep space blue-black)
- **Background Secondary**: `#141b2d` (Elevated surfaces)
- **Background Tertiary**: `#1e2942` (Cards, panels)
- **Accent Primary**: `#00d4ff` (Cyan - primary actions, highlights)
- **Accent Secondary**: `#7b61ff` (Purple - secondary elements)
- **Success/Green**: `#00ff88` (Recently refilled, healthy)
- **Warning/Yellow**: `#ffd000` (15-20 days remaining)
- **Alert/Orange**: `#ff8c00` (5-10 days remaining)
- **Critical/Red**: `#ff3366` (Exhausted, urgent)
- **Text Primary**: `#ffffff`
- **Text Secondary**: `#8892b0`
- **Text Muted**: `#5a6380`

### Typography
- **Headings**: `'Orbitron', sans-serif` (Tech/futuristic feel)
- **Body**: `'Rajdhani', sans-serif` (Modern, readable)
- **Data/Numbers**: `'JetBrains Mono', monospace` (Precision feel)

### Spatial System
- Base unit: 8px
- Spacing scale: 8, 16, 24, 32, 48, 64, 96px
- Border radius: 4px (buttons), 8px (cards), 12px (panels), 24px (large containers)
- Elevation: Subtle glow effects on active elements

### Motion Philosophy
- **Data flows**: Animated SVG paths for gas flow visualization
- **State transitions**: 300ms ease-out for color changes
- **Building interactions**: Scale 1.05 on hover with 200ms transition
- **Panel reveals**: Slide-in from right with 400ms cubic-bezier(0.4, 0, 0.2, 1)
- **Pulse animations**: Critical buildings pulse with red glow
- **Real-time updates**: Smooth interpolation for level changes

### Visual Assets
- **Icons**: Lucide React (consistent stroke weight)
- **3D Elements**: React Three Fiber with custom geometries
- **Charts**: Recharts with custom theming
- **Decorative**: Grid patterns, scanline effects, particle systems

---

## 3. Layout & Structure

### Main Layout (Single Page Application)
```
┌─────────────────────────────────────────────────────────────┐
│  HEADER (Fixed)                                              │
│  Logo | Tab Navigation | Time | Supply Status | Settings   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────┐  ┌─────────────┐ │
│  │                                     │  │             │ │
│  │     3D DIGITAL TWIN VIEWPORT        │  │   DETAILS   │ │
│  │     (Primary Interface - 70%)        │  │    PANEL    │ │
│  │                                     │  │   (30%)     │ │
│  │                                     │  │             │ │
│  └─────────────────────────────────────┘  └─────────────┘ │
│                                                             │
│  ┌─────────────────────────────────────────────────────────┐│
│  │  CONTROL BAR (Distribution Controls, Time, Speed)       ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Tab Navigation
1. **Digital Twin** - Primary 3D visualization
2. **Analytics Dashboard** - Charts and statistics
3. **Crisis Management** - Alerts and alternatives
4. **Supply Network** - Distribution flow visualization

### Responsive Strategy
- **Desktop (1200px+)**: Full 3D view with side panel
- **Tablet (768-1199px)**: 3D view with collapsible panel
- **Mobile (< 768px)**: Tab-based with simplified 3D

---

## 4. Features & Interactions

### 4.1 3D Geospatial Digital Twin

#### Map Display
- 3D representation of Whitefield area (simplified grid)
- Buildings rendered as extruded polygons
- Ground plane with subtle grid pattern
- Ambient lighting with directional shadows

#### Building Types & Colors
| Type | Base Color | Height | Icon |
|------|------------|--------|------|
| Hospital | `#00d4ff` (cyan) | 3 units | Medical cross |
| Household | `#7b61ff` (purple) | 1 unit | Home |
| Commercial | `#ffd000` (yellow) | 2 units | Store |
| Industrial | `#ff8c00` (orange) | 4 units | Factory |
| Gas Station | `#00ff88` (green) | 0.5 units | Fuel |

#### LPG Level Visualization
- **Building opacity**: 100% when green, fading as levels drop
- **Glow intensity**: Pulsing glow for red/orange buildings
- **Color overlay**: Building color shifts based on LPG level
- **Level indicator**: Floating bar above building showing percentage

#### Interactions
- **Hover**: Building scales 1.05, info tooltip appears
- **Click**: Opens detail panel with full information
- **Scroll**: Zoom in/out on map
- **Drag**: Rotate/pan camera
- **Double-click**: Focus on building

### 4.2 Detail Panel (On Building Click)

#### Content
```
┌────────────────────────────┐
│  🏥 Metro City Hospital    │
│  Type: Hospital            │
│  ID: H-001                 │
├────────────────────────────┤
│  LPG LEVEL                 │
│  ████████░░ 75%           │
│  ~12 days remaining        │
├────────────────────────────┤
│  CONSUMPTION               │
│  Rate: 2.3 kg/day          │
│  Family/Staff: 450         │
├────────────────────────────┤
│  STATUS                    │
│  🟢 Well Stocked           │
│  Next refill: Auto (2 days)│
├────────────────────────────┤
│  HISTORY                   │
│  [Sparkline chart]         │
└────────────────────────────┘
```

### 4.3 Intelligent Supply Distribution Engine

#### Central Supply Unit
- Large structure at map center
- Displays: Current capacity (%), pressure, temperature
- Animated fill level visualization
- Connected flow lines to all consumers

#### Distribution Logic
```
Priority Queue:
1. Hospitals (all red → orange → yellow)
2. Households (all red → orange → yellow)
3. Commercial (all red → orange → yellow)
4. Industrial (all red → orange → yellow)
5. Gas Stations

Allocation Algorithm:
- Each cycle, distribute 5% capacity per priority level
- Red units get 100% of their deficit
- Orange units get 50% of their deficit
- Yellow units get 25% of their deficit
- Industrial can be suspended if supply < 20%
```

#### Visual Flow
- Animated dashed lines from supply to buildings
- Line thickness indicates flow rate
- Color indicates priority (cyan=high, gray=low)
- Particles flow along lines

### 4.4 Shortage & Crisis Management

#### Trigger Conditions
- Supply < 10% capacity
- >50% of highest priority units in red
- Predicted shortage within 3 days

#### Crisis Panel
```
┌────────────────────────────────────────┐
│  ⚠️ SUPPLY CRISIS ALERT                │
│                                        │
│  Supply: 8% | Critical: 23 units      │
│                                        │
│  PREDICTED SHORTAGE:                   │
│  47 households will exhaust by Apr 7   │
│                                        │
│  ALTERNATIVES AVAILABLE:               │
│  ├─ Biogas Stations (3 nearby)         │
│  ├─ Electric Cooking Centers (2)       │
│  ├─ Community Kitchens (5)             │
│  └─ Emergency LPG Reserve (500kg)      │
│                                        │
│  NEXT SUPPLY DELIVERY:                 │
│  Estimated: 48 hours                   │
│                                        │
│  [Request Emergency Supply]            │
│  [Activate Alternatives]                │
└────────────────────────────────────────┘
```

### 4.5 Analytics Dashboard

#### Charts
1. **Supply vs Demand** - Area chart over time
2. **Category Distribution** - Donut chart
3. **Consumption Trends** - Line chart (7-day)
4. **Critical Units Map** - Heatmap overlay
5. **Prediction Accuracy** - Bar chart

#### Statistics Cards
- Total consumers: 1,247
- Critical (Red): 23
- Warning (Orange): 89
- Healthy (Green): 1,135
- Supply efficiency: 94%
- AI predictions accuracy: 91%

### 4.6 AI/Intelligence Layer

#### Prediction Engine
- **Depletion forecasting**: Based on consumption patterns
- **Demand spikes**: Detects unusual usage (festivals, events)
- **Supply optimization**: Recommends distribution routes
- **Anomaly detection**: Flags unusual consumption

#### Simulation Controls
- **Play/Pause**: Toggle real-time simulation
- **Speed**: 1x, 2x, 5x, 10x, 100x
- **Time display**: Current simulated time
- **Day/Night cycle**: Visual lighting changes

---

## 5. Component Inventory

### Header
- **Default**: Dark background with subtle border-bottom glow
- **Logo**: Animated pulse effect
- **Tab buttons**: Underline indicator on active, hover glow
- **Supply meter**: Mini progress bar with percentage

### 3D Scene
- **Canvas**: Full viewport minus header
- **Ground**: Grid-textured plane with fog
- **Buildings**: Instanced meshes for performance
- **Lights**: Ambient + 2 directional lights
- **Controls**: OrbitControls with limits

### Building Mesh
- **Default**: Type color at 80% opacity
- **Hover**: Scale 1.05, full opacity, edge glow
- **Selected**: Pulsing outline, info panel open
- **Red state**: Red overlay, pulsing glow
- **Refilling**: Particle burst effect

### Detail Panel
- **Closed**: Hidden off-screen right
- **Open**: Slide in 400ms, semi-transparent backdrop
- **Loading**: Skeleton animation
- **Content**: Scrollable if needed

### Control Bar
- **Background**: Glassmorphism effect
- **Buttons**: Icon + label, hover scale
- **Time display**: Monospace, tick animation
- **Speed selector**: Dropdown with presets

### Charts (Recharts)
- **Background**: Transparent
- **Lines/Areas**: Gradient fills matching palette
- **Grid**: Subtle `#1e2942`
- **Labels**: Text secondary color
- **Tooltips**: Dark background with glow

### Alert Cards
- **Background**: Gradient based on severity
- **Border**: Left accent bar
- **Icon**: Animated pulse for critical
- **Actions**: Primary/secondary buttons

---

## 6. Technical Approach

### Frontend Stack
- **Framework**: React 18 with Vite
- **3D**: React Three Fiber + Drei
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Charts**: Recharts
- **Icons**: Lucide React

### Project Structure
```
lpg-digital-twin/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx
│   │   │   └── ControlBar.jsx
│   │   ├── twin/
│   │   │   ├── Scene.jsx
│   │   │   ├── Building.jsx
│   │   │   ├── Ground.jsx
│   │   │   └── SupplyUnit.jsx
│   │   ├── panel/
│   │   │   ├── DetailPanel.jsx
│   │   │   └── BuildingInfo.jsx
│   │   ├── dashboard/
│   │   │   ├── Charts.jsx
│   │   │   └── StatsCards.jsx
│   │   ├── crisis/
│   │   │   └── CrisisAlert.jsx
│   │   └── ui/
│   │       ├── Button.jsx
│   │       ├── Card.jsx
│   │       └── ProgressBar.jsx
│   ├── stores/
│   │   └── useStore.js
│   ├── data/
│   │   ├── buildings.js
│   │   └── consumptionPatterns.js
│   ├── utils/
│   │   ├── simulation.js
│   │   └── predictions.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── public/
├── package.json
├── vite.config.js
├── tailwind.config.js
└── SPEC.md
```

### Data Model

#### Building
```javascript
{
  id: string,
  name: string,
  type: 'hospital' | 'household' | 'commercial' | 'industrial' | 'gas_station',
  position: [x, y, z],
  dimensions: [width, depth, height],
  lpgLevel: number (0-100),
  consumptionRate: number (kg/day),
  capacity: number (kg),
  lastRefill: timestamp,
  connections: string[] (IDs of connected buildings)
}
```

#### SupplyUnit
```javascript
{
  id: 'central_supply',
  capacity: number (kg),
  currentLevel: number (kg),
  pressure: number,
  temperature: number,
  flowRate: number
}
```

#### SimulationState
```javascript
{
  isRunning: boolean,
  speed: number,
  currentTime: timestamp,
  dayNumber: number
}
```

### Simulation Engine
- Uses `requestAnimationFrame` for smooth updates
- Configurable time scaling
- Predicts depletion using exponential decay model
- Distributes supply using priority queue
- Triggers crisis events based on thresholds

### Performance Considerations
- Instanced meshes for buildings
- Frustum culling for off-screen objects
- Debounced state updates
- Web Workers for heavy calculations (future)

---

## 7. Implementation Phases

### Phase 1: Core Visualization
- [x] Project setup with Vite + React
- [x] 3D scene with ground plane
- [x] Basic building rendering
- [x] Camera controls
- [x] Color-coded buildings

### Phase 2: Interactivity
- [x] Building hover/click detection
- [x] Detail panel
- [x] Simulation controls
- [x] Real-time updates

### Phase 3: Intelligence
- [x] Consumption simulation
- [x] Priority distribution
- [x] Depletion predictions
- [x] Crisis detection

### Phase 4: Analytics
- [ ] Charts and graphs
- [ ] Statistics dashboard
- [ ] Historical data
- [ ] Export reports

### Phase 5: Polish
- [ ] Animations and transitions
- [ ] Sound effects (optional)
- [ ] Mobile optimization
- [ ] Performance tuning
