import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true, // ← envoie les cookies automatiquement
})

export default api