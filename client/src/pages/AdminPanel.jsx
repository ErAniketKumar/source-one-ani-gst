import { useEffect, useState } from "react";
import {
  getAllUsers, toggleBlockUser,
  getAllGSTProfiles, verifyGSTProfile,
  getAllFilings, getAuditLog,
  verifyFilingHistory
} from "../services/adminService";
import { Card, Badge, Button, PageLoader, EmptyState, SectionTitle } from "../components/UI";

const TABS = ["Users", "GST Profiles", "Filings", "Audit Log"];

const AdminPanel = () => {
  const [tab, setTab] = useState("Users");
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [filings, setFilings] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [expandedFiling, setExpandedFiling] = useState(null); // Track expanded filing GSTIN

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [u, p, f, a] = await Promise.all([
        getAllUsers(), getAllGSTProfiles(), getAllFilings(), getAuditLog(),
      ]);
      setUsers(u.data.data);
      setProfiles(p.data.data);
      setFilings(f.data.data);
      setAudit(a.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleBlock = async (userId) => {
    setActionLoading((p) => ({ ...p, [userId]: true }));
    try {
      await toggleBlockUser(userId);
      setUsers((prev) =>
        prev.map((u) => u._id === userId ? { ...u, isBlocked: !u.isBlocked } : u)
      );
    } catch (err) { console.error(err); }
    finally { setActionLoading((p) => ({ ...p, [userId]: false })); }
  };

  const handleVerify = async (gstin) => {
    setActionLoading((p) => ({ ...p, [gstin]: true }));
    try {
      await verifyGSTProfile(gstin);
      setProfiles((prev) =>
        prev.map((p) => p.gstin === gstin ? { ...p, isVerified: true, verifiedAt: new Date() } : p)
      );
    } catch (err) { console.error(err); }
    finally { setActionLoading((p) => ({ ...p, [gstin]: false })); }
  };

  const handleVerifyFiling = async (gstin, status) => {
    setActionLoading((p) => ({ ...p, [`${gstin}-${status}`]: true }));
    try {
      await verifyFilingHistory(gstin, status);
      setFilings((prev) =>
        prev.map((f) => 
          f.gstin === gstin 
            ? { 
                ...f, 
                verificationStatus: status, 
                isLocked: status === "Verified" 
              } 
            : f
        )
      );
    } catch (err) { console.error(err); }
    finally { setActionLoading((p) => ({ ...p, [`${gstin}-${status}`]: false })); }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <SectionTitle title="Admin Panel" subtitle="Manage users, GST profiles, and filings" />

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Users", val: users.length, icon: "👥", c: "bg-indigo-500/20" },
          { label: "GST Profiles", val: profiles.length, icon: "🏢", c: "bg-blue-500/20" },
          { label: "Blocked Users", val: users.filter(u => u.isBlocked).length, icon: "🚫", c: "bg-red-500/20" },
          { label: "Unverified GSTs", val: profiles.filter(p => !p.isVerified).length, icon: "⏳", c: "bg-yellow-500/20" },
        ].map((s) => (
          <Card key={s.label} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${s.c}`}>{s.icon}</div>
            <div>
              <p className="text-slate-400 text-xs">{s.label}</p>
              <p className="text-white text-xl font-bold">{s.val}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 border border-slate-700/50 p-1 rounded-xl mb-6 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 min-w-max text-sm font-medium px-4 py-2 rounded-lg transition-all ${
              tab === t
                ? "bg-indigo-600 text-white shadow"
                : "text-slate-400 hover:text-white"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── USERS TAB ─────────────────────────────────────────────────────────── */}
      {tab === "Users" && (
        users.length === 0 ? <EmptyState icon="👥" title="No users found" /> : (
          <div className="grid gap-3">
            {users.map((u) => (
              <Card key={u._id} className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-indigo-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {u.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-white font-medium text-sm">{u.name}</p>
                    <p className="text-slate-400 text-xs">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={u.isBlocked ? "Blocked" : "Active"} variant={u.isBlocked ? "danger" : "success"} />
                  <Button
                    variant={u.isBlocked ? "success" : "danger"}
                    loading={actionLoading[u._id]}
                    onClick={() => handleBlock(u._id)}
                    className="text-xs py-1.5 px-3"
                  >
                    {u.isBlocked ? "Unblock" : "Block"}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* ── GST PROFILES TAB ──────────────────────────────────────────────────── */}
      {tab === "GST Profiles" && (
        profiles.length === 0 ? <EmptyState icon="🏢" title="No GST profiles found" /> : (
          <div className="grid gap-3">
            {profiles.map((p) => (
              <Card key={p._id} className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-white font-semibold text-sm">{p.tradeName}</p>
                  <p className="text-slate-400 text-xs font-mono">{p.gstin}</p>
                  <p className="text-slate-500 text-xs mt-1">
                    Owner: {p.user?.name} ({p.user?.email})
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge label={p.status} variant={p.status === "Active" ? "success" : "danger"} />
                  {p.isVerified ? (
                    <Badge label="✓ Verified" variant="success" />
                  ) : (
                    <Button
                      variant="success"
                      loading={actionLoading[p.gstin]}
                      onClick={() => handleVerify(p.gstin)}
                      className="text-xs py-1.5 px-3"
                    >
                      Verify
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )
      )}

      {/* ── FILINGS TAB ───────────────────────────────────────────────────────── */}
      {tab === "Filings" && (
        filings.length === 0 ? <EmptyState icon="📄" title="No filing records found" /> : (
          <div className="grid gap-3">
            {filings.map((f) => (
              <Card key={f._id} className={f.complianceStatus.isDefaulter ? "border-red-500/30" : ""}>
                <div className="flex items-start justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-white font-mono text-sm font-semibold">{f.gstin}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Owner: {f.user?.name} ({f.user?.email})
                    </p>
                    <p className="text-slate-400 text-xs">
                      Financial Years: {f.financialYears.map((fy) => fy.financialYear).join(", ")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {f.complianceStatus.isDefaulter && <Badge label="Defaulter" variant="danger" />}
                    {f.complianceStatus.isAnyDelay && <Badge label="Delays Found" variant="warning" />}
                    
                    {/* Verification Status */}
                    <Badge 
                      label={f.verificationStatus || "Pending"} 
                      variant={
                        f.verificationStatus === "Verified" ? "success" : 
                        f.verificationStatus === "Rejected" ? "danger" : "warning"
                      } 
                    />
                    {f.isLocked && <Badge label="🔒 Locked" variant="info" />}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        onClick={() => setExpandedFiling(expandedFiling === f.gstin ? null : f.gstin)}
                        className="text-[10px] py-1 px-3 border border-slate-700 hover:bg-slate-700/50"
                      >
                        {expandedFiling === f.gstin ? "Hide Details" : "View Details"}
                      </Button>

                      <div className="h-6 w-px bg-slate-700 mx-1" />

                      {f.verificationStatus !== "Verified" && (
                        <Button
                          variant="success"
                          loading={actionLoading[`${f.gstin}-Verified`]}
                          onClick={() => handleVerifyFiling(f.gstin, "Verified")}
                          className="text-[10px] py-1 px-3"
                        >
                          Verify
                        </Button>
                      )}
                      {f.verificationStatus !== "Rejected" && (
                        <Button
                          variant="danger"
                          loading={actionLoading[`${f.gstin}-Rejected`]}
                          onClick={() => handleVerifyFiling(f.gstin, "Rejected")}
                          className="text-[10px] py-1 px-3"
                        >
                          Reject
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedFiling === f.gstin && (
                  <div className="mt-4 border-t border-slate-700/50 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    {f.financialYears.map((fy) => (
                      <div key={fy.financialYear} className="mb-4 last:mb-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-indigo-400 font-bold text-xs uppercase tracking-wider">{fy.financialYear}</span>
                          <span className="text-slate-500 text-[10px]">({fy.filingFrequency})</span>
                        </div>
                        <div className="overflow-x-auto rounded-lg border border-slate-700/30">
                          <table className="w-full text-[11px] text-left">
                            <thead className="bg-slate-900/40 text-slate-400">
                              <tr>
                                <th className="px-3 py-2">Type</th>
                                <th className="px-3 py-2">Period</th>
                                <th className="px-3 py-2">Date</th>
                                <th className="px-3 py-2">ARN</th>
                                <th className="px-3 py-2">Status</th>
                              </tr>
                            </thead>
                            <tbody className="text-slate-300">
                              {fy.filings.map((entry, idx) => (
                                <tr key={idx} className="border-t border-slate-700/30 hover:bg-slate-700/20">
                                  <td className="px-3 py-2 font-mono text-indigo-300">{entry.returnType}</td>
                                  <td className="px-3 py-2">{entry.returnPeriod}</td>
                                  <td className="px-3 py-2">{new Date(entry.filingDate).toLocaleDateString()}</td>
                                  <td className="px-3 py-2 font-mono text-slate-400">{entry.arn || "—"}</td>
                                  <td className="px-3 py-2">
                                    <Badge 
                                      label={entry.status} 
                                      variant={entry.status === "Filed" ? "success" : entry.status === "Late Filed" ? "warning" : "danger"}
                                    />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )
      )}

      {/* ── AUDIT LOG TAB ─────────────────────────────────────────────────────── */}
      {tab === "Audit Log" && (
        audit.length === 0 ? <EmptyState icon="📋" title="No audit actions yet" /> : (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/60">
                    {["Action", "Admin", "Target User", "GSTIN", "Remarks", "Date"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {audit.map((a) => (
                    <tr key={a._id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-4 py-3">
                        <Badge
                          label={a.actionType}
                          variant={a.actionType.includes("BLOCK") ? "danger" : a.actionType === "VERIFY_GST" ? "success" : "info"}
                        />
                      </td>
                      <td className="px-4 py-3 text-slate-300 text-xs">{a.admin?.name}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{a.targetUser?.name || "—"}</td>
                      <td className="px-4 py-3 font-mono text-slate-400 text-xs">{a.targetGstin || "—"}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">{a.remarks || "—"}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs">
                        {new Date(a.createdAt).toLocaleDateString("en-IN")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default AdminPanel;
