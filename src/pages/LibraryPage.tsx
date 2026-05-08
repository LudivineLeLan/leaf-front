import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { BookMarked, BookOpen, BookCheck } from "lucide-react";
import api from "@/api/axios"; // base URL + auth with token for each request

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

	if (loading)
		return <p className="text-center text-gray-400 mt-10">Chargement...</p>;

	if (userBooks.length === 0)
		return (
			<div className="px-4 pt-6 text-center text-gray-400">
				<p>Ta bibliothèque est vide.</p>
				<p className="text-sm mt-1">Recherche des livres pour commencer !</p>
			</div>
		);

	return (
		<div className="px-4 pt-6 pb-4">
			<h1 className="text-2xl font-bold mb-4">Ma bibliothèque</h1>

			<div className="flex flex-col gap-4">
				{userBooks
					.filter((userBook) => userBook.book !== null)
					.map((userBook) => {
						const book = userBook.book!;
						return (
							<div key={userBook.bookId} className="flex gap-3 items-start">
								{/* Zone cliquable — cover + titre + série */}
								<div
									className="flex gap-3 items-start flex-1 cursor-pointer"
									onClick={() => navigate(`/book/${userBook.bookId}`)}
								>
									{/* Cover */}
									{book.cover ? (
										<img
											src={book.cover}
											alt={book.title}
											className="w-14 h-20 object-cover rounded-md shrink-0"
										/>
									) : (
										<div className="w-14 h-20 bg-gray-100 rounded-md shrink-0 flex items-center justify-center text-gray-300 text-xs">
											No cover
										</div>
									)}

									{/* Titre + Série */}
									<div className="flex flex-col gap-1 min-w-0">
										<p className="font-medium text-sm leading-tight line-clamp-2">
											{book.title}
										</p>
										{book.serie && (
											<p className="text-xs text-green-600">
												{book.serie.name}
												{book.serie.total_volumes &&
													` • ${book.serie.total_volumes} tomes`}
											</p>
										)}
									</div>
								</div>

								{/* Boutons statut */}
								<div className="flex flex-col gap-1 mt-1">
									{(Object.keys(statusConfig) as Status[]).map((statusKey) => (
										<button
											type="button"
											key={statusKey}
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
														? "#16a34a"
														: "transparent",
												color:
													userBook.status === statusKey ? "white" : "#9ca3af",
												borderColor:
													userBook.status === statusKey ? "#16a34a" : "#e5e7eb",
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
		</div>
	);
}

export default LibraryPage;
