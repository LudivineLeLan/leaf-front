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
		<nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex justify-around items-center h-16 z-50">
			{navItems.map(({ path, icon: Icon, label }) => {
				const isActive = location.pathname === path;
				return (
					<Link
						key={path}
						to={path}
						className={`flex flex-col items-center gap-1 text-xs transition-colors ${
							isActive ? "text-accent" : "text-muted"
						}`}
					>
						<Icon size={22} />
						<span>{label}</span>
					</Link>
				);
			})}
			{/* Bell notification */}
			<Link
				to="/notifications"
				className={`flex flex-col items-center gap-1 text-xs transition-colors relative ${
					location.pathname === "/notifications" ? "text-accent" : "text-muted"
				}`}
			>
				<div className="relative">
					<Bell size={22} />
					{unreadCount > 0 && (
						<span className="absolute -top-1 -right-1.5 bg-red-500 text-white rounded-full text-[9px] px-1 min-w-[14px] text-center">
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
