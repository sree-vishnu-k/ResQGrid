import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { dataApi, analysisApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, Badge, Spinner, EmptyState, PageHeader, InfoBox, StateDistrictSelector } from '../../components/ui';
import { ScoreGauge } from '../../components/charts';
import { ArrowLeft, ArrowUpRight, Search, LayoutTemplate, AlertTriangle, Activity } from "lucide-react";

export const HAZARDS_LABEL = {
  flood: 'Flood', landslide: 'Landslide', coastal_erosion: 'Coastal Erosion',
  cloudburst: 'Cloudburst', earthquake: 'Earthquake', cyclone: 'Cyclone',
  wildfire: 'Wildfire', drought: 'Drought', heatwave: 'Heatwave', avalanche: 'Avalanche',
};

const HAZARD_OPTIONS = ['All', 'flood', 'landslide', 'coastal_erosion', 'cloudburst', 'earthquake', 'cyclone'];

export default function Habitations() {
  const { id } = useParams();
  if (id) return <HabitationDetail id={id} />;
  return <HabitationList />;
}

function HabitationList() {
  const { districts, selectedDistrict, setSelectedDistrict } = useDistricts();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hazard, setHazard] = useState('');
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    const params = {};
    if (selectedDistrict && selectedDistrict !== 'All') params.district = selectedDistrict;
    if (hazard && hazard !== 'All') params.hazard = hazard;
    dataApi.habitations(params)
      .then(res => setRows(res.data || []))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [selectedDistrict, hazard]);

    const filtered = rows.filter(h =>
    !search || h.name?.toLowerCase().includes(search.toLowerCase()) || h.district?.toLowerCase().includes(search.toLowerCase())
  );

  const riskClass = (h) => {
    const score = h.riskScore || 0;
    if (score >= 7) return 'red';
    if (score >= 5) return 'orange';
    if (score >= 3) return 'yellow';
    return 'green';
  };

  return (
    <div className="space-y-5 fade-up">
      <PageHeader
        icon={<LayoutTemplate className="w-5 h-5 text-brand-500" />}
        title="Habitations"
        subtitle="Profiles assessed via Multi-Factor Dynamic HEV Risk Matrix"
        right={
          <div className="flex items-center gap-2 flex-wrap">
            <StateDistrictSelector value={selectedDistrict} onChange={setSelectedDistrict} />
            <select className="input w-auto text-sm" value={hazard} onChange={e => setHazard(e.target.value)}>
              {HAZARD_OPTIONS.map(h => <option key={h} value={h}>{h.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
        }
      />

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="input pl-10 w-full sm:max-w-sm"
          placeholder="Search habitations…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {loading ? <Spinner label="Loading habitations…" /> : (
        <Card
          title={`Registered Habitations`}
          subtitle={`${filtered.length} of ${rows.length} habitations`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Name</th>
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">District</th>
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Population</th>
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Hazards</th>
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Elevation</th>
                  <th className="py-3 pr-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Source</th>
                  <th className="py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length ? filtered.map(h => (
                  <tr key={h.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-3 pr-4">
                      <span className="font-semibold text-slate-800">{h.name}</span>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{h.district}</td>
                    <td className="py-3 pr-4 text-slate-700 font-medium tabular-nums">{(h.population || 0).toLocaleString()}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-wrap gap-1">
                        {(h.exposure || []).slice(0, 2).map(e => (
                          <Badge key={e.hazardType} tone="slate">{HAZARDS_LABEL[e.hazardType] || e.hazardType}</Badge>
                        ))}
                        {(h.exposure || []).length > 2 && <Badge tone="slate">+{h.exposure.length - 2}</Badge>}
                        {!(h.exposure || []).length && <span className="text-slate-400">—</span>}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{h.elevation ? `${h.elevation} m` : '—'}</td>
                    <td className="py-3 pr-4">
                      {h.dataSource && (
                        <Badge tone={h.dataSource === 'official' || h.dataSource?.includes('Census') ? 'green' : 'slate'}>
                          {h.dataSource?.includes('Census') ? 'Census' : h.dataSource}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        to={`/habitations/${h.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        View Analysis <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-sm text-slate-400">
                      No habitations match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function HabitationDetail({ id }) {
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    analysisApi.habitation(id)
      .then(res => setDoc(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spinner label="Loading habitation analysis…" />;
  if (!doc) return (
    <EmptyState icon={<LayoutTemplate className="w-5 h-5 text-brand-500" />} title="Habitation Not Found"
      message="This habitation record could not be loaded. It may have been removed or the ID is invalid." />
  );

  const { habitation, risk, vulnerability } = doc;
  const tone = (risk?.riskClass || 'GREEN').toLowerCase();

  return (
    <div className="space-y-5 fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => navigate('/habitations')} className="btn-outline gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold text-slate-800">{habitation.name}</h2>
            <Badge tone={tone} className="capitalize">{risk?.riskClass}</Badge>
            {habitation.dataSource && <Badge tone="slate">{habitation.dataSource?.includes('Census') ? 'Census 2011' : habitation.dataSource}</Badge>}
          </div>
          <p className="text-sm text-slate-500 mt-0.5">{habitation.district} · {habitation.state}</p>
        </div>
      </div>

      {/* Risk & Vulnerability */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card
          title="Risk Assessment"
          right={<Badge tone={tone} className="capitalize">{risk?.riskClass} Risk</Badge>}
        >
          <div className="flex items-center gap-5 flex-wrap">
            <ScoreGauge score={risk?.riskScore} color={risk?.color} label="Risk Score" />
            <div className="grid grid-cols-2 gap-2.5 flex-1 text-sm">
              <InfoBox label="Composite Hazard" value={risk?.compositeHazard} />
              <InfoBox label="Exposure Index" value={risk?.exposureIndex} />
              <InfoBox label="Infrastructure Risk" value={risk?.infrastructureRisk} />
              <InfoBox label="Terrain Risk" value={risk?.terrainRisk} />
              <InfoBox label="Pop. Exposed" value={risk?.populationExposed?.toLocaleString()} />
              <InfoBox label="Confidence" value={risk?.confidence ? (risk.confidence * 100).toFixed(0) + '%' : '—'} />
            </div>
          </div>
          {risk?.limitations?.length > 0 && (
            <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">Model Limitations</div>
              <ul className="text-xs text-slate-500 space-y-1">
                {risk.limitations.map((l, i) => <li key={i} className="flex items-start gap-1.5"><span className="text-slate-300 mt-0.5">-</span>{l}</li>)}
              </ul>
            </div>
          )}
        </Card>

        <Card
          title="Vulnerability Profile"
          right={<Badge tone={tone}>{vulnerability?.vulnerabilityClass}</Badge>}
        >
          <div className="grid grid-cols-2 gap-2.5">
            <InfoBox label="Vulnerability Score" value={vulnerability?.vulnerabilityScore} />
            <InfoBox label="Vulnerable Population" value={vulnerability?.vulnerablePopulation?.toLocaleString()} />
            <InfoBox label="Vulnerable Share" value={vulnerability?.vulnerableShare ? vulnerability.vulnerableShare + '%' : '—'} />
            <InfoBox label="Density" value={vulnerability?.populationDensity ? Math.round(vulnerability.populationDensity) + '/km²' : '—'} />
            <InfoBox label="Emergency Facility" value={vulnerability?.emergencyFacilityKm ? vulnerability.emergencyFacilityKm + ' km' : '—'} />
            <InfoBox label="Healthcare" value={vulnerability?.healthcareKm ? vulnerability.healthcareKm + ' km' : '—'} />
            <InfoBox label="Historical Events" value={vulnerability?.historicalEvents} />
            <InfoBox label="Hazard Exposure" value={vulnerability?.hazardExposure} />
          </div>
        </Card>
      </div>

      {/* Hazards & History */}
      <Card
        title="Hazard Exposure & Historical Events"
        right={<Badge tone="slate">Source: {risk?.dataSource}</Badge>}
      >
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Current Hazard Exposure</div>
            <div className="flex flex-wrap gap-2">
              {(habitation.exposure || []).length ? habitation.exposure.map(e => (
                <div key={e.hazardType} className="bg-slate-50 rounded-xl border border-slate-100 px-3 py-2">
                  <div className="font-semibold text-sm text-slate-700">{HAZARDS_LABEL[e.hazardType] || e.hazardType}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Severity {e.exposure}/10 · Freq {e.frequency}/10</div>
                </div>
              )) : <p className="text-sm text-slate-400">No exposure data recorded.</p>}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Historical Disaster Events</div>
            {(habitation.history || []).length ? (
              <ul className="space-y-2">
                {habitation.history.map((ev, i) => (
                  <li key={i} className="flex items-start gap-3 bg-slate-50 rounded-xl border border-slate-100 px-3 py-2.5">
                    <span className="text-lg mt-0.5">{ev.severity >= 70 ? <AlertTriangle className="w-4 h-4 text-red-500" /> : ev.severity >= 50 ? <AlertTriangle className="w-4 h-4 text-orange-500" /> : <Activity className="w-4 h-4 text-emerald-500" />}</span>
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">
                        {ev.year} — {HAZARDS_LABEL[ev.hazardType] || ev.hazardType}
                      </div>
                      <div className="text-xs text-slate-500">
                        Severity {ev.severity}/100 · {ev.affectedPopulation?.toLocaleString()} affected
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : <p className="text-sm text-slate-400">No historical events on record.</p>}
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-slate-400">
            Coordinates: {habitation.lat?.toFixed(4)}, {habitation.lng?.toFixed(4)} · Elevation: {habitation.elevation ?? '—'} m
          </p>
          <button className="btn-primary" onClick={() => navigate('/relocation')}>
            Generate Relocation Plan →
          </button>
        </div>
      </Card>

      {/* Exact Mathematical Derivation */}
      <Card
        title="Exact Risk Score Derivation (Master Formula)"
        subtitle={`Mathematical breakdown of how ${habitation.name}'s final score of ${risk?.riskScore} was calculated`}
      >
        <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-x-auto font-mono text-xs sm:text-sm">
          <table className="w-full text-left">
            <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-4 py-2 font-semibold">Risk Pillar</th>
                <th className="px-4 py-2 font-semibold text-right">Value (0-100)</th>
                <th className="px-4 py-2 font-semibold text-center">Weight</th>
                <th className="px-4 py-2 font-semibold text-right">Contribution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {/* Hazard Row */}
              <tr onClick={() => setExpandedRow(expandedRow === 'hazard' ? null : 'hazard')} className="cursor-pointer hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2 font-medium flex items-center justify-between">
                  1. Hazard (H)
                  <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wide">
                    {expandedRow === 'hazard' ? 'Hide Math' : 'Show Math'}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">{risk?.masterFormula?.H?.toFixed(1) || '-'}</td>
                <td className="px-4 py-2 text-center text-slate-500">35%</td>
                <td className="px-4 py-2 text-right text-brand-600 font-semibold">{((risk?.masterFormula?.H || 0) * 0.35).toFixed(2)}</td>
              </tr>
              {expandedRow === 'hazard' && (
                <tr className="bg-slate-100/50">
                  <td colSpan="4" className="px-4 py-3 text-xs text-slate-600 border-t border-slate-100">
                    <div className="font-semibold text-slate-700 mb-1.5">Exact Value Substitutions:</div>
                    <ul className="space-y-1.5 list-none mb-2">
                      <li><span className="font-semibold text-slate-500 mr-1">R (Rainfall Risk, 60%):</span> {risk?.masterFormula?.details?.hazard?.R} (based on 24h rain / 204.5mm critical threshold)</li>
                      <li><span className="font-semibold text-slate-500 mr-1">S (Soil Moisture, 25%):</span> {risk?.masterFormula?.details?.hazard?.S} (Live saturation %)</li>
                      <li><span className="font-semibold text-slate-500 mr-1">D (Disaster Signal, 15%):</span> {risk?.masterFormula?.details?.hazard?.D} (Max historical/exposure severity * 10)</li>
                    </ul>
                    <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-emerald-700 block mt-1">
                      H = ({risk?.masterFormula?.details?.hazard?.R} * 0.60) + ({risk?.masterFormula?.details?.hazard?.S} * 0.25) + ({risk?.masterFormula?.details?.hazard?.D} * 0.15) = {risk?.masterFormula?.H?.toFixed(1)}
                    </code>
                  </td>
                </tr>
              )}

              {/* Exposure Row */}
              <tr onClick={() => setExpandedRow(expandedRow === 'exposure' ? null : 'exposure')} className="cursor-pointer hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2 font-medium flex items-center justify-between">
                  2. Exposure (E)
                  <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wide">
                    {expandedRow === 'exposure' ? 'Hide Math' : 'Show Math'}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">{risk?.masterFormula?.E?.toFixed(1) || '-'}</td>
                <td className="px-4 py-2 text-center text-slate-500">20%</td>
                <td className="px-4 py-2 text-right text-brand-600 font-semibold">{((risk?.masterFormula?.E || 0) * 0.20).toFixed(2)}</td>
              </tr>
              {expandedRow === 'exposure' && (
                <tr className="bg-slate-100/50">
                  <td colSpan="4" className="px-4 py-3 text-xs text-slate-600 border-t border-slate-100">
                    <div className="font-semibold text-slate-700 mb-1.5">Exact Value Substitutions:</div>
                    <ul className="space-y-1.5 list-none mb-2">
                      <li><span className="font-semibold text-slate-500 mr-1">P (Population Exposure, 70%):</span> {risk?.masterFormula?.details?.exposure?.P} (Pop: {habitation?.population || 0} / 5000 ref)</li>
                      <li><span className="font-semibold text-slate-500 mr-1">A (Vulnerable Area %, 30%):</span> {risk?.masterFormula?.details?.exposure?.A} (Vuln Pop: {habitation?.vulnerablePopulation || 0})</li>
                    </ul>
                    <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-emerald-700 block mt-1">
                      E = ({risk?.masterFormula?.details?.exposure?.P} * 0.70) + ({risk?.masterFormula?.details?.exposure?.A} * 0.30) = {risk?.masterFormula?.E?.toFixed(1)}
                    </code>
                  </td>
                </tr>
              )}

              {/* Vulnerability Row */}
              <tr onClick={() => setExpandedRow(expandedRow === 'vulnerability' ? null : 'vulnerability')} className="cursor-pointer hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2 font-medium flex items-center justify-between">
                  3. Vulnerability (V)
                  <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wide">
                    {expandedRow === 'vulnerability' ? 'Hide Math' : 'Show Math'}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">{risk?.masterFormula?.V?.toFixed(1) || '-'}</td>
                <td className="px-4 py-2 text-center text-slate-500">20%</td>
                <td className="px-4 py-2 text-right text-brand-600 font-semibold">{((risk?.masterFormula?.V || 0) * 0.20).toFixed(2)}</td>
              </tr>
              {expandedRow === 'vulnerability' && (
                <tr className="bg-slate-100/50">
                  <td colSpan="4" className="px-4 py-3 text-xs text-slate-600 border-t border-slate-100">
                    <div className="font-semibold text-slate-700 mb-1.5">Exact Value Substitutions:</div>
                    <ul className="space-y-1.5 list-none mb-2">
                      <li><span className="font-semibold text-slate-500 mr-1">D (Demographics, 30%):</span> {risk?.masterFormula?.details?.vulnerability?.D}</li>
                      <li><span className="font-semibold text-slate-500 mr-1">H (Housing, 25%):</span> {risk?.masterFormula?.details?.vulnerability?.H} (Inv: 10 - {habitation?.criteria?.housingCondition || 5})</li>
                      <li><span className="font-semibold text-slate-500 mr-1">A (Accessibility, 20%):</span> {risk?.masterFormula?.details?.vulnerability?.A} (Inv: 10 - {habitation?.criteria?.accessibility || 5})</li>
                      <li><span className="font-semibold text-slate-500 mr-1">C (Healthcare, 15%):</span> {risk?.masterFormula?.details?.vulnerability?.C} (Dist: {habitation?.criteria?.emergencyFacilityKm || 20}km / 30km)</li>
                      <li><span className="font-semibold text-slate-500 mr-1">Hist (Historical, 10%):</span> {risk?.masterFormula?.details?.vulnerability?.Hist}</li>
                    </ul>
                    <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-emerald-700 block mt-1">
                      V = ({risk?.masterFormula?.details?.vulnerability?.D} * 0.3) + ({risk?.masterFormula?.details?.vulnerability?.H} * 0.25) + ({risk?.masterFormula?.details?.vulnerability?.A} * 0.2) + ({risk?.masterFormula?.details?.vulnerability?.C} * 0.15) + ({risk?.masterFormula?.details?.vulnerability?.Hist} * 0.1) = {risk?.masterFormula?.V?.toFixed(1)}
                    </code>
                  </td>
                </tr>
              )}

              {/* Infrastructure Row */}
              <tr onClick={() => setExpandedRow(expandedRow === 'infrastructure' ? null : 'infrastructure')} className="cursor-pointer hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2 font-medium flex items-center justify-between">
                  4. Infrastructure (I)
                  <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wide">
                    {expandedRow === 'infrastructure' ? 'Hide Math' : 'Show Math'}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">{risk?.masterFormula?.I?.toFixed(1) || '-'}</td>
                <td className="px-4 py-2 text-center text-slate-500">15%</td>
                <td className="px-4 py-2 text-right text-brand-600 font-semibold">{((risk?.masterFormula?.I || 0) * 0.15).toFixed(2)}</td>
              </tr>
              {expandedRow === 'infrastructure' && (
                <tr className="bg-slate-100/50">
                  <td colSpan="4" className="px-4 py-3 text-xs text-slate-600 border-t border-slate-100">
                    <div className="font-semibold text-slate-700 mb-1.5">Exact Value Substitutions:</div>
                    <ul className="space-y-1.5 list-none mb-2">
                      <li><span className="font-semibold text-slate-500 mr-1">B (Building/Housing, 35%):</span> {risk?.masterFormula?.details?.infrastructure?.B}</li>
                      <li><span className="font-semibold text-slate-500 mr-1">D (Drainage, 30%):</span> {risk?.masterFormula?.details?.infrastructure?.D} (Inv: 10 - {habitation?.criteria?.drainage || 5})</li>
                      <li><span className="font-semibold text-slate-500 mr-1">R (Roads, 20%):</span> {risk?.masterFormula?.details?.infrastructure?.R}</li>
                      <li><span className="font-semibold text-slate-500 mr-1">M (Emergency Infra, 15%):</span> {risk?.masterFormula?.details?.infrastructure?.M}</li>
                    </ul>
                    <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-emerald-700 block mt-1">
                      I = ({risk?.masterFormula?.details?.infrastructure?.B} * 0.35) + ({risk?.masterFormula?.details?.infrastructure?.D} * 0.30) + ({risk?.masterFormula?.details?.infrastructure?.R} * 0.20) + ({risk?.masterFormula?.details?.infrastructure?.M} * 0.15) = {risk?.masterFormula?.I?.toFixed(1)}
                    </code>
                  </td>
                </tr>
              )}

              {/* Terrain Row */}
              <tr onClick={() => setExpandedRow(expandedRow === 'terrain' ? null : 'terrain')} className="cursor-pointer hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2 font-medium flex items-center justify-between">
                  5. Terrain (T)
                  <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wide">
                    {expandedRow === 'terrain' ? 'Hide Math' : 'Show Math'}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">{risk?.masterFormula?.T?.toFixed(1) || '-'}</td>
                <td className="px-4 py-2 text-center text-slate-500">10%</td>
                <td className="px-4 py-2 text-right text-brand-600 font-semibold">{((risk?.masterFormula?.T || 0) * 0.10).toFixed(2)}</td>
              </tr>
              {expandedRow === 'terrain' && (
                <tr className="bg-slate-100/50">
                  <td colSpan="4" className="px-4 py-3 text-xs text-slate-600 border-t border-slate-100">
                    <div className="font-semibold text-slate-700 mb-1.5">Exact Value Substitutions:</div>
                    <ul className="space-y-1.5 list-none mb-2">
                      <li><span className="font-semibold text-slate-500 mr-1">Elev (Raw Elevation):</span> {risk?.masterFormula?.details?.terrain?.elev}m</li>
                      <li><span className="font-semibold text-slate-500 mr-1">E (Elevation Risk, 40%):</span> {risk?.masterFormula?.details?.terrain?.E}</li>
                      <li><span className="font-semibold text-slate-500 mr-1">S (Slope Risk, 35%):</span> {risk?.masterFormula?.details?.terrain?.S}</li>
                      <li><span className="font-semibold text-slate-500 mr-1">F (Flood Susceptibility, 25%):</span> {risk?.masterFormula?.details?.terrain?.F}</li>
                    </ul>
                    <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-emerald-700 block mt-1">
                      T = ({risk?.masterFormula?.details?.terrain?.E} * 0.40) + ({risk?.masterFormula?.details?.terrain?.S} * 0.35) + ({risk?.masterFormula?.details?.terrain?.F} * 0.25) = {risk?.masterFormula?.T?.toFixed(1)}
                    </code>
                  </td>
                </tr>
              )}

              <tr className="bg-slate-100/50 border-t border-slate-200">
                <td colSpan="3" className="px-4 py-3 font-semibold text-slate-800 text-right">Sum of weighted pillars (Base Risk):</td>
                <td className="px-4 py-3 text-right font-bold text-slate-900">{risk?.masterFormula?.BaseRisk?.toFixed(2) || '-'}</td>
              </tr>
              <tr className="bg-slate-100/50">
                <td colSpan="3" className="px-4 py-3 font-semibold text-slate-800 text-right flex flex-col items-end">
                  <span>Compounding Risk Multiplier (C):</span>
                  <span className="text-[10px] text-slate-500 font-normal">C = 1 + 0.20 * (H / 100) * (V / 100)</span>
                </td>
                <td className="px-4 py-3 text-right font-bold text-slate-900">x {risk?.masterFormula?.C?.toFixed(3) || '1.000'}</td>
              </tr>
              <tr className="bg-slate-200">
                <td colSpan="3" className="px-4 py-4 font-bold text-slate-900 text-right uppercase tracking-wider">Final Risk Score (Base Risk * C):</td>
                <td className="px-4 py-4 text-right font-bold text-brand-700 text-lg">{risk?.masterFormula?.FinalRisk?.toFixed(1) || risk?.riskScore}</td>
              </tr>
            </tbody>
          </table>
          <div className="p-4 bg-white border-t border-slate-200 text-xs text-slate-600">
            <strong>Note:</strong> Values are derived from real-time Open-Meteo telemetry and live OpenStreetMap structural attributes using the new Compounding Master Formula.
          </div>
        </div>
      </Card>
    </div>
  );
}
