import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { ArrowLeft, Search, FileText, Sprout } from "lucide-react"

type Scheme = {
  scheme_name: string
  serial_number?: string | number
  document_id?: string
}

const CARD_COLORS = [
  { bg: "#e8f5e9", accent: "#16a34a", text: "#14532d" },
  { bg: "#e3f2fd", accent: "#1976d2", text: "#0d47a1" },
  { bg: "#fce4ec", accent: "#e91e63", text: "#880e4f" },
  { bg: "#fff8e1", accent: "#f59e0b", text: "#92400e" },
  { bg: "#f3e5f5", accent: "#9c27b0", text: "#4a148c" },
  { bg: "#e0f2f1", accent: "#009688", text: "#004d40" },
]

function SchemeCard({ scheme, index }: { scheme: Scheme; index: number }) {
  const color = CARD_COLORS[index % CARD_COLORS.length]

  const handleClick = () => {
    const query = encodeURIComponent(scheme.scheme_name)
    window.open(`https://www.google.com/search?q=${query}`, "_blank", "noopener,noreferrer")
  }

  return (
    <div
      onClick={handleClick}
      className="rounded-2xl px-5 py-4 flex items-center gap-4 transition-all duration-200 active:scale-[0.98] cursor-pointer hover:brightness-95"
      style={{
        background: color.bg,
        boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
      }}
    >
      <div
        className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm"
        style={{ background: color.accent, color: "#fff" }}
      >
        {scheme.serial_number ?? index + 1}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className="font-semibold leading-snug"
          style={{ color: "#111", fontSize: "13px" }}
        >
          {scheme.scheme_name}
        </p>
        {scheme.document_id && (
          <p className="text-xs mt-0.5 font-medium" style={{ color: color.accent }}>
            ID: {scheme.document_id}
          </p>
        )}
      </div>

      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: color.accent + "22" }}
      >
        <FileText size={13} style={{ color: color.accent }} />
      </div>
    </div>
  )
}

export default function GovtSchemes() {
  const navigate = useNavigate()
  const [schemes, setSchemes] = useState<Scheme[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    api.get("/farmer/schemes")
      .then(res => {
        const data = res.data
        setSchemes(Array.isArray(data) ? data : data.schemes ?? data.records ?? [])
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  const filtered = schemes.filter(s =>
    s.scheme_name?.toLowerCase().includes(search.toLowerCase()) ||
    String(s.document_id ?? "").toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div
      className="min-h-screen"
      style={{ background: "#f8faf8", fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Hero header */}
      <div
        className="px-5 pt-10 pb-6 rounded-b-[30px] overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.52), rgba(0,0,0,0.45)),
            url('/scheme.jpeg')
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          boxShadow: "0 10px 30px rgba(0,0,0,0.12)",
        }}
      >
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 rounded-full flex items-center justify-center mb-5 transition-all active:scale-95"
          style={{
            background: "rgba(255,255,255,0.18)",
            border: "1px solid rgba(255,255,255,0.28)",
            backdropFilter: "blur(6px)",
          }}
        >
          <ArrowLeft size={16} color="#fff" />
        </button>

        {/* Title */}
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sprout size={14} color="rgba(255,255,255,0.82)" />
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{
                  color: "rgba(255,255,255,0.82)",
                  textShadow: "0 2px 8px rgba(0,0,0,0.35)",
                }}
              >
                Government
              </p>
            </div>

            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontWeight: 700,
                fontSize: "2rem",
                lineHeight: 1.05,
                color: "#fff",
                textShadow: "0 3px 12px rgba(0,0,0,0.45)",
              }}
            >
              Schemes & Benefits
            </h1>
          </div>

          {!loading && !error && (
            <div
              className="rounded-2xl px-4 py-2 text-center"
              style={{
                background: "rgba(255,255,255,0.14)",
                border: "1px solid rgba(255,255,255,0.24)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              }}
            >
              <p
                className="text-2xl font-bold text-white leading-none"
                style={{ textShadow: "0 2px 8px rgba(0,0,0,0.35)" }}
              >
                {filtered.length}
              </p>
              <p
                className="text-xs mt-0.5"
                style={{
                  color: "rgba(255,255,255,0.82)",
                  textShadow: "0 2px 8px rgba(0,0,0,0.35)",
                }}
              >
                schemes
              </p>
            </div>
          )}
        </div>

        {/* Search bar */}
        <div className="relative mt-5">
          <Search
            size={15}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "#16a34a" }}
          />
          <input
            type="text"
            placeholder="Search schemes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-2xl pl-10 pr-4 py-3.5 text-sm outline-none"
            style={{
              background: "rgba(255,255,255,0.96)",
              fontFamily: "'DM Sans', sans-serif",
              fontSize: "13px",
              boxShadow: "0 6px 20px rgba(0,0,0,0.18)",
              backdropFilter: "blur(8px)",
            }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-5 pt-5 pb-10">
        {loading && (
          <div className="flex flex-col gap-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className="rounded-2xl animate-pulse"
                style={{ height: "68px", background: "#e2e8e2" }}
              />
            ))}
          </div>
        )}

        {error && (
          <div
            className="rounded-2xl px-5 py-10 text-center"
            style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
          >
            <p className="text-3xl mb-2">⚠️</p>
            <p className="font-semibold text-gray-700 text-sm">Could not load schemes</p>
            <p className="text-xs text-gray-400 mt-1">Check your connection and try again</p>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div
            className="rounded-2xl px-5 py-10 text-center"
            style={{ background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,0.07)" }}
          >
            <p className="text-3xl mb-2">🔍</p>
            <p className="font-semibold text-gray-700 text-sm">No schemes found</p>
            <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtered.map((scheme, i) => (
              <SchemeCard key={scheme.document_id ?? i} scheme={scheme} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}