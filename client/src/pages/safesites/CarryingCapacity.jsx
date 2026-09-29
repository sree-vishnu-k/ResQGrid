import { useEffect, useState } from 'react';
import { analysisApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, StatCard, Badge, Spinner, StateDistrictSelector, PageHeader, EmptyState } from '../../components/ui';
import { DonutChart } from '../../components/charts';
import { Scale, Users, ShieldAlert, CheckCircle2 , LayoutTemplate } from "lucide-react";

export default function CarryingCapacity() {
  const { selectedDistrict: district, setSelectedDistrict } = useDistricts();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!district || district === 'All') {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    analysisApi
      .capacity(district)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [district]);

  const d = data || {};

  return (
    <div className="space-y-5 fade-up">
      <PageHeader
        icon={<LayoutTemplate className="w-5 h-5 text-brand-500" />}
        title="Carrying-Capacity Assessment"
        subtitle="Safe-site carrying capacity vs. exposed population requiring shelter"
        right={<StateDistrictSelector value={district} onChange={setSelectedDistrict} />}
      />

      {loading ? (
        <Spinner label="Assessing capacity vs demand…" />
      ) : !district || district === 'All' ? (
        <EmptyState
          icon={<LayoutTemplate className="w-5 h-5 text-brand-500" />}
          title="Select a District"
          message="Please choose a State and District using the selector above to assess safe shelter carrying capacity vs. displaced population demand."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Demand (exposed)" value={d.demandPopulation?.toLocaleString() || 0} icon={<Users className="w-5 h-5"/>} color="text-risk-orange" />
            <StatCard label="Total capacity" value={d.totalCapacity?.toLocaleString() || 0} icon={<Scale className="w-5 h-5"/>} color="text-sky-500" />
            <StatCard label="Available capacity" value={d.totalAvailable?.toLocaleString() || 0} icon={<CheckCircle2 className="w-5 h-5"/>} color="text-emerald-600" />
            <StatCard label="Capacity gap" value={d.capacityGap?.toLocaleString() || 0} icon={<ShieldAlert className="w-5 h-5"/>} color={d.capacityGap > 0 ? 'text-risk-red' : 'text-emerald-600'} />
          </div>

          <Card
            title="Capacity Sufficiency"
            subtitle="Current operational readiness for full relocation"
            right={
              <Badge tone={d.capacityGap > 0 ? 'red' : 'green'}>
                {d.capacityGap > 0 ? 'Insufficient — relocation blocked' : 'Sufficient'}
              </Badge>
            }
          >
            <div className="grid md:grid-cols-2 gap-6 items-center py-4">
              <div className="h-56">
                <DonutChart
                  data={[
                    { name: 'Available', value: d.totalAvailable || 0 },
                    { name: 'Occupied', value: Math.max(0, (d.totalCapacity || 0) - (d.totalAvailable || 0)) },
                  ]}
                  colors={['#16a34a', '#cbd5e1']}
                />
              </div>
              <div className="space-y-4 pr-6">
                <Bar label="Population Demand" value={d.demandPopulation || 0} max={Math.max(d.totalCapacity, d.demandPopulation, 1)} color="bg-orange-500" />
                <Bar label="Total Capacity" value={d.totalCapacity || 0} max={Math.max(d.totalCapacity, d.demandPopulation, 1)} color="bg-sky-500" />
                <Bar label="Available Capacity" value={d.totalAvailable || 0} max={Math.max(d.totalCapacity, d.demandPopulation, 1)} color="bg-emerald-500" />
                <Bar label="Gap (Deficit)" value={d.capacityGap || 0} max={Math.max(d.totalCapacity, d.demandPopulation, 1)} color="bg-red-500" />
              </div>
            </div>
          </Card>

          <Card title="Resource Readiness by Site">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-slate-100">
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Site</th>
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">Suitability</th>
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">Water</th>
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">Housing</th>
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">Healthcare</th>
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">Sanitation</th>
                    <th className="py-2.5 pr-4 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">Food/Log</th>
                    <th className="py-2.5 text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">Roads</th>
                  </tr>
                </thead>
                <tbody>
                  {(d.sites || []).map((s) => (
                    <tr key={s.safeSiteId} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 pr-4 font-semibold text-slate-800">{s.name}</td>
                      <td className="py-3 pr-4 text-center">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-semibold text-slate-600">{Math.round(s.suitability || 0)}</span>
                      </td>
                      <td className="py-3 pr-4 text-center font-medium text-slate-600">{s.resources?.find((r) => r.key === 'waterAvailability')?.score || 0}</td>
                      <td className="py-3 pr-4 text-center font-medium text-slate-600">{s.resources?.find((r) => r.key === 'housing')?.score || 0}</td>
                      <td className="py-3 pr-4 text-center font-medium text-slate-600">{s.resources?.find((r) => r.key === 'healthcare')?.score || 0}</td>
                      <td className="py-3 pr-4 text-center font-medium text-slate-600">{s.resources?.find((r) => r.key === 'sanitation')?.score || 0}</td>
                      <td className="py-3 pr-4 text-center font-medium text-slate-600">{s.resources?.find((r) => r.key === 'foodLogistics')?.score || 0}</td>
                      <td className="py-3 text-center font-medium text-slate-600">{s.resources?.find((r) => r.key === 'roadConnectivity')?.score || 0}</td>
                    </tr>
                  ))}
                  {(d.sites || []).length === 0 && (
                    <tr><td colSpan="8" className="py-8 text-center text-sm text-slate-400">No sites available in this district.</td></tr>
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

function Bar({ label, value, max, color }) {
  const pct = max ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
        <span>{label}</span>
        <span className="text-slate-800 tabular-nums">{value?.toLocaleString() || 0}</span>
      </div>
      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
    </div>
  );
}
