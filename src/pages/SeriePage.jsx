import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function SeriePage() {
	const { id } = useParams();

	const [serie, setSerie] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchSerie() {
			try {
				const response = await fetch(`http://localhost:3000/api/series/${id}`);

				const data = await response.json();

				setSerie(data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		}

		fetchSerie();
	}, [id]);

	if (loading) return <p>Chargement...</p>;
	if (!serie) return <p>Série introuvable</p>;

	const sortedBooks = serie
		? [...serie.books].sort((a, b) => a.seriesPosition - b.seriesPosition) //sort books by number
		: [];

	return (
		<div>
			<h1>{serie.name}</h1>

			<p>{serie.books.length} tomes</p>

			<div>
				{sortedBooks.map((book) => (
					<div key={book.id}>
						<img src={book.cover} alt={book.title} width="100" />

						<h2>{book.title}</h2>

						<p>Tome {book.seriesPosition}</p>
					</div>
				))}
			</div>
		</div>
	);
}
export default SeriePage;
