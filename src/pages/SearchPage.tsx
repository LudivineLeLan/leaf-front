import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import api from "@/api/axios";
import AddButton from "@/components/AddButton";
import { useAuth } from "@/context/AuthContext";
import { googleBooksSearch } from "@/api/googleBooks";

interface Book {
	googleBooksId: string;
	title: string;
	authors: string[];
	thumbnail: string | null;
	publishedDate: string | null;
	description: string | null;
	isInLibrary: boolean;
}

function SearchPage() {
	const [query, setQuery] = useState("");
	const [debouncedQuery, setDebouncedQuery] = useState("");
	const [results, setResults] = useState<Book[]>([]);
	const [loading, setLoading] = useState(false);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const navigate = useNavigate();
	const { user } = useAuth();

	// Delay the search by 500ms after the last keystroke to avoid firing
	// a request on every character typed
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(query);
		}, 500);

		return () => clearTimeout(timer);
	}, [query]);

	// Trigger the search only when the debounced query changes
	useEffect(() => {
		if (debouncedQuery.trim().length < 2) {
			setResults([]);
			return;
		}

		const fetchResults = async () => {
			setLoading(true);
			try {
				const books = await googleBooksSearch(debouncedQuery);

				// Check which results are already in the user's library
				let libraryGoogleIds: string[] = [];
				if (user) {
					const { data: libraryData } = await api.get("/library");
					libraryGoogleIds = libraryData.map(
						(item: { book: { googleBooksId: string } }) =>
							item.book.googleBooksId,
					);
				}

				setResults(
					books.map((book) => ({
						...book,
						isInLibrary: libraryGoogleIds.includes(book.googleBooksId),
					})),
				);
			} catch (caughtError) {
				console.error(caughtError);
				setResults([]);
			} finally {
				setLoading(false);
			}
		};

		fetchResults();
	}, [debouncedQuery, user]);

	const handleAddBook = async (book: Book) => {
		// Redirect unauthenticated users to login before allowing library actions
		if (!user) {
			navigate("/login");
			return;
		}
		try {
			// 1. Import the book into the database (findOrCreate on the backend)
			const { data: importedBook } = await api.post("/books/import", {
				googleBooksId: book.googleBooksId,
				title: book.title,
				authors: book.authors,
				thumbnail: book.thumbnail,
			});

			// 2. Add the imported book to the user's library
			await api.post(`/library/${importedBook.id}`, { status: "to_read" });

			// Optimistically update the local result to reflect the new library state
			setResults((prev) =>
				prev.map((result) =>
					result.googleBooksId === book.googleBooksId
						? { ...result, isInLibrary: true }
						: result,
				),
			);

			// Show a temporary success message for 3 seconds
			setSuccessMessage(`"${book.title}" ajouté à ta bibliothèque !`);
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (caughtError) {
			console.error(caughtError);
		}
	};

	const handleOpenBook = async (book: Book) => {
		// Redirect unauthenticated users to login before allowing navigation
		if (!user) {
			navigate("/login");
			return;
		}
		try {
			// Import the book first to get its internal id, then navigate to its page.
			// The backend uses findOrCreate so importing an existing book is safe.
			const { data: importedBook } = await api.post("/books/import", {
				googleBooksId: book.googleBooksId,
				title: book.title,
				authors: book.authors,
				thumbnail: book.thumbnail,
			});
			navigate(`/book/${importedBook.id}`);
		} catch (caughtError) {
			console.error(caughtError);
		}
	};

	return (
		<div className="px-4 pt-6 pb-24 bg-background min-h-screen">
			{/* mb-4 replaces inline style={{ marginBottom: "1rem" }} */}
			<h1 className="text-2xl font-bold text-primary mb-4">Recherche</h1>

			{successMessage && (
				<div className="mb-4 p-3 bg-accent-light text-accent text-sm rounded-lg">
					{successMessage}
				</div>
			)}

			<div className="relative mb-6 flex items-center">
				<Search
					className="absolute left-3 text-muted pointer-events-none"
					size={18}
				/>
				{/* pl-10 replaces inline style={{ paddingLeft: "2.5rem" }} */}
				<input
					type="text"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Titre, auteur..."
					className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
				/>
			</div>

			{loading && (
				<p className="text-center text-muted text-sm">Recherche...</p>
			)}

			{/* Use debouncedQuery instead of query to avoid showing "Aucun résultat"
			    during the 500ms debounce delay before results arrive */}
			{!loading &&
				results.length === 0 &&
				debouncedQuery.trim().length >= 2 && (
					<p className="text-center text-muted text-sm">Aucun résultat</p>
				)}

			<div className="flex flex-col gap-4">
				{results.map((book) => (
					<div key={book.googleBooksId} className="flex gap-3 items-start">
						{/* button instead of div for semantics — handleOpenBook is an action,
						    not a navigation to a known URL */}
						<button
							type="button"
							className="flex gap-3 items-start flex-1 text-left"
							onClick={() => handleOpenBook(book)}
						>
							{book.thumbnail ? (
								<img
									src={book.thumbnail}
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
								<p className="text-xs text-secondary">
									{book.authors?.join(", ")}
								</p>
							</div>
						</button>

						<div>
							{book.isInLibrary ? (
								<p className="text-xs text-accent">✓ Dans ta bibliothèque</p>
							) : (
								<AddButton onClick={() => handleAddBook(book)} />
							)}
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default SearchPage;
