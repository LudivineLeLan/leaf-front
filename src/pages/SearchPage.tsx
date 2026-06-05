import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import api from "@/api/axios";
import AddButton from "@/components/AddButton";

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

	// Wait 500ms after last letter
	useEffect(() => {
		const timer = setTimeout(() => {
			setDebouncedQuery(query);
		}, 500);

		return () => clearTimeout(timer);
	}, [query]);

	// Search only on debouncedQuery
	useEffect(() => {
		if (debouncedQuery.trim().length < 2) {
			setResults([]);
			return;
		}

		const fetchResults = async () => {
			setLoading(true);
			try {
				const { data } = await api.get(`/books/search?q=${debouncedQuery}`);
				setResults(data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		};

		fetchResults();
	}, [debouncedQuery]);

	const handleSearch = async (value: string) => {
		setQuery(value);

		setLoading(true);
		try {
			const { data } = await api.get(`/books/search?q=${value}`);
			setResults(data);
		} catch (error) {
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const handleAddBook = async (book: Book) => {
		try {
			// 1. Import book in db
			const { data: importedBook } = await api.post("/books/import", {
				googleBooksId: book.googleBooksId,
				title: book.title,
				authors: book.authors,
				thumbnail: book.thumbnail,
			});

			// 2. Add book to library
			await api.post(`/library/${importedBook.id}`, { status: "to_read" });

			// Update isInLibrary in results
			setResults((prev) =>
				prev.map((result) =>
					result.googleBooksId === book.googleBooksId
						? { ...result, isInLibrary: true }
						: result,
				),
			);

			setSuccessMessage(`"${book.title}" ajouté à ta bibliothèque !`);
			setTimeout(() => setSuccessMessage(null), 3000);
		} catch (err) {
			console.error(err);
		}
	};

	const handleOpenBook = async (book: Book) => {
		try {
			const { data: importedBook } = await api.post("/books/import", {
				googleBooksId: book.googleBooksId,
				title: book.title,
				authors: book.authors,
				thumbnail: book.thumbnail,
			});
			navigate(`/book/${importedBook.id}`);
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className="px-4 pt-6 pb-24 bg-background min-h-screen">
			<h1
				className="text-2xl font-bold text-primary"
				style={{ marginBottom: "1rem" }}
			>
				Recherche
			</h1>

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
				<input
					type="text"
					value={query}
					onChange={(event) => handleSearch(event.target.value)}
					placeholder="Titre, auteur..."
					style={{ paddingLeft: "2.5rem" }}
					className="w-full bg-surface border border-border rounded-xl pr-4 py-2.5 text-sm text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
				/>
			</div>

			{loading && (
				<p className="text-center text-muted text-sm">Recherche...</p>
			)}

			{!loading && results.length === 0 && query.length >= 2 && (
				<p className="text-center text-muted text-sm">Aucun résultat</p>
			)}

			<div className="flex flex-col gap-4">
				{results.map((book) => (
					<div key={book.googleBooksId} className="flex gap-3 items-start">
						<div
							className="flex gap-3 items-start flex-1 cursor-pointer"
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
						</div>

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
