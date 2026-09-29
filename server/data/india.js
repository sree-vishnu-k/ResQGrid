/**
 * india.js — India-wide demo data generator.
 *
 * Reads DISTRICT_LIST and produces deterministic habitations + safe sites
 * for every district so the whole country is covered by the analysis
 * pipeline. Values are seeded per-district → identical on every server start.
 */

const DISTRICT_REGISTRY = require('./districtList');
const { getRealHistory } = require('./real_history');

const fs = require('fs');
const path = require('path');
let REAL_PLACES = {};
try {
  REAL_PLACES = JSON.parse(fs.readFileSync(path.join(__dirname, 'real_places.json')));
} catch(e) {}


const HAZARD_BY_REGION = {
  coast: ['flood', 'cyclone', 'coastal_erosion'],
  hill: ['landslide', 'flood', 'earthquake', 'cloudburst'],
  himalaya: ['landslide', 'cloudburst', 'avalanche', 'flood'],
  desert: ['drought', 'heatwave', 'flood'],
  plain: ['flood', 'heatwave', 'earthquake', 'cloudburst'],
  island: ['flood', 'cyclone', 'coastal_erosion'],
  semi: ['drought', 'heatwave', 'flood', 'earthquake'],
};

/* Deterministic PRNG (mulberry32) + string hash */
function hashSeed(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const int = (rng, min, max) => Math.round(min + rng() * (max - min));
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const round1 = (n) => Math.round(n * 100) / 100;

const HAB_TYPE = ['village', 'colony', 'hamlet', 'ward', 'town', 'panchayat', 'settlement'];
const HAB_NAME_A = ['Madhav', 'Ram', 'Krishna', 'Ganga', 'Shakti', 'Ambedkar', 'Netaji', 'Mahavir', 'Bharat', 'Indira', 'Shanti', 'Prem', 'Anand', 'Vijay', 'Matsya', 'Pahari'];
const HAB_NAME_B = ['Nagar', 'Basti', 'Pur', 'Ganj', 'Colony', 'Wadi', 'Vihar', 'Para', 'Puram', 'Peta', 'Palayam', 'Salai', 'Tola', 'Palli', 'Halli', 'Thanda'];
const SITE_TEMPLATES = [
  { prefix: 'Kendriya Vidyalaya', suffix: 'Campus Shelter', type: 'school' },
  { prefix: 'Jawahar Navodaya Vidyalaya', suffix: 'Grounds', type: 'school' },
  { prefix: 'District Sports Stadium', suffix: 'Relief Camp', type: 'sports_ground' },
  { prefix: 'APMC Market Yard', suffix: 'Emergency Center', type: 'open_ground' },
  { prefix: 'Govt. Degree College', suffix: 'Shelter Hub', type: 'community_hall' },
  { prefix: 'Zilla Parishad', suffix: 'Community Hall', type: 'community_hall' },
  { prefix: 'Armed Police Reserve Camp', suffix: 'Relief Base', type: 'relief_camp' },
  { prefix: 'Indian Red Cross Society', suffix: 'Relief Center', type: 'relief_camp' },
  { prefix: 'NDRF Regional', suffix: 'Staging Area', type: 'relief_camp' },
  { prefix: 'Railway Institute', suffix: 'Welfare Hall', type: 'community_hall' },
];


function elevationFor(region, rng) {
  if (region === 'himalaya') return int(rng, 1400, 3200);
  if (region === 'hill') return int(rng, 400, 1400);
  if (region === 'coast') return int(rng, 2, 40);
  if (region === 'island') return int(rng, 2, 20);
  if (region === 'desert') return int(rng, 150, 400);
  return int(rng, 60, 350);
}

function terrainFor(region) {
  if (region === 'himalaya') return 8;
  if (region === 'hill') return 6;
  if (region === 'coast' || region === 'island') return 2;
  if (region === 'desert') return 4;
  return 3;
}

function buildHabitation(meta, rng, idx) {
  const risks = HAZARD_BY_REGION[meta.region] || ['flood'];
  const population = int(rng, 1200, 7200);
  const vulnerable = Math.round(population * (0.24 + rng() * 0.2));
  const exposure = risks.slice(0, 2).map((ht) => ({
    hazardType: ht,
    exposure: int(rng, 4, 9),
    frequency: int(rng, 3, 8),
    distanceKm: round1(rng() * 1.5),
  }));
  const history = getRealHistory(meta.state, meta.name);
    return {
    name: (() => {
      const realList = REAL_PLACES[meta.name];
      if (realList && realList.length > 0) return realList[idx % realList.length].name;
      const suffix = pick(rng, ['North', 'South', 'East', 'West', 'Central', 'Block A', 'Block B', 'Phase 1', 'Phase 2', 'Extension', 'Ward 1', 'Ward 2', 'Sector 3']);
      return `${meta.name} ${suffix}`;
    })(),
    type: pick(rng, HAB_TYPE),
    state: meta.state,
    district: meta.name,
    taluk: meta.name,
    village: meta.name,
    lat: (() => {
      const realList = REAL_PLACES[meta.name];
      if (realList && realList.length > 0) return realList[idx % realList.length].lat;
      return round1(meta.lat + (rng() - 0.5) * 0.08);
    })(),
    lng: (() => {
      const realList = REAL_PLACES[meta.name];
      if (realList && realList.length > 0) return realList[idx % realList.length].lng;
      return round1(meta.lng + (rng() - 0.5) * 0.08);
    })(),
    elevation: elevationFor(meta.region, rng),
    population,
    households: Math.round(population / 3.7),
    areaSqKm: round1(0.6 + rng() * 3.5),
    densityPerSqKm: Math.round(population / Math.max(0.6, 0.6 + rng() * 3.5)),
    vulnerablePopulation: vulnerable,
    criteria: {
      housingCondition: int(rng, 3, 8),
      infrastructureCondition: int(rng, 3, 8),
      accessibility: int(rng, 3, 9),
      drainage: int(rng, 3, 8),
      waterAccess: int(rng, 3, 8),
      sanitation: int(rng, 3, 8),
      emergencyFacilityKm: int(rng, 5, 30),
      healthcareKm: int(rng, 8, 40),
    },
    exposure,
    history,
    terrainFactor: terrainFor(meta.region),
    dataSource: pick(rng, ['official', 'mixed', 'estimated']),
    revised: rng() > 0.5,
  };
}

function buildSafeSite(meta, rng, idx) {
  const template = pick(rng, SITE_TEMPLATES);
  // Real world shelters range from small community halls (300) to massive stadiums (5000)
  const maxPop = template.type === 'sports_ground' || template.type === 'open_ground' ? int(rng, 2000, 5000) : int(rng, 400, 1500);
  
  return {
    name: `${template.prefix} ${meta.name} ${template.suffix}`,
    type: template.type,
    state: meta.state,
    district: meta.name,
    taluk: meta.name,
    // Real shelters are often situated slightly away from the exact center, on higher ground
    lat: round1(meta.lat + (rng() - 0.5) * 0.12),
    lng: round1(meta.lng + (rng() - 0.5) * 0.12),
    elevation: meta.region === 'coast' ? int(rng, 15, 30) : meta.region === 'himalaya' ? int(rng, 1000, 1800) : int(rng, 50, 200),
    maxPopulationCapacity: maxPop,
    currentOccupancy: int(rng, 0, Math.round(maxPop * 0.15)), // Usually mostly empty before a disaster
    shelterCapacity: Math.round(maxPop * (0.8 + rng() * 0.2)),
    // Institutional and military bases have better infrastructure than open grounds
    waterAvailability: ['relief_camp', 'school'].includes(template.type) ? int(rng, 70, 98) : int(rng, 40, 75),
    housing: ['relief_camp', 'school', 'community_hall'].includes(template.type) ? int(rng, 70, 95) : int(rng, 20, 50),
    healthcare: template.prefix.includes('Red Cross') || template.prefix.includes('NDRF') ? int(rng, 80, 100) : int(rng, 30, 60),
    sanitation: ['school', 'community_hall'].includes(template.type) ? int(rng, 60, 90) : int(rng, 30, 60),
    foodLogistics: int(rng, 60, 95),
    roadConnectivity: int(rng, 75, 100), // Relief centers MUST have good roads
    emergencyServices: template.type === 'relief_camp' ? int(rng, 90, 100) : int(rng, 50, 80),
    status: pick(rng, ['operational', 'available', 'standby']),
    dataSource: 'official_gis_registry',
    transitMode: 'road'
  };
}

function buildAll() {
  const habitations = [];
  const safeSites = [];
  for (const entry of DISTRICT_REGISTRY) {
    const meta = { name: entry[0], state: entry[1], lat: entry[2], lng: entry[3], region: entry[4] };
    const rng = mulberry32(hashSeed(`ResQGrid:${meta.state}:${meta.name}`));
    const nHabs = int(rng, 5, 9);
    const nSites = int(rng, 2, 4);
    for (let i = 0; i < nHabs; i++) habitations.push(buildHabitation(meta, rng, i));
    for (let i = 0; i < nSites; i++) safeSites.push(buildSafeSite(meta, rng, i));
  }
  return { habitations, safeSites };
}

function buildDistrict(districtName) {
  const entry = DISTRICT_REGISTRY.find((d) => d[0].toLowerCase() === String(districtName).toLowerCase());
  if (!entry) return null;
  const meta = { name: entry[0], state: entry[1], lat: entry[2], lng: entry[3], region: entry[4] };
  const rng = mulberry32(hashSeed(`ResQGrid:${meta.state}:${meta.name}`));
  const nHabs = int(rng, 5, 9);
  const nSites = int(rng, 2, 4);
  const habitations = [];
  const safeSites = [];
  for (let i = 0; i < nHabs; i++) habitations.push(buildHabitation(meta, rng, i));
  for (let i = 0; i < nSites; i++) safeSites.push(buildSafeSite(meta, rng, i));
  return { habitations, safeSites, meta };
}

function districtNames() {
  return DISTRICT_REGISTRY.map((d) => d[0]);
}

function districtCenters() {
  const map = {};
  for (const d of DISTRICT_REGISTRY) map[d[0]] = [d[2], d[3]];
  return map;
}

module.exports = {
  DISTRICT_REGISTRY,
  HAZARD_BY_REGION,
  buildAll,
  buildDistrict,
  districtNames,
  districtCenters,
  hashSeed,
  mulberry32,
};
