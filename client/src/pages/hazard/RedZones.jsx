import { useEffect, useState } from 'react';
import { LayoutTemplate, AlertTriangle, Flame, AlertCircle, BarChart2 } from "lucide-react";
import { useNavigate, useLocation } from 'react-router-dom';
import { analysisApi, dataApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import RiskMap, { MapLegend } from '../../components/map/RiskMap';
import { Card, StatCard, Badge, Spinner, StateDistrictSelector, EmptyState, PageHeader, InfoBox } from '../../components/ui';
import { ScoreGauge } from '../../components/charts';

const DEFAULT_CENTER = [22.0, 79.0];

export default function RedZones() {
  const { centers, districtMeta, getStateForDistrict, selectedDistrict: district, setSelectedDistrict } = useDistricts();
  const [analysis, setAnalysis] = useState(null);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qDistrict = params.get('district');
    if (qDistrict && qDistrict !== district) {
      setSelectedDistrict(qDistrict);
    }
  }, [location.search, district, setSelectedDistrict]);

  useEffect(() => {
    if (!district || district === 'All') {
      setAnalysis(null);
      setSites([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    analysisApi
      .redZones(district)
      .then((res) => setAnalysis(res))
      .catch(() => setAnalysis(null));
    dataApi.sites({ district }).then((res) => setSites(res.data)).catch(() => setSites([]));
    setLoading(false);
  }, [district]);

  const zones = analysis?.data || [];
  const riskSum = zones.reduce((a, z) => a + z.riskScore, 0);
  const center = (district && centers[district]) || DEFAULT_CENTER;
  const currentMeta = district ? (districtMeta[district] || {}) : {};
  const currentState = currentMeta.state || getStateForDistrict(district) || '';

  return (
    <div className="space-y-5 fade-up">
      <PageHeader
        icon={<LayoutTemplate className="w-5 h-5 text-brand-500" />}
        title="Hazard-Based Red Zones"
        subtitle="Calculated via Dynamic HEV (Hazard-Exposure-Vulnerability) Index"
        right={<StateDistrictSelector value={district} onChange={setSelectedDistrict} />}
      />

      {!district || district === 'All' ? (
        <EmptyState
          icon={<LayoutTemplate className="w-5 h-5 text-brand-500" />}
          title="Select a District"
          message="Please choose a State and District using the selector above to view the high-risk hazard red-zone habitations."
        />
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Red Zones" value={zones.filter((z) => z.riskClass === 'RED').length} icon={<AlertTriangle className="w-5 h-5" />} color="text-risk-red" />
            <StatCard label="Orange Zones" value={zones.filter((z) => z.riskClass === 'ORANGE').length} icon={<Flame className="w-5 h-5" />} color="text-risk-orange" />
            <StatCard label="Total Critical" value={zones.length} icon={<AlertCircle className="w-5 h-5" />} color="text-risk-red" />
            <StatCard label="Avg Risk Score" value={zones.length ? Math.round(riskSum / zones.length) : 0} icon={<BarChart2 className="w-5 h-5" />} color="text-brand-600" />
          </div>

          <div className="grid lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 card p-0 overflow-hidden relative shadow-md" style={{ minHeight: 520 }}>
          {loading ? (
            <div className="h-[520px] flex items-center justify-center">
              <Spinner label="Loading satellite zones…" />
            </div>
          ) : (
            <RiskMap
              zones={zones}
              sites={sites}
              center={center}
              zoom={11}
              districtName={district}
              stateName={currentState}
              showDistrictCircle={true}
              showRiskCircles={true}
              showPins={true}
              onSelectZone={setSelected}
              selectedId={selected?.habitationId}
            />
          )}
          <MapLegend />
        </div>

        <div className="lg:col-span-2 space-y-4 overflow-y-auto" style={{ maxHeight: 520 }}>
          {selected ? (
            <Card title={selected.habitation} right={<Badge tone="red">{selected.riskClass}</Badge>}>
              <ScoreGauge score={selected.riskScore} color={selected.color} label="Risk Score" />
              <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                <InfoBox label="Main hazards" value={selected.mainHazards?.join(', ')} />
                <InfoBox label="Population" value={selected.population?.toLocaleString()} />
                <InfoBox label="Population exposed" value={selected.populationExposed?.toLocaleString()} />
                <InfoBox label="Exposure index" value={selected.exposureIndex} />
                <InfoBox label="Infrastructure risk" value={selected.infrastructureRisk} />
                <InfoBox label="Confidence" value={(selected.confidence * 100).toFixed(0) + '%'} />
              </div>
              <button
                className="btn-primary w-full mt-3 text-xs"
                onClick={() => navigate(`/habitations/${selected.habitationId}`)}
              >
                Open Habitation Details →
              </button>
            </Card>
          ) : (
            <Card title="Critical Habitations" subtitle="Click any circle or list item to inspect">
              {zones.length ? (
                <ul className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                  {zones.slice(0, 12).map((z) => (
                    <li
                      key={z.habitationId || z._id}
                      className="border border-slate-100 rounded-xl p-3 hover:bg-slate-50 cursor-pointer transition flex items-center justify-between"
                      onClick={() => setSelected(z)}
                    >
                      <div>
                        <div className="font-semibold text-slate-800">{z.habitation}</div>
                        <div className="text-xs text-slate-500">
                          {z.district} · {z.mainHazards?.join(', ')}
                        </div>
                      </div>
                      <Badge tone={z.riskClass.toLowerCase()}>{z.riskScore} {z.riskClass}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-500 py-10 text-center">
                  No red/orange zones found in {district} district.
                </p>
              )}
            </Card>
          )}
        </div>
      </div>
      </>
      )}
    </div>
  );
}
