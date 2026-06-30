const API_KEY = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY;
const BASE_URL = "https://www.googleapis.com/books/v1/volumes";

export interface GoogleBook {
	googleBooksId: string;
	title: string;
	authors: string[];
	thumbnail: string | null;
	publishedDate: string | null;
	description: string | null;
	language: string | null;
}

// Minimal shape of a Google Books API item, used to avoid `any`
interface GoogleBooksApiItem {
	id: string;
	volumeInfo?: {
		title?: string;
		authors?: string[];
		imageLinks?: { thumbnail?: string };
		publishedDate?: string;
		description?: string;
		language?: string;
	};
}

// Shared mapping logic, used by all search functions below
function mapToGoogleBook(item: GoogleBooksApiItem): GoogleBook {
	return {
		googleBooksId: item.id,
		title: item.volumeInfo?.title || "Titre inconnu",
		authors: item.volumeInfo?.authors || [],
		thumbnail: item.volumeInfo?.imageLinks?.thumbnail || null,
		publishedDate: item.volumeInfo?.publishedDate || null,
		description: item.volumeInfo?.description || null,
		language: item.volumeInfo?.language || null,
	};
}

// Shared fetch logic, used by all search functions below.
// `query` must already be the final query string (including any
// Google Books search operators like "inauthor:"), it gets URL-encoded here.
async function fetchGoogleBooks(
	query: string,
	maxResults: number,
): Promise<GoogleBook[]> {
	const response = await fetch(
		`${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=${maxResults}&key=${API_KEY}`,
	);
	if (!response.ok) throw new Error("Google Books API error");
	const data = await response.json();
	if (!data.items) return [];
	return data.items.map(mapToGoogleBook);
}

export const googleBooksSearch = (query: string): Promise<GoogleBook[]> =>
	fetchGoogleBooks(query, 10);

export const googleBooksSearchByAuthor = (
	authorName: string,
): Promise<GoogleBook[]> =>
	// authorName is encoded separately so the "inauthor:" operator stays intact
	fetchGoogleBooks(`inauthor:${encodeURIComponent(authorName)}`, 20);

export const googleBooksSearchSerie = (query: string): Promise<GoogleBook[]> =>
	fetchGoogleBooks(query, 40);
