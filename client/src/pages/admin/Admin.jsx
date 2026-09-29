import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { userApi, dataApi, analysisApi } from '../../services/api';
import { Card, Badge, Spinner } from '../../components/ui';
import { Ban, RefreshCw, Check, AlertTriangle, Info, X } from 'lucide-react';

export default function Admin() {
  const { role } = useAuth();
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const fetchUsers = () => {
    userApi.list()
      .then((r) => setUsers(r.data || []))
      .catch(() => []);
  };

  useEffect(() => {
    fetchUsers();
    analysisApi.meta().then(() => {}).catch(() => {});
    dataApi.habitations({}).then((r) => setStats({ habitations: r.count })).catch(() => setStats({ habitations: 0 }));
    dataApi.sites({}).then((r) => setStats((s) => ({ ...s, sites: r.count }))).catch(() => {});
    setLoading(false);
  }, []);

  const handleApprove = async (id, email) => {
    setProcessingId(id);
    try {
      await userApi.approve(id);
      setActionMessage({ type: 'success', text: `Approved access for ${email}` });
      fetchUsers();
    } catch (err) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to approve user' });
    } finally {
      setProcessingId(null);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleReject = async (id, email) => {
    if (!window.confirm(`Are you sure you want to reject access for ${email}?`)) return;
    setProcessingId(id);
    try {
      await userApi.reject(id);
      setActionMessage({ type: 'info', text: `Rejected access request for ${email}` });
      fetchUsers();
    } catch (err) {
      setActionMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to reject user' });
    } finally {
      setProcessingId(null);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const handleToggleActive = async (u) => {
    const newActive = !u.active;
    setProcessingId(u.id);
    try {
      await userApi.update(u.id, { active: newActive });
      setActionMessage({ type: 'info', text: `User ${u.email} is now ${newActive ? 'Active' : 'Disabled'}` });
      fetchUsers();
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to update user status' });
    } finally {
      setProcessingId(null);
      setTimeout(() => setActionMessage(null), 4000);
    }
  };

  const pendingUsers = users.filter((u) => u.status === 'pending');
  const activeUsers = users.filter((u) => u.active !== false && u.status === 'approved').length;

  if (role !== 'admin') {
    return (
      <div className="text-center py-16 text-slate-500 bg-white rounded-2xl shadow-sm border border-slate-200 mt-6 max-w-lg mx-auto p-8">
        <Ban className="w-12 h-12 mb-3 text-red-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-800">Administrator Access Required</h3>
        <p className="text-xs text-slate-500 mt-1">
          This portal section is restricted to designated System Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Admin · Security & Access Management</h2>
          <p className="text-sm text-slate-500">Government Decision Support Portal · Role & Approval Pipeline</p>
        </div>
        <button
          onClick={fetchUsers}
          className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition"
        >
          <RefreshCw className="w-4 h-4 mr-2 inline-block" /> Refresh Users
        </button>
      </div>

      {actionMessage && (
        <div
          className={`p-3 rounded-xl text-xs font-medium border flex items-center gap-2 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : actionMessage.type === 'error'
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}
        >
          <span>{actionMessage.type === 'success' ? <Check className="w-4 h-4" /> : actionMessage.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <Info className="w-4 h-4" />}</span>
          <span>{actionMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat label="Total Users" value={users.length} color="text-brand-600" />
        <Stat
          label="Pending Approvals"
          value={pendingUsers.length}
          color={pendingUsers.length > 0 ? 'text-amber-600' : 'text-slate-400'}
          highlight={pendingUsers.length > 0}
        />
        <Stat label="Active Authorized" value={activeUsers} color="text-emerald-600" />
        <Stat label="Monitored Habitations" value={stats?.habitations || 0} color="text-risk-orange" />
      </div>

      {/* PENDING APPROVALS QUEUE */}
      {pendingUsers.length > 0 && (
        <Card
          title={
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping"></span>
              <span>Pending Registration Requests ({pendingUsers.length})</span>
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200 text-xs uppercase tracking-wider">
                  <th className="py-2.5 font-semibold">Applicant</th>
                  <th className="py-2.5 font-semibold">Email</th>
                  <th className="py-2.5 font-semibold">Requested Tier</th>
                  <th className="py-2.5 font-semibold">Designation / District</th>
                  <th className="py-2.5 font-semibold text-right">Approval Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 font-semibold text-slate-800">{u.name}</td>
                    <td className="py-3 text-slate-600 font-mono text-xs">{u.email}</td>
                    <td className="py-3">{roleBadge(u.role)}</td>
                    <td className="py-3 text-slate-600 text-xs">
                      {u.designation || '—'} {u.district ? `(${u.district})` : ''}
                    </td>
                    <td className="py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(u.id, u.email)}
                          disabled={processingId === u.id}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition disabled:opacity-50"
                        >
                          <Check className="w-4 h-4 mr-1 inline-block" /> Approve Access
                        </button>
                        <button
                          onClick={() => handleReject(u.id, u.email)}
                          disabled={processingId === u.id}
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg transition disabled:opacity-50"
                        >
                          <X className="w-4 h-4 mr-1 inline-block" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ALL USERS ROSTER */}
      {loading ? (
        <Spinner />
      ) : (
        <Card title="System Personnel & Access Directory">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200 text-xs uppercase tracking-wider">
                  <th className="py-2.5 font-semibold">Name</th>
                  <th className="py-2.5 font-semibold">Email</th>
                  <th className="py-2.5 font-semibold">Role Tier</th>
                  <th className="py-2.5 font-semibold">Designation</th>
                  <th className="py-2.5 font-semibold">Approval Status</th>
                  <th className="py-2.5 font-semibold">Account State</th>
                  <th className="py-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/40 transition">
                    <td className="py-3 font-semibold text-slate-800">{u.name}</td>
                    <td className="py-3 text-slate-600 font-mono text-xs">{u.email}</td>
                    <td className="py-3">{roleBadge(u.role)}</td>
                    <td className="py-3 text-slate-600 text-xs">{u.designation || '—'}</td>
                    <td className="py-3">{statusBadge(u.status)}</td>
                    <td className="py-3">
                      {u.active === false ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Disabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleActive(u)}
                          disabled={processingId === u.id}
                          className="text-xs text-slate-500 hover:text-slate-800 underline transition"
                        >
                          {u.active === false ? 'Re-enable' : 'Disable'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function Stat({ label, value, color, highlight }) {
  return (
    <div className={`card p-4 text-center ${highlight ? 'border-amber-400 bg-amber-50/30' : ''}`}>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs uppercase text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function roleBadge(role) {
  const labels = {
    admin: 'Admin',
    disaster_authority: 'Disaster Authority',
    analyst: 'Analyst',
    field_officer: 'Field Officer',
    viewer: 'Viewer',
  };
  const tones = {
    admin: 'red',
    disaster_authority: 'orange',
    analyst: 'yellow',
    field_officer: 'blue',
    viewer: 'green',
  };
  return <Badge tone={tones[role] || 'slate'}>{labels[role] || role}</Badge>;
}

function statusBadge(status) {
  if (status === 'approved') {
    return <Badge tone="green">Approved</Badge>;
  }
  if (status === 'rejected') {
    return <Badge tone="red">Rejected</Badge>;
  }
  return <Badge tone="orange">Pending Approval</Badge>;
}
