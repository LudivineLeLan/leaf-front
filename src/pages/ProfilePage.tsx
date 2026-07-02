import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function ProfilePage() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		try {
			await logout();
		} finally {
			// Always redirect to login, even if the logout request fails —
			// AuthContext already clears local state in its own finally block
			navigate("/login");
		}
	};

	return (
		<div className="px-4 pt-6 pb-24 bg-background min-h-screen">
			{/* mb-4 replaces inline style={{ marginBottom: "1rem" }} */}
			<h1 className="text-2xl font-bold text-primary mb-4">Profil</h1>

			{/* Avatar + user info */}
			<div className="flex items-center gap-4 mb-8 bg-surface rounded-xl p-4">
				<div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center">
					<User size={32} className="text-accent" />
				</div>
				<div>
					<p className="font-semibold text-lg text-primary">{user?.username}</p>
					<p className="text-sm text-muted">{user?.email}</p>
				</div>
			</div>

			{/* Logout button — same destructive style as the remove-from-library button */}
			<button
				type="button"
				onClick={handleLogout}
				className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-sm border border-red-900 bg-red-950 text-red-400 cursor-pointer"
			>
				<LogOut size={16} />
				Se déconnecter
			</button>
		</div>
	);
}

export default ProfilePage;
