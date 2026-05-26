import { useEffect, useState } from "react";
import api from "@/api/axios";

interface Stats {
	total: number;
	toRead: number;
	reading: number;
	finished: number;
	seriesFollowed: number;
	authorsFollowed: number;
}

function StatsPage() {
	const [stats, setStats] = useState<Stats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const { data } = await api.get("/stats");
				setStats(data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, []);

	if (loading)
		return <p className="text-center text-gray-400 mt-10">Chargement...</p>;
	if (!stats)
		return (
			<p className="text-center text-gray-400 mt-10">Erreur de chargement</p>
		);

	const statCards = [
		{ label: "Livres au total", value: stats.total, color: "#16a34a" },
		{ label: "À lire", value: stats.toRead, color: "#9ca3af" },
		{ label: "En cours", value: stats.reading, color: "#f59e0b" },
		{ label: "Lus", value: stats.finished, color: "#16a34a" },
		{ label: "Séries suivies", value: stats.seriesFollowed, color: "#6366f1" },
		{ label: "Auteurs suivis", value: stats.authorsFollowed, color: "#ec4899" },
	];

	return (
		<div className="px-4 pt-6 pb-4">
			<h1 className="text-2xl font-bold mb-6">Statistiques</h1>

			<div className="grid grid-cols-2 gap-4">
				{statCards.map((card) => (
					<div
						key={card.label}
						className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
					>
						<p
							className="text-3xl font-bold mb-1"
							style={{ color: card.color }}
						>
							{card.value}
						</p>
						<p className="text-xs text-gray-500">{card.label}</p>
					</div>
				))}
			</div>
		</div>
	);
}

export default StatsPage;
