import { useEffect, useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getMyFilings, getFilingByGSTIN, initializeFilings } from "../services/filingService";
import { Badge, Card, PageLoader, EmptyState, InputField, SelectField, SectionTitle, Button } from "../components/UI";

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const FilingRow = ({ filing }) => (
  <tr className={`border-b border-slate-700/50 hover:bg-slate-700/20 transition-colors ${filing.isDelay ? "bg-red-500/5" : ""}`}>
    <td className="px-4 py-3">
      <span className="font-mono text-xs bg-slate-700 text-slate-200 px-2 py-1 rounded">
        {filing.returnType}
      </span>
    </td>
    <td className="px-4 py-3 text-slate-300 text-sm">{filing.returnPeriod}</td>
    <td className="px-4 py-3 text-slate-300 text-sm">{formatDate(filing.filingDate)}</td>
    <td className="px-4 py-3 text-slate-400 text-xs font-mono">{filing.arn || "—"}</td>
    <td className="px-4 py-3">
      <Badge
        label={filing.status}
        variant={filing.status === "Filed" ? "success" : filing.status === "Late Filed" ? "warning" : "danger"}
      />
    </td>
    <td className="px-4 py-3">
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${filing.mode === "ONLINE" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"}`}>
        {filing.mode}
      </span>
    </td>
    <td className="px-4 py-3">
      {filing.isDelay ? (
        <span className="text-xs font-bold text-red-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" /> Delayed
        </span>
      ) : (
        <span className="text-xs text-green-400">On Time</span>
      )}
    </td>
  </tr>
);

// Mobile card for each filing
const FilingCard = ({ filing }) => (
  <div className={`rounded-xl border p-4 ${filing.isDelay ? "border-red-500/40 bg-red-500/5" : "border-slate-700/50 bg-slate-800/40"}`}>
    <div className="flex items-center justify-between mb-2">
      <span className="font-mono text-xs bg-slate-700 text-slate-200 px-2 py-1 rounded">{filing.returnType}</span>
      <Badge label={filing.status} variant={filing.status === "Filed" ? "success" : filing.status === "Late Filed" ? "warning" : "danger"} />
    </div>
    <div className="text-xs text-slate-400 space-y-1">
      <p>Period: <span className="text-slate-200">{filing.returnPeriod}</span></p>
      <p>Filed: <span className="text-slate-200">{formatDate(filing.filingDate)}</span></p>
      <p>ARN: <span className="font-mono text-slate-300">{filing.arn || "—"}</span></p>
      <p>Mode: <span className="text-slate-200">{filing.mode}</span></p>
      {filing.isDelay && <p className="text-red-400 font-semibold">⚠ Delayed Filing</p>}
    </div>
  </div>
);

const FilingHistory = () => {
  const { gstin } = useParams(); // optional — if viewing by gstin
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initLoading, setInitLoading] = useState(false);

  // Filters
  const [yearFilter, setYearFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [arnSearch, setArnSearch] = useState("");

  const fetchData = () => {
    setLoading(true);
    const fetch = gstin
      ? getFilingByGSTIN(gstin).then((r) => setRecords([r.data.data]))
      : getMyFilings().then((r) => setRecords(r.data.data));

    fetch.catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [gstin]);

  const handleInitialize = async () => {
    if (!gstin) return;
    setInitLoading(true);
    try {
      await initializeFilings(gstin);
      fetchData(); // Refresh data
    } catch (err) {
      console.error(err);
    } finally {
      setInitLoading(false);
    }
  };

  // Collect all unique financial years across records
  const allYears = useMemo(() => {
    const s = new Set();
    records.forEach((r) => r.financialYears.forEach((fy) => s.add(fy.financialYear)));
    return ["", ...Array.from(s).sort().reverse()];
  }, [records]);

  // Flatten all filings for display
  const allFilings = useMemo(() => {
    const result = [];
    records.forEach((record) => {
      record.financialYears
        .filter((fy) => !yearFilter || fy.financialYear === yearFilter)
        .forEach((fy) => {
          fy.filings
            .filter((f) => !typeFilter || f.returnType === typeFilter)
            .filter((f) => !arnSearch || (f.arn || "").toLowerCase().includes(arnSearch.toLowerCase()))
            .forEach((f) => result.push({ 
              ...f, 
              financialYear: fy.financialYear, 
              gstin: record.gstin,
              verificationStatus: record.verificationStatus 
            }));
        });
    });
    return result.sort((a, b) => new Date(b.filingDate) - new Date(a.filingDate));
  }, [records, yearFilter, typeFilter, arnSearch]);

  const recordStatus = records[0]?.verificationStatus || "Pending";

  const delayCount = allFilings.filter((f) => f.isDelay).length;

  if (loading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <SectionTitle
          title={gstin ? `Filing History — ${gstin}` : "All Filing History"}
          subtitle="Track and filter all your GST return filings"
        />
        {gstin && (
          <Badge 
            label={`Verification: ${recordStatus}`} 
            variant={recordStatus === "Verified" ? "success" : recordStatus === "Rejected" ? "danger" : "warning"} 
            className="md:mt-0"
          />
        )}
      </div>

      {/* Compliance summary */}
      {delayCount > 0 && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
          <span className="text-2xl">🚨</span>
          <div>
            <p className="text-red-400 font-semibold text-sm">Compliance Warning</p>
            <p className="text-red-300 text-xs">{delayCount} delayed filing{delayCount > 1 ? "s" : ""} found in the selected view.</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectField
            label="Financial Year"
            id="year-filter"
            options={allYears.map((y) => ({ value: y, label: y || "All Years" }))}
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
          />
          <SelectField
            label="Return Type"
            id="type-filter"
            options={[
              { value: "", label: "All Types" },
              { value: "GSTR1", label: "GSTR1" },
              { value: "GSTR3B", label: "GSTR3B" },
              { value: "GSTR9", label: "GSTR9" },
            ]}
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          />
          <InputField
            label="Search by ARN"
            id="arn-search"
            placeholder="AA010324..."
            value={arnSearch}
            onChange={(e) => setArnSearch(e.target.value)}
          />
        </div>
      </Card>

      {/* Result count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-400 text-sm">
          Showing <span className="text-white font-semibold">{allFilings.length}</span> filing{allFilings.length !== 1 ? "s" : ""}
        </p>
        {(yearFilter || typeFilter || arnSearch) && (
          <button
            onClick={() => { setYearFilter(""); setTypeFilter(""); setArnSearch(""); }}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {allFilings.length === 0 ? (
        <div className="flex flex-col items-center">
          <EmptyState icon="📄" title="No filings found" message="Try adjusting your filters or initialize your filing history." />
          {gstin && (
            <Button 
              onClick={handleInitialize} 
              loading={initLoading}
              className="mt-4"
            >
              Fetch & Initialize Filing History
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-slate-800/60 border border-slate-700/50 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700 bg-slate-900/60">
                    {["Return Type", "Period", "Filing Date", "ARN", "Status", "Mode", "Delay"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allFilings.map((f) => (
                    <FilingRow key={f._id || f.arn} filing={f} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden grid grid-cols-1 gap-3">
            {allFilings.map((f) => (
              <FilingCard key={f._id || f.arn} filing={f} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FilingHistory;
