import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "@/api/axios";

interface Serie {
  id: number;
  name: string;
  total_volumes: number | null;
}

interface Book {
  id: number;
  title: string;
  cover: string | null;
  synopsis: string | null;
  releaseDate: string | null;
  seriesPosition: number | null;
  serie: Serie | null;
}

interface UserBook {
  bookId: number;
  status: string;
  book: Book;
}

function BookDetailPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [userBook, setUserBook] = useState<UserBook | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBook = async () => {
      try {
        const { data } = await api.get(`/library/${bookId}`)
        setUserBook(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    fetchBook()
  }, [bookId])

  if (loading) return <p className="text-center text-gray-400 mt-10">Chargement...</p>
  if (!userBook) return <p className="text-center text-gray-400 mt-10">Livre non trouvé</p>

  const book = userBook.book

  return (
    <div className="pb-4">
      {/* Header avec bouton retour */}
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

      {/* Infos */}
      <div className="px-4 flex flex-col gap-3">

        {/* Série */}
        {book.serie && (
          <p className="text-sm text-green-600 font-medium">
            {book.serie.name}
            {book.seriesPosition && ` • Tome ${book.seriesPosition}`}
            {book.serie.total_volumes && ` / ${book.serie.total_volumes}`}
          </p>
        )}

        {/* Date de publication */}
        {book.releaseDate && (
          <p className="text-xs text-gray-400">
            Publié le {new Date(book.releaseDate).toLocaleDateString('fr-FR')}
          </p>
        )}

        {/* Synopsis */}
        {book.synopsis ? (
          <p className="text-sm text-gray-600 leading-relaxed">{book.synopsis}</p>
        ) : (
          <p className="text-sm text-gray-400 italic">Aucun synopsis disponible</p>
        )}

      </div>
    </div>
  )
}

export default BookDetailPage