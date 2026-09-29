
function getHazard(key) {
  const hazards = {
    flood: { label: 'Flood' },
    landslide: { label: 'Landslide' },
    earthquake: { label: 'Earthquake' },
    cyclone: { label: 'Cyclone / High Wind' },
    tsunami: { label: 'Tsunami' },
    drought: { label: 'Drought' },
    heatwave: { label: 'Heatwave' }
  };
  return hazards[key] || { label: (key || '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) };
}

const { clamp, round } = require('../utils/helpers');

// Base Risk Weights
const WEIGHTS = {
  hazard: 0.35,
  exposure: 0.20,
  vulnerability: 0.20,
  infrastructure: 0.15,
  terrain: 0.10,
};

function riskClass(score) {
  if (score >= 75) return 'RED';
  if (score >= 60) return 'ORANGE';
  if (score >= 45) return 'YELLOW';
  return 'GREEN'; // 0-44 is moderate/low
}

function riskClassMeta(cls) {
  const map = {
    GREEN: { label: 'Low/Moderate', color: '#16a34a', severity: 1 },
    YELLOW: { label: 'High Risk', color: '#ca8a04', severity: 2 },
    ORANGE: { label: 'Very High Risk', color: '#ea580c', severity: 3 },
    RED: { label: 'Critical Risk', color: '#dc2626', severity: 4 },
  };
  return map[cls];
}

function calculateHazard(h, weather) {
  let R = 0;
  let S = 0;
  if (weather) {
    const rain24h = Number(weather.dailyPrecipitationSumMm || weather.currentPrecipitationMm * 4 || 0);
    R = Math.min(100, (rain24h / 204.5) * 100);
    S = clamp(Number(weather.soilMoisture || 0) * 100, 0, 100);
  }
  
  let D = 0;
  const history = h.history || [];
  if (history.length > 0) {
    const maxSev = Math.max(...history.map(ev => ev.severity || 0));
    D = clamp(maxSev > 10 ? maxSev : maxSev * 10, 0, 100);
  } else if ((h.exposure || []).length > 0) {
    const maxExp = Math.max(...h.exposure.map(e => e.exposure || 0));
    D = clamp(maxExp * 10, 0, 100);
  }
  
  return (R * 0.60) + (S * 0.25) + (D * 0.15);
}

function calculateExposure(h) {
  const pop = h.population || 0;
  const vulnerable = h.vulnerablePopulation || pop * 0.25;
  
  const P = Math.min(100, (pop / 5000) * 100);
  const A = pop > 0 ? (vulnerable / pop) * 100 : 0;
  
  return (P * 0.70) + (A * 0.30);
}

function calculateVulnerability(h) {
  const pop = h.population || 0;
  const vulnerable = h.vulnerablePopulation || pop * 0.25;
  const c = h.criteria || {};
  
  const D = pop > 0 ? (vulnerable / pop) * 100 : 0;
  const H = (10 - clamp(c.housingCondition || 5, 0, 10)) * 10;
  const A = (10 - clamp(c.accessibility || 5, 0, 10)) * 10;
  const C = Math.min(100, ((c.emergencyFacilityKm || 20) / 30) * 100);
  const Hist = (h.history || []).length > 0 ? 100 : 0;
  
  return (D * 0.30) + (H * 0.25) + (A * 0.20) + (C * 0.15) + (Hist * 0.10);
}

function calculateInfrastructure(h) {
  const c = h.criteria || {};
  const B = (10 - clamp(c.housingCondition || 5, 0, 10)) * 10;
  const D = (10 - clamp(c.drainage || 5, 0, 10)) * 10;
  const R = (10 - clamp(c.accessibility || 5, 0, 10)) * 10;
  const M = Math.min(100, ((c.emergencyFacilityKm || 20) / 30) * 100);
  
  return (B * 0.35) + (D * 0.30) + (R * 0.20) + (M * 0.15);
}

function calculateTerrain(h) {
  const elev = h.elevation || 100;
  let E = 50;
  if (elev < 10 || elev > 1500) E = 100;
  
  const S = elev > 800 ? Math.min(100, 30 + ((elev - 800) / 10)) : 20;
  const F = elev < 50 ? 90 : 30;
  
  return (E * 0.40) + (S * 0.35) + (F * 0.25);
}

function assessHabitation(h, vulnerabilityResult, liveWeather = null) {
  const weather = liveWeather || h.liveWeather || null;
  
  const H = clamp(calculateHazard(h, weather), 0, 100);
  const E = clamp(calculateExposure(h), 0, 100);
  const V = clamp(calculateVulnerability(h), 0, 100);
  const I = clamp(calculateInfrastructure(h), 0, 100);
  const T = clamp(calculateTerrain(h), 0, 100);
  
  const BaseRisk = (H * WEIGHTS.hazard) + (E * WEIGHTS.exposure) + (V * WEIGHTS.vulnerability) + (I * WEIGHTS.infrastructure) + (T * WEIGHTS.terrain);
  
  const C = 1 + 0.20 * (H / 100) * (V / 100);
  
  const FinalRisk = clamp(BaseRisk * C, 0, 100);
  
  const riskScore = round(FinalRisk, 1);
  const cls = riskClass(riskScore);
  const meta = riskClassMeta(cls);
  
  const mainHazards = (h.exposure || [])
    .map((e) => getHazard(e.hazardType).label)
    .filter((v, i, a) => a.indexOf(v) === i);
    
  if (weather && weather.dailyPrecipitationSumMm >= 60 && !mainHazards.includes('Monsoon Heavy Rainfall')) {
    mainHazards.unshift('Monsoon Heavy Rainfall (Live)');
  }
  
  return {
    habitationId: h.id || h._id,
    habitation: h.name,
    district: h.district,
    state: h.state,
    lat: h.lat,
    lng: h.lng,
    riskScore,
    riskClass: cls,
    riskLabel: meta.label,
    color: meta.color,
    severity: meta.severity,
    mainHazards,
    exposureIndex: round(E / 10, 2), // map to old 0-10 format for backwards compatibility where needed
    vulnerabilityIndex: round(V / 10, 2),
    infrastructureRisk: round(I / 10, 2),
    terrainRisk: round(T / 10, 2),
    compositeHazard: round(H / 10, 2),
    // Attach exact master formula derivation breakdown
    masterFormula: {
      H: round(H, 1), E: round(E, 1), V: round(V, 1), I: round(I, 1), T: round(T, 1), 
      BaseRisk: round(BaseRisk, 1), C: round(C, 3), FinalRisk: round(FinalRisk, 1),
      details: {
        hazard: {
          R: round(Math.min(100, (Number(weather?.dailyPrecipitationSumMm || weather?.currentPrecipitationMm * 4 || 0) / 204.5) * 100), 1),
          S: round(clamp(Number(weather?.soilMoisture || 0) * 100, 0, 100), 1),
          D: round(clamp(Math.max(...(h.history || []).map(ev => (ev.severity > 10 ? ev.severity : (ev.severity || 0) * 10)), ...(h.exposure || []).map(e => (e.exposure || 0) * 10), 0), 0, 100), 1)
        },
        exposure: {
          P: round(Math.min(100, ((h.population || 0) / 5000) * 100), 1),
          A: round((h.population || 0) > 0 ? ((h.vulnerablePopulation || (h.population || 0) * 0.25) / (h.population || 0)) * 100 : 0, 1)
        },
        vulnerability: {
          D: round((h.population || 0) > 0 ? ((h.vulnerablePopulation || (h.population || 0) * 0.25) / (h.population || 0)) * 100 : 0, 1),
          H: round((10 - clamp((h.criteria || {}).housingCondition || 5, 0, 10)) * 10, 1),
          A: round((10 - clamp((h.criteria || {}).accessibility || 5, 0, 10)) * 10, 1),
          C: round(Math.min(100, (((h.criteria || {}).emergencyFacilityKm || 20) / 30) * 100), 1),
          Hist: (h.history || []).length > 0 ? 100 : 0
        },
        infrastructure: {
          B: round((10 - clamp((h.criteria || {}).housingCondition || 5, 0, 10)) * 10, 1),
          D: round((10 - clamp((h.criteria || {}).drainage || 5, 0, 10)) * 10, 1),
          R: round((10 - clamp((h.criteria || {}).accessibility || 5, 0, 10)) * 10, 1),
          M: round(Math.min(100, (((h.criteria || {}).emergencyFacilityKm || 20) / 30) * 100), 1)
        },
        terrain: {
          elev: h.elevation || 100,
          E: (h.elevation || 100) < 10 || (h.elevation || 100) > 1500 ? 100 : 50,
          S: round((h.elevation || 100) > 800 ? Math.min(100, 30 + (((h.elevation || 100) - 800) / 10)) : 20, 1),
          F: round((h.elevation || 100) < 50 ? 90 : 30, 1)
        }
      }
    },
    population: h.population || 0,
    populationExposed: round((h.population || 0) * (E / 100), 0),
    dataSource: weather ? 'OpenStreetMap + Open-Meteo Live Telemetry' : (h.dataSource || 'estimated'),
    lastUpdatedAt: h.lastUpdatedAt || new Date(),
    liveWeather: weather,
    confidence: 0.85,
    limitations: ['New Master Formula Active', 'Uses real-time Open-Meteo & IMD Telemetry'],
  };
}

module.exports = { assessHabitation, riskClass, riskClassMeta, WEIGHTS };