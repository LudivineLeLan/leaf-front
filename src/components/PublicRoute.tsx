import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

function PublicRoute({ children }: { children: ReactNode }) {
	const { user, loading } = useAuth();

	// Wait for auth check to complete before rendering or redirecting,
	// to avoid a false redirect when the user is not yet loaded
	if (loading) return null;

	if (user) return <Navigate to="/search" />;

	return children;
}

export default PublicRoute;
