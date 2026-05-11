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
		<div className="px-4 pt-6 pb-4">
			<h1 className="text-2xl font-bold mb-6">Profil</h1>

			{/* Avatar + infos */}
			<div className="flex items-center gap-4 mb-8">
				<div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
					<User size={32} className="text-green-600" />
				</div>
				<div>
					<p className="font-semibold text-lg">{user?.username}</p>
					<p className="text-sm text-gray-400">{user?.email}</p>
				</div>
			</div>

			{/* Log out button */}
			<button
				type="button"
				onClick={handleLogout}
				style={{
					display: "flex",
					alignItems: "center",
					gap: "8px",
					padding: "10px 16px",
					borderRadius: "12px",
					fontSize: "14px",
					border: "1px solid #fee2e2",
					cursor: "pointer",
					backgroundColor: "#fff1f2",
					color: "#dc2626",
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
