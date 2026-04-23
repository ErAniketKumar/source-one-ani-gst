import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">G</span>
            </div>
            <span className="text-white font-semibold text-lg tracking-tight">
              GST<span className="text-indigo-400">Manager</span>
            </span>
          </Link>

          {/* Nav Links */}
          {user && (
            <div className="hidden md:flex items-center gap-6">
              <Link to="/dashboard" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                Dashboard
              </Link>
              <Link to="/gst/add" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                Add GST
              </Link>
              <Link to="/filings" className="text-slate-300 hover:text-white text-sm font-medium transition-colors">
                Filings
              </Link>
              {isAdmin && (
                <Link to="/admin" className="text-indigo-400 hover:text-indigo-300 text-sm font-semibold transition-colors">
                  Admin Panel
                </Link>
              )}
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-7 h-7 bg-indigo-700 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-slate-300 text-sm">{user.name}</span>
                  {isAdmin && (
                    <span className="bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-slate-700 hover:bg-slate-600 text-white text-sm px-3 py-1.5 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm px-4 py-1.5 rounded-lg transition-colors">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
