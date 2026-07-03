import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@/api/axios";
import AddButton from "@/components/AddButton";
import { useAuth } from "@/context/AuthContext";
import { googleBooksSearchByAuthor } from "@/api/googleBooks";

interface AuthorBook {
	googleBooksId: string;
	title: string;
	authors: string[];
	cover: string | null;
	publishedDate: string | null;
	description: string | null;
	isInLibrary: boolean;
}

interface Author {
	id: number;
	name: string;
	firstname: string | null;
}

function AuthorPage() {
	const { authorId } = useParams<{ authorId: string }>();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [author, setAuthor] = useState<Author | null>(null);
	const [books, setBooks] = useState<AuthorBook[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchAuthor() {
			try {
				// 1. Get author info from backend
				const { data } = await api.get(`/authors/${authorId}`);
				setAuthor(data);

				const fullName = `${data.firstname || ""} ${data.name}`.trim();

				// 2. Search books from Google Books frontend-side
				const googleResults = await googleBooksSearchByAuthor(fullName);
				console.log("googleResults:", googleResults);
				console.log("fullName:", fullName);

				// 3. Deduplicate
				const seen = new Set();
				const uniqueResults = googleResults.filter((book) => {
					if (seen.has(book.googleBooksId)) return false;
					seen.add(book.googleBooksId);
					return true;
				});

				// 4. Filter by author name match
				const fullNameLower = fullName.toLowerCase();
				const filtered = uniqueResults.filter((book) =>
					book.authors?.some((authorName) => {
						const authorNameLower = authorName.toLowerCase();
						return (
							authorNameLower.includes(fullNameLower) ||
							fullNameLower.includes(authorNameLower)
						);
					}),
				);

				console.log("filtered:", filtered);

				// 5. Check library
				let libraryGoogleIds: string[] = [];
				if (user) {
					const { data: libraryData } = await api.get("/library");
					libraryGoogleIds = libraryData.map(
						(item: { book: { googleBooksId: string } }) =>
							item.book.googleBooksId,
					);
				}

				setBooks(
					filtered.map((book) => ({
						googleBooksId: book.googleBooksId,
						title: book.title,
						authors: book.authors, // ajouté
						cover: book.thumbnail,
						publishedDate: book.publishedDate,
						description: book.description, // ajouté
						isInLibrary: libraryGoogleIds.includes(book.googleBooksId),
					})),
				);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		}
		fetchAuthor();
	}, [authorId, user]);

	const handleAddBook = async (book: AuthorBook) => {
		try {
			const { data: importedBook } = await api.post("/books/import", {
				googleBooksId: book.googleBooksId,
				title: book.title,
				authors: book.authors, // ajouté
				thumbnail: book.cover,
				description: book.description, // ajouté
				publishedDate: book.publishedDate, // ajouté
			});
			await api.post(`/library/${importedBook.id}`, { status: "to_read" });
			setBooks((prev) =>
				prev.map((existingBook) =>
					existingBook.googleBooksId === book.googleBooksId
						? { ...existingBook, isInLibrary: true }
						: existingBook,
				),
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

			<div className="flex flex-col gap-3 px-4">
				{books.map((book) => (
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
