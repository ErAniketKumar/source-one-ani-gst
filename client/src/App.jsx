import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute, AdminRoute, PublicRoute } from "./components/RouteGuards";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import GSTForm from "./pages/GSTForm";
import FilingHistory from "./pages/FilingHistory";
import AdminPanel from "./pages/AdminPanel";

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <div className="min-h-screen bg-slate-950 text-white">
        <Navbar />
        <main>
          <Routes>
            {/* Public routes (redirect to dashboard if already logged in) */}
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

            {/* Protected user routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/gst/add" element={<ProtectedRoute><GSTForm /></ProtectedRoute>} />
            <Route path="/filings" element={<ProtectedRoute><FilingHistory /></ProtectedRoute>} />
            <Route path="/filings/:gstin" element={<ProtectedRoute><FilingHistory /></ProtectedRoute>} />

            {/* Admin-only routes */}
            <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />

            {/* Fallbacks */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <p className="text-8xl mb-4">404</p>
                <h2 className="text-2xl font-bold text-white mb-2">Page not found</h2>
                <p className="text-slate-400 text-sm mb-6">The page you're looking for doesn't exist.</p>
                <a href="/dashboard" className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                  Go to Dashboard
                </a>
              </div>
            } />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
