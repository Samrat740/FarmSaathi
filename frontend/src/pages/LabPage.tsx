import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const LeafIcon = ({ size = 16, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M26 4C26 4 24 9 20 13C16 17 9 18 5 28" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M26 4C26 4 14 4 9 10C4 16 5 28 5 28C5 28 10 22 15 19C20 16 26 14 26 4Z" fill={color} opacity="0.9"/>
  </svg>
)

// SVG illustrated backgrounds for each card
const SimulatorBg = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sim-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1e0a3c"/>
        <stop offset="100%" stopColor="#3b0764"/>
      </linearGradient>
      <linearGradient id="sim-glow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#7c3aed" stopOpacity="0"/>
        <stop offset="50%" stopColor="#7c3aed" stopOpacity="0.6"/>
        <stop offset="100%" stopColor="#7c3aed" stopOpacity="0"/>
      </linearGradient>
    </defs>
    <rect width="400" height="260" fill="url(#sim-bg)"/>
    {/* Grid lines */}
    {[0,1,2,3,4,5].map(i => (
      <line key={`h${i}`} x1="0" y1={40+i*40} x2="400" y2={40+i*40} stroke="rgba(124,58,237,0.15)" strokeWidth="1"/>
    ))}
    {[0,1,2,3,4,5,6,7].map(i => (
      <line key={`v${i}`} x1={50+i*50} y1="0" x2={50+i*50} y2="260" stroke="rgba(124,58,237,0.15)" strokeWidth="1"/>
    ))}
    {/* Waveform / yield curve */}
    <path d="M20,180 C60,160 80,80 120,90 C160,100 180,140 220,100 C260,60 280,120 320,80 C350,50 370,70 390,60" stroke="#7c3aed" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    <path d="M20,180 C60,160 80,80 120,90 C160,100 180,140 220,100 C260,60 280,120 320,80 C350,50 370,70 390,60 L390,260 L20,260 Z" fill="url(#sim-glow)" opacity="0.18"/>
    {/* Data points */}
    {[[120,90],[220,100],[320,80]].map(([x,y],i) => (
      <g key={i}>
        <circle cx={x} cy={y} r="5" fill="#7c3aed"/>
        <circle cx={x} cy={y} r="10" fill="#7c3aed" opacity="0.2"/>
      </g>
    ))}
    {/* Floating stats */}
    <rect x="20" y="20" width="90" height="32" rx="8" fill="rgba(124,58,237,0.25)" stroke="rgba(124,58,237,0.4)" strokeWidth="1"/>
    <text x="65" y="31" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="sans-serif">YIELD FORECAST</text>
    <text x="65" y="45" textAnchor="middle" fill="#c4b5fd" fontSize="12" fontWeight="bold" fontFamily="sans-serif">+24.8%</text>
    <rect x="290" y="20" width="90" height="32" rx="8" fill="rgba(124,58,237,0.25)" stroke="rgba(124,58,237,0.4)" strokeWidth="1"/>
    <text x="335" y="31" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="8" fontFamily="sans-serif">RISK SCORE</text>
    <text x="335" y="45" textAnchor="middle" fill="#86efac" fontSize="12" fontWeight="bold" fontFamily="sans-serif">LOW</text>
    {/* Crop seedling icons */}
    <g opacity="0.3">
      <path d="M200,230 C200,230 195,215 185,210 C195,208 205,215 200,230Z" fill="#86efac"/>
      <path d="M200,230 C200,230 205,215 215,210 C205,208 195,215 200,230Z" fill="#86efac"/>
      <line x1="200" y1="230" x2="200" y2="250" stroke="#86efac" strokeWidth="1.5"/>
    </g>
    <g opacity="0.2" transform="translate(-30,0)">
      <path d="M200,220 C200,220 195,208 187,204 C196,202 204,208 200,220Z" fill="#86efac"/>
      <path d="M200,220 C200,220 205,208 213,204 C204,202 196,208 200,220Z" fill="#86efac"/>
      <line x1="200" y1="220" x2="200" y2="238" stroke="#86efac" strokeWidth="1.5"/>
    </g>
    <g opacity="0.2" transform="translate(30,0)">
      <path d="M200,225 C200,225 196,212 188,207 C197,205 205,212 200,225Z" fill="#86efac"/>
      <path d="M200,225 C200,225 204,212 212,207 C203,205 195,212 200,225Z" fill="#86efac"/>
      <line x1="200" y1="225" x2="200" y2="244" stroke="#86efac" strokeWidth="1.5"/>
    </g>
  </svg>
)

const SoilBg = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="soil-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1c0a00"/>
        <stop offset="100%" stopColor="#3d1a00"/>
      </linearGradient>
    </defs>
    <rect width="400" height="260" fill="url(#soil-bg)"/>
    {/* Soil layers */}
    <rect x="0" y="100" width="400" height="35" fill="rgba(180,83,9,0.25)" rx="0"/>
    <text x="20" y="123" fill="rgba(251,191,36,0.6)" fontSize="9" fontFamily="sans-serif" fontWeight="600">TOPSOIL — pH 6.8</text>
    <rect x="0" y="135" width="400" height="35" fill="rgba(180,83,9,0.18)" rx="0"/>
    <text x="20" y="158" fill="rgba(251,191,36,0.45)" fontSize="9" fontFamily="sans-serif">SUBSOIL — pH 7.1</text>
    <rect x="0" y="170" width="400" height="90" fill="rgba(120,53,15,0.3)" rx="0"/>
    <text x="20" y="193" fill="rgba(251,191,36,0.3)" fontSize="9" fontFamily="sans-serif">BEDROCK</text>
    {/* NPK bars */}
    <rect x="30" y="20" width="100" height="14" rx="7" fill="rgba(255,255,255,0.07)"/>
    <rect x="30" y="20" width="75" height="14" rx="7" fill="#b45309" opacity="0.8"/>
    <text x="145" y="31" fill="rgba(255,255,255,0.55)" fontSize="9" fontFamily="sans-serif">N 75%</text>
    <rect x="30" y="42" width="100" height="14" rx="7" fill="rgba(255,255,255,0.07)"/>
    <rect x="30" y="42" width="55" height="14" rx="7" fill="#d97706" opacity="0.8"/>
    <text x="145" y="53" fill="rgba(255,255,255,0.55)" fontSize="9" fontFamily="sans-serif">P 55%</text>
    <rect x="30" y="64" width="100" height="14" rx="7" fill="rgba(255,255,255,0.07)"/>
    <rect x="30" y="64" width="85" height="14" rx="7" fill="#f59e0b" opacity="0.8"/>
    <text x="145" y="75" fill="rgba(255,255,255,0.55)" fontSize="9" fontFamily="sans-serif">K 85%</text>
    {/* Soil particles */}
    {[[280,30],[310,45],[295,65],[330,30],[340,60],[270,55],[320,75],[290,80]].map(([x,y],i) => (
      <circle key={i} cx={x} cy={y} r={3+i%3} fill={`rgba(180,83,9,${0.3+i*0.05})`}/>
    ))}
    {/* Roots */}
    <path d="M200,100 L200,60 M200,60 L185,40 M200,60 L215,40 M185,40 L178,25 M215,40 L222,25" stroke="rgba(180,83,9,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    <circle cx="200" cy="55" r="8" fill="none" stroke="rgba(251,191,36,0.3)" strokeWidth="1"/>
    {/* pH gauge */}
    <rect x="290" y="110" width="90" height="40" rx="8" fill="rgba(0,0,0,0.4)" stroke="rgba(180,83,9,0.4)" strokeWidth="1"/>
    <text x="335" y="126" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="8" fontFamily="sans-serif">pH LEVEL</text>
    <text x="335" y="144" textAnchor="middle" fill="#fbbf24" fontSize="16" fontWeight="bold" fontFamily="sans-serif">6.8</text>
  </svg>
)

const FertBg = () => (
  <svg width="100%" height="100%" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="fert-bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#001a24"/>
        <stop offset="100%" stopColor="#003344"/>
      </linearGradient>
    </defs>
    <rect width="400" height="260" fill="url(#fert-bg)"/>
    {/* Hexagon grid pattern */}
    {[[60,50],[120,50],[180,50],[240,50],[300,50],[360,50],
      [90,98],[150,98],[210,98],[270,98],[330,98],
      [60,146],[120,146],[180,146],[240,146],[300,146],[360,146],
      [90,194],[150,194],[210,194],[270,194],[330,194]].map(([cx,cy],i) => (
      <polygon key={i}
        points={`${cx},${cy-22} ${cx+19},${cy-11} ${cx+19},${cy+11} ${cx},${cy+22} ${cx-19},${cy+11} ${cx-19},${cy-11}`}
        fill="none" stroke={`rgba(8,145,178,${0.08+i%4*0.03})`} strokeWidth="1"
      />
    ))}
    {/* Highlighted hexagons */}
    {[[180,50],[120,98],[270,98],[150,146],[300,50]].map(([cx,cy],i) => (
      <polygon key={i}
        points={`${cx},${cy-22} ${cx+19},${cy-11} ${cx+19},${cy+11} ${cx},${cy+22} ${cx-19},${cy+11} ${cx-19},${cy-11}`}
        fill={`rgba(8,145,178,${0.1+i*0.04})`} stroke="rgba(8,145,178,0.4)" strokeWidth="1"
      />
    ))}
    {/* NPK circles */}
    <circle cx="80" cy="220" r="28" fill="rgba(8,145,178,0.12)" stroke="rgba(8,145,178,0.4)" strokeWidth="1.5"/>
    <text x="80" y="215" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="sans-serif">NITROGEN</text>
    <text x="80" y="230" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="bold" fontFamily="sans-serif">N</text>
    <circle cx="155" cy="220" r="28" fill="rgba(8,145,178,0.12)" stroke="rgba(8,145,178,0.4)" strokeWidth="1.5"/>
    <text x="155" y="215" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="sans-serif">PHOSPHORUS</text>
    <text x="155" y="230" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="bold" fontFamily="sans-serif">P</text>
    <circle cx="230" cy="220" r="28" fill="rgba(8,145,178,0.12)" stroke="rgba(8,145,178,0.4)" strokeWidth="1.5"/>
    <text x="230" y="215" textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="9" fontFamily="sans-serif">POTASSIUM</text>
    <text x="230" y="230" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="bold" fontFamily="sans-serif">K</text>
    {/* Calculator display */}
    <rect x="290" y="180" width="95" height="60" rx="10" fill="rgba(0,0,0,0.5)" stroke="rgba(8,145,178,0.4)" strokeWidth="1"/>
    <text x="337" y="200" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="8" fontFamily="sans-serif">DOSAGE / ACRE</text>
    <text x="337" y="218" textAnchor="middle" fill="#38bdf8" fontSize="15" fontWeight="bold" fontFamily="sans-serif">42 kg</text>
    <text x="337" y="232" textAnchor="middle" fill="rgba(255,255,255,0.35)" fontSize="8" fontFamily="sans-serif">₹ 1,260 est.</text>
    {/* Particles/granules */}
    {[[310,40],[340,25],[360,55],[320,70],[350,80],[380,35],[295,65]].map(([x,y],i) => (
      <circle key={i} cx={x} cy={y} r={2+i%3} fill={`rgba(8,145,178,${0.4+i*0.06})`}/>
    ))}
  </svg>
)

const CARDS = [
  {
    id: "simulator",
    route: "/simulator",
    label: "Crop Simulator",
    tag: "AI Model",
    tagline: "Predict before you plant.",
    desc: "Input your soil type, location, rainfall and seed variety. Our model simulates the full growth cycle and predicts expected yield, best sowing date and risk factors.",
    stat: "50+", statLabel: "crop models",
    accent: "#7c3aed",
    accentGlow: "rgba(124,58,237,0.4)",
    accentLight: "rgba(124,58,237,0.12)",
    Bg: SimulatorBg,
    icon: (c: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </svg>
    ),
    features: ["Yield prediction", "Sowing calendar", "Risk analysis", "Weather sync"],
  },
  {
    id: "soil",
    route: "/soil-analyzer",
    label: "Soil Health Analyzer",
    tag: "Diagnostic",
    tagline: "Know what your land needs.",
    desc: "Enter your soil test values — pH, nitrogen, phosphorus, potassium. Get a detailed health report, deficiency diagnosis and crop-specific amendment recommendations.",
    stat: "12", statLabel: "soil parameters",
    accent: "#b45309",
    accentGlow: "rgba(180,83,9,0.4)",
    accentLight: "rgba(180,83,9,0.12)",
    Bg: SoilBg,
    icon: (c: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a7 7 0 0 1 7 7c0 5-7 13-7 13S5 14 5 9a7 7 0 0 1 7-7z"/>
        <circle cx="12" cy="9" r="2.5"/>
      </svg>
    ),
    features: ["pH analysis", "NPK levels", "Organic matter", "Amendment guide"],
  },
  {
    id: "fertilizer",
    route: "/fertilizer-calc",
    label: "Fertilizer Calculator",
    tag: "Precision",
    tagline: "Right dose, right time.",
    desc: "Select your crop, enter your field area and current soil nutrient levels. Get the exact fertilizer type, quantity and application schedule to maximize yield and minimize waste.",
    stat: "200+", statLabel: "fertilizer types",
    accent: "#0891b2",
    accentGlow: "rgba(8,145,178,0.4)",
    accentLight: "rgba(8,145,178,0.12)",
    Bg: FertBg,
    icon: (c: string) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="3" width="16" height="18" rx="2"/>
        <line x1="8" y1="8" x2="16" y2="8"/>
        <line x1="8" y1="12" x2="16" y2="12"/>
        <line x1="8" y1="16" x2="12" y2="16"/>
      </svg>
    ),
    features: ["Crop-specific dosage", "Area calculator", "Cost estimate", "NPK schedule"],
  },
]

function Navbar({ active }: { active: string }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const nav = document.getElementById("lab-nav")
      if (nav && !nav.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [menuOpen])

  return (
    <nav id="lab-nav" style={{ position:"relative", zIndex:30, display:"flex", justifyContent:"center", padding:"20px 16px 0" }}>
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
        <span onClick={() => navigate("/overview")} style={{ cursor:"pointer", fontSize:"0.85rem", fontWeight:500, color:"rgba(255,255,255,0.42)" }}>Download</span>
      </div>

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

export default function LabPage() {
  const navigate = useNavigate()
  const [activeCard, setActiveCard] = useState(0)
  const [openCard, setOpenCard] = useState<number | null>(0) // mobile: first card open by default

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}

        .fade-u { animation:fadeUp .55s ease both; }
        .fade-u1{ animation:fadeUp .55s ease both; animation-delay:.08s; }
        .fade-u2{ animation:fadeUp .55s ease both; animation-delay:.16s; }

        .hcard{
          transition: flex-grow .45s cubic-bezier(.25,.46,.45,.94),
                      flex-basis .45s cubic-bezier(.25,.46,.45,.94),
                      box-shadow .3s ease;
          cursor:pointer; position:relative; overflow:hidden; border-radius:22px;
          will-change:flex-grow; transform:translateZ(0);
        }
        .hcard-label{ writing-mode:vertical-rl; text-orientation:mixed; transform:rotate(180deg); }

        .vcard{ border-radius:20px; overflow:hidden; cursor:pointer; transition:box-shadow .3s ease; }

        .scrollbar-hide::-webkit-scrollbar{display:none;}
        .scrollbar-hide{-ms-overflow-style:none;scrollbar-width:none;}

        @media(max-width:767px){
          .desk-nav{display:none!important;}
          .mob-nav{display:flex!important;}
          .cards-horiz{display:none!important;}
          .cards-vert{display:flex!important;}
        }
        @media(min-width:768px){
          .mob-nav{display:none!important;}
          .cards-horiz{display:flex!important;}
          .cards-vert{display:none!important;}
        }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#f0f2ed", fontFamily:"'Plus Jakarta Sans',sans-serif", display:"flex", flexDirection:"column", overflow:"hidden" }}>

        <Navbar active="lab"/>

        <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"16px clamp(12px,4vw,48px) 28px", gap:"16px", maxWidth:"1400px", margin:"0 auto", width:"100%" }}>

          {/* ── HEADER ── */}
          <div className="fade-u" style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginTop:"4px" }}>
            <div>
              <p style={{ fontSize:"10px", color:"#9ca38f", letterSpacing:".14em", textTransform:"uppercase", fontWeight:600, marginBottom:"4px" }}>🔬 Research & Tools</p>
              <h1 style={{ fontSize:"clamp(1.5rem,3.5vw,2.2rem)", fontWeight:800, color:"#111", letterSpacing:"-.03em", lineHeight:1.1 }}>
                Smarter Farming<br/>
                <span style={{ color:"#7c3aed" }}>Through Science</span>
              </h1>
            </div>
            <div className="desk-nav" style={{ display:"flex", alignItems:"center", gap:"8px" }}>
              <div style={{ padding:"6px 14px", borderRadius:"999px", background:"rgba(124,58,237,0.1)", border:"1px solid rgba(124,58,237,0.2)", display:"flex", alignItems:"center", gap:"6px" }}>
                <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#7c3aed", boxShadow:"0 0 6px #7c3aed" }}/>
                <span style={{ fontSize:"11px", fontWeight:700, color:"#7c3aed", letterSpacing:".04em" }}>AI POWERED</span>
              </div>
            </div>
          </div>

          {/* ── DESKTOP HORIZONTAL CARDS ── */}
          <div className="cards-horiz fade-u1" style={{ gap:"14px", flex:1, height:"clamp(280px,42vh,440px)", overflow:"hidden" }}>
            {CARDS.map((card, idx) => {
              const isActive = activeCard === idx
              const { Bg } = card
              return (
                <div key={card.id} className="hcard"
                  style={{
                    flex: isActive ? "4 1 0" : "1 1 0",
                    minWidth: isActive ? "0" : "72px",
                    boxShadow: isActive ? `0 24px 60px rgba(0,0,0,0.25)` : "0 4px 16px rgba(0,0,0,0.1)",
                    outline: isActive ? `2px solid ${card.accent}55` : "2px solid transparent",
                  }}
                  onMouseEnter={() => setActiveCard(idx)}
                  onClick={() => navigate(card.route)}
                >
                  {/* SVG illustrated background */}
                  <div style={{ position:"absolute", inset:0 }}>
                    <Bg/>
                  </div>

                  {/* Dark overlay when collapsed */}
                  <div style={{
                    position:"absolute", inset:0,
                    background: isActive ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.45)",
                    transition:"background .4s ease",
                  }}/>

                  {/* Accent gradient tint */}
                  <div style={{
                    position:"absolute", inset:0,
                    background:`linear-gradient(135deg, ${card.accent}18 0%, transparent 65%)`,
                    opacity: isActive ? 1 : 0,
                    transition:"opacity .4s ease",
                  }}/>

                  {/* Bottom accent strip */}
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"3px", background:card.accent, opacity:isActive?1:0, transition:"opacity .3s ease" }}/>

                  <div style={{ position:"relative", zIndex:2, height:"100%", padding:"20px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>

                    {/* Top row */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{
                        padding:"4px 11px", borderRadius:"999px",
                        background: isActive ? card.accent : "rgba(255,255,255,0.15)",
                        backdropFilter:"blur(8px)",
                        fontSize:"10px", fontWeight:700, color:"#fff",
                        letterSpacing:".05em", transition:"background .3s ease",
                        whiteSpace:"nowrap", position:"relative", zIndex:3,
                      }}>{card.tag}</span>

                      {/* Vertical label collapsed */}
                      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", opacity:isActive?0:1, transition:"opacity .2s ease" }}>
                        <p className="hcard-label" style={{ color:"rgba(255,255,255,.85)", fontSize:"12px", fontWeight:700, letterSpacing:".06em" }}>{card.label}</p>
                      </div>

                      {/* Icon */}
                      <div style={{ color:card.accent, background:"rgba(0,0,0,0.35)", backdropFilter:"blur(8px)", borderRadius:"10px", padding:"7px", border:`1px solid ${card.accent}44`, opacity:isActive?1:0, transition:"opacity .2s ease", position:"relative", zIndex:3 }}>
                        {card.icon(card.accent)}
                      </div>
                    </div>

                    {/* Bottom content */}
                    <div style={{ opacity:isActive?1:0, pointerEvents:isActive?"auto":"none", transition:"opacity .25s ease .1s", overflow:"hidden" }}>
                      {/* Feature pills */}
                      <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"14px" }}>
                        {card.features.map((f,i) => (
                          <span key={i} style={{ padding:"3px 10px", borderRadius:"999px", fontSize:"10px", fontWeight:600, color:"rgba(255,255,255,0.85)", background:"rgba(0,0,0,0.35)", border:"1px solid rgba(255,255,255,0.18)", backdropFilter:"blur(6px)", whiteSpace:"nowrap" }}>{f}</span>
                        ))}
                      </div>

                      <div style={{ marginBottom:"16px" }}>
                        <p style={{ color:"rgba(255,255,255,.5)", fontSize:"10px", fontWeight:600, letterSpacing:".08em", textTransform:"uppercase", marginBottom:"5px" }}>{card.tagline}</p>
                        <h3 style={{ fontSize:"clamp(1.1rem,2vw,1.45rem)", fontWeight:800, color:"#fff", letterSpacing:"-.02em", lineHeight:1.1, marginBottom:"10px" }}>{card.label}</h3>
                        <p style={{ color:"rgba(255,255,255,.62)", fontSize:"12.5px", lineHeight:1.65, maxWidth:"400px" }}>{card.desc}</p>
                      </div>

                      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                        <div>
                          <p style={{ fontSize:"1.35rem", fontWeight:800, color:"#fff", lineHeight:1 }}>{card.stat}</p>
                          <p style={{ fontSize:"9px", color:"rgba(255,255,255,.4)", marginTop:"2px" }}>{card.statLabel}</p>
                        </div>
                        <button onClick={e => { e.stopPropagation(); navigate(card.route) }}
                          style={{ display:"flex", alignItems:"center", gap:"6px", padding:"10px 20px", borderRadius:"999px", background:"#fff", color:"#111", border:"none", cursor:"pointer", fontSize:"12px", fontWeight:700, boxShadow:`0 4px 20px ${card.accentGlow}`, transition:"transform .2s" }}
                          onMouseEnter={e => (e.currentTarget.style.transform="translateY(-1px)")}
                          onMouseLeave={e => (e.currentTarget.style.transform="translateY(0)")}
                        >
                          Launch
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── MOBILE VERTICAL CARDS ── */}
          <div className="cards-vert fade-u1" style={{ flexDirection:"column", gap:"12px" }}>
            {CARDS.map((card, idx) => {
              const open = openCard === idx
              const { Bg } = card
              return (
                <div key={card.id} className="vcard"
                  style={{ boxShadow:open?`0 16px 40px rgba(0,0,0,0.18),0 0 0 1.5px ${card.accent}44`:"0 4px 14px rgba(0,0,0,0.09)" }}
                >
                  <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"16px", background:"#fff", borderBottom:open?`1px solid ${card.accent}22`:"none", cursor:"pointer" }}
                    onClick={() => setOpenCard(open ? null : idx)}>
                    <div style={{ width:"44px", height:"44px", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background:card.accentLight, color:card.accent }}>
                      {card.icon(card.accent)}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:700, fontSize:"14px", color:"#111" }}>{card.label}</p>
                      <p style={{ fontSize:"11px", color:"#9ca38f", marginTop:"2px" }}>{card.tagline}</p>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <span style={{ padding:"3px 9px", borderRadius:"999px", background:card.accentLight, color:card.accent, fontSize:"9px", fontWeight:700 }}>{card.tag}</span>
                      <div style={{ color:"#bbb", transition:"transform .3s", transform:open?"rotate(180deg)":"rotate(0)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                    </div>
                  </div>
                  {open && (
                    <div>
                      <div style={{ height:"140px", position:"relative", overflow:"hidden" }}>
                        <Bg/>
                        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,.6) 0%,transparent 55%)" }}/>
                        <div style={{ position:"absolute", bottom:"12px", left:"14px" }}>
                          <p style={{ color:"#fff", fontSize:"14px", fontWeight:800, lineHeight:1 }}>{card.stat}</p>
                          <p style={{ color:"rgba(255,255,255,.5)", fontSize:"9px", marginTop:"1px" }}>{card.statLabel}</p>
                        </div>
                        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"3px", background:card.accent }}/>
                      </div>
                      <div style={{ padding:"14px 16px 16px", background:"#fff" }}>
                        <div style={{ display:"flex", gap:"6px", flexWrap:"wrap", marginBottom:"12px" }}>
                          {card.features.map((f,i) => (
                            <span key={i} style={{ padding:"3px 10px", borderRadius:"999px", fontSize:"10px", fontWeight:600, color:card.accent, background:card.accentLight }}>{f}</span>
                          ))}
                        </div>
                        <p style={{ fontSize:"13px", color:"#4a5568", lineHeight:1.65, marginBottom:"14px" }}>{card.desc}</p>
                        <button onClick={() => navigate(card.route)} style={{ width:"100%", padding:"12px", borderRadius:"12px", background:card.accent, color:"#fff", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:"6px" }}>
                          Launch {card.label}
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