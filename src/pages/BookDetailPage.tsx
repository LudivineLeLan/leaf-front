import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import DOMPurify from "dompurify";
import api from "@/api/axios";
import { cn } from "@/lib/utils";

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

// Labels for the reading status buttons
const STATUS_LABELS: Record<string, string> = {
	to_read: "À lire",
	reading: "En cours",
	finished: "Lu",
};

function BookDetailPage() {
	const { bookId } = useParams<{ bookId: string }>();
	const navigate = useNavigate();
	const [book, setBook] = useState<BookDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [followedAuthors, setFollowedAuthors] = useState<number[]>([]);
	// Initialized to null — will be set once the book data is fetched
	const [userStatus, setUserStatus] = useState<string | null>(null);

	// Fetch book details on mount or when bookId changes
	useEffect(() => {
		const fetchBook = async () => {
			try {
				const { data } = await api.get<BookDetail>(`/books/id/${bookId}`);
				setBook(data);
				setUserStatus(data.userStatus ?? null);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};
		fetchBook();
	}, [bookId]);

	// Fetch followed authors on mount — runs in parallel with fetchBook
	useEffect(() => {
		const fetchFollows = async () => {
			try {
				const { data } = await api.get("/follows");
				setFollowedAuthors(
					data.authors.map((author: { authorId: number }) => author.authorId),
				);
			} catch (error) {
				console.error(error);
			}
		};
		fetchFollows();
	}, []);

	// Optimistically update local status before the server confirms
	const handleStatusChange = async (newStatus: string) => {
		try {
			await api.put(`/library/${bookId}`, { status: newStatus });
			setUserStatus(newStatus);
		} catch (error) {
			console.error(error);
		}
	};

	// Toggle follow/unfollow for a given author
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

	// Remove the book from the user's library and redirect to library page
	const handleRemoveFromLibrary = async () => {
		try {
			await api.delete(`/library/${bookId}`);
			navigate("/library");
		} catch (error) {
			console.error(error);
		}
	};

	if (loading)
		return <p className="text-center text-muted mt-10">Chargement...</p>;
	if (!book)
		return <p className="text-center text-muted mt-10">Livre non trouvé</p>;

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
				{/* Serie — links to the serie page */}
				{book.serie && (
					<Link
						to={`/serie/${book.serie.id}`}
						className="text-sm text-accent font-medium hover:underline"
					>
						{book.serie.name}
						{book.seriesPosition && ` • Tome ${book.seriesPosition}`}
						{book.serie.total_volumes && ` / ${book.serie.total_volumes}`}
					</Link>
				)}

				{/* Reading status buttons — only shown if the book is in the library */}
				{book.isInLibrary && (
					<div className="flex gap-2">
						{(["to_read", "reading", "finished"] as const).map((statusKey) => (
							<button
								key={statusKey}
								type="button"
								onClick={() => handleStatusChange(statusKey)}
								className={cn(
									"px-3 py-1 rounded-full text-xs border cursor-pointer",
									userStatus === statusKey
										? "bg-accent text-background border-accent"
										: "bg-transparent text-muted border-border",
								)}
							>
								{STATUS_LABELS[statusKey]}
							</button>
						))}
					</div>
				)}

				{/* Authors — each links to the author page with a follow toggle */}
				{book.authors?.length > 0 && (
					<div className="flex flex-col gap-3">
						{book.authors.map((author) => (
							<div
								key={author.id}
								className="flex items-center justify-between"
							>
								<Link
									to={`/author/${author.id}`}
									className="text-sm text-secondary hover:text-accent"
								>
									{author.firstname} {author.name}
								</Link>
								<button
									type="button"
									onClick={() => handleFollowAuthor(author.id)}
									className={cn(
										"px-3 py-1 rounded-full text-xs border cursor-pointer",
										followedAuthors.includes(author.id)
											? "bg-transparent text-muted border-border"
											: "bg-accent text-background border-accent",
									)}
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

				{/* Synopsis — sanitized with DOMPurify before injection to prevent XSS.
				    Google Books synopses may contain basic HTML tags like <br> or <b>. */}
				{book.synopsis ? (
					<div
						className="text-sm text-secondary leading-relaxed"
						dangerouslySetInnerHTML={{
							__html: DOMPurify.sanitize(book.synopsis),
						}}
					/>
				) : (
					<p className="text-sm text-muted italic">Aucun synopsis disponible</p>
				)}

				{/* Remove from library — only shown if the book is in the library */}
				{book.isInLibrary && (
					<button
						type="button"
						onClick={handleRemoveFromLibrary}
						className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm border border-red-900 bg-red-950 text-red-400 cursor-pointer"
					>
						Retirer de ma bibliothèque
					</button>
				)}
			</div>
		</div>
	);
}

export default BookDetailPage;
