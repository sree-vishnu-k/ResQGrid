import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AlertBell from './AlertBell';
import {
  LayoutDashboard, Map, AlertTriangle, Home, ShieldCheck,
  Scale, Truck, FileText, Users, LogOut, Globe, Menu, X
} from 'lucide-react';

const NAV = [
  { to: '/',          label: 'Dashboard',       Icon: LayoutDashboard, end: true, color: 'blue' },
  { to: '/map',       label: 'GIS Map',         Icon: Map, color: 'indigo' },
  { to: '/red-zones', label: 'Red Zones',       Icon: AlertTriangle, color: 'red' },
  { to: '/habitations', label: 'Habitations',   Icon: Home, color: 'emerald' },
  { to: '/sites',     label: 'Safe Sites',      Icon: ShieldCheck, color: 'green' },
  { to: '/capacity',  label: 'Capacity',        Icon: Scale, color: 'amber' },
  { to: '/relocation', label: 'Relocation',     Icon: Truck, color: 'orange' },
  { to: '/reports',   label: 'Reports',         Icon: FileText, color: 'slate' },
];
const ADMIN_NAV = [{ to: '/admin', label: 'Admin', Icon: Users }];

export default function Layout() {
  const { user, logout, can } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const roleLabel = {
    admin:             'Administrator',
    disaster_authority:'Authority',
    analyst:           'Analyst',
    field_officer:     'Field Officer',
    viewer:            'Viewer',
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased">
      
      {/* ── Horizontal Top Navigation Bar (Apple Style) ──────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/70 shadow-apple-sm">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-14">
            
            {/* Logo area */}
            <div className="flex items-center gap-3 mr-6">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shadow-sm">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div className="font-bold text-sm text-slate-800 leading-tight tracking-tight hidden sm:block">
                ResQGrid
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex flex-1 items-center gap-1 flex-wrap overflow-visible">
              {NAV.map(({ to, label, Icon, end, color }) => {
                const colorMap = {
                  blue: 'bg-blue-50 text-blue-700 font-semibold',
                  indigo: 'bg-indigo-50 text-indigo-700 font-semibold',
                  red: 'bg-red-50 text-red-700 font-semibold',
                  emerald: 'bg-emerald-50 text-emerald-700 font-semibold',
                  green: 'bg-green-50 text-green-700 font-semibold',
                  amber: 'bg-amber-50 text-amber-700 font-semibold',
                  orange: 'bg-orange-50 text-orange-700 font-semibold',
                  slate: 'bg-slate-100 text-slate-800 font-semibold'
                };
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) => `
                      flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap
                      ${isActive ? colorMap[color] : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Right side: Alerts, User & Mobile Toggle */}
            <div className="flex items-center gap-3 ml-4">
              <AlertBell />
              
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-200/70">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Live</span>
              </div>
              
              {/* User Dropdown / Info */}
              <div className="flex items-center gap-3 pl-3 sm:border-l sm:border-slate-200">
                {can('admin') ? (
                  <Link to="/admin" className="flex items-center gap-3 hover:bg-slate-50 p-1.5 pr-2 rounded-xl transition-colors cursor-pointer group">
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-semibold text-slate-800 group-hover:text-brand-600 flex items-center justify-end gap-1">
                        {user?.name}
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-end gap-1"><ShieldCheck className="w-3 h-3 text-purple-500" /> Admin Panel</div>
                    </div>
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm group-hover:shadow-md transition-all">
                      {user?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                  </Link>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right">
                      <div className="text-xs font-semibold text-slate-800">{user?.name}</div>
                      <div className="text-[10px] text-slate-400">{roleLabel[user?.role] || 'Officer'}</div>
                    </div>
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-sm">
                      {user?.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="hidden md:flex p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile menu toggle */}
              <button
                className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-100 bg-white/95 backdrop-blur-md px-4 py-3 space-y-1 shadow-apple">
            {NAV.map(({ to, label, Icon, end, color }) => {
              const colorMap = {
                  blue: 'bg-blue-50 text-blue-700 font-semibold',
                  indigo: 'bg-indigo-50 text-indigo-700 font-semibold',
                  red: 'bg-red-50 text-red-700 font-semibold',
                  emerald: 'bg-emerald-50 text-emerald-700 font-semibold',
                  green: 'bg-green-50 text-green-700 font-semibold',
                  amber: 'bg-amber-50 text-amber-700 font-semibold',
                  orange: 'bg-orange-50 text-orange-700 font-semibold',
                  slate: 'bg-slate-100 text-slate-800 font-semibold'
                };
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors
                    ${isActive ? colorMap[color] : 'text-slate-600 hover:bg-slate-50'}
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </NavLink>
              );
            })}
              <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </header>

      {/* ── Main Content Area ──────────────────────────────────────────── */}
      <main className="flex-1 p-4 lg:p-6 max-w-[1600px] w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}