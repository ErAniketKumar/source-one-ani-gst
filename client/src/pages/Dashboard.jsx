import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getMyProfiles } from "../services/gstService";
import { getMyFilings } from "../services/filingService";
import { Card, Badge, PageLoader, EmptyState, SectionTitle } from "../components/UI";

const StatCard = ({ label, value, icon, color }) => (
  <Card className="flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-xs font-medium">{label}</p>
      <p className="text-white text-2xl font-bold mt-0.5">{value}</p>
    </div>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyProfiles(), getMyFilings()])
      .then(([p, f]) => {
        setProfiles(p.data.data);
        setFilings(f.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalFilings = filings.reduce(
    (acc, f) =>
      acc + f.financialYears.reduce((a, fy) => a + fy.filings.length, 0),
    0
  );
  const defaulters = filings.filter((f) => f.complianceStatus.isDefaulter).length;
  const delayed = filings.filter((f) => f.complianceStatus.isAnyDelay).length;

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">
          Good day, <span className="text-indigo-400">{user?.name}</span> 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">Here's your GST filing overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="GST Profiles" value={profiles.length} icon="🏢" color="bg-indigo-500/20" />
        <StatCard label="Total Filings" value={totalFilings} icon="📄" color="bg-blue-500/20" />
        <StatCard label="With Delays" value={delayed} icon="⏰" color="bg-yellow-500/20" />
        <StatCard label="Defaulters" value={defaulters} icon="🚨" color="bg-red-500/20" />
      </div>

      {/* GST Profiles List */}
      <SectionTitle
        title="Your GST Profiles"
        subtitle="Manage all your registered businesses"
      />

      {profiles.length === 0 ? (
        <EmptyState
          icon="🏢"
          title="No GST Profiles yet"
          message="Add your first GST profile to start tracking filings."
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {profiles.map((p) => (
            <Card key={p._id} className="hover:border-indigo-500/50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white font-semibold">{p.tradeName}</p>
                  <p className="text-slate-400 text-xs mt-0.5">{p.gstin}</p>
                </div>
                <Badge
                  label={p.status}
                  variant={p.status === "Active" ? "success" : "danger"}
                />
              </div>
              <p className="text-slate-400 text-xs mb-1">{p.businessType}</p>
              <p className="text-slate-400 text-xs mb-4">
                {p.primaryAddress?.city}, {p.primaryAddress?.state}
              </p>
              <div className="flex items-center gap-2">
                {p.isVerified ? (
                  <Badge label="✓ Verified" variant="success" />
                ) : (
                  <Badge label="Pending Verification" variant="warning" />
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  to={`/filings/${p.gstin}`}
                  className="flex-1 text-center bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  View Filings
                </Link>
                <Link
                  to={`/gst/edit/${p.gstin}`}
                  className="flex-1 text-center bg-slate-700/60 hover:bg-slate-700 text-slate-300 text-xs font-semibold py-2 rounded-lg transition-colors"
                >
                  Edit Profile
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link
          to="/gst/add"
          className="group bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500/50 rounded-2xl p-6 flex items-center gap-4 transition-all"
        >
          <div className="w-10 h-10 bg-indigo-600/20 rounded-xl flex items-center justify-center text-xl group-hover:bg-indigo-600/40 transition-colors">
            ➕
          </div>
          <div>
            <p className="text-white font-semibold">Add GST Profile</p>
            <p className="text-slate-400 text-xs">Register a new business GSTIN</p>
          </div>
        </Link>
        <Link
          to="/filings"
          className="group bg-slate-800/60 border border-slate-700/50 hover:border-indigo-500/50 rounded-2xl p-6 flex items-center gap-4 transition-all"
        >
          <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-xl group-hover:bg-blue-600/40 transition-colors">
            📊
          </div>
          <div>
            <p className="text-white font-semibold">Filing History</p>
            <p className="text-slate-400 text-xs">View and track all filed returns</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
