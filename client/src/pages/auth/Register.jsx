import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import Globe from 'react-globe.gl';
import { Globe as GlobeIcon, CheckCircle2, ShieldCheck, Activity, Briefcase, Building, UserCheck, AlertTriangle } from 'lucide-react';

const ROLES = [
  { value: 'viewer', label: 'Public / Inter-Agency Viewer' },
  { value: 'field_officer', label: 'Field Response Officer' },
  { value: 'analyst', label: 'GIS Analyst & Hazard Planner' },
  { value: 'disaster_authority', label: 'Disaster Management Authority' },
  { value: 'admin', label: 'System Administrator' },
];

const INITIAL_ARCS = [...Array(20).keys()].map(() => ({
  startLat: (Math.random() - 0.5) * 180,
  startLng: (Math.random() - 0.5) * 360,
  endLat: (Math.random() - 0.5) * 180,
  endLng: (Math.random() - 0.5) * 360,
  color: ['#10b981', '#3b82f6', '#ef4444'][Math.floor(Math.random() * 3)]
}));

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer',
    designation: '',
    district: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  
  const globeRef = useRef();



  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 800,
    height: typeof window !== 'undefined' ? window.innerHeight : 800,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const initControls = () => {
      if (globeRef.current) {
        const controls = globeRef.current.controls();
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.2;
          controls.enableZoom = false;
        }
        globeRef.current.pointOfView({ altitude: 1.8 }, 1000);
      }
    };
    setTimeout(initControls, 500);
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authApi.register(form);
      if (res.success || res.ok || (res.data && res.data.user)) {
        setSubmitted(true);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration request could not be submitted.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617] py-10">
      {/* 3D Globe Background */}
      <div className={`absolute inset-0 z-0 flex items-center justify-center opacity-70`}>
        <Globe
          ref={globeRef}
          
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          width={windowSize.width}
          height={windowSize.height}
          arcsData={INITIAL_ARCS}
          arcColor="color"
          arcDashLength={0.4}
          arcDashGap={0.2}
          arcDashAnimateTime={1500}
          arcAltitudeAutoScale={0.3}
        />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 w-full max-w-lg p-6">
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 rounded-xl bg-white/5 backdrop-blur-md items-center justify-center text-2xl mb-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] border border-white/20 text-emerald-400">
            <GlobeIcon className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-2xl">ResQGrid</h1>
          <p className="text-slate-200 text-xs mt-1 drop-shadow-xl font-medium">Access Request Portal</p>
        </div>

        <div className="rounded-3xl p-8 bg-transparent backdrop-blur-[16px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
          {submitted ? (
            <div className="text-center py-6 flex flex-col items-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
              <h2 className="text-xl font-bold text-white mb-2">Request Submitted</h2>
              <p className="text-slate-300 text-xs leading-relaxed mb-6">
                Your access request has been logged. An administrator will review your designation and grant permissions.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-all"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold text-white">Request Account</h2>
                <span className="text-xs text-slate-400 font-medium">Step 1 of 1</span>
              </div>

              {error && (
                <div className="text-xs rounded-xl p-3 bg-red-500/20 text-red-200 border border-red-500/30 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> {error}
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Official Email</label>
                <input
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Password</label>
                <input
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Role Type</label>
                <select
                  className="w-full rounded-xl border border-white/20 bg-slate-900 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Designation</label>
                  <input
                    className="w-full rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    type="text"
                    placeholder="e.g. Officer"
                    value={form.designation}
                    onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">District</label>
                  <input
                    className="w-full rounded-xl border border-white/20 bg-white/5 px-3.5 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    type="text"
                    placeholder="e.g. Wayanad"
                    value={form.district}
                    onChange={(e) => setForm({ ...form, district: e.target.value })}
                  />
                </div>
              </div>

              <button
                className="w-full py-3 mt-2 font-bold text-xs text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all flex items-center justify-center gap-2"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Submitting Request…' : 'Submit Access Request'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Already have credentials?</span>
            <Link to="/login" className="text-emerald-400 font-semibold hover:text-emerald-300 transition-colors">
              Sign In Here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}