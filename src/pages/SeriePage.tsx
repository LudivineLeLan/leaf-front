import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@/api/axios";

interface Book {
  id: number;
  title: string;
  cover: string | null;
  seriesPosition: number | null;
}

interface Serie {
  id: number;
  name: string;
  books: Book[];
}

function SeriePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [serie, setSerie] = useState<Serie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSerie() {
      try {
        const { data } = await api.get(`/serie/${id}`);
        setSerie(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchSerie();
  }, [id]);

  if (loading) return <p className="text-center text-gray-400 mt-10">Chargement...</p>;
  if (!serie) return <p className="text-center text-gray-400 mt-10">Série introuvable</p>;

  const sortedBooks = [...serie.books].sort(
    (a, b) => (a.seriesPosition ?? 0) - (b.seriesPosition ?? 0)
  );

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 mb-6">
        <button type="button" onClick={() => navigate(-1)}>
          <ArrowLeft size={22} />
        </button>
        <h1 className="text-lg font-bold line-clamp-1">{serie.name}</h1>
      </div>

      <p className="px-4 text-sm text-gray-400 mb-4">{serie.books.length} tomes dans ta bibliothèque</p>

      <div className="flex flex-col gap-4 px-4">
        {sortedBooks.map((book) => (
          <div key={book.id} className="flex gap-3 items-center">
            {book.cover ? (
              <img
                src={book.cover}
                alt={book.title}
                className="w-14 h-20 object-cover rounded-md shrink-0"
              />
            ) : (
              <div className="w-14 h-20 bg-gray-100 rounded-md shrink-0 flex items-center justify-center text-gray-300 text-xs">
                No cover
              </div>
            )}
            <div>
              <p className="font-medium text-sm">{book.title}</p>
              {book.seriesPosition && (
                <p className="text-xs text-gray-400">Tome {book.seriesPosition}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SeriePage;