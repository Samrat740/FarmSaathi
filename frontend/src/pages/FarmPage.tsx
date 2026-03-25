import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

type Forecast = { time: string; temperature: number; condition: string }
type WeatherData = {
  location: string
  weather: { city: string; temperature: number; humidity: number; condition: string }
  forecast: Forecast[]
  recommended_crop: string
}

const LeafIcon = ({ size = 16, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M26 4C26 4 24 9 20 13C16 17 9 18 5 28" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M26 4C26 4 14 4 9 10C4 16 5 28 5 28C5 28 10 22 15 19C20 16 26 14 26 4Z" fill={color} opacity="0.9"/>
  </svg>
)

function WeatherBg({ condition }: { condition: string }) {
  const c = condition.toLowerCase()
  const isRain = c.includes("rain") || c.includes("drizzle")
  const isCloudy = c.includes("cloud")
  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden", borderRadius:"inherit" }}>
      <div style={{
        position:"absolute", inset:0,
        background: isRain
          ? "linear-gradient(160deg,#3d2c50 0%,#5a3d6b 40%,#7a4f7a 100%)"
          : isCloudy
          ? "linear-gradient(160deg,#6b4fa5 0%,#a07bc5 30%,#c9a0dc 55%,#f2c4ce 100%)"
          : "linear-gradient(160deg,#b34a6a 0%,#d4748a 25%,#e8a0a8 50%,#f7c5b0 75%,#fde0c5 100%)",
      }}/>
      {!isRain && !isCloudy && (
        <div style={{
          position:"absolute", top:"15%", right:"10%",
          width:"70px", height:"70px", borderRadius:"50%",
          background:"radial-gradient(circle,rgba(255,180,60,1) 0%,rgba(255,120,60,.85) 50%,transparent 75%)",
          boxShadow:"0 0 60px 24px rgba(255,120,60,.4)",
          animation:"sunPulse 4s ease-in-out infinite",
        }}/>
      )}
      <div className="cloud cloud-1" style={{ top:"10%", left:"-10%", opacity:isCloudy||isRain?0.85:0.3 }}/>
      <div className="cloud cloud-2" style={{ top:"28%", left:"-20%", opacity:isCloudy||isRain?0.65:0.18 }}/>
      <div className="cloud cloud-3" style={{ top:"6%",  left:"15%",  opacity:isCloudy||isRain?0.5:0.15 }}/>
      {isRain && Array.from({length:16}).map((_,i) => (
        <div key={i} className="raindrop" style={{
          left:`${(i*6.4)%100}%`,
          animationDelay:`${(i*0.14)%1.2}s`,
          animationDuration:`${0.7+(i%4)*0.15}s`,
        }}/>
      ))}
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"40%", background:"linear-gradient(to top,rgba(0,0,0,.45) 0%,transparent 100%)" }}/>
    </div>
  )
}

const CARDS = [
  {
    id:"crop", route:"/crop-analysis",
    label:"Crop & Seed Analysis", tag:"AI Powered",
    tagline:"Know your field, grow smarter.",
    desc:"Upload a field photo or describe your soil. Our AI detects crop health, identifies pests, recommends the best seeds and forecasts yield — tailored to your region and season.",
    stat:"500+", statLabel:"crops in database",
    image:"https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=85&auto=format&fit=crop",
    accent:"#16a34a", accentGlow:"rgba(22,163,74,0.35)",
  },
  {
    id:"schemes", route:"/schemes",
    label:"Govt Schemes", tag:"Updated Daily",
    tagline:"Benefits you deserve.",
    desc:"Browse 200+ central and state government schemes — subsidies, crop insurance, PM-KISAN, Kisan Credit Card and more. Filtered by your state and crop type.",
    stat:"200+", statLabel:"active schemes",
    image:"https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=85&auto=format&fit=crop",
    accent:"#2563eb", accentGlow:"rgba(37,99,235,0.35)",
  },
  {
    id:"kisan", route:"/kisan",
    label:"Your Kisan", tag:"24/7 AI",
    tagline:"Ask anything, anytime.",
    desc:"Your personal farming assistant — sowing schedules, disease remedies, market outlook, government helplines. Answers in Hindi and English, day or night.",
    stat:"24/7", statLabel:"always available",
    image:"https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=85&auto=format&fit=crop",
    accent:"#d97706", accentGlow:"rgba(217,119,6,0.35)",
  },
]

function Navbar({ active }: { active: string }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const nav = document.getElementById("farm-mobile-nav")
      if (nav && !nav.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  return (
    <nav id="farm-mobile-nav" style={{ position:"relative", zIndex:30, display:"flex", justifyContent:"center", padding:"20px 16px 0" }}>
      {/* Desktop */}
      <div className="desk-nav" style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"10px 28px",
        background:"rgba(2,2,2,0.93)", backdropFilter:"blur(28px)",
        border:"1px solid rgba(255,255,255,0.06)", borderRadius:"9999px",
        boxShadow:"0 8px 40px rgba(0,0,0,0.5)",
        width:"min(680px,92vw)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"9px", cursor:"pointer" }} onClick={() => navigate("/")}>
          <LeafIcon size={17} color="white"/>
          <span style={{ fontWeight:700, fontSize:"0.9rem", color:"#fff" }}>FarmSaathi</span>
        </div>
        <div style={{ display:"flex", gap:"28px" }}>
          {["Home","Farm","Market","Lab"].map(item => (
            <span key={item} onClick={() => navigate(item==="Home"?"/":`/${item.toLowerCase()}`)}
              style={{ cursor:"pointer", fontSize:"0.85rem", fontWeight:500, position:"relative",
                color:item.toLowerCase()===active?"#fff":"rgba(255,255,255,0.42)" }}>
              {item}
              {item.toLowerCase()===active && <span style={{ position:"absolute", bottom:"-3px", left:0, right:0, height:"1.5px", background:"#4ade80", borderRadius:"99px" }}/>}
            </span>
          ))}
        </div>
        <span onClick={() => navigate("/")} style={{ cursor:"pointer", fontSize:"0.85rem", fontWeight:500, color:"rgba(255,255,255,0.42)" }}>Overview</span>
      </div>

      {/* Mobile */}
      <div className="mob-nav" style={{
        display:"none", alignItems:"center", justifyContent:"space-between",
        width:"100%", maxWidth:"calc(100vw - 32px)", padding:"10px 20px",
        background:"rgba(2,2,2,0.93)", backdropFilter:"blur(28px)",
        border:"1px solid rgba(255,255,255,0.06)", borderRadius:"9999px",
        boxShadow:"0 8px 40px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px", cursor:"pointer" }} onClick={() => navigate("/")}>
          <LeafIcon size={15} color="white"/>
          <span style={{ fontWeight:700, fontSize:"0.88rem", color:"#fff" }}>FarmSaathi</span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)}
          style={{ background:"none", border:"none", cursor:"pointer", display:"flex", flexDirection:"column", gap:"5px", padding:"4px" }}>
          {[0,1,2].map(i => <span key={i} style={{ display:"block", height:"2px", width:i===1?"14px":"20px", background:"rgba(255,255,255,0.8)", borderRadius:"99px" }}/>)}
        </button>
      </div>

      {menuOpen && (
        <div style={{
          position:"absolute", top:"72px", left:"16px", right:"16px", zIndex:50,
          background:"rgba(4,4,4,0.97)", backdropFilter:"blur(28px)",
          border:"1px solid rgba(255,255,255,0.07)", borderRadius:"20px",
          boxShadow:"0 16px 48px rgba(0,0,0,0.7)", overflow:"hidden",
        }}>
          {["Home","Farm","Market","Lab"].map((item,i,arr) => (
            <div key={item}
              onClick={() => { setMenuOpen(false); navigate(item==="Home"?"/":`/${item.toLowerCase()}`) }}
              style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"16px 20px", cursor:"pointer",
                borderBottom:i<arr.length-1?"1px solid rgba(255,255,255,0.05)":"none",
                color:item.toLowerCase()===active?"#fff":"rgba(255,255,255,0.52)",
                fontSize:"14px", fontWeight:500,
              }}>
              <span>{item}</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>
          ))}
        </div>
      )}
    </nav>
  )
}

export default function FarmPage() {
  const navigate = useNavigate()
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [activeCard, setActiveCard] = useState(0)

  useEffect(() => {
    const fetch = (lat: number, lon: number) =>
      api.get(`/farmer/dashboard?lat=${lat}&lon=${lon}`)
        .then(res => setWeatherData(res.data)).catch(console.error)
    navigator.geolocation
      ? navigator.geolocation.getCurrentPosition(p => fetch(p.coords.latitude, p.coords.longitude), () => fetch(31.326, 75.5762))
      : fetch(31.326, 75.5762)
  }, [])

  const condition = weatherData?.weather.condition ?? "clear"

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}

        @keyframes sunPulse{0%,100%{box-shadow:0 0 60px 20px rgba(255,200,50,.35);}50%{box-shadow:0 0 90px 35px rgba(255,200,50,.5);}}
        @keyframes cloudDrift{from{transform:translateX(0);}to{transform:translateX(110vw);}}
        @keyframes rainFall{from{transform:translateY(-10px) rotate(15deg);opacity:0;}to{transform:translateY(240px) rotate(15deg);opacity:.65;}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes weatherShimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
        @keyframes lineSlide{0%{width:0%;margin-left:0%;}50%{width:60%;margin-left:20%;}100%{width:0%;margin-left:100%;}}

        .cloud{position:absolute;background:rgba(255,255,255,.82);border-radius:50px;filter:blur(2px);}
        .cloud::before,.cloud::after{content:'';position:absolute;background:inherit;border-radius:50%;}
        .cloud-1{width:130px;height:40px;animation:cloudDrift 26s linear infinite;}
        .cloud-1::before{width:64px;height:64px;top:-30px;left:18px;}
        .cloud-1::after{width:46px;height:46px;top:-22px;left:62px;}
        .cloud-2{width:90px;height:28px;animation:cloudDrift 36s linear infinite;animation-delay:-14s;}
        .cloud-2::before{width:44px;height:44px;top:-22px;left:14px;}
        .cloud-2::after{width:32px;height:32px;top:-14px;left:44px;}
        .cloud-3{width:160px;height:46px;animation:cloudDrift 20s linear infinite;animation-delay:-8s;}
        .cloud-3::before{width:76px;height:76px;top:-36px;left:24px;}
        .cloud-3::after{width:54px;height:54px;top:-26px;left:78px;}
        .raindrop{position:absolute;top:-10px;width:1.5px;height:20px;background:rgba(180,210,255,.75);border-radius:2px;animation:rainFall linear infinite;}

        .scrollbar-hide::-webkit-scrollbar{display:none;}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none;}

        /* Desktop horizontal cards */
        .hcard{
          transition:flex .5s cubic-bezier(.4,0,.2,1), box-shadow .3s ease;
          cursor:pointer; position:relative; overflow:hidden; border-radius:20px;
        }
        .hcard-label{
          writing-mode:vertical-rl; text-orientation:mixed;
          transform:rotate(180deg); transition:opacity .3s ease;
        }
        .hcard-content{ transition:opacity .35s ease, transform .35s ease; }

        /* Mobile vertical cards */
        .vcard{
          position:relative; overflow:hidden; border-radius:20px; cursor:pointer;
          transition:box-shadow .3s ease;
        }

        .fade-u{animation:fadeUp .55s ease both;}
        .fade-u1{animation:fadeUp .55s ease both;animation-delay:.1s;}
        .fade-u2{animation:fadeUp .55s ease both;animation-delay:.18s;}

        /* Responsive switches */
        @media(max-width:767px){
          .desk-nav{ display:none !important; }
          .mob-nav{ display:flex !important; }
          .cards-horiz{ display:none !important; }
          .cards-vert{ display:flex !important; }
          .weather-forecast-desk{ display:none !important; }
          .weather-forecast-mob{ display:flex !important; }
        }
        @media(min-width:768px){
          .mob-nav{ display:none !important; }
          .cards-horiz{ display:flex !important; }
          .cards-vert{ display:none !important; }
          .weather-forecast-mob{ display:none !important; }
          .weather-forecast-desk{ display:flex !important; }
        }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#f0f2ed", fontFamily:"'Plus Jakarta Sans',sans-serif", display:"flex", flexDirection:"column" }}>

        <Navbar active="farm"/>

        <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"16px clamp(12px,4vw,48px) 24px", gap:"14px", maxWidth:"1400px", margin:"0 auto", width:"100%" }}>

          {/* ── WEATHER ── */}
          <div className="fade-u" style={{ borderRadius:"20px", overflow:"hidden", position:"relative", boxShadow:"0 12px 40px rgba(0,0,0,0.16)" }}>
            {weatherData ? (
              <>
                <WeatherBg condition={condition}/>
                <div style={{ position:"relative", zIndex:2, display:"flex", flexDirection:"column", padding:"clamp(16px,3vw,28px) clamp(16px,4vw,36px)", gap:"16px" }}>

                  {/* Top row: temp + forecast side by side on desktop, stacked on mobile */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"16px", flexWrap:"wrap" }}>

                    {/* Left: location + temp + pills */}
                    <div>
                      <p style={{ color:"rgba(255,255,255,.85)", fontSize:"10px", letterSpacing:".14em", textTransform:"uppercase", marginBottom:"4px", textShadow:"0 1px 4px rgba(0,0,0,0.3)" }}>📍 {weatherData.location}</p>
                      <div style={{ display:"flex", alignItems:"flex-end", gap:"12px" }}>
                        <span style={{ fontSize:"clamp(3rem,7vw,5rem)", fontWeight:800, color:"#fff", lineHeight:1, letterSpacing:"-.04em", textShadow:"0 2px 16px rgba(0,0,0,0.45)" }}>
                          {Math.round(weatherData.weather.temperature)}°
                        </span>
                        <div style={{ paddingBottom:"6px" }}>
                          <p style={{ color:"rgba(255,255,255,.95)", fontSize:"13px", marginBottom:"6px", textShadow:"0 1px 6px rgba(0,0,0,0.35)" }}>{weatherData.weather.condition}</p>
                          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                            {[`💧 ${weatherData.weather.humidity}%`,`🌱 ${weatherData.recommended_crop}`].map((t,i) => (
                              <span key={i} style={{ padding:"3px 10px", borderRadius:"999px", fontSize:"10px", fontWeight:700, color:"#fff", background:"rgba(0,0,0,0.28)", border:"1px solid rgba(255,255,255,.35)", backdropFilter:"blur(8px)", whiteSpace:"nowrap", textShadow:"0 1px 3px rgba(0,0,0,0.3)" }}>{t}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: forecast - visible on desktop inline */}
                    <div className="weather-forecast-desk" style={{ display:"flex", gap:"7px", overflowX:"auto" }}>
                      {weatherData.forecast.slice(0,6).map((item,i) => {
                        const hr = parseInt((item.time.split(" ")[1]||item.time).split(":")[0])
                        const label = hr===0?"12 AM":hr<12?`${hr} AM`:hr===12?"12 PM":`${hr-12} PM`
                        const emoji = item.condition.toLowerCase().includes("rain")?"🌧":item.condition.toLowerCase().includes("cloud")?"☁️":"☀️"
                        return (
                          <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", padding:"9px 13px", borderRadius:"13px", minWidth:"54px", flexShrink:0, background:"rgba(0,0,0,0.22)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,.25)" }}>
                            <span style={{ color:"rgba(255,255,255,.8)", fontSize:"10px" }}>{label}</span>
                            <span style={{ fontSize:"13px" }}>{emoji}</span>
                            <span style={{ color:"#fff", fontSize:"11px", fontWeight:800, textShadow:"0 1px 4px rgba(0,0,0,0.3)" }}>{Math.round(item.temperature)}°</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Forecast scroll row - mobile only, below temp */}
                  <div className="weather-forecast-mob scrollbar-hide" style={{ display:"none", gap:"7px", overflowX:"auto", paddingBottom:"2px" }}>
                    {weatherData.forecast.slice(0,6).map((item,i) => {
                      const hr = parseInt((item.time.split(" ")[1]||item.time).split(":")[0])
                      const label = hr===0?"12 AM":hr<12?`${hr} AM`:hr===12?"12 PM":`${hr-12} PM`
                      const emoji = item.condition.toLowerCase().includes("rain")?"🌧":item.condition.toLowerCase().includes("cloud")?"☁️":"☀️"
                      return (
                        <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", padding:"9px 13px", borderRadius:"13px", minWidth:"54px", flexShrink:0, background:"rgba(0,0,0,0.22)", backdropFilter:"blur(10px)", border:"1px solid rgba(255,255,255,.25)" }}>
                          <span style={{ color:"rgba(255,255,255,.8)", fontSize:"10px" }}>{label}</span>
                          <span style={{ fontSize:"13px" }}>{emoji}</span>
                          <span style={{ color:"#fff", fontSize:"11px", fontWeight:800, textShadow:"0 1px 4px rgba(0,0,0,0.3)" }}>{Math.round(item.temperature)}°</span>
                        </div>
                      )
                    })}
                  </div>

                </div>
              </>
            ) : (
              <div style={{ position:"relative", overflow:"hidden", borderRadius:"inherit" }}>
                <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg,#b34a6a 0%,#d4748a 25%,#e8a0a8 50%,#f7c5b0 75%,#fde0c5 100%)" }}/>
                <div style={{ position:"relative", zIndex:2, padding:"clamp(24px,4vw,36px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"16px", minHeight:"130px" }}>
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontSize:"13px", fontWeight:700, color:"#fff", textShadow:"0 1px 6px rgba(0,0,0,0.3)", marginBottom:"3px" }}>Fetching weather…</p>
                    <p style={{ fontSize:"11px", color:"rgba(255,255,255,0.65)", textShadow:"0 1px 4px rgba(0,0,0,0.2)" }}>Detecting your location</p>
                  </div>
                  <div style={{ width:"160px", height:"3px", borderRadius:"99px", background:"rgba(255,255,255,0.2)", overflow:"hidden" }}>
                    <div style={{ height:"100%", borderRadius:"99px", background:"#fff", animation:"lineSlide 1.4s ease-in-out infinite" }}/>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── SECTION HEADER ── */}
          <div className="fade-u1" style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
            <div>
              <p style={{ fontSize:"10px", color:"#9ca38f", letterSpacing:".14em", textTransform:"uppercase", fontWeight:600, marginBottom:"3px" }}>✦ Farm Tools</p>
              <h2 style={{ fontSize:"clamp(1.1rem,2.5vw,1.6rem)", fontWeight:800, color:"#111", letterSpacing:"-.025em", lineHeight:1.1 }}>
                Complete Solutions for <span style={{ color:"#16a34a" }}>Modern Farming</span>
              </h2>
            </div>
            <p className="desk-nav" style={{ fontSize:"12px", color:"#9ca38f", fontWeight:500 }}>Hover to explore →</p>
          </div>

          {/* ── DESKTOP: 3 HORIZONTAL CARDS ── */}
          <div className="cards-horiz fade-u2" style={{ gap:"12px", flex:1, minHeight:0, height:"clamp(200px,30vh,300px)" }}>
            {CARDS.map((card,idx) => {
              const isActive = activeCard===idx
              return (
                <div key={card.id} className="hcard"
                  style={{
                    flex:isActive?"4 1 0":"1 1 0",
                    minWidth:isActive?"0":"68px",
                    boxShadow:isActive?`0 20px 50px rgba(0,0,0,0.2), 0 0 0 1.5px ${card.accent}55`:"0 4px 14px rgba(0,0,0,0.08)",
                  }}
                  onMouseEnter={() => setActiveCard(idx)}
                  onClick={() => navigate(card.route)}
                >
                  <div style={{ position:"absolute", inset:0, backgroundImage:`url(${card.image})`, backgroundSize:"cover", backgroundPosition:"center", transition:"transform .5s ease", transform:isActive?"scale(1.04)":"scale(1)" }}/>
                  <div style={{ position:"absolute", inset:0, background:isActive?"linear-gradient(135deg,rgba(0,0,0,0.72) 0%,rgba(0,0,0,0.28) 50%,rgba(0,0,0,0.52) 100%)":"linear-gradient(to bottom,rgba(0,0,0,0.12) 0%,rgba(0,0,0,0.72) 100%)", transition:"background .4s ease" }}/>
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"3px", background:card.accent, opacity:isActive?1:0, transition:"opacity .3s ease" }}/>

                  <div style={{ position:"relative", zIndex:2, height:"100%", padding:"18px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                    <div style={{ display:"flex" }}>
                      <span style={{ padding:"3px 10px", borderRadius:"999px", background:isActive?card.accent:"rgba(255,255,255,.15)", backdropFilter:"blur(8px)", fontSize:"9px", fontWeight:700, color:"#fff", letterSpacing:".05em", transition:"background .3s ease", whiteSpace:"nowrap" }}>{card.tag}</span>
                      {!isActive && (
                        <div style={{ flex:1, display:"flex", justifyContent:"center", alignItems:"center", height:"100%", position:"absolute", inset:0 }}>
                          <p className="hcard-label" style={{ color:"rgba(255,255,255,.7)", fontSize:"11px", fontWeight:700, letterSpacing:".06em" }}>{card.label}</p>
                        </div>
                      )}
                    </div>

                    {isActive && (
                      <div className="hcard-content">
                        <div style={{ marginBottom:"10px" }}>
                          <p style={{ color:"rgba(255,255,255,.5)", fontSize:"10px", fontWeight:600, letterSpacing:".08em", textTransform:"uppercase", marginBottom:"5px" }}>{card.tagline}</p>
                          <h3 style={{ fontSize:"clamp(1rem,1.8vw,1.35rem)", fontWeight:800, color:"#fff", letterSpacing:"-.02em", lineHeight:1.1, marginBottom:"8px" }}>{card.label}</h3>
                          <p style={{ color:"rgba(255,255,255,.62)", fontSize:"12px", lineHeight:1.6, maxWidth:"400px" }}>{card.desc}</p>
                        </div>
                        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                          <div>
                            <p style={{ fontSize:"1.3rem", fontWeight:800, color:"#fff", lineHeight:1 }}>{card.stat}</p>
                            <p style={{ fontSize:"9px", color:"rgba(255,255,255,.4)", marginTop:"2px" }}>{card.statLabel}</p>
                          </div>
                          <button onClick={e => { e.stopPropagation(); navigate(card.route) }}
                            style={{ display:"flex", alignItems:"center", gap:"5px", padding:"8px 16px", borderRadius:"999px", background:"#fff", color:"#111", border:"none", cursor:"pointer", fontSize:"11px", fontWeight:700, boxShadow:`0 4px 18px ${card.accentGlow}` }}>
                            Open
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── MOBILE: VERTICAL CARDS ── */}
          <div className="cards-vert fade-u2" style={{ flexDirection:"column", gap:"12px", display:"none" }}>
            {CARDS.map((card,idx) => {
              const isActive = activeCard===idx
              return (
                <div key={card.id} className="vcard"
                  style={{ boxShadow:isActive?`0 16px 40px rgba(0,0,0,0.2), 0 0 0 1.5px ${card.accent}55`:"0 4px 14px rgba(0,0,0,0.1)" }}
                  onClick={() => setActiveCard(isActive?-1:idx)}
                >
                  {/* Always visible top row */}
                  <div style={{
                    display:"flex", alignItems:"center", gap:"12px", padding:"16px",
                    background:"#fff",
                    borderBottom:isActive?`1px solid ${card.accent}22`:"none",
                  }}>
                    {/* Thumb */}
                    <div style={{ width:"48px", height:"48px", borderRadius:"12px", overflow:"hidden", flexShrink:0 }}>
                      <img src={card.image} alt={card.label} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:700, fontSize:"14px", color:"#111", letterSpacing:"-.01em" }}>{card.label}</p>
                      <p style={{ fontSize:"11px", color:"#9ca38f", marginTop:"2px" }}>{card.tagline}</p>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <span style={{ padding:"3px 9px", borderRadius:"999px", background:`${card.accent}18`, color:card.accent, fontSize:"9px", fontWeight:700, letterSpacing:".05em" }}>{card.tag}</span>
                      <div style={{ color:"#ccc", transition:"transform .3s ease", transform:isActive?"rotate(180deg)":"rotate(0deg)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isActive && (
                    <div>
                      {/* Image strip */}
                      <div style={{ height:"140px", position:"relative", overflow:"hidden" }}>
                        <img src={card.image} alt={card.label} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,.65) 0%,transparent 60%)" }}/>
                        <div style={{ position:"absolute", bottom:"12px", left:"16px" }}>
                          <p style={{ color:"#fff", fontSize:"1.4rem", fontWeight:800, lineHeight:1 }}>{card.stat}</p>
                          <p style={{ color:"rgba(255,255,255,.55)", fontSize:"10px", marginTop:"2px" }}>{card.statLabel}</p>
                        </div>
                        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"3px", background:card.accent }}/>
                      </div>

                      {/* Text + CTA */}
                      <div style={{ padding:"16px", background:"#fff" }}>
                        <p style={{ fontSize:"13px", color:"#4a5568", lineHeight:1.65, marginBottom:"16px" }}>{card.desc}</p>
                        <button
                          onClick={e => { e.stopPropagation(); navigate(card.route) }}
                          style={{ width:"100%", padding:"12px", borderRadius:"12px", background:card.accent, color:"#fff", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:700, letterSpacing:".02em", display:"flex", alignItems:"center", justifyContent:"center", gap:"6px" }}>
                          Open {card.label}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </div>
    </>
  )
}