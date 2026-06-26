import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function ProtectedRoute({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth();

	// Wait for auth check to complete before rendering or redirecting,
	// to avoid a false redirect when the user is already logged in
	if (loading) return null; // or a spinner

	if (!user) return <Navigate to="/login" />;

	return children;
}

export default ProtectedRoute;
