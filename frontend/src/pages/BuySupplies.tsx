import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Product {
  name: string
  category: "Seeds" | "Fertilizer" | "Pesticide"
  price: string
  emoji: string
  flipkart: string
  amazon: string
}

interface SuppliesResponse { crop: string; products: Product[] }
interface DashboardData { weather: { temperature: number }; recommended_crop: string }

// ── Product images (accurate, from Pexels/Unsplash) ───────────────────────────

const PRODUCT_IMAGES: Record<string, string> = {
  // Seeds — actual grain/seed close-ups
  "HD-2967 Wheat Seeds":
    "https://images.pexels.com/photos/326082/pexels-photo-326082.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  "IR64 Rice Seeds":
    "https://images.pexels.com/photos/4110251/pexels-photo-4110251.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  "HHB-67 Pearl Millet Seeds":
    "https://images.pexels.com/photos/5503175/pexels-photo-5503175.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  // Fertilizer — granules / bags
  "Urea Fertilizer 50 kg":
    "https://images.pexels.com/photos/4505161/pexels-photo-4505161.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  "DAP Fertilizer 50 kg":
    "https://images.pexels.com/photos/4505161/pexels-photo-4505161.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  "NPK 10-26-26 Fertilizer":
    "https://images.pexels.com/photos/4505161/pexels-photo-4505161.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  // Pesticide — spray bottle / chemical
  "Mancozeb Fungicide":
    "https://images.pexels.com/photos/5501001/pexels-photo-5501001.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  "Chlorpyrifos Pesticide":
    "https://images.pexels.com/photos/5501001/pexels-photo-5501001.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
  "Carbendazim Fungicide":
    "https://images.pexels.com/photos/5501001/pexels-photo-5501001.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop",
}

const PRICE_RANGES: Record<string, string> = {
  "HD-2967 Wheat Seeds":       "₹240 – ₹380",
  "IR64 Rice Seeds":            "₹280 – ₹420",
  "HHB-67 Pearl Millet Seeds": "₹190 – ₹320",
  "Urea Fertilizer 50 kg":      "₹780 – ₹1,050",
  "DAP Fertilizer 50 kg":       "₹1,050 – ₹1,400",
  "NPK 10-26-26 Fertilizer":    "₹860 – ₹1,150",
  "Mancozeb Fungicide":         "₹310 – ₹480",
  "Chlorpyrifos Pesticide":     "₹440 – ₹660",
  "Carbendazim Fungicide":      "₹260 – ₹400",
}

const CROP_ACCENT: Record<string, string> = {
  wheat: "#d4a017", rice: "#2ecc71", millet: "#e67e22",
}

const CAT_COLOR: Record<string, string> = {
  Seeds: "#16a34a", Fertilizer: "#b45309", Pesticide: "#4338ca",
}

const QUICK = ["Drip irrigation", "Hand sprayer", "Organic manure", "Soil kit"]

function recommendCrop(t: number) { return t < 20 ? "Wheat" : t < 30 ? "Rice" : "Millet" }

// ── Buy Popup ─────────────────────────────────────────────────────────────────

function BuyPopup({ product, accent, onClose }: { product: Product; accent: string; onClose: () => void }) {
  const img = PRODUCT_IMAGES[product.name]
  const price = PRICE_RANGES[product.name] ?? product.price

  return (
    <div onClick={onClose} style={{
      position:"fixed", inset:0, zIndex:200,
      background:"rgba(0,0,0,0.6)", backdropFilter:"blur(6px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:"20px", animation:"fadeIn .18s ease",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        width:"100%", maxWidth:"360px",
        background:"#fff", border:"1px solid #c9cdd4",
        borderRadius:"20px", padding:"24px",
        animation:"popIn .22s cubic-bezier(.34,1.56,.64,1) both",
      }}>
        {/* Product row */}
        <div style={{ display:"flex", gap:"12px", alignItems:"center", marginBottom:"16px", paddingBottom:"16px", borderBottom:"1px solid #e0e0e0" }}>
          <img src={img} alt={product.name} style={{ width:"56px", height:"56px", borderRadius:"10px", objectFit:"cover", flexShrink:0 }} onError={e => { (e.target as HTMLImageElement).style.display = "none" }}/>
          <div>
            <p style={{ fontSize:"10px", color: CAT_COLOR[product.category] ?? "#111", fontWeight:700, letterSpacing:".08em", textTransform:"uppercase", marginBottom:"3px" }}>{product.category}</p>
            <p style={{ fontWeight:700, fontSize:"14px", color:"#111", lineHeight:1.3, marginBottom:"3px" }}>{product.name}</p>
            <p style={{ fontSize:"15px", fontWeight:800, color: accent }}>{price}</p>
          </div>
        </div>

        <p style={{ fontSize:"11px", color:"rgba(0,0,0,0.4)", marginBottom:"16px" }}>Prices vary by seller. Pick a platform:</p>

        {/* Flipkart */}
        <a href={product.flipkart} target="_blank" rel="noopener noreferrer"
          style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#f8f9ff", borderRadius:"12px", padding:"14px 16px", textDecoration:"none", marginBottom:"8px", border:"1px solid #b8c4f8" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkicon-2x-79f0d6.png" alt="Flipkart" style={{ width:"22px", height:"22px", borderRadius:"4px", objectFit:"contain" }} onError={e => { (e.target as HTMLImageElement).style.display="none" }}/>
            <span style={{ fontWeight:800, fontSize:"15px", color:"#2874f0", fontFamily:"inherit" }}>flipkart</span>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2874f0" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>

        {/* Amazon */}
        <a href={product.amazon} target="_blank" rel="noopener noreferrer"
          style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fffbf2", borderRadius:"12px", padding:"14px 16px", textDecoration:"none", marginBottom:"12px", border:"1px solid #f0cc6a" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/200px-Amazon_logo.svg.png" alt="Amazon" style={{ height:"18px", objectFit:"contain" }} onError={e => { (e.target as HTMLImageElement).style.display="none" }}/>
          </div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ff9900" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </a>

        <button onClick={onClose} style={{ width:"100%", padding:"11px", borderRadius:"10px", background:"#e5e7eb", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(0,0,0,0.4)", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function BuySupplies() {
  const navigate = useNavigate()
  const [data, setData]         = useState<SuppliesResponse | null>(null)
  const [crop, setCrop]         = useState("")
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(false)
  const [query, setQuery]       = useState("")
  const [searched, setSearched] = useState("")
  const [popup, setPopup]       = useState<Product | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const coords = await new Promise<GeolocationCoordinates>((res, rej) =>
          navigator.geolocation.getCurrentPosition(p => res(p.coords), rej)
        )
        const dash = await api.get<DashboardData>("/farmer/dashboard", { params: { lat: coords.latitude, lon: coords.longitude } })
        const detected = dash.data.recommended_crop
        setCrop(detected)
        const res = await api.get<SuppliesResponse>("/market/supplies", { params: { crop: detected } })
        setData(res.data)
      } catch {
        const fallback = recommendCrop(25)
        setCrop(fallback)
        try {
          const res = await api.get<SuppliesResponse>("/market/supplies", { params: { crop: fallback } })
          setData(res.data)
        } catch { setError(true) }
      } finally { setLoading(false) }
    })()
  }, [])

  const accent = CROP_ACCENT[crop.toLowerCase()] ?? "#4ade80"

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
        @keyframes popIn  { from{opacity:0;transform:scale(.92)} to{opacity:1;transform:scale(1)} }
        @keyframes pulse  { 0%,100%{opacity:.5} 50%{opacity:.9} }

        .fu  { animation: fadeUp .4s ease both; }
        .fu1 { animation: fadeUp .4s .08s ease both; }
        .fu2 { animation: fadeUp .4s .16s ease both; }
        .fu3 { animation: fadeUp .4s .24s ease both; }

        .pcard { transition: box-shadow .2s ease; cursor:pointer; }
        .pcard:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.5) !important; }
        .pcard:active { transform: scale(.99); }

        .buybtn { transition: opacity .15s ease, transform .15s ease; }
        .buybtn:hover { opacity:.85; transform:translateY(-1px); }

        .qpill { transition: border-color .15s, color .15s; cursor:pointer; }
        .qpill:hover { border-color: rgba(0,0,0,0.3) !important; color: rgba(0,0,0,0.7) !important; }

        input::placeholder { color:rgba(255,255,255,0.28); }
        input:focus { outline:none; }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#f5f3ee", fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#fff" }}>

        {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
        <div style={{ padding:"18px clamp(16px,4vw,40px) 0", display:"flex", alignItems:"center", justifyContent:"space-between", maxWidth:"960px", margin:"0 auto" }}>
          <button onClick={() => navigate(-1)} style={{ display:"flex", alignItems:"center", gap:"5px", background:"none", border:"none", color:"rgba(0,0,0,0.4)", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"inherit", padding:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Back
          </button>
          <p style={{ fontSize:"11px", color:"rgba(0,0,0,0.3)", fontWeight:600, letterSpacing:".12em", textTransform:"uppercase" }}>Buy Supplies</p>
          <div style={{ width:"40px" }}/>
        </div>

        {/* ── CROP HEADER ─────────────────────────────────────────────────────── */}
        <div className="fu" style={{ padding:"28px clamp(16px,4vw,40px) 0", maxWidth:"960px", margin:"0 auto" }}>
          {loading ? (
            <div>
              <div style={{ height:"36px", width:"160px", background:"rgba(0,0,0,0.07)", borderRadius:"8px", marginBottom:"8px", animation:"pulse 1.4s infinite" }}/>
              <div style={{ height:"14px", width:"240px", background:"rgba(0,0,0,0.05)", borderRadius:"6px", animation:"pulse 1.4s .2s infinite" }}/>
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
              <div style={{ width:"4px", height:"40px", background: accent, borderRadius:"2px", flexShrink:0 }}/>
              <div>
                <h1 style={{ fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:800, letterSpacing:"-.03em", lineHeight:1, color:"#111" }}>{crop}</h1>
                <p style={{ fontSize:"12px", color:"rgba(0,0,0,0.4)", marginTop:"4px", fontWeight:500 }}>
                  {crop === "Wheat" ? "Cool temp · ideal conditions" : crop === "Rice" ? "Warm & humid · ideal conditions" : "High temp · dry heat conditions"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── SEARCH ──────────────────────────────────────────────────────────── */}
        <div className="fu1" style={{ padding:"20px clamp(16px,4vw,40px) 0", maxWidth:"960px", margin:"0 auto" }}>
          <div style={{ display:"flex", gap:"8px", background:"#fff", border:"1px solid #c9cdd4", borderRadius:"12px", padding:"6px 6px 6px 14px", alignItems:"center" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && query.trim() && setSearched(query.trim())}
              placeholder="Search seeds, tools, fertilizers…"
              style={{ flex:1, background:"transparent", border:"none", color:"#111", fontSize:"13px", fontFamily:"inherit" }}
            />
            <button onClick={() => query.trim() && setSearched(query.trim())}
              style={{ background: accent, border:"none", borderRadius:"8px", padding:"8px 16px", fontWeight:700, fontSize:"12px", cursor:"pointer", color: crop.toLowerCase() === "wheat" ? "#111" : "#fff", fontFamily:"inherit", flexShrink:0 }}>
              Search
            </button>
          </div>


        </div>

        {/* ── SEARCH RESULT ───────────────────────────────────────────────────── */}
        {searched && (
          <div className="fu" style={{ padding:"16px clamp(16px,4vw,40px) 0", maxWidth:"960px", margin:"0 auto" }}>
            <div style={{ background:"#fff", border:"1px solid #c9cdd4", borderRadius:"12px", padding:"14px 16px", display:"flex", alignItems:"center", gap:"12px" }}>
              <p style={{ fontSize:"13px", fontWeight:600, flex:1, color:"#111" }}>"{searched}"</p>
              <a href={`https://www.flipkart.com/search?q=${encodeURIComponent(searched)}`} target="_blank" rel="noopener noreferrer"
                style={{ padding:"7px 14px", background:"#2874f0", borderRadius:"8px", color:"#fff", fontSize:"12px", fontWeight:700, textDecoration:"none" }}>
                Flipkart
              </a>
              <a href={`https://www.amazon.in/s?k=${encodeURIComponent(searched)}`} target="_blank" rel="noopener noreferrer"
                style={{ padding:"7px 14px", background:"#ff9900", borderRadius:"8px", color:"#111", fontSize:"12px", fontWeight:700, textDecoration:"none" }}>
                Amazon
              </a>
              <button onClick={() => setSearched("")} style={{ background:"none", border:"none", color:"rgba(0,0,0,0.25)", fontSize:"16px", cursor:"pointer" }}>✕</button>
            </div>
          </div>
        )}

        {/* ── DIVIDER ─────────────────────────────────────────────────────────── */}
        <div style={{ height:"1px", background:"#e5e7eb", margin:"24px clamp(16px,4vw,40px) 0", maxWidth:"960px", marginLeft:"auto", marginRight:"auto" }}/>

        {/* ── PRODUCTS ────────────────────────────────────────────────────────── */}
        <div style={{ padding:"0 clamp(16px,4vw,40px) 60px", maxWidth:"960px", margin:"0 auto" }}>

          {/* Loading */}
          {loading && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,260px),1fr))", gap:"12px" }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ borderRadius:"16px", overflow:"hidden", animation:`pulse 1.4s ${i*.15}s infinite` }}>
                  <div style={{ height:"160px", background:"#e8e8e8" }}/>
                  <div style={{ padding:"14px", background:"#f5f3ee", display:"flex", flexDirection:"column", gap:"8px" }}>
                    <div style={{ height:"11px", width:"55%", background:"#e0e0e0", borderRadius:"4px" }}/>
                    <div style={{ height:"18px", width:"38%", background:"#d8d8d8", borderRadius:"4px" }}/>
                    <div style={{ height:"36px", background:"#e0e0e0", borderRadius:"8px" }}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {!loading && error && (
            <div style={{ textAlign:"center", padding:"48px 20px" }}>
              <p style={{ fontSize:"36px", marginBottom:"12px" }}>🌧️</p>
              <p style={{ fontWeight:700, marginBottom:"6px" }}>Couldn't load supplies</p>
              <p style={{ color:"rgba(0,0,0,0.4)", fontSize:"12px", marginBottom:"20px" }}>Allow location & check backend</p>
              <button onClick={() => navigate(-1)} style={{ background:"#fff", border:"1px solid #c9cdd4", color:"#111", padding:"10px 24px", borderRadius:"999px", cursor:"pointer", fontFamily:"inherit", fontWeight:600 }}>← Go Back</button>
            </div>
          )}

          {/* Cards */}
          {!loading && !error && data && (
            <>
              <div className="fu2" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
                <p style={{ fontSize:"10px", color:"rgba(0,0,0,0.3)", letterSpacing:".14em", textTransform:"uppercase", fontWeight:700 }}>
                  Recommended supplies
                </p>
                <span style={{ fontSize:"10px", color: accent, fontWeight:700 }}>3 products</span>
              </div>

              <div className="fu2" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(min(100%,260px),1fr))", gap:"12px", marginBottom:"32px" }}>
                {data.products.map((p, i) => {
                  const img = PRODUCT_IMAGES[p.name]
                  const price = PRICE_RANGES[p.name] ?? p.price
                  return (
                    <div key={i} className="pcard"
                      onClick={() => setPopup(p)}
                      style={{
                        borderRadius:"16px", overflow:"hidden",
                        background:"rgba(255,255,255,0.04)",
                        border:"1px solid rgba(255,255,255,0.07)",
                        boxShadow:"0 4px 16px rgba(0,0,0,0.3)",
                        animationDelay:`${i*.08}s`,
                      }}
                    >
                      {/* Image */}
                      <div style={{ height:"160px", overflow:"hidden", position:"relative", background:"#f0f0f0" }}>
                        {img && (
                          <img src={img} alt={p.name}
                            style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", transition:"transform .35s ease" }}
                            onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1.04)"}
                            onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = "scale(1)"}
                            onError={e => { (e.target as HTMLImageElement).parentElement!.style.background = "#1e1e1e" }}
                          />
                        )}
                        {/* Subtle bottom fade */}
                        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"48px", background:"linear-gradient(to top,rgba(255,255,255,0.5),transparent)" }}/>
                      </div>

                      {/* Body */}
                      <div style={{ padding:"14px 16px 16px" }}>
                        <p style={{ fontSize:"9px", color: CAT_COLOR[p.category] ?? "#fff", fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:"5px" }}>
                          {p.category}
                        </p>
                        <p style={{ fontWeight:700, fontSize:"14px", color:"#111", lineHeight:1.3, marginBottom:"8px" }}>{p.name}</p>
                        <p style={{ fontSize:"15px", fontWeight:800, color:"#111", marginBottom:"12px" }}>
                          {price} <span style={{ fontSize:"10px", color:"rgba(0,0,0,0.3)", fontWeight:400 }}>approx.</span>
                        </p>
                        <button className="buybtn"
                          style={{ width:"100%", padding:"10px", borderRadius:"10px", background: accent, border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:700, fontSize:"13px", color: crop.toLowerCase() === "wheat" ? "#111" : "#fff" }}>
                          Buy
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Browse more */}
              <div className="fu3" style={{ background:"#fff", border:"1px solid #c8cdc6", borderRadius:"14px", padding:"18px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"12px", flexWrap:"wrap" }}>
                <div>
                  <p style={{ fontWeight:700, fontSize:"13px", marginBottom:"2px", color:"#111" }}>Need something else?</p>
                  <p style={{ color:"rgba(0,0,0,0.4)", fontSize:"11px" }}>Search any supply — Flipkart or Amazon.</p>
                </div>
                <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                  {QUICK.map(s => (
                    <button key={s} className="qpill"
                      onClick={() => { setQuery(s); setSearched(s); window.scrollTo({ top:0, behavior:"smooth" }) }}
                      style={{ background:"transparent", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"999px", padding:"6px 14px", color:"rgba(0,0,0,0.4)", fontSize:"11px", fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                      {s} →
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── POPUP ────────────────────────────────────────────────────────────── */}
      {popup && <BuyPopup product={popup} accent={accent} onClose={() => setPopup(null)} />}
    </>
  )
}