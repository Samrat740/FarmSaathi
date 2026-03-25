import { useEffect, useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import { ArrowLeft, MapPin, ChevronDown, TrendingUp, TrendingDown, Minus, Search } from "lucide-react"

const INDIAN_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu",
  "Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Delhi","Jammu & Kashmir","Ladakh","Puducherry",
]

type MandiEntry = {
  commodity?: string; crop?: string; name?: string
  market?: string; mandi?: string; district?: string
  min_price?: number|string; max_price?: number|string
  modal_price?: number|string; price?: number|string
  unit?: string; date?: string; arrival_date?: string
}

function getStateFromCoords(lat: number, lon: number): string {
  if (lat>=29.5&&lat<=32.5&&lon>=73.8&&lon<=76.9) return "Punjab"
  if (lat>=27.6&&lat<=31.4&&lon>=74.4&&lon<=77.6) return "Haryana"
  if (lat>=28.4&&lat<=30.9&&lon>=77.0&&lon<=78.3) return "Delhi"
  if (lat>=23.0&&lat<=30.4&&lon>=69.5&&lon<=78.3) return "Rajasthan"
  if (lat>=23.0&&lat<=26.9&&lon>=74.0&&lon<=84.4) return "Madhya Pradesh"
  if (lat>=18.9&&lat<=22.1&&lon>=72.6&&lon<=80.9) return "Maharashtra"
  if (lat>=15.0&&lat<=18.5&&lon>=74.0&&lon<=84.6) return "Karnataka"
  if (lat>=8.0 &&lat<=13.5&&lon>=76.2&&lon<=80.4) return "Tamil Nadu"
  if (lat>=8.3 &&lat<=12.8&&lon>=74.8&&lon<=77.4) return "Kerala"
  if (lat>=12.6&&lat<=19.9&&lon>=76.7&&lon<=84.8) return "Andhra Pradesh"
  if (lat>=17.1&&lat<=19.9&&lon>=77.2&&lon<=81.3) return "Telangana"
  if (lat>=21.9&&lat<=27.5&&lon>=83.3&&lon<=87.5) return "West Bengal"
  if (lat>=24.3&&lat<=27.5&&lon>=83.3&&lon<=88.2) return "Bihar"
  if (lat>=23.4&&lat<=30.4&&lon>=77.0&&lon<=84.7) return "Uttar Pradesh"
  if (lat>=20.0&&lat<=24.1&&lon>=80.2&&lon<=84.4) return "Chhattisgarh"
  if (lat>=21.0&&lat<=24.8&&lon>=68.0&&lon<=74.5) return "Gujarat"
  if (lat>=30.0&&lat<=33.5&&lon>=74.0&&lon<=80.4) return "Himachal Pradesh"
  return "Punjab"
}

const PEXELS_API_KEY = import.meta.env.VITE_PEXELS_API_KEY;
const FALLBACK_IMAGE = "https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg?auto=compress&cs=tinysrgb&w=400"
const imageCache: Record<string,string> = {}

const HINDI_ALIASES: Record<string,string> = {
  kheera:"cucumber",khira:"cucumber",kakdi:"cucumber",tamatar:"tomato",
  pyaz:"onion",lasun:"garlic",adrak:"ginger",mirch:"chilli pepper",
  shimla:"bell pepper",baingan:"eggplant",aloo:"potato",gobhi:"cauliflower",
  patta:"cabbage",palak:"spinach",methi:"fenugreek",bhindi:"okra",
  lauki:"bottle gourd",karela:"bitter gourd",kaddu:"pumpkin",mooli:"radish",
  gajar:"carrot",matar:"green peas",chana:"chickpea",sarso:"mustard",
  haldi:"turmeric",jeera:"cumin",dhaniya:"coriander",aam:"mango",
  kela:"banana",angur:"grapes",amrud:"guava",santara:"orange",nimbu:"lemon",
  gehun:"wheat",chawal:"rice",makka:"corn",arhar:"pigeon pea",
  moong:"mung beans",urad:"black gram",masoor:"red lentil",rajma:"kidney beans",
}

const NOISE_WORDS = new Set(["wet","dry","fresh","local","desi","hybrid","grade","no","big","small","medium","large","fine","bold","new","old","raw","ripe","green","red","yellow","white","black","f1","variety","loose","packed","other","misc"])

function cleanCommodityQuery(raw: string): string {
  let name = raw.replace(/[()[\]/\\]/g," ").trim().split(",")[0].trim()
  name = name.replace(/cucumbar/gi,"cucumber").replace(/brinjall?/gi,"eggplant").replace(/chilly/gi,"chilli").replace(/tomate/gi,"tomato").replace(/pumkin/gi,"pumpkin").replace(/capsicum/gi,"bell pepper").replace(/ladyfinger/gi,"okra")
  const words = name.toLowerCase().split(/\s+/)
  const resolved = words.map(w => HINDI_ALIASES[w] ?? w)
  const meaningful = resolved.filter(w => w.length>2 && !NOISE_WORDS.has(w)).slice(0,2)
  return meaningful.length>0 ? meaningful.join(" ") : words[0]
}

async function fetchPexelsImage(commodity: string): Promise<string> {
  const query = cleanCommodityQuery(commodity)
  const cacheKey = query.toLowerCase()
  if (imageCache[cacheKey]) return imageCache[cacheKey]
  try {
    const res = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query+" food vegetable")}&per_page=1&orientation=landscape`,{ headers:{ Authorization: PEXELS_API_KEY } })
    const data = await res.json()
    const url: string = data.photos?.[0]?.src?.medium ?? FALLBACK_IMAGE
    imageCache[cacheKey] = url
    return url
  } catch { return FALLBACK_IMAGE }
}

function useCommodityImage(commodity: string): string {
  const [imgUrl, setImgUrl] = useState(FALLBACK_IMAGE)
  const fetched = useRef(false)
  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    fetchPexelsImage(commodity).then(setImgUrl)
  }, [commodity])
  return imgUrl
}

const CARD_ACCENTS = ["#16a34a","#2563eb","#d97706","#9333ea","#dc2626","#0891b2"]

function MandiCard({ entry, index }: { entry: MandiEntry; index: number }) {
  const commodity = entry.commodity||entry.crop||entry.name||"Unknown"
  const market = entry.market||entry.mandi||"—"
  const district = entry.district||""
  const modal = entry.modal_price||entry.price
  const min = entry.min_price
  const max = entry.max_price
  const unit = entry.unit||"Quintal"
  const date = entry.arrival_date||entry.date||""
  const image = useCommodityImage(commodity)
  const accent = CARD_ACCENTS[index % CARD_ACCENTS.length]
  const priceDiff = max && min ? Number(max)-Number(min) : null

  return (
    <div style={{
      background:"#fff", borderRadius:"18px", overflow:"hidden",
      boxShadow:"0 2px 12px rgba(0,0,0,0.07)",
      border:"1.5px solid #eef0eb",
      transition:"transform .25s ease, box-shadow .25s ease",
      fontFamily:"'Plus Jakarta Sans',sans-serif",
    }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform="translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow="0 12px 32px rgba(0,0,0,0.12)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform="translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow="0 2px 12px rgba(0,0,0,0.07)"; }}
    >
      {/* Image */}
      <div style={{ height:"120px", position:"relative", overflow:"hidden" }}>
        <img src={image} alt={commodity} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}/>
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)" }}/>

        {/* Bottom: name + market */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"8px 12px" }}>
          <p style={{ color:"#fff", fontWeight:700, fontSize:"13px", lineHeight:1.2, textShadow:"0 1px 6px rgba(0,0,0,0.5)" }}>{commodity}</p>
          <div style={{ display:"flex", alignItems:"center", gap:"3px", marginTop:"2px" }}>
            <MapPin size={9} color="rgba(255,255,255,0.65)"/>
            <span style={{ color:"rgba(255,255,255,0.65)", fontSize:"10px" }}>{market}{district?`, ${district}`:""}</span>
          </div>
        </div>

        {/* LIVE badge */}
        <div style={{ position:"absolute", top:"10px", left:"10px", padding:"2px 8px", borderRadius:"999px", background:accent, fontSize:"9px", fontWeight:700, color:"#fff", letterSpacing:".05em" }}>LIVE</div>

        {/* Trend badge */}
        <div style={{ position:"absolute", top:"10px", right:"10px", width:"26px", height:"26px", borderRadius:"50%", background:"rgba(0,0,0,0.38)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          {priceDiff!==null && priceDiff>200 ? <TrendingUp size={12} color="#4ade80"/>
            : priceDiff!==null && priceDiff<50 ? <Minus size={12} color="#facc15"/>
            : <TrendingDown size={12} color="#f87171"/>}
        </div>

        {/* Accent bottom strip */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"2.5px", background:accent }}/>
      </div>

      {/* Prices */}
      <div style={{ padding:"12px" }}>
        <div style={{ display:"flex", gap:"6px" }}>
          {min!==undefined && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"6px 4px", borderRadius:"10px", background:"#f8faf6" }}>
              <span style={{ fontSize:"9px", fontWeight:600, color:"#9ca38f", letterSpacing:".06em" }}>MIN</span>
              <span style={{ fontSize:"12px", fontWeight:700, color:"#555", marginTop:"2px" }}>₹{min}</span>
            </div>
          )}
          {modal!==undefined && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"6px 4px", borderRadius:"10px", background:`${accent}12` }}>
              <span style={{ fontSize:"9px", fontWeight:600, color:accent, letterSpacing:".06em" }}>RATE</span>
              <span style={{ fontSize:"13px", fontWeight:800, color:accent, marginTop:"2px" }}>₹{modal}</span>
            </div>
          )}
          {max!==undefined && (
            <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", padding:"6px 4px", borderRadius:"10px", background:"#f8faf6" }}>
              <span style={{ fontSize:"9px", fontWeight:600, color:"#9ca38f", letterSpacing:".06em" }}>MAX</span>
              <span style={{ fontSize:"12px", fontWeight:700, color:"#555", marginTop:"2px" }}>₹{max}</span>
            </div>
          )}
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:"8px" }}>
          <span style={{ fontSize:"10px", color:"#bbb" }}>per {unit}</span>
          {date && <span style={{ fontSize:"10px", color:"#bbb" }}>{date}</span>}
        </div>
      </div>
    </div>
  )
}

export default function MandiPrices() {
  const navigate = useNavigate()
  const [prices, setPrices] = useState<MandiEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [state, setState] = useState("")
  const [detectedState, setDetectedState] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [search, setSearch] = useState("")
  const [stateSearch, setStateSearch] = useState("")

  const fetchPrices = (stateName: string) => {
    setLoading(true); setError(false)
    api.get(`/market/prices/${stateName}`)
      .then(res => { const d = res.data; setPrices(Array.isArray(d)?d:d.prices??d.records??d.data??[]) })
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    const init = (lat: number, lon: number) => {
      const s = getStateFromCoords(lat, lon)
      setDetectedState(s); setState(s); fetchPrices(s)
    }
    navigator.geolocation
      ? navigator.geolocation.getCurrentPosition(p => init(p.coords.latitude, p.coords.longitude), () => { setDetectedState("Punjab"); setState("Punjab"); fetchPrices("Punjab") })
      : (() => { setDetectedState("Punjab"); setState("Punjab"); fetchPrices("Punjab") })()
  }, [])

  const filteredStates = INDIAN_STATES.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()))
  const filteredPrices = prices.filter(p => {
    const commodity = p.commodity||p.crop||p.name||""
    const market = p.market||p.mandi||""
    const q = search.toLowerCase()
    return commodity.toLowerCase().includes(q)||market.toLowerCase().includes(q)
  })

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:translateY(0);}}
        @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
        .skel{background:linear-gradient(90deg,#eef0eb 25%,#e4e7e0 50%,#eef0eb 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;}
        .scrollbar-hide::-webkit-scrollbar{display:none;}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none;}
      `}</style>

      <div style={{ minHeight:"100vh", background:"#f0f2ed", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>

        {/* ── HEADER: BG image layer (no overflow hidden, uses pseudo via absolute) ── */}
        <div style={{ position:"relative", zIndex:10 }}>
          {/* BG image — clipped separately */}
          <div style={{
            position:"absolute", inset:0, zIndex:0,
            backgroundImage:`linear-gradient(rgba(0,0,0,0.58),rgba(0,0,0,0.52)),url('https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=80&auto=format&fit=crop')`,
            backgroundSize:"cover", backgroundPosition:"center",
            borderRadius:"0 0 28px 28px",
            boxShadow:"0 10px 40px rgba(0,0,0,0.18)",
            overflow:"hidden",
          }}/>

          {/* Content — NO overflow hidden, so dropdown escapes */}
          <div style={{ position:"relative", zIndex:1, padding:"clamp(28px,5vw,44px) clamp(16px,4vw,32px) 22px" }}>

            {/* Back + title row */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"16px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
                <button onClick={() => navigate(-1)} style={{
                  width:"36px", height:"36px", borderRadius:"50%", flexShrink:0,
                  background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.18)",
                  display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
                  transition:"background .18s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.background="rgba(255,255,255,0.22)")}
                  onMouseLeave={e => (e.currentTarget.style.background="rgba(255,255,255,0.12)")}
                >
                  <ArrowLeft size={15} color="#fff"/>
                </button>
                <div>
                  <p style={{ fontSize:"9px", fontWeight:700, color:"#4ade80", letterSpacing:".16em", textTransform:"uppercase", marginBottom:"3px" }}>✦ Live Market</p>
                  <h1 style={{ fontSize:"clamp(1.5rem,3.5vw,2rem)", fontWeight:800, color:"#fff", letterSpacing:"-.03em", lineHeight:1 }}>Mandi Prices</h1>
                </div>
              </div>
              {!loading && !error && (
                <div style={{ padding:"6px 14px", borderRadius:"14px", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.15)", textAlign:"center", flexShrink:0 }}>
                  <p style={{ fontSize:"1.3rem", fontWeight:800, color:"#fff", lineHeight:1 }}>{filteredPrices.length}</p>
                  <p style={{ fontSize:"9px", color:"rgba(255,255,255,0.5)", marginTop:"2px" }}>entries</p>
                </div>
              )}
            </div>

            {/* State selector */}
            <div style={{ position:"relative", marginBottom:"10px" }}>
              <button onClick={() => setShowDropdown(!showDropdown)} style={{
                width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"11px 16px", borderRadius:"14px", cursor:"pointer",
                background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.18)",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                  <MapPin size={13} color="#4ade80"/>
                  <span style={{ fontWeight:600, fontSize:"13px", color:"#fff" }}>{state||"Select State"}</span>
                  {detectedState && state===detectedState && (
                    <span style={{ fontSize:"9px", fontWeight:700, padding:"2px 8px", borderRadius:"999px", background:"rgba(74,222,128,0.2)", color:"#4ade80", letterSpacing:".04em" }}>AUTO</span>
                  )}
                </div>
                <ChevronDown size={14} color="rgba(255,255,255,0.6)" style={{ transform:showDropdown?"rotate(180deg)":"rotate(0)", transition:"transform .2s" }}/>
              </button>

              {/* Dropdown — renders OUTSIDE the clipped bg div */}
              {showDropdown && (
                <div style={{
                  position:"absolute", top:"calc(100% + 6px)", left:0, right:0, zIndex:999,
                  background:"rgba(8,10,6,0.98)", backdropFilter:"blur(24px)",
                  border:"1px solid rgba(255,255,255,0.12)", borderRadius:"16px", overflow:"hidden",
                  boxShadow:"0 20px 60px rgba(0,0,0,0.6)",
                }}>
                  <div style={{ padding:"10px", borderBottom:"1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ position:"relative" }}>
                      <Search size={13} style={{ position:"absolute", left:"11px", top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.35)" }}/>
                      <input type="text" placeholder="Search state..." value={stateSearch} onChange={e => setStateSearch(e.target.value)} autoFocus
                        style={{ width:"100%", padding:"8px 12px 8px 32px", borderRadius:"10px", background:"rgba(255,255,255,0.07)", border:"1px solid rgba(255,255,255,0.1)", color:"#fff", fontSize:"12px", outline:"none", fontFamily:"'Plus Jakarta Sans',sans-serif" }}/>
                    </div>
                  </div>
                  <div className="scrollbar-hide" style={{ maxHeight:"240px", overflowY:"auto" }}>
                    {filteredStates.map(s => (
                      <div key={s} onClick={() => { setState(s); setShowDropdown(false); setStateSearch(""); fetchPrices(s) }}
                        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"11px 16px", cursor:"pointer", color:s===state?"#4ade80":"rgba(255,255,255,0.75)", fontSize:"13px", fontWeight:s===state?700:400 }}
                        onMouseEnter={e => (e.currentTarget.style.background="rgba(255,255,255,0.05)")}
                        onMouseLeave={e => (e.currentTarget.style.background="transparent")}
                      >
                        <span>{s}</span>
                        {s===detectedState && <span style={{ fontSize:"9px", color:"#4ade80", fontWeight:700 }}>YOUR LOCATION</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search */}
            <div style={{ position:"relative" }}>
              <Search size={13} style={{ position:"absolute", left:"14px", top:"50%", transform:"translateY(-50%)", color:"rgba(255,255,255,0.38)" }}/>
              <input type="text" placeholder="Search commodity or market..." value={search} onChange={e => setSearch(e.target.value)}
                style={{ width:"100%", padding:"11px 16px 11px 38px", borderRadius:"14px", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.12)", color:"#fff", fontSize:"13px", outline:"none", fontFamily:"'Plus Jakarta Sans',sans-serif" }}/>
            </div>

          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ padding:"20px clamp(12px,4vw,32px) 40px" }}>

          {/* Loading skeletons */}
          {loading && (
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"12px" }}>
              {[1,2,3,4,5,6].map(i => (
                <div key={i} className="skel" style={{ height:"200px", borderRadius:"18px" }}/>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div style={{ background:"#fff", borderRadius:"20px", padding:"40px 20px", textAlign:"center", boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
              <p style={{ fontSize:"2rem", marginBottom:"8px" }}>⚠️</p>
              <p style={{ fontWeight:700, color:"#333", fontSize:"14px" }}>Could not load prices for {state}</p>
              <p style={{ color:"#aaa", fontSize:"12px", marginTop:"4px" }}>Try selecting a different state</p>
              <button onClick={() => fetchPrices(state)} style={{ marginTop:"16px", padding:"8px 20px", borderRadius:"999px", background:"#16a34a", color:"#fff", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:700 }}>Retry</button>
            </div>
          )}

          {/* Empty */}
          {!loading && !error && filteredPrices.length===0 && (
            <div style={{ background:"#fff", borderRadius:"20px", padding:"40px 20px", textAlign:"center", boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
              <p style={{ fontSize:"2rem", marginBottom:"8px" }}>📊</p>
              <p style={{ fontWeight:700, color:"#333", fontSize:"14px" }}>No price data found</p>
              <p style={{ color:"#aaa", fontSize:"12px", marginTop:"4px" }}>Try a different state or search term</p>
            </div>
          )}

          {/* Results */}
          {!loading && !error && filteredPrices.length>0 && (
            <>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"14px" }}>
                <p style={{ fontSize:"12px", color:"#9ca38f", fontWeight:500 }}>{filteredPrices.length} price{filteredPrices.length!==1?"s":""} in <strong style={{ color:"#333" }}>{state}</strong></p>
                <div style={{ display:"flex", alignItems:"center", gap:"4px", padding:"4px 10px", borderRadius:"999px", background:"rgba(22,163,74,0.1)", border:"1px solid rgba(22,163,74,0.2)" }}>
                  <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#4ade80", boxShadow:"0 0 5px #4ade80" }}/>
                  <span style={{ fontSize:"10px", fontWeight:700, color:"#16a34a", letterSpacing:".04em" }}>LIVE</span>
                </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"12px" }}>
                {filteredPrices.map((entry,i) => (
                  <MandiCard key={i} entry={entry} index={i}/>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}