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

export const googleBooksSearch = async (
	query: string,
): Promise<GoogleBook[]> => {
	const response = await fetch(
		`${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=10&key=${API_KEY}`,
	);
	if (!response.ok) throw new Error("Google Books API error");
	const data = await response.json();
	if (!data.items) return [];
	return data.items.map((item: any) => ({
		googleBooksId: item.id,
		title: item.volumeInfo?.title || "Titre inconnu",
		authors: item.volumeInfo?.authors || [],
		thumbnail: item.volumeInfo?.imageLinks?.thumbnail || null,
		publishedDate: item.volumeInfo?.publishedDate || null,
		description: item.volumeInfo?.description || null,
		language: item.volumeInfo?.language || null,
	}));
};

export const googleBooksSearchByAuthor = async (
	authorName: string,
): Promise<GoogleBook[]> => {
	const response = await fetch(
		`${BASE_URL}?q=inauthor:${encodeURIComponent(authorName)}&maxResults=20&key=${API_KEY}`,
	);
	if (!response.ok) throw new Error("Google Books API error");
	const data = await response.json();
	if (!data.items) return [];
	return data.items.map((item: any) => ({
		googleBooksId: item.id,
		title: item.volumeInfo?.title || "Titre inconnu",
		authors: item.volumeInfo?.authors || [],
		thumbnail: item.volumeInfo?.imageLinks?.thumbnail || null,
		publishedDate: item.volumeInfo?.publishedDate || null,
		description: item.volumeInfo?.description || null,
		language: item.volumeInfo?.language || null,
	}));
};

export const googleBooksSearchSerie = async (
	query: string,
): Promise<GoogleBook[]> => {
	const response = await fetch(
		`${BASE_URL}?q=${encodeURIComponent(query)}&maxResults=40&key=${API_KEY}`,
	);
	if (!response.ok) throw new Error("Google Books API error");
	const data = await response.json();
	if (!data.items) return [];
	return data.items.map((item: any) => ({
		googleBooksId: item.id,
		title: item.volumeInfo?.title || "Titre inconnu",
		authors: item.volumeInfo?.authors || [],
		thumbnail: item.volumeInfo?.imageLinks?.thumbnail || null,
		publishedDate: item.volumeInfo?.publishedDate || null,
		description: item.volumeInfo?.description || null,
		language: item.volumeInfo?.language || null,
	}));
};
