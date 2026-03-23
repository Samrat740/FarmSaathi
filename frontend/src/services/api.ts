import axios from "axios"

const api = axios.create({
  baseURL: "https://farmsaathi.onrender.com",
  headers: {
    "Content-Type": "application/json"
  }
})

export default api