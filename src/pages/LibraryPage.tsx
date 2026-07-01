import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
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
	// Separate error state to distinguish a fetch failure from an empty library
	const [error, setError] = useState(false);
	const navigate = useNavigate();

	useEffect(() => {
		const fetchOverview = async () => {
			try {
				const { data } = await api.get<LibraryOverview>("/library/overview");
				setOverview(data);
			} catch (error) {
				console.error(error);
				setError(true);
			} finally {
				setLoading(false);
			}
		};
		fetchOverview();
	}, []);

	if (loading)
		return <p className="text-center text-muted mt-10">Chargement...</p>;

	// Show a dedicated error message instead of the empty library state,
	// so the user isn't misled into thinking their library is empty
	if (error)
		return (
			<p className="text-center text-muted mt-10">
				Impossible de charger ta bibliothèque.
			</p>
		);

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
			{/* mb-4 replaces the inline style={{ marginBottom: "1rem" }} */}
			<h1 className="text-2xl font-bold text-primary mb-4">Ma bibliothèque</h1>

			{/* Series section */}
			{overview.series.length > 0 && (
				<div className="mb-8">
					<h2 className="text-sm font-semibold text-secondary uppercase tracking-wider mb-3">
						Séries
					</h2>
					<div className="flex flex-col gap-3">
						{overview.series.map((serie) => (
							// Link instead of div + onClick for semantics, keyboard nav,
							// and middle-click support (open in new tab)
							<Link
								key={serie.id}
								to={`/serie/${serie.id}`}
								className="bg-surface rounded-xl p-3 block"
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

										{/* Progress bar — inline style is justified here because
										    Tailwind cannot generate dynamic widths at runtime */}
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
							</Link>
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
							<Link
								key={book.id}
								to={`/book/${book.id}`}
								className="bg-surface rounded-xl p-3 flex gap-3 items-center block"
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
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	);
}

export default LibraryPage;
