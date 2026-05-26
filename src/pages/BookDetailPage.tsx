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

	if (loading)
		return <p className="text-center text-gray-400 mt-10">Chargement...</p>;
	if (!book)
		return <p className="text-center text-gray-400 mt-10">Livre non trouvé</p>;

	return (
		<div className="pb-4">
			{/* Header */}
			<div className="flex items-center gap-3 px-4 pt-6 mb-6">
				<button type="button" onClick={() => navigate(-1)}>
					<ArrowLeft size={22} />
				</button>
				<h1 className="text-lg font-bold line-clamp-1">{book.title}</h1>
			</div>

			{/* Cover */}
			<div className="flex justify-center mb-6">
				{book.cover ? (
					<img
						src={book.cover}
						alt={book.title}
						className="w-32 h-48 object-cover rounded-lg shadow-md"
					/>
				) : (
					<div className="w-32 h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-300 text-sm">
						No cover
					</div>
				)}
			</div>

			<div className="px-4 flex flex-col gap-4">
				{/* Série */}
				{book.serie && (
					<p
						className="text-sm text-green-600 font-medium cursor-pointer hover:underline"
						onClick={() => navigate(`/serie/${book.serie!.id}`)}
					>
						{book.serie.name}
						{book.seriesPosition && ` • Tome ${book.seriesPosition}`}
						{book.serie.total_volumes && ` / ${book.serie.total_volumes}`}
					</p>
				)}

				{/* Auteurs */}
				{book.authors?.length > 0 && (
					<div className="flex flex-col gap-2">
						{book.authors.map((author) => (
							<div
								key={author.id}
								className="flex items-center justify-between"
							>
								<p className="text-sm text-gray-700">
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
											: "#16a34a",
										color: followedAuthors.includes(author.id)
											? "#9ca3af"
											: "white",
										borderColor: followedAuthors.includes(author.id)
											? "#e5e7eb"
											: "#16a34a",
									}}
								>
									{followedAuthors.includes(author.id) ? "Suivi ✓" : "+ Suivre"}
								</button>
							</div>
						))}
					</div>
				)}

				{/* Date de publication */}
				{book.releaseDate && (
					<p className="text-xs text-gray-400">
						Publié le {new Date(book.releaseDate).toLocaleDateString("fr-FR")}
					</p>
				)}

				{/* Synopsis */}
				{book.synopsis ? (
					<p className="text-sm text-gray-600 leading-relaxed">
						{book.synopsis}
					</p>
				) : (
					<p className="text-sm text-gray-400 italic">
						Aucun synopsis disponible
					</p>
				)}
			</div>
		</div>
	);
}

export default BookDetailPage;
