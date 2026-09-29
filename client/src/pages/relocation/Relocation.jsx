import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analysisApi, relocationApi, dataApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, StatCard, Badge, Spinner, StateDistrictSelector, PageHeader, EmptyState } from '../../components/ui';
import RiskMap from '../../components/map/RiskMap';
import { Truck, Users, Activity, Flag, AlertTriangle , LayoutTemplate, MapPin, Map } from "lucide-react";

export default function Relocation() {
  const { centers, districtMeta, getStateForDistrict, selectedDistrict: district, setSelectedDistrict } = useDistricts();
  const [priority, setPriority] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [safeSites, setSafeSites] = useState([]);

  
  const fetchOsrmRoute = async (hIndex, aIndex) => {
    const h = priority[hIndex];
    const a = h.assignments[aIndex];
    if (a.routeGeometry) return;
    try {
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${h.lng},${h.lat};${a.destLng},${a.destLat}?overview=full&geometries=geojson`;
      const res = await fetch(osrmUrl);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setPriority(prev => {
          const newPriority = [...prev];
          newPriority[hIndex] = {
            ...newPriority[hIndex],
            assignments: newPriority[hIndex].assignments.map((assign, i) => 
              i === aIndex ? { ...assign, routeGeometry: route.geometry } : assign
            )
          };
          return newPriority;
        });
      }
    } catch (e) {
      console.error("OSRM Fetch Failed", e);
      alert("Failed to load OSRM route. The demo server might be rate limited.");
    }
  };

  const load = (d) => {
    if (!d || d === 'All') {
      setPriority([]);
      setSummary(null);
      setSafeSites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    Promise.all([
      analysisApi.relocation(d),
      dataApi.sites({ district: d }),
    ]).then(([relRes, sitesRes]) => {
      const priority = (relRes && relRes.data && relRes.data.priority) || [];
      const summary = (relRes && relRes.data && relRes.data.summary) || null;
      const sites = (sitesRes && (sitesRes.data || sitesRes.sites)) || [];
      setPriority(priority);
      setSummary(summary);
      setSafeSites(sites);
      setLoading(false);
    }).catch(() => {
      setPriority([]);
      setSummary(null);
      setSafeSites([]);
      setLoading(false);
    });
  };
  useEffect(() => { load(district); }, [district]);

  const districtCenter = (district && centers[district]) || [22.0, 79.0];
  const currentMeta = district ? (districtMeta[district] || {}) : {};
  const currentState = currentMeta.state || getStateForDistrict(district) || '';

  const generate = async () => {
    if (!district || district === 'All') {
      alert('Please select a specific State and District first before generating relocation plans.');
      return;
    }

    setGenerating(true);
    try {
      const res = await relocationApi.generate(district);
      setSavedId(res.data?.[0]?.id || null);
      alert(`Relocation report generated! ${res.count} plan(s) have been saved to the database. You can view and manage them in the Reports tab.`);
    } catch (e) {
      alert('Could not generate plan — please ensure the server is running with npm run start.');
    } finally {
      setGenerating(false);
    }
  };

  const s = summary || {};
  return (
    <div className="space-y-5 fade-up">
      <PageHeader
        icon={<LayoutTemplate className="w-5 h-5 text-brand-500" />}
        title="Relocation Priority & Evacuation"
        subtitle="Computed via CCNN (Capacity-Constrained Nearest Neighbor) Spatial Allocation"
        right={
          <div className="flex flex-wrap gap-2.5 items-center">
            <StateDistrictSelector value={district} onChange={setSelectedDistrict} />
            <button className="btn-primary" onClick={generate} disabled={generating || !district || district === 'All'}>
                {generating ? 'Generating...' : 'Generate Plans'}
              </button>
          </div>
        }
      />

      {!district || district === 'All' ? (
        <EmptyState
          icon={<LayoutTemplate className="w-5 h-5 text-brand-500" />}
          title="Select a District"
          message="Please choose a State and District using the selector above to calculate relocation priorities and evacuation shelter matching."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="People to relocate" value={s.totalPopulation?.toLocaleString() || 0} icon={<Users className="w-5 h-5"/>} color="text-risk-orange" />
            <StatCard label="Need shelter" value={s.totalVulnerable?.toLocaleString() || 0} icon={<Activity className="w-5 h-5"/>} color="text-risk-yellow" />
            <StatCard label="Red zones" value={s.redZoneCount || 0} icon={<Flag className="w-5 h-5"/>} color="text-risk-red" />
            <StatCard label="Capacity gap" value={s.capacityGap?.toLocaleString() || 0} icon={<AlertTriangle className="w-5 h-5"/>} color={s.capacityGap > 0 ? 'text-risk-red' : 'text-emerald-600'} />
          </div>

          <Card title="Relocation zone map" subtitle="Red-zone habitations (pins) & safe sites (circles)">
            <div className="h-[520px] rounded-xl overflow-hidden border border-slate-200">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center bg-slate-50">
                  <Spinner label="Loading relocation routing map…" />
                </div>
              ) : (
                <RiskMap
                  zones={priority}
                  sites={safeSites}
                  center={districtCenter}
                  zoom={11}
                  districtName={district}
                  stateName={currentState}
                  showDistrictCircle={true}
                  showRiskCircles={true}
                  showPins={true}
                  showSites={true}
                />
              )}
            </div>
          </Card>

          <Card title="Relocation priority ranking" subtitle="Highest urgency first">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-100">
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">#</th>
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Habitation</th>
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Population</th>
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Risk</th>
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Vuln</th>
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Priority Score</th>
                    <th className="py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Site Assignment</th>
                  </tr>
                </thead>
                <tbody>
                  {priority.length ? priority.map((h, i) => (
                    <tr key={h.habitationId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pr-4 text-slate-400 font-medium">{i + 1}</td>
                      <td className="py-3 pr-4 font-semibold text-slate-800">{h.habitation}</td>
                      <td className="py-3 pr-4 tabular-nums font-medium text-slate-600">{(h.population || 0).toLocaleString()}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{h.riskScore ?? '—'}</span>
                          {h.riskClass && <Badge tone={h.riskClass.toLowerCase()}>{h.riskClass}</Badge>}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{h.vulnerabilityScore ?? '—'}</span>
                          {h.vulnerabilityClass && <Badge tone="slate">{h.vulnerabilityClass}</Badge>}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-red-100 text-red-800 font-bold tabular-nums">
                          {h.relocationScore ?? '—'}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600">
                        {(h.assignments || []).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {h.assignments.map((a, idx) => (
                              <div key={idx} className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded text-xs font-medium flex flex-col items-start gap-1 w-full max-w-[250px]">
                                  <span>{a.safeSiteName} ({a.assignedPopulation} pax)</span>
                                  <div className="flex flex-wrap items-center justify-between w-full border-t border-emerald-200/50 pt-1 gap-2">
                                    <span className="text-[10px] text-emerald-600 font-mono leading-none">{a.distanceKm}km &bull; ETA {a.etaMinutes}m</span>
                                    <button 
                                        onClick={(e) => { e.preventDefault(); fetchOsrmRoute(i, idx); }}
                                        disabled={!!a.routeGeometry}
                                        className="w-full mt-2 text-xs font-bold bg-emerald-600 text-white border border-emerald-700 hover:bg-emerald-700 disabled:bg-emerald-200 disabled:border-emerald-200 disabled:text-emerald-600 px-3 py-1.5 rounded shadow-sm transition-all cursor-pointer flex justify-center items-center gap-1"
                                      >
                                        {a.routeGeometry ? <><MapPin className="w-3 h-3" /> Route Mapped</> : <><Map className="w-3 h-3" /> Load OSRM Route</>}
                                      </button>
                                  </div>
                                </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-red-500 font-medium text-xs bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            {h.unallocatedPopulation ?? 0} unassigned
                          </span>
                        )}
                      </td>
                    </tr>
                  )) : <tr><td colSpan="7" className="py-8 text-center text-sm text-slate-400">No relocation candidates in this district.</td></tr>}
                </tbody>
              </table>
            </div>
          </Card>

          {savedId && (
            <Card className="bg-emerald-50 border border-emerald-200">
              <p className="text-sm text-emerald-800 font-medium">
                Plan generated and saved with ID <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-100 mx-1">{savedId}</span>
                <Link className="text-emerald-700 underline ml-2 hover:text-emerald-900" to="/reports">View in Reports →</Link>
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}