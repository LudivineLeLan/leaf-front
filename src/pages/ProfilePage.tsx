import { useNavigate } from "react-router-dom";
import { LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function ProfilePage() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = async () => {
		await logout();
		navigate("/login");
	};

	return (
		<div className="px-4 pt-6 pb-24 bg-background min-h-screen">
			<h1
				className="text-2xl font-bold text-primary"
				style={{ marginBottom: "1rem" }}
			>
				Profil
			</h1>

			{/* Avatar + infos */}
			<div className="flex items-center gap-4 mb-8 bg-surface rounded-xl p-4">
				<div className="w-16 h-16 rounded-full bg-surface-elevated flex items-center justify-center">
					<User size={32} className="text-accent" />
				</div>
				<div>
					<p className="font-semibold text-lg text-primary">{user?.username}</p>
					<p className="text-sm text-muted">{user?.email}</p>
				</div>
			</div>

			{/* Logout button */}
			<button
				type="button"
				onClick={handleLogout}
				style={{
					display: "flex",
					alignItems: "center",
					gap: "8px",
					padding: "12px 16px",
					borderRadius: "12px",
					fontSize: "14px",
					border: "1px solid #3f1010",
					cursor: "pointer",
					backgroundColor: "#1c0a0a",
					color: "#f87171",
					width: "100%",
				}}
			>
				<LogOut size={16} />
				Se déconnecter
			</button>
		</div>
	);
}

export default ProfilePage;
