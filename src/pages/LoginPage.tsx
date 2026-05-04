import { useState } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import api from '@/api/axios'
import { useAuth } from '@/context/AuthContext'

function LoginPage() {
  const { login } = useAuth() 
  const location = useLocation()
  const successMessage = location.state?.message
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (event : React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value })
  }

  const handleSubmit = async (event : React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data } = await api.post('/auth/login', formData)
      login(data.user, data.token)
      navigate('/search')
   } catch (error) {
  setError('Email ou mot de passe incorrect')
} finally {
  setLoading(false)
}
  }

  return (
    <div className="min-h-screen flex flex-col justify-center px-6">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-green-600">Leaf 🍃</h1>
        <p className="text-gray-500 mt-2">Ta bibliothèque personnelle</p>
      </div>

      {successMessage && (
        <p className="text-green-600 text-sm text-center mb-4 bg-green-50 p-3 rounded-lg">
          {successMessage}
        </p>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="ton@email.com"
            required
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" disabled={loading} className="mt-2 bg-green-600 hover:bg-green-700">
          {loading ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        Pas encore de compte ?{' '}
        <Link to="/register" className="text-green-600 font-medium">
          S'inscrire
        </Link>
      </p>
    </div>
  )
}

export default LoginPage