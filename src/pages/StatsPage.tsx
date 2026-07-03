import { useEffect, useState } from "react";
import api from "@/api/axios";
import { cn } from "@/lib/utils";

interface Stats {
	total: number;
	toRead: number;
	reading: number;
	finished: number;
	seriesFollowed: number;
	authorsFollowed: number;
}

// Each card uses a Tailwind class instead of a hardcoded hex color,
// keeping the UI consistent with the design token system
interface StatCard {
	label: string;
	value: number;
	className: string;
}

function StatsPage() {
	const [stats, setStats] = useState<Stats | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const { data } = await api.get<Stats>("/stats");
				setStats(data);
			} catch (caughtError) {
				console.error(caughtError);
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, []);

	if (loading)
		return <p className="text-center text-muted mt-10">Chargement...</p>;
	if (!stats)
		return <p className="text-center text-muted mt-10">Erreur de chargement</p>;

	const statCards: StatCard[] = [
		{ label: "Livres au total", value: stats.total, className: "text-accent" },
		{ label: "À lire", value: stats.toRead, className: "text-indigo-400" },
		{ label: "En cours", value: stats.reading, className: "text-yellow-400" },
		{ label: "Lus", value: stats.finished, className: "text-accent" },
		{
			label: "Séries suivies",
			value: stats.seriesFollowed,
			className: "text-purple-400",
		},
		{
			label: "Auteurs suivis",
			value: stats.authorsFollowed,
			className: "text-pink-400",
		},
	];

	return (
		<div className="px-4 pt-6 pb-24 bg-background min-h-screen">
			{/* mb-4 replaces inline style={{ marginBottom: "1rem" }} */}
			<h1 className="text-2xl font-bold text-primary mb-4">Statistiques</h1>

			<div className="grid grid-cols-2 gap-4">
				{statCards.map((card) => (
					<div
						key={card.label}
						className="bg-surface rounded-xl p-4 border border-border"
					>
						{/* cn() applies the per-card color class alongside the shared styles */}
						<p className={cn("text-3xl font-bold mb-1", card.className)}>
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
