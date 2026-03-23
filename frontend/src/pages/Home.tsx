import { useEffect, useState } from "react"
import api from "../services/api"
import WeatherDashboard from "../components/WeatherDashboard"

export default function Home() {

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const fetchDashboard = async (lat: number, lon: number) => {
      try {

        const res = await api.get(
          `/farmer/dashboard?lat=${lat}&lon=${lon}`
        )

        console.log("API RESPONSE:", res.data)

        setData(res.data)

      } catch (error) {

        console.error("API error:", error)

      } finally {

        setLoading(false)

      }
    }

    if (!navigator.geolocation) {
      console.error("Geolocation not supported")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(

      (position) => {

        const lat = position.coords.latitude
        const lon = position.coords.longitude

        fetchDashboard(lat, lon)

      },

      (error) => {

        console.error("Location error:", error)

        // fallback coordinates (Jalandhar)
        fetchDashboard(31.3260, 75.5762)

      }

    )

  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[40vh] text-lg animate-pulse">
        🌱 Fetching farm weather...
      </div>
    )
  }

  if (!data) {
    return <div className="p-10">Unable to load farm data</div>
  }

  return (
    <div className="px-10 pt-10 h-[33vh]">
      <WeatherDashboard data={data} />
    </div>
  )
}