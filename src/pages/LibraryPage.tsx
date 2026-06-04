import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";

interface Book {
	id: number;
	title: string;
	cover: string | null;
	seriesPosition: number | null;
	status: string;
}

interface SerieOverview {
	id: number;
	name: string;
	total_volumes: number | null;
	cover: string | null;
	booksOwned: number;
	books: Book[];
}

interface StandaloneBook {
	id: number;
	title: string;
	cover: string | null;
	status: string;
}

interface LibraryOverview {
	series: SerieOverview[];
	standalone: StandaloneBook[];
}

function LibraryPage() {
	const [overview, setOverview] = useState<LibraryOverview | null>(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchOverview = async () => {
			try {
				const { data } = await api.get("/library/overview");
				setOverview(data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};
		fetchOverview();
	}, []);

	if (loading)
		return <p className="text-center text-muted mt-10">Chargement...</p>;

	if (
		!overview ||
		(overview.series.length === 0 && overview.standalone.length === 0)
	)
		return (
			<div className="px-4 pt-6 text-center text-muted">
				<p>Ta bibliothèque est vide.</p>
				<p className="text-sm mt-1">Recherche des livres pour commencer !</p>
			</div>
		);

	return (
		<div className="px-4 pt-6 pb-24 bg-background min-h-screen">
			<h1
				className="text-2xl font-bold text-primary"
				style={{ marginBottom: "1rem" }}
			>
				Ma bibliothèque
			</h1>

			{/* Series section */}
			{overview.series.length > 0 && (
				<div className="mb-8">
					<h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">
						Séries
					</h2>
					<div className="flex flex-col gap-3">
						{overview.series.map((serie) => (
							<div
								key={serie.id}
								className="bg-surface rounded-xl p-3 cursor-pointer"
								onClick={() => navigate(`/serie/${serie.id}`)}
							>
								<div className="flex gap-3 items-center">
									{/* Cover */}
									{serie.cover ? (
										<img
											src={serie.cover}
											alt={serie.name}
											className="w-14 h-20 object-cover rounded-md shrink-0"
										/>
									) : (
										<div className="w-14 h-20 bg-surface-elevated rounded-md shrink-0 flex items-center justify-center text-muted text-xs">
											No cover
										</div>
									)}

									{/* Infos */}
									<div className="flex-1 min-w-0">
										<p className="font-medium text-sm text-primary mb-1">
											{serie.name}
										</p>
										<p className="text-xs text-muted mb-2">
											{serie.booksOwned}
											{serie.total_volumes ? ` / ${serie.total_volumes}` : ""}{" "}
											tome(s)
										</p>

										{/* Progress bar */}
										{serie.total_volumes && serie.total_volumes > 0 && (
											<div className="w-full bg-surface-elevated rounded-full h-1.5">
												<div
													className="bg-accent rounded-full h-1.5"
													style={{
														width: `${Math.min((serie.booksOwned / serie.total_volumes) * 100, 100)}%`,
													}}
												/>
											</div>
										)}
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Standalone books section */}
			{overview.standalone.length > 0 && (
				<div>
					<h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">
						Livres
					</h2>
					<div className="flex flex-col gap-3">
						{overview.standalone.map((book) => (
							<div
								key={book.id}
								className="bg-surface rounded-xl p-3 flex gap-3 items-center cursor-pointer"
								onClick={() => navigate(`/book/${book.id}`)}
							>
								{book.cover ? (
									<img
										src={book.cover}
										alt={book.title}
										className="w-14 h-20 object-cover rounded-md shrink-0"
									/>
								) : (
									<div className="w-14 h-20 bg-surface-elevated rounded-md shrink-0 flex items-center justify-center text-muted text-xs">
										No cover
									</div>
								)}
								<p className="font-medium text-sm text-primary">{book.title}</p>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

export default LibraryPage;
