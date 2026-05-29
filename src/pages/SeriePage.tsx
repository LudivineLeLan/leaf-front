import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil } from "lucide-react";
import api from "@/api/axios";

interface Volume {
	googleBooksId: string;
	title: string;
	cover: string | null;
	seriesPosition: number | null;
	isInLibrary: boolean;
	libraryBookId: number | null;
}

interface Serie {
	id: number;
	name: string;
	total_volumes: number | null;
	volumes: Volume[];
}

function SeriePage() {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [serie, setSerie] = useState<Serie | null>(null);
	const [loading, setLoading] = useState(true);
	const [isFollowing, setIsFollowing] = useState(false);
	const [isEditingVolumes, setIsEditingVolumes] = useState(false);
	const [totalVolumes, setTotalVolumes] = useState<number | null>(null);

	useEffect(() => {
		async function fetchSerie() {
			try {
				const { data } = await api.get(`/serie/${id}`);
				setSerie(data);
				setTotalVolumes(data.total_volumes ?? null);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		}
		fetchSerie();
	}, [id]);

	useEffect(() => {
		async function fetchFollowStatus() {
			try {
				const { data } = await api.get("/follows");
				const following = data.series.some(
					(s: { serieId: number }) => s.serieId === Number(id),
				);
				setIsFollowing(following);
			} catch (error) {
				console.error(error);
			}
		}
		fetchFollowStatus();
	}, [id]);

	const handleFollow = async () => {
		try {
			if (isFollowing) {
				await api.delete(`/follows/serie/${id}`);
				setIsFollowing(false);
			} else {
				await api.post(`/follows/serie/${id}`);
				setIsFollowing(true);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const handleUpdateVolumes = async (value: number) => {
		try {
			await api.patch(`/serie/${id}`, { total_volumes: value });
			setTotalVolumes(value);
			setIsEditingVolumes(false);
		} catch (error) {
			console.error(error);
		}
	};

	if (loading)
		return <p className="text-center text-gray-400 mt-10">Chargement...</p>;
	if (!serie)
		return <p className="text-center text-gray-400 mt-10">Série introuvable</p>;

	return (
		<div className="pb-24 bg-background min-h-screen">
			{/* Header */}
			<div className="flex items-center justify-between px-4 pt-6 mb-4">
				<div className="flex items-center gap-3">
					<button
						type="button"
						onClick={() => navigate(-1)}
						className="text-primary"
					>
						<ArrowLeft size={22} />
					</button>
					<h1 className="text-lg font-bold line-clamp-1 text-primary">
						{serie.name}
					</h1>
				</div>
				<button
					type="button"
					onClick={handleFollow}
					style={{
						padding: "6px 14px",
						borderRadius: "999px",
						fontSize: "12px",
						border: "1px solid",
						cursor: "pointer",
						backgroundColor: isFollowing ? "transparent" : "#34d399",
						color: isFollowing ? "#52525b" : "#0f0f0f",
						borderColor: isFollowing ? "#3f3f46" : "#34d399",
					}}
				>
					{isFollowing ? "Suivi ✓" : "+ Suivre"}
				</button>
			</div>

			{/* Progression */}

			<div className="px-4 mb-4 flex items-center gap-2">
				<p className="text-sm text-muted">
					{serie.volumes.filter((v) => v.isInLibrary).length}
					{" / "}
					{isEditingVolumes ? (
						<input
							type="number"
							defaultValue={totalVolumes ?? ""}
							onBlur={(e) => handleUpdateVolumes(Number(e.target.value))}
							onKeyDown={(e) => {
								if (e.key === "Enter")
									handleUpdateVolumes(
										Number((e.target as HTMLInputElement).value),
									);
							}}
							autoFocus
							style={{
								width: "50px",
								background: "transparent",
								border: "1px solid #3f3f46",
								borderRadius: "4px",
								color: "#ffffff",
								padding: "0 4px",
								fontSize: "14px",
							}}
						/>
					) : (
						<span>{totalVolumes ?? "?"} tomes</span>
					)}
				</p>
				<button
					type="button"
					onClick={() => setIsEditingVolumes(true)}
					className="text-muted hover:text-accent"
				>
					<Pencil size={14} />
				</button>
			</div>

			{/* Progress bar */}
			{totalVolumes && totalVolumes > 0 && (
				<div className="px-4 mb-4">
					<div className="w-full bg-surface-elevated rounded-full h-2">
						<div
							className="bg-accent rounded-full h-2 transition-all"
							style={{
								width: `${Math.min(
									(serie.volumes.filter((v) => v.isInLibrary).length /
										totalVolumes) *
										100,
									100,
								)}%`,
							}}
						/>
					</div>
				</div>
			)}

			{/* Volumes list */}
			<div className="flex flex-col gap-3 px-4">
				{serie.volumes.map((volume) => (
					<div
						key={volume.googleBooksId}
						className="flex gap-3 items-center bg-surface rounded-xl p-3"
					>
						{/* Cover */}
						{volume.cover ? (
							<img
								src={volume.cover}
								alt={volume.title}
								className="w-12 h-18 object-cover rounded-md shrink-0"
							/>
						) : (
							<div className="w-12 h-18 bg-surface-elevated rounded-md shrink-0 flex items-center justify-center text-muted text-xs">
								No cover
							</div>
						)}

						{/* Infos */}
						<div className="flex-1">
							<p className="font-medium text-sm text-primary">{volume.title}</p>
							{volume.seriesPosition && (
								<p className="text-xs text-muted">
									Tome {volume.seriesPosition}
								</p>
							)}
							<p
								className={`text-xs mt-1 ${volume.isInLibrary ? "text-accent" : "text-muted"}`}
							>
								{volume.isInLibrary ? "✓ Dans ta bibliothèque" : "Non possédé"}
							</p>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default SeriePage;
