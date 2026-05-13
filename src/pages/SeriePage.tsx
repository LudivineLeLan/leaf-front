import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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

	useEffect(() => {
		async function fetchSerie() {
			try {
				const { data } = await api.get(`/serie/${id}`);
				setSerie(data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		}
		fetchSerie();
	}, [id]);

	if (loading)
		return <p className="text-center text-gray-400 mt-10">Chargement...</p>;
	if (!serie)
		return <p className="text-center text-gray-400 mt-10">Série introuvable</p>;

	return (
		<div className="pb-4">
			{/* Header */}
			<div className="flex items-center gap-3 px-4 pt-6 mb-4">
				<button type="button" onClick={() => navigate(-1)}>
					<ArrowLeft size={22} />
				</button>
				<h1 className="text-lg font-bold line-clamp-1">{serie.name}</h1>
			</div>

			{/* Progression */}
			<p className="px-4 text-sm text-gray-400 mb-4">
				{serie.volumes.filter((v) => v.isInLibrary).length} /{" "}
				{serie.volumes.length} tomes
			</p>

			{/* Liste des volumes */}
			<div className="flex flex-col gap-4 px-4">
				{serie.volumes.map((volume) => (
					<div key={volume.googleBooksId} className="flex gap-3 items-center">
						{/* Cover */}
						{volume.cover ? (
							<img
								src={volume.cover}
								alt={volume.title}
								className="w-14 h-20 object-cover rounded-md shrink-0"
							/>
						) : (
							<div className="w-14 h-20 bg-gray-100 rounded-md shrink-0 flex items-center justify-center text-gray-300 text-xs">
								No cover
							</div>
						)}

						{/* Infos */}
						<div className="flex-1">
							<p className="font-medium text-sm">{volume.title}</p>
							{volume.seriesPosition && (
								<p className="text-xs text-gray-400">
									Tome {volume.seriesPosition}
								</p>
							)}
							<p
								className={`text-xs mt-1 ${volume.isInLibrary ? "text-green-600" : "text-gray-300"}`}
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
