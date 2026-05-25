import { useState, useEffect } from "react";
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

	return (
		<div className="px-4 pt-6 pb-4">
			<h1 className="text-2xl font-bold mb-4">Recherche</h1>
			{successMessage && (
				<div className="mb-4 p-3 bg-green-50 text-green-700 text-sm rounded-lg">
					{successMessage}
				</div>
			)}

			<div className="relative mb-6 flex items-center">
				<Search
					className="absolute left-3 text-gray-400 pointer-events-none"
					size={18}
				/>
				<input
					type="text"
					value={query}
					onChange={(event) => handleSearch(event.target.value)}
					placeholder="Titre, auteur..."
					style={{ paddingLeft: "2.5rem" }}
					className="w-full border border-gray-300 rounded-xl pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
				/>
			</div>

			{loading && (
				<p className="text-center text-gray-400 text-sm">Recherche...</p>
			)}

			{!loading && results.length === 0 && query.length >= 2 && (
				<p className="text-center text-gray-400 text-sm">Aucun résultat</p>
			)}

			<div className="flex flex-col gap-4">
				{results.map((book) => (
					<div key={book.googleBooksId} className="flex gap-3 items-start">
						{book.thumbnail ? (
							<img
								src={book.thumbnail}
								alt={book.title}
								className="w-14 h-20 object-cover rounded-md shrink-0"
							/>
						) : (
							<div className="w-14 h-20 bg-gray-100 rounded-md shrink-0 flex items-center justify-center text-gray-300 text-xs">
								No cover
							</div>
						)}

						<div className="flex flex-col gap-1 flex-1 min-w-0">
							<p className="font-medium text-sm leading-tight line-clamp-2">
								{book.title}
							</p>
							<p className="text-xs text-gray-500">
								{book.authors?.join(", ")}
							</p>
							<div>
								{book.isInLibrary ? (
									<p className="text-xs text-green-600">
										✓ Dans ta bibliothèque
									</p>
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

export default SearchPage;
