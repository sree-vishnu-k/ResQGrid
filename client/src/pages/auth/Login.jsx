import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Globe from 'react-globe.gl';
import { Globe as GlobeIcon, Lock, Eye, EyeOff, ShieldCheck, Clock, XCircle, AlertTriangle, UserCheck, Building, Activity, Briefcase } from 'lucide-react';

const INITIAL_ARCS = [...Array(20).keys()].map(() => ({
  startLat: (Math.random() - 0.5) * 180,
  startLng: (Math.random() - 0.5) * 360,
  endLat: (Math.random() - 0.5) * 180,
  endLng: (Math.random() - 0.5) * 360,
  color: ['#10b981', '#3b82f6', '#ef4444'][Math.floor(Math.random() * 3)]
}));

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  
  const globeRef = useRef();



  useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Auto-rotate the globe slowly.
    // Use an animation frame to ensure the canvas is ready
    requestAnimationFrame(() => {
      if (globeRef.current) {
        const controls = globeRef.current.controls();
        if (controls) {
          controls.autoRotate = true;
          controls.autoRotateSpeed = 0.5;
          controls.enableZoom = true;
        }
        // SET INSTANTLY (0 ms) to avoid perceived stutter from the camera flying in while rendering
        globeRef.current.pointOfView({ altitude: 1.8 }, 0);
      }
    });
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.ok) {
        navigate('/', { replace: true });
      } else {
        setError(res.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const isPendingApproval = error && error.toLowerCase().includes('pending');
  const isRejected = error && error.toLowerCase().includes('rejected');

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



  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#020617]">
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
      <div className="relative z-10 w-full max-w-md p-6">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 rounded-2xl bg-white/5 backdrop-blur-md items-center justify-center text-3xl mb-3 shadow-[0_0_30px_rgba(16,185,129,0.3)] border border-white/20 text-emerald-400">
            <GlobeIcon className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-2xl">ResQGrid</h1>
          <p className="text-slate-200 text-sm mt-2 drop-shadow-xl font-medium">Hazard-Based Red Zones & Relocation Decision Support</p>
        </div>

        {/* High-Blur Glassmorphism Login Card */}
        <div className="rounded-3xl p-8 bg-transparent backdrop-blur-[12px] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Sign In</h2>
            <span className="text-xs text-slate-400 font-medium tracking-wide">AUTHORIZED ONLY</span>
          </div>

          {error && (
            <div
              className={`mb-6 text-sm rounded-xl p-3.5 border flex items-start gap-2.5 backdrop-blur-md ${
                isPendingApproval
                  ? 'bg-amber-500/20 text-amber-200 border-amber-500/30'
                  : isRejected
                  ? 'bg-rose-500/20 text-rose-200 border-rose-500/30'
                  : 'bg-red-500/20 text-red-200 border-red-500/30'
              }`}
            >
              <div className="mt-0.5">
                {isPendingApproval ? <Clock className="w-5 h-5" /> : isRejected ? <XCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-white">
                  {isPendingApproval
                    ? 'Approval Pending'
                    : isRejected
                    ? 'Registration Rejected'
                    : 'Access Denied'}
                </div>
                <div className="text-xs mt-1 leading-relaxed opacity-90">{error}</div>
              </div>
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Official Email
              </label>
              <input
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
              </div>
              <div className="relative">
                <input
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white pr-10 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors focus:outline-none"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              className="w-full py-3 mt-2 font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="animate-spin inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Authenticating…
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Secure Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo Quick-Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-[10px] text-slate-400 text-center mb-3 font-semibold uppercase tracking-wider">Demo Quick Login</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setEmail('admin@resqgrid.gov.in'); setPassword('Admin@123'); }}
                className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs py-2 px-3 rounded-lg font-medium transition-colors border border-white/10 flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-3.5 h-3.5" /> Super Admin
              </button>
              <button
                type="button"
                onClick={() => { setEmail('analyst@resqgrid.gov.in'); setPassword('Analyst@12345'); }}
                className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs py-2 px-3 rounded-lg font-medium transition-colors border border-white/10 flex items-center justify-center gap-1.5"
              >
                <Building className="w-3.5 h-3.5" /> Sub Admin
              </button>
            </div>
          </div>
          <div className="mt-5 text-center text-xs text-slate-400">
            <span>Need an official account?</span>{' '}
            <Link to="/register" className="text-emerald-400 font-semibold hover:text-emerald-300 hover:underline transition-colors ml-1">
              Request Registration
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-3 font-medium">
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> End-to-End Encrypted</span>
          <span>•</span>
          <span>Role-Based Access</span>
        </div>
      </div>
    </div>
  );
}