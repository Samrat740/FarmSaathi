import axios from "axios"

const api = axios.create({
  baseURL: "https://farmsaathi.onrender.com",
  // baseURL: "http://127.0.0.1:10000",
  headers: {
    "Content-Type": "application/json"
  }
})

export default api