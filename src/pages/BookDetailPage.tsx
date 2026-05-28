import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@/api/axios";

interface Author {
	id: number;
	name: string;
	firstname: string | null;
}

interface Serie {
	id: number;
	name: string;
	total_volumes: number | null;
}

interface BookDetail {
	id: number;
	title: string;
	cover: string | null;
	synopsis: string | null;
	releaseDate: string | null;
	seriesPosition: number | null;
	serie: Serie | null;
	authors: Author[];
	isInLibrary: boolean;
	userStatus: string | null;
}

function BookDetailPage() {
	const { bookId } = useParams<{ bookId: string }>();
	const navigate = useNavigate();
	const [book, setBook] = useState<BookDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [followedAuthors, setFollowedAuthors] = useState<number[]>([]);

	useEffect(() => {
		const fetchBook = async () => {
			try {
				const { data } = await api.get(`/books/id/${bookId}`);
				setBook(data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};
		fetchBook();
	}, [bookId]);

	useEffect(() => {
		const fetchFollows = async () => {
			try {
				const { data } = await api.get("/follows");
				setFollowedAuthors(
					data.authors.map((a: { authorId: number }) => a.authorId),
				);
			} catch (error) {
				console.error(error);
			}
		};
		fetchFollows();
	}, []);

	const handleFollowAuthor = async (authorId: number) => {
		try {
			if (followedAuthors.includes(authorId)) {
				await api.delete(`/follows/author/${authorId}`);
				setFollowedAuthors((prev) => prev.filter((id) => id !== authorId));
			} else {
				await api.post(`/follows/author/${authorId}`);
				setFollowedAuthors((prev) => [...prev, authorId]);
			}
		} catch (error) {
			console.error(error);
		}
	};

	const handleRemoveFromLibrary = async () => {
		try {
			await api.delete(`/library/${bookId}`);
			navigate("/library");
		} catch (error) {
			console.error(error);
		}
	};

	if (loading)
		return <p className="text-center text-gray-400 mt-10">Chargement...</p>;
	if (!book)
		return <p className="text-center text-gray-400 mt-10">Livre non trouvé</p>;

	return (
		<div className="pb-24 bg-background min-h-screen">
			{/* Header */}
			<div className="flex items-center gap-3 px-4 pt-6 mb-6">
				<button
					type="button"
					onClick={() => navigate(-1)}
					className="text-primary"
				>
					<ArrowLeft size={22} />
				</button>
				<h1 className="text-lg font-bold line-clamp-1 text-primary">
					{book.title}
				</h1>
			</div>

			{/* Cover */}
			<div className="flex justify-center mb-6">
				{book.cover ? (
					<img
						src={book.cover}
						alt={book.title}
						className="w-36 h-52 object-cover rounded-xl shadow-lg shadow-black/50"
					/>
				) : (
					<div className="w-36 h-52 bg-surface rounded-xl flex items-center justify-center text-muted text-sm">
						No cover
					</div>
				)}
			</div>

			<div className="px-4 flex flex-col gap-5">
				{/* Serie */}
				{book.serie && (
					<p
						className="text-sm text-accent font-medium cursor-pointer hover:underline"
						onClick={() => navigate(`/serie/${book.serie!.id}`)}
					>
						{book.serie.name}
						{book.seriesPosition && ` • Tome ${book.seriesPosition}`}
						{book.serie.total_volumes && ` / ${book.serie.total_volumes}`}
					</p>
				)}

				{/* Authors */}
				{book.authors?.length > 0 && (
					<div className="flex flex-col gap-3">
						{book.authors.map((author) => (
							<div
								key={author.id}
								className="flex items-center justify-between"
							>
								<p className="text-sm text-secondary">
									{author.firstname} {author.name}
								</p>
								<button
									type="button"
									onClick={() => handleFollowAuthor(author.id)}
									style={{
										padding: "4px 12px",
										borderRadius: "999px",
										fontSize: "11px",
										border: "1px solid",
										cursor: "pointer",
										backgroundColor: followedAuthors.includes(author.id)
											? "transparent"
											: "#34d399",
										color: followedAuthors.includes(author.id)
											? "#52525b"
											: "#0f0f0f",
										borderColor: followedAuthors.includes(author.id)
											? "#3f3f46"
											: "#34d399",
									}}
								>
									{followedAuthors.includes(author.id) ? "Suivi ✓" : "+ Suivre"}
								</button>
							</div>
						))}
					</div>
				)}

				{/* Divider */}
				<div className="border-t border-border" />

				{/* Release date */}
				{book.releaseDate && (
					<p className="text-xs text-muted">
						Publié le {new Date(book.releaseDate).toLocaleDateString("fr-FR")}
					</p>
				)}

				{/* Synopsis */}
				{book.synopsis ? (
					<div
						className="text-sm text-secondary leading-relaxed"
						dangerouslySetInnerHTML={{ __html: book.synopsis }}
					/>
				) : (
					<p className="text-sm text-muted italic">Aucun synopsis disponible</p>
				)}
				{/* Remove from library */}
				{book.isInLibrary && (
					<button
						type="button"
						onClick={handleRemoveFromLibrary}
						style={{
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							gap: "8px",
							padding: "12px 16px",
							borderRadius: "12px",
							fontSize: "14px",
							border: "1px solid #3f1010",
							cursor: "pointer",
							backgroundColor: "#1c0a0a",
							color: "#f87171",
							width: "100%",
						}}
					>
						Retirer de ma bibliothèque
					</button>
				)}
			</div>
		</div>
	);
}

export default BookDetailPage;
