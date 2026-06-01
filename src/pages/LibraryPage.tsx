import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookMarked, BookOpen, BookCheck } from "lucide-react";
import api from "@/api/axios";

type Status = "to_read" | "reading" | "finished";

interface Serie {
	id: number;
	name: string;
	total_volumes: number | null;
}

interface Book {
	id: number;
	title: string;
	cover: string | null;
	seriesPosition: number | null;
	serie: Serie | null;
}

interface UserBook {
	bookId: number;
	status: Status;
	book: Book | null;
}

const statusConfig: Record<Status, { label: string; icon: React.ReactNode }> = {
	to_read: { label: "À lire", icon: <BookMarked size={12} /> },
	reading: { label: "En cours", icon: <BookOpen size={12} /> },
	finished: { label: "Lu", icon: <BookCheck size={12} /> },
};

function LibraryPage() {
	const [userBooks, setUserBooks] = useState<UserBook[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
	const [serieFilter, setSerieFilter] = useState<number | "all">("all");
	const navigate = useNavigate();

	useEffect(() => {
		const fetchLibrary = async () => {
			try {
				const { data } = await api.get("/library");
				setUserBooks(data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};
		fetchLibrary();
	}, []);

	const handleStatusChange = async (bookId: number, newStatus: Status) => {
		try {
			await api.put(`/library/${bookId}`, { status: newStatus });
			setUserBooks((prev) =>
				prev.map((userBook) =>
					userBook.bookId === bookId
						? { ...userBook, status: newStatus }
						: userBook,
				),
			);
		} catch (error) {
			console.error(error);
		}
	};

	// Extract unique series present in the user's library
	const availableSeries = Array.from(
		new Map(
			userBooks
				.filter((userBook) => userBook.book?.serie)
				.map((userBook) => [userBook.book!.serie!.id, userBook.book!.serie!]),
		).values(),
	);

	// Apply status and serie filters on top of the loaded data
	const filteredBooks = userBooks
		.filter((userBook) => userBook.book !== null)
		.filter(
			(userBook) => statusFilter === "all" || userBook.status === statusFilter,
		)
		.filter(
			(userBook) =>
				serieFilter === "all" || userBook.book?.serie?.id === serieFilter,
		);

	if (loading)
		return <p className="text-center text-gray-400 mt-10">Chargement...</p>;

	if (userBooks.length === 0)
		return (
			<div className="px-4 pt-6 text-center text-gray-400">
				<p>Ta bibliothèque est vide.</p>
				<p className="text-sm mt-1">Recherche des livres pour commencer !</p>
			</div>
		);

	const pillBase: React.CSSProperties = {
		display: "inline-flex",
		alignItems: "center",
		gap: "4px",
		padding: "4px 12px",
		borderRadius: "999px",
		fontSize: "12px",
		border: "1px solid",
		cursor: "pointer",
		whiteSpace: "nowrap",
	};

	const pillActive: React.CSSProperties = {
		...pillBase,
		backgroundColor: "#34d399",
		color: "#0f0f0f",
		borderColor: "#34d399",
	};

	const pillInactive: React.CSSProperties = {
		...pillBase,
		backgroundColor: "transparent",
		color: "#52525b",
		borderColor: "#3f3f46",
	};

	return (
		<div className="px-4 pt-6 pb-24 bg-background min-h-screen">
			<h1
				className="text-2xl font-bold text-primary"
				style={{ marginBottom: "1rem" }}
			>
				Bibliothèque
			</h1>

			{/* Status filter pills */}
			<div style={{ marginBottom: "12px" }}>
				<div
					style={{
						display: "flex",
						gap: "6px",
						overflowX: "auto",
						paddingBottom: "4px",
						scrollbarWidth: "none",
					}}
				>
					<button
						style={statusFilter === "all" ? pillActive : pillInactive}
						onClick={() => setStatusFilter("all")}
					>
						Tous
					</button>
					{(Object.keys(statusConfig) as Status[]).map((status) => (
						<button
							key={status}
							style={statusFilter === status ? pillActive : pillInactive}
							onClick={() => setStatusFilter(status)}
						>
							{statusConfig[status].icon}
							{statusConfig[status].label}
						</button>
					))}
				</div>
			</div>

			{/* Serie filter pills — only shown if the library contains at least one serie */}
			{availableSeries.length > 0 && (
				<div style={{ marginBottom: "20px" }}>
					<div
						style={{
							display: "flex",
							gap: "6px",
							overflowX: "auto",
							paddingBottom: "4px",
							scrollbarWidth: "none",
						}}
					>
						<button
							style={serieFilter === "all" ? pillActive : pillInactive}
							onClick={() => setSerieFilter("all")}
						>
							Toutes les séries
						</button>
						{availableSeries.map((serie) => (
							<button
								key={serie.id}
								style={serieFilter === serie.id ? pillActive : pillInactive}
								onClick={() => setSerieFilter(serie.id)}
							>
								{serie.name}
							</button>
						))}
					</div>
				</div>
			)}

			{/* Empty state when filters return no results */}
			{filteredBooks.length === 0 ? (
				<p className="text-center text-gray-400 mt-10">
					Aucun livre pour ces filtres.
				</p>
			) : (
				<div className="flex flex-col gap-4">
					{filteredBooks.map((userBook) => {
						const book = userBook.book!;
						return (
							<div
								key={userBook.bookId}
								className="flex gap-3 items-start bg-surface rounded-xl p-3"
							>
								{/* Clickable zone — navigates to book detail */}
								<div
									className="flex gap-3 items-start flex-1 cursor-pointer"
									onClick={() => navigate(`/book/${userBook.bookId}`)}
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

									<div className="flex flex-col gap-1 min-w-0">
										<p className="font-medium text-sm leading-tight line-clamp-2 text-primary">
											{book.title}
										</p>
										{book.serie?.id && (
											<p
												className="text-xs text-accent cursor-pointer hover:underline"
												onClick={(event) => {
													event.stopPropagation();
													navigate(`/serie/${book.serie!.id}`);
												}}
											>
												{book.serie.name}
												{book.serie.total_volumes &&
													` • ${book.serie.total_volumes} tomes`}
											</p>
										)}
									</div>
								</div>

								{/* Status buttons */}
								<div className="flex flex-col gap-1 mt-1">
									{(Object.keys(statusConfig) as Status[]).map((statusKey) => (
										<button
											key={statusKey}
											type="button"
											onClick={() =>
												handleStatusChange(userBook.bookId, statusKey)
											}
											style={{
												display: "flex",
												alignItems: "center",
												gap: "4px",
												padding: "2px 8px",
												borderRadius: "999px",
												fontSize: "11px",
												border: "1px solid",
												cursor: "pointer",
												backgroundColor:
													userBook.status === statusKey
														? "#34d399"
														: "transparent",
												color:
													userBook.status === statusKey ? "#0f0f0f" : "#52525b",
												borderColor:
													userBook.status === statusKey ? "#34d399" : "#3f3f46",
											}}
										>
											{statusConfig[statusKey].icon}
											{statusConfig[statusKey].label}
										</button>
									))}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}

export default LibraryPage;
