import { useState, useEffect, useRef } from 'react';
import { Bell, AlertTriangle, ChevronRight, ShieldAlert, Thermometer, CloudRain, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export default function AlertBell() {
  const [open, setOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Close dropdown on click outside
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await api.get('/api/analysis/india');
        // The API returns { success: true, count: N, zones: [...] }
        const habs = res.data.zones || res.data.data || [];
        
        const newAlerts = [];
        
        // 1. Get all RED zones, sorted by Risk Score descending
        const redZones = habs.filter(h => h.zoneClass === 'RED').sort((a, b) => b.riskScore - a.riskScore);
        redZones.forEach(z => {
          newAlerts.push({
            id: z.id,
            type: 'critical',
            title: `CRITICAL ALERT: ${z.name}`,
            desc: `Risk Score: ${z.riskScore}. Severe threat in ${z.district}, ${z.state}. Immediate evacuation required.`,
            icon: <ShieldAlert className="w-4 h-4 text-red-600" />,
            color: 'bg-red-50 border-red-200 text-red-900',
            bgIcon: 'bg-red-100',
            time: 'Live',
            zone: z
          });
        });

        
        // Add ORANGE zones
        const orangeZones = habs.filter(h => h.zoneClass === 'ORANGE').sort((a, b) => b.riskScore - a.riskScore);
        orangeZones.forEach(z => {
          newAlerts.push({
            id: z.id,
            type: 'warning',
            title: `WARNING: ${z.name}`,
            desc: `Risk Score: ${z.riskScore}. High vulnerability in ${z.district}, ${z.state}. Evacuation on standby.`,
            icon: <AlertTriangle className="w-4 h-4 text-orange-600" />,
            color: 'bg-orange-50 border-orange-200 text-orange-900',
            bgIcon: 'bg-orange-100',
            time: 'Live',
            zone: z
          });
        });

        
        setAlerts(newAlerts);
      } catch (err) {
        console.error('Failed to fetch alerts', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
    // Refresh alerts every 2 minutes
    const interval = setInterval(fetchAlerts, 120000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = alerts.length;

  const handleAlertClick = (alert) => {
    setOpen(false);
    navigate(`/habitations/${alert.id}`);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
          </span>
        )}
      </button>

      {open && (
        <div className="fixed top-[60px] left-4 right-4 sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:w-96 bg-white rounded-xl shadow-2xl sm:shadow-xl border border-slate-200 z-[9999] overflow-hidden flex flex-col">
          <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-500" />
              Live Threat Alerts
            </h3>
            <span className="bg-brand-100 text-brand-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount} Active
            </span>
          </div>

          <div className="max-h-[400px] overflow-y-auto p-2 space-y-2">
            {loading ? (
              <div className="p-4 text-center text-slate-400 text-sm">Scanning satellite telemetry...</div>
            ) : alerts.length === 0 ? (
              <div className="p-6 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
                <ShieldAlert className="w-8 h-8 text-emerald-300" />
                <p className="text-sm">No critical or warning zones detected.</p>
                <p className="text-xs text-slate-400">All regions are currently stable.</p>
              </div>
            ) : (
              alerts.map((alert, i) => (
                <div
                  key={i}
                  onClick={() => handleAlertClick(alert)}
                  className={`flex gap-3 p-3 rounded-lg border cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-md ${alert.color}`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-full h-fit shrink-0 ${alert.bgIcon}`}>
                    {alert.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h4 className="font-bold text-xs truncate pr-2">{alert.title}</h4>
                      <span className="text-[9px] font-semibold opacity-70 whitespace-nowrap">{alert.time}</span>
                    </div>
                    <p className="text-[11px] leading-snug opacity-90">{alert.desc}</p>
                  </div>
                  <ChevronRight className="w-4 h-4 self-center opacity-40 shrink-0" />
                </div>
              ))
            )}
          </div>
          
          {alerts.length > 0 && (
            <div className="border-t border-slate-100 p-2 bg-slate-50 text-center">
              <button 
                onClick={() => { setOpen(false); navigate('/relocation'); }}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800"
              >
                View Relocation Dashboard &rarr;
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
