import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analysisApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, StatCard, Spinner, Badge, StateDistrictSelector, EmptyState, PageHeader } from '../../components/ui';
import { RiskDistributionChart, DonutChart, RISK_COLORS } from '../../components/charts';
import {
  Home, AlertTriangle, Users, LifeBuoy, Scale, ShieldAlert,
  CloudSun, RefreshCw, ArrowUpRight,
  LayoutTemplate} from 'lucide-react';

export default function Dashboard() {
  const { selectedDistrict: district, setSelectedDistrict } = useDistricts();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [syncing, setSyncing] = useState(false);
  const [syncMsg, setSyncMsg] = useState('');
  


  const fetchData = (d) => {
    if (!d || d === 'All') { setData(null); setLoading(false); return; }
    setLoading(true); setError('');
    analysisApi.districtAnalysis(d)
      .then(res => setData(res?.analysis || null))
      .catch(() => setError('Could not load analysis. Is the backend running?'))
      .finally(() => setLoading(false));
    
  };

  useEffect(() => { fetchData(district); }, [district]);

  const handleSync = async () => {
    if (!district || district === 'All') return;
    setSyncing(true); setSyncMsg('');
    try {
      const res = await analysisApi.districtAnalysis(district);
      if (res?.analysis) { setData(res.analysis); setSyncMsg('Synced successfully'); }
      setTimeout(() => setSyncMsg(''), 3500);
    } catch { setSyncMsg('Sync failed — using cached data'); }
    finally { setSyncing(false); }
  };

  const s = data?.summary || {};
  const liveTel = data?.liveTelemetry;

  const riskRows = ['RED', 'ORANGE', 'YELLOW', 'GREEN'].map(k => ({
    name: k, value: s[`${k.toLowerCase()}Count`] || 0,
  }));
  const vulnRows = [
    { name: 'Critical', value: s.vulnerabilityByClass?.critical || 0 },
    { name: 'High',     value: s.vulnerabilityByClass?.high || 0 },
    { name: 'Moderate', value: s.vulnerabilityByClass?.moderate || 0 },
    { name: 'Low',      value: s.vulnerabilityByClass?.low || 0 },
  ].filter(x => x.value > 0);

  return (
    <div className="space-y-5 fade-up">
      {/* ── Hero Header ─────────────────────────────────── */}
      <div className="card-glass p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Decision-Support Dashboard</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Real-time multi-hazard risk · vulnerability · carrying capacity
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <StateDistrictSelector value={district} onChange={setSelectedDistrict} />
            {district && district !== 'All' && (
              <button
                onClick={handleSync}
                disabled={syncing}
                className="btn-outline gap-2 whitespace-nowrap"
                title="Refresh live data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{syncing ? 'Syncing…' : 'Sync'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sync / error toasts */}
      {syncMsg && (
        <div className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
          {syncMsg}
        </div>
      )}
      {error && (
        <div className="text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-2.5">
          {error}
        </div>
      )}

      {loading ? (
        <Spinner label="Computing live hazard analysis…" />
      ) : !district ? (
        <EmptyState
          icon={<LayoutTemplate className="w-5 h-5 text-brand-500" />}
          title="Select a District to Begin"
          message="Use the State and District selector above to view real-time multi-hazard risk zonation, vulnerable habitations, and carrying-capacity analytics."
        />
      ) : (
        <>
          {/* ── Live Weather Bar ──────────────────────────── */}
          {liveTel && (
            <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-sky-50 flex items-center justify-center">
                  <CloudSun className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-800 text-sm">{district} Weather (Open-Meteo)</span>
                    <Badge tone={
                      liveTel.imdAlertLevel === 'RED'    ? 'red' :
                      liveTel.imdAlertLevel === 'ORANGE' ? 'orange' :
                      liveTel.imdAlertLevel === 'YELLOW' ? 'yellow' : 'green'
                    }>
                      IMD {liveTel.imdAlertLevel}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{liveTel.alertDescription || 'Normal operations'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {[
                  { label: 'Rain/h',  value: `${liveTel.precipitationMm ?? 0} mm`,     color: 'text-sky-600' },
                  { label: '24h Sum', value: `${liveTel.dailyPrecipitationSumMm ?? 0} mm`, color: 'text-sky-600' },
                  { label: 'Soil',    value: `${Math.round((liveTel.soilMoisture ?? 0.25)*100)}%`, color: 'text-emerald-600' },
                  { label: 'Temp',    value: `${liveTel.temperatureC ?? 24}°C`,          color: 'text-amber-600' },
                ].map(item => (
                  <div key={item.label} className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{item.label}</div>
                    <div className={`font-bold text-sm mt-0.5 ${item.color}`}>{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Stat Cards ────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
            <StatCard label="Habitations"  value={s.totalHabitations}  icon={<Home className="w-5 h-5"/>} color="text-brand-600" />
            <StatCard label="Red Zones"    value={s.redZoneCount}       icon={<AlertTriangle className="w-5 h-5"/>} color="text-risk-red" sub="Critical risk" />
            <StatCard label="Exposed Pop"  value={s.totalPopulationExposed?.toLocaleString()} icon={<Users className="w-5 h-5"/>} color="text-risk-orange" />
            <StatCard label="Vulnerable"   value={s.totalVulnerable?.toLocaleString()} icon={<LifeBuoy className="w-5 h-5"/>} color="text-risk-yellow" />
            <StatCard label="Capacity"     value={s.capacityAvailable?.toLocaleString()} icon={<Scale className="w-5 h-5"/>} color="text-sky-500" />
            <StatCard label="Cap. Gap"     value={s.capacityGap?.toLocaleString()} icon={<ShieldAlert className="w-5 h-5"/>}
              color={s.capacityGap > 0 ? 'text-risk-red' : 'text-emerald-600'} sub={s.capacityGap > 0 ? 'Insufficient' : 'Sufficient'} />
          </div>

          {/* ── Charts ───────────────────────────────────── */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card title="Risk Zone Distribution" subtitle={`Habitations by risk class · ${district}`}>
              <RiskDistributionChart data={riskRows} />
            </Card>
            <Card
              title="Vulnerability by Class"
              subtitle="People needing priority support"
              right={<Badge tone={s.capacityGap > 0 ? 'red' : 'green'}>{s.capacityGap > 0 ? 'Capacity Gap' : 'Sufficient'}</Badge>}
            >
              {vulnRows.length ? (
                <DonutChart data={vulnRows} colors={[RISK_COLORS.RED, RISK_COLORS.ORANGE, RISK_COLORS.YELLOW, RISK_COLORS.GREEN]} />
              ) : (
                <p className="text-sm text-slate-400 py-10 text-center">No vulnerability data.</p>
              )}
            </Card>
          </div>

          {/* ── Red Zone Register ─────────────────────────── */}
          <Card
            title="Red-Zone Risk Register"
            subtitle="Highest-risk habitations requiring immediate action"
            right={<Link to="/red-zones" className="text-xs text-brand-600 font-semibold hover:underline flex items-center gap-1">View All <ArrowUpRight className="w-3 h-3"/></Link>}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-100">
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Habitation</th>
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Hazards</th>
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Exposed</th>
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Score</th>
                    <th className="py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Zone</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.redZones || []).slice(0, 6).map((r) => (
                    <tr key={r.zone.habitationId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                      <td className="py-3 pr-4">
                        <Link
                          to={`/habitations/${r.zone.habitationId}`}
                          className="font-semibold text-slate-800 group-hover:text-brand-600 transition-colors flex items-center gap-1"
                        >
                          {r.zone.habitation}
                          <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </td>
                      <td className="py-3 pr-4 text-slate-500">{r.zone.mainHazards.join(', ')}</td>
                      <td className="py-3 pr-4 text-slate-600 font-medium tabular-nums">{r.zone.populationExposed.toLocaleString()}</td>
                      <td className="py-3 pr-4 font-bold text-slate-800">{r.zone.riskScore}</td>
                      <td className="py-3">
                        <Badge tone={r.zone.riskClass.toLowerCase()}>{r.zone.riskClass}</Badge>
                      </td>
                    </tr>
                  ))}
                  {(data?.redZones || []).length === 0 && (
                    <tr><td colSpan="5" className="py-8 text-center text-sm text-slate-400">No critical zones found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
