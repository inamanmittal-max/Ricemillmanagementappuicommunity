import { Navigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";

export function RedirectToDashboard() {
  const { isAuthenticated } = useAuth();
  
  // If not authenticated, redirect to login
  // If authenticated, redirect to dashboard
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />;
}