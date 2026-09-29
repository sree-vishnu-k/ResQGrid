// IndiaRiskMap.jsx
// Lightweight district-aggregated zone map for the national view.
// Renders one coloured circle per district (~160) instead of per habitation (6000+).

import { useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';

const RISK_COLOR = {
  RED:    { fill: '#ef4444', border: '#b91c1c', shadow: 'rgba(239, 68, 68, 0.4)' },
  ORANGE: { fill: '#f97316', border: '#c2410c', shadow: 'rgba(249, 115, 22, 0.4)' },
  YELLOW: { fill: '#eab308', border: '#a16207', shadow: 'rgba(234, 179, 8, 0.4)' },
  GREEN:  { fill: '#22c55e', border: '#15803d', shadow: 'rgba(34, 197, 94, 0.4)' },
};

const PRIORITY = { RED: 4, ORANGE: 3, YELLOW: 2, GREEN: 1 };

export default function IndiaRiskMap({ zones = [], filter = 'ALL', centers = {} }) {
  const navigate = useNavigate();

  const districtData = useMemo(() => {
    const map = {};
    for (const z of zones) {
      const key = z.district;
      if (!key) continue;
      
      const c = centers[key];
      // Only include districts that are officially available in the Red Zones map (registry)
      if (!c) continue; 

      if (!map[key]) {
        map[key] = {
          district: z.district,
          state: z.state,
          lat: c[0],
          lng: c[1],
          worstClass: z.riskClass,
          total: 0,
          red: 0, orange: 0, yellow: 0, green: 0,
        };
      }
      const d = map[key];
      d.total++;
      const cls = (z.riskClass || 'GREEN').toLowerCase();
      if (d[cls] !== undefined) d[cls]++;
      if ((PRIORITY[z.riskClass] || 0) > (PRIORITY[d.worstClass] || 0)) {
        d.worstClass = z.riskClass;
      }
    }
    return Object.values(map);
  }, [zones, centers]);

  const visible = useMemo(() => {
    if (filter === 'ALL') return districtData;
    return districtData.filter(d => d.worstClass === filter);
  }, [districtData, filter]);

  const handleClick = useCallback((d) => {
    navigate(`/red-zones?district=${encodeURIComponent(d.district)}`);
  }, [navigate]);

  return (
    <MapContainer
      center={[22.5, 82.0]}
      zoom={5}
      minZoom={4}
      maxZoom={10}
      style={{ height: '100%', width: '100%', background: '#f8fafc' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        attribution='Tiles &copy; Esri'
      />
      <TileLayer
        url="https://services.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
        attribution='Labels &copy; Esri'
      />

      {visible.map((d) => {
        const cls = filter === 'ALL' ? d.worstClass : filter;
        const color = RISK_COLOR[cls] || RISK_COLOR.GREEN;
        
        // Dynamic sizing based on habitation count
        const baseSize = Math.min(28, Math.max(16, 12 + Math.log2(d.total + 1) * 3));
        const innerSize = baseSize * 0.55;

        // Modern UI marker with pulse effect for Red/Orange zones
        const isCritical = cls === 'RED' || cls === 'ORANGE';
        
        const html = `
          <div class="relative flex items-center justify-center w-full h-full cursor-pointer group">
            ${isCritical ? `<div class="absolute w-full h-full rounded-full opacity-40 animate-ping" style="background-color: ${color.fill}"></div>` : ''}
            <div class="absolute rounded-full transition-transform duration-500 ease-out group-hover:scale-125" 
                 style="width: ${innerSize}px; height: ${innerSize}px; background: linear-gradient(135deg, ${color.fill}, ${color.border}); border: 1.5px solid rgba(255,255,255,0.9); box-shadow: 0 4px 12px ${color.shadow}, inset 0 -2px 4px rgba(0,0,0,0.15)">
            </div>
          </div>
        `;

        const icon = L.divIcon({
          html,
          className: 'bg-transparent border-0',
          iconSize: [baseSize, baseSize],
          iconAnchor: [baseSize / 2, baseSize / 2]
        });

        return (
          <Marker
            key={d.district}
            position={[d.lat, d.lng]}
            icon={icon}
            eventHandlers={{ click: () => handleClick(d) }}
          >
            <Tooltip sticky direction="top" opacity={1} className="!bg-white/80 !backdrop-blur-xl !border !border-white/60 !shadow-[0_8px_30px_rgb(0,0,0,0.12)] !rounded-2xl !p-0 overflow-hidden">
              <div className="w-[180px] p-3 font-sans">
                <div className="flex flex-col mb-3">
                  <span className="text-[15px] font-bold text-slate-900 tracking-tight leading-tight">{d.district}</span>
                  <span className="text-[11px] font-medium text-slate-500">{d.state}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-x-2 gap-y-2 mb-3">
                  <div className="flex flex-col bg-red-50/50 rounded-lg p-1.5 border border-red-100/50">
                    <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider">Red</span>
                    <span className="text-red-600 font-bold text-sm leading-none mt-0.5">{d.red}</span>
                  </div>
                  <div className="flex flex-col bg-orange-50/50 rounded-lg p-1.5 border border-orange-100/50">
                    <span className="text-[9px] text-orange-400 font-bold uppercase tracking-wider">Orange</span>
                    <span className="text-orange-600 font-bold text-sm leading-none mt-0.5">{d.orange}</span>
                  </div>
                  <div className="flex flex-col bg-yellow-50/50 rounded-lg p-1.5 border border-yellow-100/50">
                    <span className="text-[9px] text-yellow-500 font-bold uppercase tracking-wider">Yellow</span>
                    <span className="text-yellow-600 font-bold text-sm leading-none mt-0.5">{d.yellow}</span>
                  </div>
                  <div className="flex flex-col bg-emerald-50/50 rounded-lg p-1.5 border border-emerald-100/50">
                    <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider">Green</span>
                    <span className="text-emerald-600 font-bold text-sm leading-none mt-0.5">{d.green}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/50 flex items-center justify-between text-brand-600 group-hover:text-brand-700 transition-colors cursor-pointer">
                  <span className="text-xs font-semibold">View Details</span>
                  <span className="text-lg leading-none">→</span>
                </div>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
