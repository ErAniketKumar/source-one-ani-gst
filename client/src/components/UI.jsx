// ── Spinner ────────────────────────────────────────────────────────────────────
export const Spinner = ({ size = "md" }) => {
  const sizes = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" };
  return (
    <div className={`${sizes[size]} border-4 border-indigo-600 border-t-transparent rounded-full animate-spin`} />
  );
};

// ── Page Loader ────────────────────────────────────────────────────────────────
export const PageLoader = () => (
  <div className="flex items-center justify-center py-20">
    <Spinner size="lg" />
  </div>
);

// ── Empty State ────────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = "📭", title = "No data found", message = "" }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="text-5xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-slate-200 mb-1">{title}</h3>
    {message && <p className="text-slate-400 text-sm max-w-xs">{message}</p>}
  </div>
);

// ── Alert Banner ───────────────────────────────────────────────────────────────
export const Alert = ({ type = "error", message }) => {
  if (!message) return null;
  const styles = {
    error: "bg-red-500/10 border-red-500/30 text-red-400",
    success: "bg-green-500/10 border-green-500/30 text-green-400",
    info: "bg-indigo-500/10 border-indigo-500/30 text-indigo-400",
  };
  return (
    <div className={`border rounded-lg px-4 py-3 text-sm font-medium ${styles[type]}`}>
      {message}
    </div>
  );
};

// ── Status Badge ───────────────────────────────────────────────────────────────
export const Badge = ({ label, variant = "default" }) => {
  const variants = {
    default: "bg-slate-700 text-slate-200",
    success: "bg-green-500/20 text-green-400 border border-green-500/30",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30",
    warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    info: "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
  };
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${variants[variant]}`}>
      {label}
    </span>
  );
};

// ── Card ───────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = "" }) => (
  <div className={`bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 backdrop-blur-sm ${className}`}>
    {children}
  </div>
);

// ── Section Title ──────────────────────────────────────────────────────────────
export const SectionTitle = ({ title, subtitle }) => (
  <div className="mb-6">
    <h2 className="text-xl font-bold text-white">{title}</h2>
    {subtitle && <p className="text-slate-400 text-sm mt-1">{subtitle}</p>}
  </div>
);

// ── Input Field ────────────────────────────────────────────────────────────────
export const InputField = ({ label, id, error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label}
      </label>
    )}
    <input
      id={id}
      className="bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
      {...props}
    />
    {error && <span className="text-red-400 text-xs">{error}</span>}
  </div>
);

// ── Select Field ───────────────────────────────────────────────────────────────
export const SelectField = ({ label, id, options = [], error, ...props }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label htmlFor={id} className="text-sm font-medium text-slate-300">
        {label}
      </label>
    )}
    <select
      id={id}
      className="bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
    {error && <span className="text-red-400 text-xs">{error}</span>}
  </div>
);

// ── Primary Button ─────────────────────────────────────────────────────────────
export const Button = ({ children, loading, variant = "primary", className = "", ...props }) => {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    ghost: "bg-slate-700 hover:bg-slate-600 text-white",
    success: "bg-green-600 hover:bg-green-700 text-white",
  };
  return (
    <button
      disabled={loading}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
      {children}
    </button>
  );
};
