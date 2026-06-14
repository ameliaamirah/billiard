// src/components/ProtectedRoute.jsx (Alternatif HOC)
import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

// HOC untuk proteksi route
export function withProtection(Component, allowedRole) {
  return function ProtectedComponent(props) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [redirectPath, setRedirectPath] = useState(null);

    useEffect(() => {
      const checkAuth = () => {
        const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
        const userRole = localStorage.getItem("role");

        if (!isLoggedIn) {
          setRedirectPath(allowedRole === "admin" ? "/admin" : "/kasir");
        } else if (userRole !== allowedRole) {
          setRedirectPath(userRole === "admin" ? "/admin-dashboard" : "/kasir-dashboard");
        } else {
          setIsAuthorized(true);
        }
        
        setIsLoading(false);
      };
      
      checkAuth();
    }, [allowedRole]);

    if (isLoading) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <FontAwesomeIcon icon={faSpinner} spin className="text-3xl text-[#00ff99]" />
        </div>
      );
    }

    if (redirectPath) {
      return <Navigate to={redirectPath} replace />;
    }

    return <Component {...props} />;
  };
}

// Komponen ProtectedRoute biasa (untuk React Router v6)
export default function ProtectedRoute({ children, allowedRole }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Simulasi pengecekan
    const check = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      const role = localStorage.getItem("role");
      
      setIsAuthenticated(loggedIn);
      setUserRole(role);
      setIsLoading(false);
    };
    
    check();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00ff99] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-xs">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (allowedRole === "admin") return <Navigate to="/admin" replace />;
    if (allowedRole === "kasir") return <Navigate to="/kasir" replace />;
    return <Navigate to="/" replace />;
  }

  if (userRole !== allowedRole) {
    if (userRole === "admin") return <Navigate to="/admin-dashboard" replace />;
    if (userRole === "kasir") return <Navigate to="/kasir-dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}