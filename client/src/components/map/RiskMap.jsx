import { useEffect, useState, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  WMSTileLayer,
  Marker,
  Popup,
  Circle,
  Tooltip,
  useMap,
  Polyline,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { Layers, Map as MapIcon, Globe, Navigation, ShieldCheck, Activity } from 'lucide-react';

// Fix default leaflet icon URLs for modern bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export const RISK_META = {
  RED: {
    color: '#dc2626',
    fillColor: '#ef4444',
    label: 'Critical / High Hazard',
    bg: 'bg-red-500',
    ring: 'border-red-500',
    badge: 'bg-red-100 text-red-700 border-red-300',
  },
  ORANGE: {
    color: '#ea580c',
    fillColor: '#f97316',
    label: 'High Hazard',
    bg: 'bg-orange-500',
    ring: 'border-orange-500',
    badge: 'bg-orange-100 text-orange-700 border-orange-300',
  },
  YELLOW: {
    color: '#ca8a04',
    fillColor: '#eab308',
    label: 'Moderate Hazard',
    bg: 'bg-yellow-500',
    ring: 'border-yellow-500',
    badge: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  },
  GREEN: {
    color: '#16a34a',
    fillColor: '#22c55e',
    label: 'Low Hazard / Stable',
    bg: 'bg-emerald-500',
    ring: 'border-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  },
};

// Real-world GIS basemap providers
export const MAP_LAYERS = {
  satellite: {
    name: 'Satellite Hybrid',
    icon: <Globe className="w-3.5 h-3.5" />,
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics',
    overlay: 'https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}',
    overlayAttribution: 'Labels &copy; Esri',
  },
  light: {
    name: 'Clean Light',
    icon: <MapIcon className="w-3.5 h-3.5" />,
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  },
  dark: {
    name: 'Dark Mode',
    icon: <Layers className="w-3.5 h-3.5" />,
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
  },
  topo: {
    name: 'Topographic Terrain',
    icon: <Layers className="w-3.5 h-3.5" />,
    base: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Esri, USGS, NOAA',
  }
};

// Custom risk teardrop pin with score badge
function createRiskPin(color, score) {
  return L.divIcon({
    className: 'risk-marker',
    html: `
      <div class="risk-pin" style="background:${color};">
        <span class="risk-pin-score">${score ?? ''}</span>
      </div>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 38],
    popupAnchor: [0, -36],
  });
}

// Safe site shelter icon pin
function createSafeSitePin() {
  return L.divIcon({
    className: 'site-marker',
    html: `<div class="site-pin shadow-md" title="Safe Site" style="display:flex;align-items:center;justify-center:center;background:#0ea5e9;color:white;border-radius:50%;width:26px;height:26px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin:auto"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg></div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
}

// Smooth animated camera flight
function MapFlyController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      map.flyTo(center, zoom || 11, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [center, zoom, map]);
  return null;
}

export default function RiskMap({
  zones = [],
  sites = [],
  center = [22.0, 79.0],
  zoom = 11,
  districtName = '',
  stateName = '',
  showSites = true,
  showDistrictCircle = true,
  showRiskCircles = true,
  showPins = true,
  showRelocationRoutes = true,
  onSelectZone,
  selectedId,
  className = '',
}) {
  const [activeLayer, setActiveLayer] = useState('satellite');
  const [showControls, setShowControls] = useState(true);
  const navigate = useNavigate();

  // Compute OSRM Relocation Routes
  const relocationRoutes = useMemo(() => {
    if (!showRelocationRoutes) return [];
    const routes = [];
    zones.forEach(z => {
      if (!z.assignments) return;
      
      const isSelected = selectedId === z.habitationId || selectedId === z.id;
      
      // DESIGN FIX: If a zone is selected, ONLY show its route. If none selected, show all very faintly.
      if (selectedId && !isSelected) return; 

      z.assignments.forEach(a => {
        let osrmPositions = [];
        let directPositions = [];
        
        if (a.destLat && a.destLng && z.lat && z.lng) {
          directPositions = [[z.lat, z.lng], [a.destLat, a.destLng]];
        }
        
        if (a.routeGeometry && a.routeGeometry.coordinates) {
          osrmPositions = a.routeGeometry.coordinates.map(c => [c[1], c[0]]);
        }
        
        const color = z.riskClass === 'RED' ? '#ef4444' : z.riskClass === 'ORANGE' ? '#f97316' : '#3b82f6';
        const baseOpacity = isSelected ? 1.0 : 0.15;
        const baseWeight = isSelected ? 4 : 2;
        
        // Draw the direct line (dashed)
        if (directPositions.length > 0) {
          routes.push({
            id: a.safeSiteId + '-' + Math.random() + '-direct',
            positions: directPositions,
            color: color,
            dashArray: '5, 8',
            weight: baseWeight - 1,
            opacity: baseOpacity * 0.7,
            label: `Distance: ${(a.distanceKm || 0).toFixed(1)} km`
          });
        }
        
        // Draw the OSRM route if loaded (solid)
        if (osrmPositions.length > 0) {
          routes.push({
            id: a.safeSiteId + '-' + Math.random() + '-osrm',
            positions: osrmPositions,
            color: color,
            weight: baseWeight,
            opacity: baseOpacity,
            label: `Road Route to ${a.safeSiteName}`
          });
        }
      });
    });
    return routes;
  }, [zones, showRelocationRoutes, selectedId]);

  // Compute live zone counts
  const counts = useMemo(() => {
    const res = { RED: 0, ORANGE: 0, YELLOW: 0, GREEN: 0 };
    zones.forEach((z) => {
      if (res[z.riskClass] !== undefined) res[z.riskClass]++;
    });
    return res;
  }, [zones]);

  // Determine highest risk level for district boundary styling
  const maxRiskClass = useMemo(() => {
    if (counts.RED > 0) return 'RED';
    if (counts.ORANGE > 0) return 'ORANGE';
    if (counts.YELLOW > 0) return 'YELLOW';
    return 'GREEN';
  }, [counts]);

  const layer = MAP_LAYERS[activeLayer] || MAP_LAYERS.satellite;

  const handleAnalysisClick = (z) => {
    if (onSelectZone) onSelectZone(z);
    navigate(`/habitations/${z.habitationId || z.id}`);
  };

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-xl ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%', minHeight: '480px' }}
        scrollWheelZoom
        preferCanvas={true} // ENABLES HARDWARE ACCELERATION FOR VECTORS!
      >
        {/* Base Real-World GIS Map Layer */}
        {layer.isWMS ? (
          <WMSTileLayer
            key={layer.base}
            url={layer.base}
            layers={layer.layers}
            format="image/png"
            transparent={true}
            attribution={layer.attribution}
          />
        ) : (
          <TileLayer
            key={layer.base}
            url={layer.base}
            attribution={layer.attribution}
            maxZoom={19}
          />
        )}

        {/* Satellite Labels / Boundaries Overlay */}
        {layer.overlay && (
          <TileLayer
            key={layer.overlay}
            url={layer.overlay}
            attribution={layer.overlayAttribution}
            maxZoom={19}
            className="pointer-events-none opacity-80"
          />
        )}

        <MapFlyController center={center} zoom={zoom} />

        {/* 1. DISTRICT BOUNDARY CIRCLE */}
        {showDistrictCircle && districtName && districtName !== 'All' && (() => {
          let maxDist = 25000;
          if (zones && zones.length > 0 && center) {
            zones.forEach(z => {
              const dLat = (z.lat - center[0]) * 111000; // rough meters
              const dLng = (z.lng - center[1]) * 111000 * Math.cos(center[0] * Math.PI / 180);
              const dist = Math.sqrt(dLat*dLat + dLng*dLng);
              if (dist > maxDist) maxDist = dist;
            });
          }
          return (
            <Circle
              center={center}
              radius={maxDist + 2000} // Add 2km padding so dots don't sit exactly on the line
              pathOptions={{
                color: RISK_META[maxRiskClass].color,
                fillColor: 'transparent',
                weight: 2,
                dashArray: '6, 8',
                opacity: 0.6,
              }}
            />
          );
        })()}

        {/* 2. HABITATIONS (PINS + RISK RADII) */}
        {zones.map((z) => {
          const pos = [z.lat, z.lng];
          const isSelected = selectedId === z.habitationId;
          const meta = RISK_META[z.riskClass] || RISK_META.GREEN;
          // Tighter dynamic blast/flood radius cap (max 4km) to stop visual spillover out of district bounds
          const impactRadius = Math.max(500, Math.min(4000, Math.sqrt(z.population || 1000) * 8));

          return (
            <div key={`zone-group-${z.habitationId}`}>
              {showRiskCircles && (
                <Circle
                  center={pos}
                  radius={impactRadius}
                  pathOptions={{
                    color: meta.color,
                    fillColor: meta.fillColor,
                    fillOpacity: isSelected ? 0.4 : 0.15,
                    weight: isSelected ? 2 : 1,
                  }}
                >
                  <Tooltip direction="top" opacity={0.9}>
                    <div className="font-semibold">{z.habitation}</div>
                    <div className="text-xs opacity-80">{meta.label}</div>
                  </Tooltip>
                </Circle>
              )}

              {showPins && (
                <Marker position={pos} icon={createRiskPin(meta.color, z.riskScore)}>
                  <Popup className="custom-popup">
                    <div className="p-1 min-w-[220px]">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm leading-tight">
                            {z.habitation}
                          </h4>
                          <div className="text-xs text-slate-500 mt-0.5">{z.district}, {z.state}</div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${meta.badge}`}>
                          {z.riskClass}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 mb-1">
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div className="text-slate-400 font-medium text-[10px] uppercase">Risk Score</div>
                          <div className="font-bold text-slate-700">{z.riskScore ?? 'N/A'}/100</div>
                        </div>
                        <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div className="text-slate-400 font-medium text-[10px] uppercase">Population</div>
                          <div className="font-bold text-slate-700">{(z.population || 0).toLocaleString()}</div>
                        </div>
                        {z.mainHazards && z.mainHazards.length > 0 && (
                          <div className="col-span-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <div className="text-slate-400 font-medium text-[10px] uppercase">Main Hazards</div>
                            <div className="font-medium text-slate-700 capitalize truncate flex items-center gap-1">
                              <Activity className="w-3 h-3 text-red-500" />
                              {z.mainHazards.join(', ')}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAnalysisClick(z)}
                        className="mt-3 w-full py-1.5 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-sm transition flex items-center justify-center gap-1"
                      >
                        <ShieldCheck className="w-4 h-4" /> View In-Depth Analysis
                      </button>
                    </div>
                  </Popup>
                </Marker>
              )}
            </div>
          );
        })}

        {/* 3. SAFE SITE CARRYING CAPACITY CIRCLES & MARKERS */}
        {showSites &&
          sites.map((s) => {
            const pos = [s.lat, s.lng];
            const cap = s.availableCapacity ?? s.maxPopulationCapacity ?? 500;
            const siteRadius = Math.min(1800, Math.max(500, Math.round(Math.sqrt(cap) * 30)));

            return (
              <div key={`site-group-${s.safeSiteId || s._id || s.id}-${s.lat}`}>
                {/* Safe buffer circle */}
                <Circle
                  center={pos}
                  radius={siteRadius}
                  pathOptions={{
                    color: '#0284c7',
                    fillColor: '#38bdf8',
                    fillOpacity: 0.2,
                    weight: 1.5,
                    dashArray: '4, 4',
                  }}
                >
                  <Tooltip direction="bottom" opacity={0.9}>
                    <div className="text-xs">
                      <span className="font-bold text-sky-900 flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> {s.name || s.siteName}</span>
                      <div className="text-sky-700">Capacity: {cap} persons</div>
                    </div>
                  </Tooltip>
                </Circle>

                {/* Safe site pin */}
                <Marker position={pos} icon={createSafeSitePin()}>
                  <Popup>
                    <div className="text-sm min-w-[200px] p-1">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck className="w-5 h-5 text-sky-600" />
                        <span className="font-bold text-slate-900 leading-snug">{s.name || s.siteName}</span>
                      </div>
                      <div className="text-slate-500 text-xs mt-0.5">{s.district} — Safe Shelter Site</div>

                      <div className="mt-2 text-xs bg-sky-50 text-sky-900 border border-sky-100 rounded-lg p-2 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Available Capacity:</span>
                          <span className="font-bold text-sky-800">{cap} persons</span>
                        </div>
                        {s.currentOccupancy !== undefined && (
                          <div className="flex justify-between">
                            <span className="text-slate-600">Current Occupancy:</span>
                            <span className="font-semibold">{s.currentOccupancy}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-600">Status:</span>
                          <span className="font-semibold text-emerald-700 capitalize">
                            {s.status || 'Operational'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              </div>
            );
          })}

        {/* 4. OSRM RELOCATION ROUTES (POLYLINES) */}
        {showRelocationRoutes && relocationRoutes.map((route) => (
          <Polyline
            key={route.id}
            positions={route.positions}
            pathOptions={{ color: route.color, weight: route.weight || 3, dashArray: route.dashArray || null, opacity: route.opacity || 0.8 }}
          >
            <Tooltip sticky className="font-mono text-xs font-semibold">{route.label}</Tooltip>
          </Polyline>
        ))}
      </MapContainer>

      {/* FLOATING REAL-WORLD BASEMAP SWITCHER */}
      <div className="absolute top-3 right-3 z-[1000] bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl shadow-lg p-1.5 flex items-center gap-1">
        {Object.entries(MAP_LAYERS).map(([k, l]) => (
          <button
            key={k}
            type="button"
            onClick={() => setActiveLayer(k)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeLayer === k
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
            title={l.name}
          >
            {l.icon}
            <span className="hidden sm:inline">{l.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {/* FLOATING LIVE ZONE COUNTER HUD */}
      <div className="absolute top-3 left-12 z-[1000] bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-xl shadow-md px-3 py-1.5 flex items-center gap-3 text-xs">
        <div className="font-bold text-slate-700 hidden md:block">
          {districtName ? `${districtName}` : 'All Zones'}:
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-red-600 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
            {counts.RED} Red
          </span>
          <span className="flex items-center gap-1 text-orange-600 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            {counts.ORANGE} Orange
          </span>
          <span className="flex items-center gap-1 text-yellow-700 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
            {counts.YELLOW} Yellow
          </span>
          <span className="flex items-center gap-1 text-emerald-600 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            {counts.GREEN} Green
          </span>
        </div>
      </div>
    </div>
  );
}

export function MapLegend({ className = '' }) {
  return (
    <div className={`card absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur-md px-3.5 py-2.5 text-xs space-y-1.5 shadow-lg border border-slate-200/90 rounded-xl max-w-[220px] ${className}`}>
      <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider flex items-center gap-1">
        <MapIcon className="w-3 h-3" /> GIS Risk Legend
      </div>
      <div className="space-y-1.5 pt-0.5">
        {Object.entries(RISK_META).map(([k, m]) => (
          <div key={k} className="flex items-center justify-between text-slate-700">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full border border-white shadow-sm" style={{ background: m.color }} />
              <span className="font-medium">{k}</span>
            </div>
            <span className="text-[11px] text-slate-500">{m.label.split('/')[0]}</span>
          </div>
        ))}
        <div className="border-t border-slate-200 pt-1 flex items-center justify-between text-slate-700">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-sky-500 border border-white shadow-sm" />
            <span className="font-medium">Safe Site</span>
          </div>
          <span className="text-[11px] text-slate-500">Relief / Camp</span>
        </div>
        <div className="flex items-center justify-between text-slate-700">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-dashed border-sky-400 bg-sky-100" />
            <span className="font-medium">District Zone</span>
          </div>
          <span className="text-[11px] text-slate-500">Radius Ring</span>
        </div>
      </div>
    </div>
  );
}