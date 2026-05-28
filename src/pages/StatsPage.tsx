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
		{ label: "Livres au total", value: stats.total, color: "#34d399" },
		{ label: "À lire", value: stats.toRead, color: "#818cf8" },
		{ label: "En cours", value: stats.reading, color: "#fbbf24" },
		{ label: "Lus", value: stats.finished, color: "#34d399" },
		{ label: "Séries suivies", value: stats.seriesFollowed, color: "#c084fc" },
		{ label: "Auteurs suivis", value: stats.authorsFollowed, color: "#f472b6" },
	];

	return (
		<div className="px-4 pt-6 pb-24 bg-background min-h-screen">
			<h1
				className="text-2xl font-bold text-primary"
				style={{ marginBottom: "1rem" }}
			>
				Statistiques
			</h1>

			<div className="grid grid-cols-2 gap-4">
				{statCards.map((card) => (
					<div
						key={card.label}
						className="bg-surface rounded-xl p-4 border border-border"
					>
						<p
							className="text-3xl font-bold mb-1"
							style={{ color: card.color }}
						>
							{card.value}
						</p>
						<p className="text-xs text-secondary">{card.label}</p>
					</div>
				))}
			</div>
		</div>
	);
}

export default StatsPage;
