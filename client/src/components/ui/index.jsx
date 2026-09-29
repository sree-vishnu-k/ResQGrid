// Shared UI components — Apple-style light theme
import { Link } from 'react-router-dom';

/* ━━ Card ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function Card({ title, subtitle, right, children, className = '', href }) {
  const inner = (
    <div className={`card p-5 ${className}`}>
      {(title || right) && (
        <div className="flex items-start justify-between mb-4">
          <div>
            {title && <h3 className="text-base font-semibold text-slate-800">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {right && <div>{right}</div>}
        </div>
      )}
      {children}
    </div>
  );
  if (href) return <Link to={href} className="block hover:no-underline">{inner}</Link>;
  return inner;
}

/* ━━ StatCard ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function StatCard({ label, value, sub, icon, color = 'text-brand-600', trend }) {
  const bgMap = {
    'text-brand-600': 'bg-brand-50',
    'text-risk-red': 'bg-red-50',
    'text-risk-orange': 'bg-orange-50',
    'text-risk-yellow': 'bg-amber-50',
    'text-emerald-600': 'bg-emerald-50',
    'text-sky-500': 'bg-sky-50',
  };
  const bg = bgMap[color] || 'bg-slate-50';

  return (
    <div className="card p-4 flex items-start gap-3.5 hover:shadow-apple transition-all duration-200 hover:-translate-y-0.5 group cursor-default">
      {icon && (
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bg} transition-transform duration-200 group-hover:scale-105`}>
          <span className={`${color} text-xl leading-none`}>{icon}</span>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5 tracking-tight tabular-nums">
          {value ?? '—'}
        </p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ━━ Badge ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
const badgeStyles = {
  green:  'bg-emerald-50 text-emerald-700 border-emerald-200',
  yellow: 'bg-amber-50 text-amber-700 border-amber-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  red:    'bg-red-50 text-red-700 border-red-200',
  blue:   'bg-brand-50 text-brand-700 border-brand-200',
  slate:  'bg-slate-100 text-slate-600 border-slate-200',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
};

export function Badge({ children, tone = 'slate', className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeStyles[tone] || badgeStyles.slate} ${className}`}>
      {children}
    </span>
  );
}

export function riskTone(riskClass) {
  return String(riskClass || '').toLowerCase();
}

/* ━━ Spinner ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function Spinner({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
      <div className="h-8 w-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
      <p className="mt-3 text-sm text-slate-500">{label}</p>
    </div>
  );
}

/* ━━ EmptyState ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function EmptyState({ icon, title, message }) {
  return (
    <div className="card p-14 text-center fade-up">
      {icon && (
        <div className="inline-flex h-16 w-16 rounded-full bg-slate-100 items-center justify-center text-slate-400 mb-4 shadow-inner">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-800">{title}</h3>
      {message && <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">{message}</p>}
    </div>
  );
}

/* ━━ InfoBox ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function InfoBox({ label, value }) {
  return (
    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{label}</div>
      <div className="text-sm font-semibold text-slate-700 truncate" title={String(value ?? '')}>{value ?? '—'}</div>
    </div>
  );
}

/* ━━ PageHeader ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
export function PageHeader({ icon, title, subtitle, right }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="h-10 w-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-brand-600">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-slate-800 leading-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {right && <div className="flex items-center gap-2 flex-shrink-0">{right}</div>}
    </div>
  );
}

export { default as StateDistrictSelector } from './StateDistrictSelector';