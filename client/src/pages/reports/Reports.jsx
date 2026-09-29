import { useEffect, useState } from 'react';
import { relocationApi } from '../../services/api';
import useDistricts from '../../hooks/useDistricts';
import { Card, Badge, Spinner, StateDistrictSelector, PageHeader, EmptyState } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import OfficialReportPdfModal from '../../components/reports/OfficialReportPdfModal';
import { FileText, Save, List, Trash2, FileOutput, ShieldAlert , LayoutTemplate } from "lucide-react";

const STATUS_COLOR = {
  proposed: 'slate',
  under_review: 'yellow',
  approved: 'green',
  executing: 'blue',
  rejected: 'red',
};

export default function Reports() {
  const { user } = useAuth();
  const { selectedDistrict: district, setSelectedDistrict } = useDistricts();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [selectedPdfPlan, setSelectedPdfPlan] = useState(null);

  const canApprove = (user?.role || '') === 'admin' || (user?.role || '') === 'disaster_authority';
  const canGenerate = (user?.role || '') === 'admin' || (user?.role || '') === 'disaster_authority' || (user?.role || '') === 'analyst' || !user;

  const [allPlansCount, setAllPlansCount] = useState(0);

  const load = () => {
    setLoading(true);
    const distParam = district && district !== 'All' && district !== '' ? district : undefined;
    
    Promise.all([
      relocationApi.list(distParam),
      relocationApi.list(),
    ])
      .then(([filteredRes, allRes]) => {
        setPlans(filteredRes.data || []);
        setAllPlansCount((allRes.data || []).length);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };
  
  useEffect(() => { load(); }, [district]);

  const updateStatus = (id, status) => {
    relocationApi.updateStatus(id, status).then(() => load());
  };

  const deletePlan = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this report from the database?')) {
      relocationApi.deletePlan(id).then(() => load());
    }
  };

  const handleGenerateReport = async () => {
    if (!district || district === 'All') {
      setFeedback('Please select a specific district first.');
      return;
    }
    setGenerating(true);
    setFeedback('Running relocation engine & saving to MongoDB...');
    try {
      const res = await relocationApi.generate(district);
      setFeedback(`Generated and saved ${res.count} report(s) successfully!`);
      load();
    } catch (e) {
      setFeedback('Could not generate report. Ensure server is running.');
    } finally {
      setGenerating(false);
      setTimeout(() => setFeedback(''), 5000);
    }
  };

  return (
    <div className="space-y-5 fade-up">
      <PageHeader
        icon={<LayoutTemplate className="w-5 h-5 text-brand-500" />}
        title="Official Reports & Relocation Directives"
        subtitle="Manage saved evacuation plans, update approval status, and generate official PDF orders"
        right={<StateDistrictSelector value={district} onChange={setSelectedDistrict} />}
      />

      {feedback && (
        <div className={`p-3 rounded-xl border flex items-center gap-2 text-sm font-semibold ${
          feedback.includes('Could not') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
        }`}>
          {feedback}
        </div>
      )}

      {loading ? (
        <Spinner label="Loading saved reports from database…" />
      ) : (
        <Card title={`Saved Reports ${district && district !== 'All' ? `for ${district}` : '(All Districts)'}`}>
          {plans.length ? (
            <div className="space-y-4">
              {plans.map((p) => (
                <PlanCard
                  key={p.id || p._id}
                  plan={p}
                  onStatus={updateStatus}
                  onDelete={deletePlan}
                  onViewPdf={(planItem) => setSelectedPdfPlan(planItem)}
                  canApprove={canApprove}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<LayoutTemplate className="w-5 h-5 text-brand-500" />}
              title={district && district !== 'All' ? `No saved reports for ${district}` : 'No saved relocation reports found.'}
              message={district && district !== 'All'
                ? `Click "Generate & Save Report" to run the risk engine for ${district} and save it to MongoDB.`
                : 'Select a district above and click "Generate & Save Report" to create and store the evacuation report in MongoDB.'}
            />
          )}

          {(!plans.length || district) && (
            <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-center gap-3">
              {canGenerate && district && district !== 'All' && (
                <button
                  className="btn-primary"
                  onClick={handleGenerateReport}
                  disabled={generating}
                >
                  <Save className="w-4 h-4" /> {generating ? 'Generating…' : `Generate & Save for ${district}`}
                </button>
              )}
              {district && district !== 'All' && allPlansCount > 0 && (
                <button
                  className="btn-outline"
                  onClick={() => setSelectedDistrict('All')}
                >
                  <List className="w-4 h-4" /> View All Saved Reports ({allPlansCount})
                </button>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Official Government PDF Layout Modal */}
      {selectedPdfPlan && (
        <OfficialReportPdfModal
          plan={selectedPdfPlan}
          district={district}
          onClose={() => setSelectedPdfPlan(null)}
        />
      )}
    </div>
  );
}

function PlanCard({ plan, onStatus, onDelete, onViewPdf, canApprove }) {
  const planId = plan.id || plan._id;
  const formattedDate = plan.createdAt ? new Date(plan.createdAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }) : 'Recently created';

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-colors shadow-sm">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h3 className="font-bold text-slate-800 text-lg leading-none">{plan.habitationName}</h3>
            <Badge tone={plan.riskClass?.toLowerCase() || 'slate'}>
              {plan.riskClass} Risk — Score {plan.riskScore}
            </Badge>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              REF: {planId.slice(-6).toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {plan.district}, {plan.state} · Created: {formattedDate} {plan.createdBy ? `by ${plan.createdBy}` : ''}
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Badge tone={STATUS_COLOR[plan.status] || 'slate'} className="uppercase tracking-wider">
            {plan.status?.replace('_', ' ')}
          </Badge>
          
          <button
            onClick={() => onViewPdf(plan)}
            className="btn bg-brand-50 hover:bg-brand-100 text-brand-700 py-1.5 px-3 text-xs"
            title="Open official PDF document format"
          >
            <FileOutput className="w-3.5 h-3.5" /> PDF Format
          </button>

          {onDelete && (
            <button
              onClick={() => onDelete(planId)}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete report from database"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-5">
        <Info label="Habitation Pop." value={plan.populationToRelocate?.toLocaleString() || 0} />
        <Info label="Needing Shelter" value={plan.populationNeedingShelter?.toLocaleString() || 0} />
        <Info label="Feasibility" value={`${plan.feasibility || 0}%`} highlight={plan.feasibility >= 80 ? 'text-emerald-700' : 'text-amber-700'} />
        <Info label="Safe Sites" value={plan.assignments?.length || 0} />
      </div>

      <div className="mt-4 bg-slate-50 rounded-xl p-3.5 border border-slate-100">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
          <span>Safe Site Capacity Allocations</span>
          {plan.unallocatedPopulation > 0 && (
            <span className="text-risk-red flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> {plan.unallocatedPopulation.toLocaleString()} pax unallocated
            </span>
          )}
        </div>
        <ul className="text-sm text-slate-700 space-y-2">
          {(plan.assignments || []).length > 0 ? (
            plan.assignments.map((a, idx) => (
              <li key={a.safeSiteId || idx} className="flex items-center justify-between bg-white px-3 py-2.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <span className="flex items-center gap-1"><Tent className="w-3 h-3" /> {a.safeSiteName}</span>
                </span>
                <span className="text-slate-600">
                  <strong className="text-slate-900 tabular-nums">{a.assignedPopulation?.toLocaleString()}</strong> people 
                  <span className="text-slate-400 text-xs ml-1">({a.distanceKm} km · ~{a.etaMinutes} min)</span>
                </span>
              </li>
            ))
          ) : (
            <li className="text-slate-400 italic text-xs">No safe sites assigned.</li>
          )}
        </ul>
      </div>

      {plan.recommendedActions?.length > 0 && (
        <div className="mt-4 px-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Recommended Directives</div>
          <ul className="text-sm text-slate-600 space-y-1">
            {plan.recommendedActions.map((a, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-brand-500 mt-0.5">•</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {canApprove && (
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-4">
          <div className="text-xs text-slate-500">
            {plan.approvedBy ? `Approved by ${plan.approvedBy} on ${new Date(plan.approvedAt).toLocaleDateString()}` : 'Pending administrative action'}
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-outline py-1.5 text-xs" onClick={() => onStatus(planId, 'under_review')}>Under Review</button>
            <button className="btn bg-emerald-600 hover:bg-emerald-700 text-white py-1.5 text-xs shadow-sm" onClick={() => onStatus(planId, 'approved')}>Approve Order</button>
            <button className="btn bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 py-1.5 text-xs" onClick={() => onStatus(planId, 'executing')}>Execute Order</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value, highlight }) {
  return (
    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</div>
      <div className={`font-bold text-slate-800 text-sm ${highlight || ''}`}>{value}</div>
    </div>
  );
}
