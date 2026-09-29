import { useEffect, useState } from 'react';
import { Map as MapIcon, Filter } from 'lucide-react';
import { analysisApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import IndiaRiskMap from '../../components/map/IndiaRiskMap';
import { Spinner } from '../../components/ui';

export default function MapView() {
  const { centers } = useDistricts();
  const [zones, setZones] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    setLoading(true);
    analysisApi.indiaAnalysis()
      .then(res => {
        const mapped = (res.zones || []).map(z => ({
          ...z,
          riskClass: z.zoneClass,
        }));
        setZones(mapped);
      })
      .catch(() => setZones([]))
      .finally(() => setLoading(false));
  }, []);

  // Calculate counts based on district worstClass (since the map renders districts, not habitations)
  let total = 0, red = 0, orange = 0, yellow = 0, green = 0;
  if (zones) {
    const PRIORITY = { RED: 4, ORANGE: 3, YELLOW: 2, GREEN: 1 };
    const distMap = {};
    for (const z of zones) {
      if (!z.district || !centers[z.district]) continue;
      if (!distMap[z.district]) distMap[z.district] = z.riskClass;
      if ((PRIORITY[z.riskClass] || 0) > (PRIORITY[distMap[z.district]] || 0)) {
        distMap[z.district] = z.riskClass;
      }
    }
    const grouped = Object.values(distMap);
    total = grouped.length;
    red = grouped.filter(c => c === 'RED').length;
    orange = grouped.filter(c => c === 'ORANGE').length;
    yellow = grouped.filter(c => c === 'YELLOW').length;
    green = grouped.filter(c => c === 'GREEN').length;
  }

  const FILTERS = [
    { key: 'ALL',    label: 'All',    count: total,  active: 'bg-slate-800 text-white' },
    { key: 'RED',    label: 'Red',    count: red,    active: 'bg-red-500 text-white' },
    { key: 'ORANGE', label: 'Orange', count: orange, active: 'bg-orange-500 text-white' },
    { key: 'YELLOW', label: 'Yellow', count: yellow, active: 'bg-yellow-400 text-white' },
    { key: 'GREEN',  label: 'Green',  count: green,  active: 'bg-emerald-500 text-white' },
  ];

  return (
    <div className="space-y-4 fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-brand-600">
            <MapIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">India GIS Zone Map</h2>
            <p className="text-sm text-slate-500">National risk zone classification by district</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card h-[75vh] flex flex-col items-center justify-center space-y-4">
          <Spinner />
          <div className="text-slate-500 animate-pulse">Loading national zone data...</div>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden relative shadow-md" style={{ height: 'calc(100vh - 160px)' }}>
          {/* Filter bar */}
          <div className="absolute top-3 left-3 z-[400] bg-white/95 backdrop-blur rounded-lg shadow border border-slate-200 p-1.5 flex items-center gap-1.5">
            <div className="flex items-center gap-1.5 px-2 border-r border-slate-200 mr-0.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Zones</span>
            </div>
            {FILTERS.map(({ key, label, count, active }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 text-xs font-bold rounded transition-all ${
                  filter === key ? active : 'bg-transparent text-slate-500 hover:bg-slate-100'
                }`}
              >
                {label}
                <span className="ml-1 opacity-70 font-normal">({count})</span>
              </button>
            ))}
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 right-3 z-[400] bg-white/95 backdrop-blur rounded-lg shadow border border-slate-200 p-2.5 flex flex-col gap-1.5">
            {[
              { color: 'bg-red-500',     label: 'Critical (RED)' },
              { color: 'bg-orange-500',  label: 'High (ORANGE)' },
              { color: 'bg-yellow-400',  label: 'Moderate (YELLOW)' },
              { color: 'bg-emerald-500', label: 'Stable (GREEN)' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${color} opacity-90 flex-shrink-0`} />
                <span className="text-[11px] text-slate-600 font-medium">{label}</span>
              </div>
            ))}
            <div className="text-[10px] text-slate-400 mt-1 border-t border-slate-100 pt-1">One dot = one district</div>
          </div>

          {/* Full-screen India map */}
          <IndiaRiskMap zones={zones || []} filter={filter} centers={centers} />
        </div>
      )}
    </div>
  );
}