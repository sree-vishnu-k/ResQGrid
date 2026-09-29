/**
 * Seed dataset — nationwide (all states & UTs) demo region, India.
 * Curated Kerala habitation entries below are retained (hand-tuned, verified)
 * and are merged with a deterministic nation-wide dataset generated from
 * ./india.js for every other district. Covers all registered hazards.
 * Lat/lng are approximate for representation purposes only.
 * Passwords here are only used during seeding / demo logins.
 */

/* ----------------------------- System Users ----------------------------- */
const users = [
  { name: 'Super Admin', email: 'admin@resqgrid.gov.in', password: 'Admin@123', role: 'admin', designation: 'NDMA Admin', district: '', habitation: '' },
  { name: 'Analyst', email: 'analyst@resqgrid.gov.in', password: 'Analyst@12345', role: 'analyst', designation: 'Risk Analyst', district: '', habitation: '' }
];

/* ----------------------------- Habitations ----------------------------- */
// Field layout matches the Habitation model exactly.
const habitations = [
  {
    name: 'Mundakkai', type: 'village', state: 'Kerala', district: 'Wayanad', taluk: 'Vythiri', village: 'Mundakkai',
    lat: 11.513, lng: 76.225, elevation: 980,
    population: 2100, households: 540, areaSqKm: 1.4, densityPerSqKm: 1500, vulnerablePopulation: 720,
    criteria: { housingCondition: 3, infrastructureCondition: 3, accessibility: 3, drainage: 3, waterAccess: 5, sanitation: 4, emergencyFacilityKm: 22, healthcareKm: 28 },
    exposure: [
      { hazardType: 'landslide', exposure: 9, frequency: 8, distanceKm: 0.2 },
      { hazardType: 'cloudburst', exposure: 8, frequency: 6, distanceKm: 0.4 },
    ],
    history: [
      { hazardType: 'landslide', year: 2024, severity: 90, affectedPopulation: 900, description: 'Major landslide, houses damaged', source: 'official' },
      { hazardType: 'cloudburst', year: 2021, severity: 60, affectedPopulation: 410, description: 'Heavy cloudburst events', source: 'mixed' },
    ],
    terrainFactor: 8, dataSource: 'official', revised: true,
  },
  {
    name: 'Chooralmala', type: 'village', state: 'Kerala', district: 'Wayanad', taluk: 'Vythiri', village: 'Chooralmala',
    lat: 11.507, lng: 76.219, elevation: 890,
    population: 3450, households: 870, areaSqKm: 2.1, densityPerSqKm: 1643, vulnerablePopulation: 980,
    criteria: { housingCondition: 3, infrastructureCondition: 3, accessibility: 4, drainage: 4, waterAccess: 6, sanitation: 4, emergencyFacilityKm: 18, healthcareKm: 25 },
    exposure: [
      { hazardType: 'landslide', exposure: 9, frequency: 8, distanceKm: 0.1 },
      { hazardType: 'cloudburst', exposure: 7, frequency: 5, distanceKm: 0.3 },
    ],
    history: [
      { hazardType: 'landslide', year: 2019, severity: 80, affectedPopulation: 1500, description: 'Major slide, casualties reported', source: 'official' },
    ],
    terrainFactor: 8, dataSource: 'official', revised: true,
  },
  {
    name: 'Kallody', type: 'colony', state: 'Kerala', district: 'Wayanad', taluk: 'Mananthavady', village: 'Kallody',
    lat: 11.663, lng: 76.018, elevation: 760,
    population: 1750, households: 440, areaSqKm: 1.0, densityPerSqKm: 1750, vulnerablePopulation: 590,
    criteria: { housingCondition: 4, infrastructureCondition: 4, accessibility: 5, drainage: 4, waterAccess: 6, sanitation: 5, emergencyFacilityKm: 14, healthcareKm: 20 },
    exposure: [{ hazardType: 'landslide', exposure: 8, frequency: 7, distanceKm: 0.3 }],
    history: [{ hazardType: 'landslide', year: 2019, severity: 60, affectedPopulation: 300, description: 'Slope failure near habitation', source: 'official' }],
    terrainFactor: 7, dataSource: 'official', revised: false,
  },
  {
    name: 'Meppadi', type: 'town', state: 'Kerala', district: 'Wayanad', taluk: 'Vythiri', village: 'Meppadi',
    lat: 11.553, lng: 76.137, elevation: 900,
    population: 6100, households: 1550, areaSqKm: 3.2, densityPerSqKm: 1906, vulnerablePopulation: 1900,
    criteria: { housingCondition: 6, infrastructureCondition: 7, accessibility: 6, drainage: 6, waterAccess: 8, sanitation: 7, emergencyFacilityKm: 6, healthcareKm: 12 },
    exposure: [
      { hazardType: 'cloudburst', exposure: 6, frequency: 5, distanceKm: 0.5 },
      { hazardType: 'landslide', exposure: 5, frequency: 4, distanceKm: 0.8 },
    ],
    history: [{ hazardType: 'cloudburst', year: 2021, severity: 5, affectedPopulation: 200, description: 'Localized waterlogging', source: 'mixed' }],
    terrainFactor: 5, dataSource: 'official', revised: false,
  },
  {
    name: 'Pookode', type: 'village', state: 'Kerala', district: 'Idukki', taluk: 'Devikulam', village: 'Pookode',
    lat: 10.02, lng: 77.15, elevation: 1450,
    population: 2650, households: 660, areaSqKm: 1.6, densityPerSqKm: 1656, vulnerablePopulation: 810,
    criteria: { housingCondition: 4, infrastructureCondition: 4, accessibility: 5, drainage: 4, waterAccess: 6, sanitation: 5, emergencyFacilityKm: 30, healthcareKm: 38 },
    exposure: [
      { hazardType: 'landslide', exposure: 8, frequency: 7, distanceKm: 0.2 },
      { hazardType: 'cloudburst', exposure: 7, frequency: 6, distanceKm: 0.4 },
    ],
    history: [{ hazardType: 'landslide', year: 2021, severity: 80, affectedPopulation: 260, description: 'Massive earthslip', source: 'official' }],
    terrainFactor: 8, dataSource: 'official', revised: true,
  },
  {
    name: 'Rajakkad', type: 'village', state: 'Kerala', district: 'Idukki', taluk: 'Udumpanchola', village: 'Rajakkad',
    lat: 9.93, lng: 77.18, elevation: 1280,
    population: 4100, households: 1020, areaSqKm: 2.6, densityPerSqKm: 1577, vulnerablePopulation: 1250,
    criteria: { housingCondition: 5, infrastructureCondition: 5, accessibility: 6, drainage: 5, waterAccess: 6, sanitation: 6, emergencyFacilityKm: 24, healthcareKm: 33 },
    exposure: [
      { hazardType: 'landslide', exposure: 7, frequency: 6, distanceKm: 0.3 },
      { hazardType: 'flood', exposure: 5, frequency: 4, distanceKm: 1.2 },
    ],
    history: [{ hazardType: 'flood', year: 2018, severity: 60, affectedPopulation: 400, description: 'Periyar overflow', source: 'official' }],
    terrainFactor: 6, dataSource: 'mixed', revised: false,
  },
  {
    name: 'Thekku Arayil', type: 'hamlet', state: 'Kerala', district: 'Alappuzha', taluk: 'Cherthala', village: 'Aroor',
    lat: 9.87, lng: 76.3, elevation: 3,
    population: 1500, households: 380, areaSqKm: 0.9, densityPerSqKm: 1667, vulnerablePopulation: 500,
    criteria: { housingCondition: 4, infrastructureCondition: 5, accessibility: 8, drainage: 5, waterAccess: 6, sanitation: 5, emergencyFacilityKm: 6, healthcareKm: 10 },
    exposure: [
      { hazardType: 'coastal_erosion', exposure: 9, frequency: 8, distanceKm: 0.05 },
      { hazardType: 'flood', exposure: 7, frequency: 7, distanceKm: 0.2 },
    ],
    history: [{ hazardType: 'coastal_erosion', year: 2022, severity: 80, affectedPopulation: 200, description: 'Severe erosion, seawall breach', source: 'official' }],
    terrainFactor: 1, dataSource: 'official', revised: true,
  },
  {
    name: 'Chempumthara', type: 'village', state: 'Kerala', district: 'Alappuzha', taluk: 'Ambalapuzha', village: 'Chempumthara',
    lat: 9.44, lng: 76.35, elevation: 1,
    population: 2200, households: 560, areaSqKm: 1.2, densityPerSqKm: 1833, vulnerablePopulation: 760,
    criteria: { housingCondition: 4, infrastructureCondition: 5, accessibility: 7, drainage: 4, waterAccess: 5, sanitation: 5, emergencyFacilityKm: 8, healthcareKm: 12 },
    exposure: [{ hazardType: 'flood', exposure: 8, frequency: 8, distanceKm: 0.1 }],
    history: [{ hazardType: 'flood', year: 2024, severity: 70, affectedPopulation: 1100, description: 'Paddy field flooding', source: 'official' }],
    terrainFactor: 1, dataSource: 'official', revised: false,
  },
  {
    name: 'Kuttanad', type: 'village', state: 'Kerala', district: 'Alappuzha', taluk: 'Kuttanad', village: 'Kavanatt',
    lat: 9.32, lng: 76.36, elevation: -1,
    population: 1900, households: 480, areaSqKm: 2.3, densityPerSqKm: 826, vulnerablePopulation: 700,
    criteria: { housingCondition: 5, infrastructureCondition: 4, accessibility: 3, drainage: 2, waterAccess: 4, sanitation: 5, emergencyFacilityKm: 12, healthcareKm: 18 },
    exposure: [{ hazardType: 'flood', exposure: 9, frequency: 9, distanceKm: 0.05 }],
    history: [{ hazardType: 'flood', year: 2024, severity: 80, affectedPopulation: 400, description: 'Below sea level, persistent flooding', source: 'official' }],
    terrainFactor: 1, dataSource: 'official', revised: false,
  },
  {
    name: 'Alappuzha Town', type: 'town', state: 'Kerala', district: 'Alappuzha', taluk: 'Alappuzha', village: 'Alappuzha',
    lat: 9.45, lng: 76.33, elevation: 2,
    population: 12800, households: 3200, areaSqKm: 6.5, densityPerSqKm: 1969, vulnerablePopulation: 3400,
    criteria: { housingCondition: 7, infrastructureCondition: 7, accessibility: 9, drainage: 6, waterAccess: 5, sanitation: 7, emergencyFacilityKm: 2, healthcareKm: 3 },
    exposure: [{ hazardType: 'coastal_erosion', exposure: 6, frequency: 6, distanceKm: 0.2 }],
    history: [{ hazardType: 'coastal_erosion', year: 2022, severity: 5, affectedPopulation: 300, description: 'Beach erosion episodes', source: 'official' }],
    terrainFactor: 1, dataSource: 'official', revised: false,
  },
  {
    name: 'Kallai', type: 'ward', state: 'Kerala', district: 'Kozhikode', taluk: 'Kozhikode', village: 'Kallai',
    lat: 11.24, lng: 75.78, elevation: 59,
    population: 3240, households: 810, areaSqKm: 1.9, densityPerSqKm: 1705, vulnerablePopulation: 1080,
    criteria: { housingCondition: 5, infrastructureCondition: 6, accessibility: 8, drainage: 5, waterAccess: 5, sanitation: 6, emergencyFacilityKm: 10, healthcareKm: 12 },
    exposure: [
      { hazardType: 'coastal_erosion', exposure: 6, frequency: 6, distanceKm: 0.1 },
      { hazardType: 'cloudburst', exposure: 6, frequency: 5, distanceKm: 0.2 },
    ],
    history: [{ hazardType: 'cloudburst', year: 2021, severity: 4, affectedPopulation: 1500, description: 'Rain-based waterlogging', source: 'mixed' }],
    terrainFactor: 1, dataSource: 'mixed', revised: false,
  },
  {
    name: 'Koyilandy', type: 'village', state: 'Kerala', district: 'Kozhikode', taluk: 'Koyilandy', village: 'Koyilandy',
    lat: 11.4, lng: 75.8, elevation: 35,
    population: 5400, households: 1382, areaSqKm: 3.0, densityPerSqKm: 1800, vulnerablePopulation: 1500,
    criteria: { housingCondition: 6, infrastructureCondition: 6, accessibility: 8, drainage: 5, waterAccess: 5, sanitation: 6, emergencyFacilityKm: 9, healthcareKm: 11 },
    exposure: [
      { hazardType: 'coastal_erosion', exposure: 5, frequency: 4, distanceKm: 0.2 },
      { hazardType: 'flood', exposure: 6, frequency: 6, distanceKm: 0.3 },
    ],
    history: [{ hazardType: 'flood', year: 2019, severity: 60, affectedPopulation: 1200, description: 'Riverine flooding', source: 'mixed' }],
    terrainFactor: 5, dataSource: 'mixed', revised: false,
  },
  // --- Low-risk habitations (relatively safe, for complete GREEN legend band) ---
  {
    name: 'Ollur', type: 'town', state: 'Kerala', district: 'Thrissur', taluk: 'Thrissur', village: 'Ollur',
    lat: 10.49, lng: 76.25, elevation: 30,
    population: 4200, households: 1050, areaSqKm: 4.5, densityPerSqKm: 933, vulnerablePopulation: 800,
    criteria: { housingCondition: 9, infrastructureCondition: 8, accessibility: 9, drainage: 8, waterAccess: 9, sanitation: 8, emergencyFacilityKm: 2, healthcareKm: 4 },
    exposure: [{ hazardType: 'flood', exposure: 2, frequency: 2, distanceKm: 3 }],
    history: [], terrainFactor: 1, dataSource: 'official', revised: false,
  },
  {
    name: 'Munnar Hills', type: 'village', state: 'Kerala', district: 'Idukki', taluk: 'Devikulam', village: 'Munnar',
    lat: 10.088, lng: 77.06, elevation: 950,
    population: 1800, households: 450, areaSqKm: 5.0, densityPerSqKm: 360, vulnerablePopulation: 260,
    criteria: { housingCondition: 8, infrastructureCondition: 8, accessibility: 7, drainage: 7, waterAccess: 8, sanitation: 7, emergencyFacilityKm: 5, healthcareKm: 8 },
    exposure: [{ hazardType: 'cloudburst', exposure: 3, frequency: 2, distanceKm: 1.0 }],
    history: [], terrainFactor: 5, dataSource: 'official', revised: false,
  },
];

/* ------------------------------ Safe sites ------------------------------ */
const safeSites = [
  {
    name: 'Community Hall Vythiri', type: 'community_hall', state: 'Kerala', district: 'Wayanad', taluk: 'Vythiri',
    lat: 11.551, lng: 76.036,
    maxPopulationCapacity: 600, currentOccupancy: 120, shelterCapacity: 500,
    waterAvailability: 70, housing: 55, healthcare: 40, sanitation: 65, foodLogistics: 60, roadConnectivity: 75, emergencyServices: 55,
    status: 'operational', dataSource: 'official',
  },
  {
    name: 'School Meppadi Relief Shelter', type: 'school', state: 'Kerala', district: 'Wayanad', taluk: 'Vythiri',
    lat: 11.554, lng: 76.126,
    maxPopulationCapacity: 1200, currentOccupancy: 300, shelterCapacity: 900,
    waterAvailability: 80, housing: 60, healthcare: 30, sanitation: 70, foodLogistics: 65, roadConnectivity: 85, emergencyServices: 60,
    status: 'available', dataSource: 'official',
  },
  {
    name: 'Relief Camp Mananthavady', type: 'relief_camp', state: 'Kerala', district: 'Wayanad', taluk: 'Mananthavady',
    lat: 11.662, lng: 76.009,
    maxPopulationCapacity: 800, currentOccupancy: 400, shelterCapacity: 700,
    waterAvailability: 75, housing: 65, healthcare: 50, sanitation: 72, foodLogistics: 70, roadConnectivity: 70, emergencyServices: 65,
    status: 'operational', dataSource: 'official',
  },
  {
    name: 'School Devikulam', type: 'school', state: 'Kerala', district: 'Idukki', taluk: 'Devikulam',
    lat: 10.065, lng: 77.10,
    maxPopulationCapacity: 700, currentOccupancy: 80, shelterCapacity: 600,
    waterAvailability: 70, housing: 60, healthcare: 35, sanitation: 66, foodLogistics: 58, roadConnectivity: 65, emergencyServices: 50,
    status: 'available', dataSource: 'mixed',
  },
  {
    name: 'Open Ground Nedumkandam', type: 'open_ground', state: 'Kerala', district: 'Idukki', taluk: 'Nedumkandam',
    lat: 9.908, lng: 77.22,
    maxPopulationCapacity: 1500, currentOccupancy: 0, shelterCapacity: 1200,
    waterAvailability: 40, housing: 20, healthcare: 25, sanitation: 35, foodLogistics: 50, roadConnectivity: 70, emergencyServices: 40,
    status: 'available', dataSource: 'estimated',
  },
  {
    name: 'Community Hall Cherthala', type: 'community_hall', state: 'Kerala', district: 'Alappuzha', taluk: 'Cherthala',
    lat: 9.69, lng: 76.32,
    maxPopulationCapacity: 500, currentOccupancy: 250, shelterCapacity: 400,
    waterAvailability: 78, housing: 60, healthcare: 45, sanitation: 70, foodLogistics: 62, roadConnectivity: 85, emergencyServices: 60,
    status: 'operational', dataSource: 'official',
  },
  {
    name: 'School Ambalapuzha', type: 'school', state: 'Kerala', district: 'Alappuzha', taluk: 'Ambalapuzha',
    lat: 9.392, lng: 76.37,
    maxPopulationCapacity: 900, currentOccupancy: 150, shelterCapacity: 750,
    waterAvailability: 72, housing: 58, healthcare: 32, sanitation: 68, foodLogistics: 60, roadConnectivity: 78, emergencyServices: 55,
    status: 'available', dataSource: 'mixed',
  },
  {
    name: 'Relief Camp Kozhikode', type: 'relief_camp', state: 'Kerala', district: 'Kozhikode', taluk: 'Kozhikode',
    lat: 11.28, lng: 75.81,
    maxPopulationCapacity: 1000, currentOccupancy: 350, shelterCapacity: 800,
    waterAvailability: 80, housing: 65, healthcare: 55, sanitation: 72, foodLogistics: 75, roadConnectivity: 88, emergencyServices: 70,
    status: 'operational', dataSource: 'official',
  },
];

const fs = require('fs');
const path = require('path');

let authenticCensusData = [];
let authenticRealShelters = [];
let excelSheltersData = [];

try {
  const rawCensus = fs.readFileSync(path.join(__dirname, 'census_extracted.json'), 'utf8');
  authenticCensusData = JSON.parse(rawCensus);
} catch (e) {
  console.warn('[seedData] Could not load census_extracted.json:', e.message);
}

try {
  const rawExcel = fs.readFileSync(path.join(__dirname, 'excel_shelters_extracted.json'), 'utf8');
  excelSheltersData = JSON.parse(rawExcel);
} catch (e) {
  console.warn('[seedData] Could not load excel_shelters_extracted.json:', e.message);
}

try {
  const rawShelters = fs.readFileSync(path.join(__dirname, 'real_shelters_extracted.json'), 'utf8');
  authenticRealShelters = JSON.parse(rawShelters);
} catch (e) {
  console.warn('[seedData] Could not load real_shelters_extracted.json:', e.message);
}

// ─── Enrich census records that lack risk fields ────────────────────────────
// Census data only has demographics; risk engine needs exposure/history/criteria.
// We add deterministic region-based enrichment so analysis is meaningful.
const { HAZARD_BY_REGION, hashSeed, mulberry32 } = require('./india');
const DISTRICT_REGISTRY_RAW = require('./districtList');
const { getRealHistory } = require('./real_history');

function enrichCensusRecord(h) {
  const regEntry = DISTRICT_REGISTRY_RAW.find(d => d[0].toLowerCase() === (h.district || '').toLowerCase());
  const region = regEntry ? regEntry[4] : 'plain';
  const risks = HAZARD_BY_REGION[region] || ['flood'];
  const seed = hashSeed(`enrich:${h.district}:${h.name}`);
  const rng = mulberry32(seed);
  const intR = (mn, mx) => Math.round(mn + rng() * (mx - mn));

  const exposure = (h.exposure && h.exposure.length > 0) ? h.exposure : risks.slice(0, 2).map(ht => ({
    hazardType: ht,
    exposure: intR(3, 8),
    frequency: intR(2, 7),
    distanceKm: Math.round(rng() * 200) / 100,
  }));

  const baseHistory = (h.history || []).map(ev => ({
    ...ev,
    severity: ev.severity <= 10 ? ev.severity * 10 : ev.severity
  }));
  const regionalHistory = getRealHistory(h.state, h.district);
  
  // Merge both
  const history = [...baseHistory, ...regionalHistory];
  
  const criteria = h.criteria || {
    housingCondition: intR(3, 8),
    infrastructureCondition: intR(3, 8),
    accessibility: intR(3, 9),
    drainage: intR(3, 8),
    waterAccess: intR(4, 9),
    sanitation: intR(3, 8),
    emergencyFacilityKm: intR(5, 30),
    healthcareKm: intR(8, 35),
  };

  const terrainMap = { himalaya: 8, hill: 6, coast: 2, island: 2, desert: 4 };
  return {
    ...h,
    exposure,
    history,
    criteria,
    terrainFactor: h.terrainFactor || terrainMap[region] || 3,
    revised: true,
  };
}

const enrichedCensusData = authenticCensusData.map(enrichCensusRecord);

// ─── Merge strategy ──────────────────────────────────────────────────────────
// Priority: hand-curated > enriched census > india.js generated (for gaps)
const CURATED_HAB_DISTRICTS = new Set(habitations.map(h => h.district));
const CENSUS_DISTRICTS = new Set(enrichedCensusData.map(h => h.district));

// Find districts in registry that have ZERO coverage from either curated or census
const { buildAll, districtNames } = require('./india');
const INDIA = buildAll();
const INDIA_HAB_BY_DISTRICT = {};
const INDIA_SITE_BY_DISTRICT = {};
for (const h of INDIA.habitations) {
  if (!INDIA_HAB_BY_DISTRICT[h.district]) INDIA_HAB_BY_DISTRICT[h.district] = [];
  INDIA_HAB_BY_DISTRICT[h.district].push(h);
}
for (const s of INDIA.safeSites) {
  if (!INDIA_SITE_BY_DISTRICT[s.district]) INDIA_SITE_BY_DISTRICT[s.district] = [];
  INDIA_SITE_BY_DISTRICT[s.district].push(s);
}

// Build final habitations: curated + census (non-curated districts) + india.js (gaps only)
const ALL_HABITATIONS = [
  ...habitations,
  ...enrichedCensusData.filter(h => !CURATED_HAB_DISTRICTS.has(h.district)),
  // Fill in india.js generated data for districts with NO census coverage and NOT curated
  ...INDIA.habitations.filter(h =>
    !CURATED_HAB_DISTRICTS.has(h.district) && !CENSUS_DISTRICTS.has(h.district)
  ).map(enrichCensusRecord),
];

// Build final safe sites: curated Kerala + excel + OSM real + india.js gaps
const SITE_DISTRICTS_COVERED = new Set([
  ...safeSites.map(s => s.district),
  ...excelSheltersData.map(s => s.district),
  ...authenticRealShelters.map(s => s.district),
]);

const ALL_SAFE_SITES = [
  ...safeSites,
  ...excelSheltersData,
  ...authenticRealShelters,
  // India.js generated sites only for districts with no real site data
  ...INDIA.safeSites.filter(s => !SITE_DISTRICTS_COVERED.has(s.district)),
];

const allDistricts = Array.from(new Set([
  ...districtNames(),
  ...ALL_HABITATIONS.map(h => h.district).filter(Boolean),
  ...ALL_SAFE_SITES.map(s => s.district).filter(Boolean),
])).sort();

console.log(`[seedData] Loaded: ${ALL_HABITATIONS.length} habitations, ${ALL_SAFE_SITES.length} safe sites across ${allDistricts.length} districts`);

module.exports = {
  DISTRICTS: allDistricts,
  users,
  habitations: ALL_HABITATIONS,
  safeSites: ALL_SAFE_SITES,
};
