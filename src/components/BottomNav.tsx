import { Link, useLocation } from "react-router-dom";
import { Search, BookOpen, BarChart2, User, Bell } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/api/axios";

const navItems = [
	{ path: "/search", icon: Search, label: "Recherche" },
	{ path: "/library", icon: BookOpen, label: "Bibliothèque" },
	{ path: "/stats", icon: BarChart2, label: "Statistiques" },
	{ path: "/profile", icon: User, label: "Profil" },
];

function BottomNav() {
	const location = useLocation();
	const [unreadCount, setUnreadCount] = useState(0);

	useEffect(() => {
		async function fetchUnreadCount() {
			try {
				const { data } = await api.get("/notifications/unread");
				setUnreadCount(data.count);
			} catch (error) {
				console.error(error);
			}
		}
		fetchUnreadCount();
	}, []);

	return (
		<nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50">
			{navItems.map(({ path, icon: Icon, label }) => {
				const isActive = location.pathname === path;
				return (
					<Link
						key={path}
						to={path}
						className={`flex flex-col items-center gap-1 text-xs transition-colors ${
							isActive ? "text-green-600" : "text-gray-400"
						}`}
					>
						<Icon size={22} />
						<span>{label}</span>
					</Link>
				);
			})}

			{/* Cloche notifications */}
			<Link
				to="/notifications"
				className={`flex flex-col items-center gap-1 text-xs transition-colors relative ${
					location.pathname === "/notifications"
						? "text-green-600"
						: "text-gray-400"
				}`}
			>
				<div className="relative">
					<Bell size={22} />
					{unreadCount > 0 && (
						<span
							style={{
								position: "absolute",
								top: "-4px",
								right: "-6px",
								backgroundColor: "#dc2626",
								color: "white",
								borderRadius: "999px",
								fontSize: "9px",
								padding: "1px 4px",
								minWidth: "14px",
								textAlign: "center",
							}}
						>
							{unreadCount}
						</span>
					)}
				</div>
				<span>Alertes</span>
			</Link>
		</nav>
	);
}

export default BottomNav;
