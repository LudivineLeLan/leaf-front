import { useState } from 'react'
import { Search } from 'lucide-react'
import AddButton from '@/components/AddButton'
import api from '@/api/axios'

function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async (value) => {
    setQuery(value)

    if (value.trim().length < 2) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const { data } = await api.get(`/books/search?q=${value}`)
      setResults(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <h1 className="text-2xl font-bold mb-4">Recherche</h1>

      {/* Barre de recherche */}
     <div className="relative mb-6 flex items-center">
  <Search className="absolute left-3 text-gray-400 pointer-events-none" size={18} />
  <input
    type="text"
    value={query}
    onChange={(event) => handleSearch(event.target.value)}
    placeholder="Titre, auteur..."
    style={{ paddingLeft: '2.5rem' }}
    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
  />
</div>

      {/* Résultats */}
      {loading && <p className="text-center text-gray-400 text-sm">Recherche...</p>}

      {!loading && results.length === 0 && query.length >= 2 && (
        <p className="text-center text-gray-400 text-sm">Aucun résultat</p>
      )}

      <div className="flex flex-col gap-4">
        {results.map((book) => (
          <div key={book.googleBooksId} className="flex gap-3 items-start">
            {/* Cover */}
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
              <p className="font-medium text-sm leading-tight line-clamp-2">{book.title}</p>
              <p className="text-xs text-gray-500">{book.authors?.join(', ')}</p>
              <div>
         <div>
  <AddButton onClick={() => console.log('Ajouter', book.googleBooksId)} />
</div>
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SearchPage