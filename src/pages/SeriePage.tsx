import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import api from "@/api/axios";
import AddButton from "@/components/AddButton";
import { googleBooksSearchSerie } from "@/api/googleBooks";
import { extractSeriesInfo } from "@/utils/seriesInfo";
import { cn } from "@/lib/utils";

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

	// Fetch serie details and cross with Google Books results
	useEffect(() => {
		async function fetchSerie() {
			try {
				const { data } = await api.get(`/serie/${id}`);

				// Search Google Books from the frontend to avoid geo-biased results
				const googleResults = await googleBooksSearchSerie(data.searchQuery);

				// Deduplicate and keep only books whose title starts with the serie name
				const seen = new Set();
				const uniqueResults = googleResults.filter((book) => {
					if (seen.has(book.googleBooksId)) return false;
					seen.add(book.googleBooksId);
					return book.title.toLowerCase().startsWith(data.name.toLowerCase());
				});

				// Cross Google Books results with the user's library books
				const volumes = uniqueResults
					.map((googleBook) => {
						const bookInLibrary = data.libraryBooks.find(
							(book: { googleBooksId: string }) =>
								book.googleBooksId === googleBook.googleBooksId,
						);
						const seriesInfo = extractSeriesInfo(googleBook.title);
						return {
							googleBooksId: googleBook.googleBooksId,
							title: googleBook.title,
							cover: googleBook.thumbnail,
							seriesPosition:
								bookInLibrary?.seriesPosition || seriesInfo?.position || null,
							isInLibrary: !!bookInLibrary,
							libraryBookId: bookInLibrary?.id || null,
						};
					})
					// Sort by series position, volumes without a position go last
					.sort((firstVolume, secondVolume) => {
						if (firstVolume.seriesPosition === null) return 1;
						if (secondVolume.seriesPosition === null) return -1;
						return firstVolume.seriesPosition - secondVolume.seriesPosition;
					});

				setSerie({
					id: data.id,
					name: data.name,
					total_volumes: data.total_volumes,
					volumes,
				});
				setTotalVolumes(data.total_volumes ?? null);
			} catch (caughtError) {
				console.error(caughtError);
			} finally {
				setLoading(false);
			}
		}
		fetchSerie();
	}, [id]);

	// Fetch follow status in parallel with fetchSerie
	useEffect(() => {
		async function fetchFollowStatus() {
			try {
				const { data } = await api.get("/follows");
				const following = data.series.some(
					(series: { serieId: number }) => series.serieId === Number(id),
				);
				setIsFollowing(following);
			} catch (caughtError) {
				console.error(caughtError);
			}
		}
		fetchFollowStatus();
	}, [id]);

	// Toggle follow/unfollow for this serie
	const handleFollow = async () => {
		try {
			if (isFollowing) {
				await api.delete(`/follows/serie/${id}`);
				setIsFollowing(false);
			} else {
				await api.post(`/follows/serie/${id}`);
				setIsFollowing(true);
			}
		} catch (caughtError) {
			console.error(caughtError);
		}
	};

	// Update the total number of volumes for this serie
	const handleUpdateVolumes = async (value: number) => {
		try {
			await api.patch(`/serie/${id}`, { total_volumes: value });
			setTotalVolumes(value);
			setIsEditingVolumes(false);
		} catch (caughtError) {
			console.error(caughtError);
		}
	};

	// Import a volume and add it to the library, then update local state
	const handleAddBook = async (volume: Volume, event: React.MouseEvent) => {
		// Prevent the click from bubbling up to the volume row's navigation handler
		event.stopPropagation();
		try {
			const { data: importedBook } = await api.post("/books/import", {
				googleBooksId: volume.googleBooksId,
				title: volume.title,
				thumbnail: volume.cover,
			});
			await api.post(`/library/${importedBook.id}`, { status: "to_read" });
			setSerie((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					volumes: prev.volumes.map((existingVolume) =>
						existingVolume.googleBooksId === volume.googleBooksId
							? {
									...existingVolume,
									isInLibrary: true,
									libraryBookId: importedBook.id,
								}
							: existingVolume,
					),
				};
			});
		} catch (caughtError) {
			console.error(caughtError);
		}
	};

	// Remove a volume from the library and update local state
	const handleRemoveBook = async (
		libraryBookId: number,
		event: React.MouseEvent,
	) => {
		// Prevent the click from bubbling up to the volume row's navigation handler
		event.stopPropagation();
		try {
			await api.delete(`/library/${libraryBookId}`);
			setSerie((prev) => {
				if (!prev) return prev;
				return {
					...prev,
					volumes: prev.volumes.map((volume) =>
						volume.libraryBookId === libraryBookId
							? { ...volume, isInLibrary: false, libraryBookId: null }
							: volume,
					),
				};
			});
		} catch (caughtError) {
			console.error(caughtError);
		}
	};

	// Navigate to the book detail page. If the book isn't imported yet,
	// import it first to get its internal id, then navigate.
	const handleOpenVolume = async (volume: Volume) => {
		if (volume.libraryBookId) {
			navigate(`/book/${volume.libraryBookId}`);
			return;
		}
		try {
			const { data: importedBook } = await api.post("/books/import", {
				googleBooksId: volume.googleBooksId,
				title: volume.title,
				thumbnail: volume.cover,
			});
			navigate(`/book/${importedBook.id}`);
		} catch (caughtError) {
			console.error(caughtError);
		}
	};

	if (loading)
		return <p className="text-center text-muted mt-10">Chargement...</p>;
	if (!serie)
		return <p className="text-center text-muted mt-10">Série introuvable</p>;

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
				{/* Follow toggle — same pattern as the author follow button */}
				<button
					type="button"
					onClick={handleFollow}
					className={cn(
						"px-3 py-1.5 rounded-full text-xs border cursor-pointer",
						isFollowing
							? "bg-transparent text-muted border-border"
							: "bg-accent text-background border-accent",
					)}
				>
					{isFollowing ? "Suivi ✓" : "+ Suivre"}
				</button>
			</div>

			{/* Volume count and inline editor for total volumes */}
			<div className="px-4 mb-4 flex items-center gap-2">
				<p className="text-sm text-muted">
					{serie.volumes.filter((volume) => volume.isInLibrary).length}
					{" / "}
					{isEditingVolumes ? (
						<input
							type="number"
							defaultValue={totalVolumes ?? ""}
							onBlur={(event) =>
								handleUpdateVolumes(Number(event.target.value))
							}
							onKeyDown={(event) => {
								if (event.key === "Enter")
									handleUpdateVolumes(
										Number((event.target as HTMLInputElement).value),
									);
							}}
							autoFocus
							// Tailwind replaces the inline style — border-border uses the design token
							className="w-12 bg-transparent border border-border rounded text-primary px-1 text-sm"
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

			{/* Progress bar — inline style is justified here because Tailwind
			    cannot generate dynamic widths at runtime */}
			{totalVolumes && totalVolumes > 0 && (
				<div className="px-4 mb-4">
					<div className="w-full bg-surface-elevated rounded-full h-2">
						<div
							className="bg-accent rounded-full h-2 transition-all"
							style={{
								width: `${Math.min(
									(serie.volumes.filter((volume) => volume.isInLibrary).length /
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
					// button instead of div for semantics and keyboard navigation
					<button
						key={volume.googleBooksId}
						type="button"
						className="flex gap-3 items-center bg-surface rounded-xl p-3 w-full text-left"
						onClick={() => handleOpenVolume(volume)}
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
							<div className="flex items-center justify-between mt-1">
								{volume.isInLibrary ? (
									<>
										<p className="text-xs text-accent">
											✓ Dans ta bibliothèque
										</p>
										{volume.libraryBookId && (
											<button
												type="button"
												onClick={(event) =>
													handleRemoveBook(volume.libraryBookId!, event)
												}
												className="text-muted hover:text-red-400 transition-colors"
											>
												<Trash2 size={14} />
											</button>
										)}
									</>
								) : (
									<AddButton
										onClick={(event) => handleAddBook(volume, event)}
									/>
								)}
							</div>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}

export default SeriePage;
