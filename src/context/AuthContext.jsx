import { createContext, useContext, useState, useEffect } from 'react'
import api from '@/api/axios'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // check if user is logged
  useEffect(() => {
    async function fetchMe() {
      try {
        const { data } = await api.get('/auth/me')
        setUser(data)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchMe()
  }, [])

const login = (userData, token) => {
  localStorage.setItem('token', token)
  setUser(userData)
}

const logout = async () => {
  await api.post('/auth/logout')
  localStorage.removeItem('token')
  setUser(null)
}

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}