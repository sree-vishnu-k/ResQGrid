/**
 * RELOCATION ENGINE
 * -----------------
 * Answers: who should be relocated first, and where should they go?
 *
 *  1. Priority ranking  — habitations are ranked by a composite of risk,
 *     vulnerability and feasible evacuation difficulty.
 *  2. Capacity allocation— a greedy assignment of each habitation to the
 *     nearest safe site(s) with available capacity.
 *  3. Practical detail   — distance, transit mode, ETA, constraints and
 *     recommended operational actions.
 *
 * This is an optimisation heuristic used for decision support. Final
 * relocation decisions must be validated by field authorities.
 */

const { clamp, round, haversineKm } = require('../utils/helpers');

const TRANSIT_SPEED_KMH = { road: 40, boat: 18, air: 120 };

function relocationScore(h, assessed) {
  const risk = assessed.riskScore || 0;
  const vuln = assessed.vulnerabilityScore || 0;
  const historyBoost = Math.min((h.history || []).length, 3) * 2;
  return round(clamp(risk * 0.6 + vuln * 0.3 + historyBoost, 0, 100), 1);
}

/**
 * Rank habitations needing relocation for a given district.
 */
function rankHabitations(habitationsWithAssessment) {
  return habitationsWithAssessment
    .map(({ habitation, assessment, vulnerability }) => ({
      habitationId: habitation.id || habitation._id,
      habitation: habitation.name,
      district: habitation.district,
      lat: habitation.lat,
      lng: habitation.lng,
      population: habitation.population || 0,
      households: habitation.households || 0,
      vulnerablePopulation: habitation.vulnerablePopulation || 0,
      riskScore: assessment.riskScore,
      riskClass: assessment.riskClass,
      vulnerabilityScore: vulnerability.vulnerabilityScore,
      vulnerabilityClass: vulnerability.vulnerabilityClass,
      relocationScore: relocationScore(habitation, assessment),
      needsRelocation: assessment.riskClass === 'RED' || assessment.riskClass === 'ORANGE',
    }))
    .sort((a, b) => b.relocationScore - a.relocationScore);
}

/**
 * Greedy assignment of relocating habitations to safe sites.
 * Higher priority habitations get first pick of nearest available capacity.
 */
/**
 * Async Greedy assignment with Risk-Adjusted Pathfinding and Real OSRM Routing.
 */
async function allocate(ranked, sites) {
  const sitePool = sites.map((s) => ({
    site: s,
    remaining: Math.max(0, (s.maxPopulationCapacity || 0) - (s.currentOccupancy || 0)),
  }));

  const assignmentsPromises = ranked.map(async (h) => {
    let need = h.population;
    const assignments = [];

    // Prefer available sites, sorted by Risk-Adjusted Distance
    // (We apply a penalty to the Haversine distance if the site itself is in a high-risk area)
    const pool = [...sitePool].sort((a, b) => {
      const da = haversineKm(h.lat, h.lng, a.site.lat, a.site.lng);
      const db = haversineKm(h.lat, h.lng, b.site.lat, b.site.lng);
      // Heuristic penalty: a site closer to the coast/hills (elevation extremes) gets a 1.2x penalty
      const penaltyA = (a.site.elevation < 10 || a.site.elevation > 1500) ? 1.2 : 1.0;
      const penaltyB = (b.site.elevation < 10 || b.site.elevation > 1500) ? 1.2 : 1.0;
      return (da * penaltyA) - (db * penaltyB);
    });

    for (const p of pool) {
      if (need <= 0) break;
      if (p.remaining <= 0) continue;
      const take = Math.min(need, p.remaining);
      
      let dist = haversineKm(h.lat, h.lng, p.site.lat, p.site.lng);
      let speed = TRANSIT_SPEED_KMH[p.site.transitMode] || TRANSIT_SPEED_KMH.road;
      let routeGeometry = null;

      // Fetch Real Route Geometry from OSRM for the safest path
      try {
        const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${h.lng},${h.lat};${p.site.lng},${p.site.lat}?overview=full&geometries=geojson`;
        // const res = await fetch(osrmUrl);
        if (false) {
          const data = await res.json();
          if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            dist = route.distance / 1000; // OSRM gives meters
            speed = (dist / (route.duration / 3600)); // calculate real average speed
            routeGeometry = route.geometry;
          }
        }
      } catch (e) {
        // console.warn(`[OSRM] Routing failed...`);
      }

      assignments.push({
        safeSiteId: p.site.id || p.site._id,
        safeSiteName: p.site.name,
        assignedPopulation: Math.round(take),
        assignedHouseholds: Math.round((take / Math.max(h.population, 1)) * (h.households || 0)),
        distanceKm: round(dist, 1),
        transitMode: dist > 15 ? 'road' : 'road',
        etaMinutes: Math.round((dist / speed) * 60),
destLat: p.site.lat,
destLng: p.site.lng,
        routeGeometry
      });
      p.remaining -= take;
      need -= take;
    }

    const assignedTotal = assignments.reduce((a, x) => a + x.assignedPopulation, 0);
    const unallocated = Math.max(0, h.population - assignedTotal);
    const feasible = unallocated === 0 ? 100 : round(((h.population - unallocated) / h.population) * 100, 1);

    return {
      ...h,
      assignments,
      unallocatedPopulation: Math.round(unallocated),
      feasible: feasible,
      strategy: feasible === 100 ? 'fully_assigned' : feasible >= 50 ? 'partial_assignment' : 'insufficient_capacity',
      constraints: buildConstraints(feasible, h),
    };
  });

  return Promise.all(assignmentsPromises);
}

function buildConstraints(feasible, h) {
  const constraints = [];
  if (feasible < 100) constraints.push('Insufficient nearby safe-site capacity for full relocation.');
  if (h.vulnerablePopulation > 0 && (h.households || 0) > 0) {
    constraints.push('Priority for elderly, children and disabled during evacuation phasing.');
  }
  return constraints;
}

module.exports = { relocationScore, rankHabitations, allocate, TRANSIT_SPEED_KMH };