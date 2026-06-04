import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@/api/axios";
import AddButton from "@/components/AddButton";

interface AuthorBook {
	googleBooksId: string;
	title: string;
	cover: string | null;
	publishedDate: string | null;
	isInLibrary: boolean;
}

interface Author {
	id: number;
	name: string;
	firstname: string | null;
	books: AuthorBook[];
}

function AuthorPage() {
	const { authorId } = useParams<{ authorId: string }>();
	const navigate = useNavigate();
	const [author, setAuthor] = useState<Author | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchAuthor() {
			try {
				const { data } = await api.get(`/authors/${authorId}`);
				setAuthor(data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		}
		fetchAuthor();
	}, [authorId]);

	const handleAddBook = async (book: AuthorBook) => {
		try {
			const { data: importedBook } = await api.post("/books/import", {
				googleBooksId: book.googleBooksId,
				title: book.title,
				thumbnail: book.cover,
			});
			await api.post(`/library/${importedBook.id}`, { status: "to_read" });
			setAuthor((prev) =>
				prev
					? {
							...prev,
							books: prev.books.map((existingBook) =>
								existingBook.googleBooksId === book.googleBooksId
									? { ...existingBook, isInLibrary: true }
									: existingBook,
							),
						}
					: prev,
			);
		} catch (error) {
			console.error(error);
		}
	};

	if (loading)
		return <p className="text-center text-muted mt-10">Chargement...</p>;
	if (!author)
		return <p className="text-center text-muted mt-10">Auteur introuvable</p>;

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
				<h1 className="text-lg font-bold text-primary">
					{author.firstname} {author.name}
				</h1>
			</div>

			{/* Books list */}
			<div className="flex flex-col gap-3 px-4">
				{author.books.map((book) => (
					<div
						key={book.googleBooksId}
						className="flex gap-3 items-start bg-surface rounded-xl p-3"
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

						<div className="flex flex-col gap-1 flex-1 min-w-0">
							<p className="font-medium text-sm text-primary leading-tight line-clamp-2">
								{book.title}
							</p>
							{book.publishedDate && (
								<p className="text-xs text-muted">
									{book.publishedDate.slice(0, 4)}
								</p>
							)}
							<div className="mt-1">
								{book.isInLibrary ? (
									<p className="text-xs text-accent">✓ Dans ta bibliothèque</p>
								) : (
									<AddButton onClick={() => handleAddBook(book)} />
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default AuthorPage;
