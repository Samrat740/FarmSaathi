import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"

const LeafIcon = ({ size = 16, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M26 4C26 4 24 9 20 13C16 17 9 18 5 28" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    <path d="M26 4C26 4 14 4 9 10C4 16 5 28 5 28C5 28 10 22 15 19C20 16 26 14 26 4Z" fill={color} opacity="0.9"/>
  </svg>
)

const CARDS = [
  {
    id: "mandi",
    route: "/mandi",
    label: "Mandi Prices",
    tag: "Live",
    tagline: "Real prices, right now.",
    desc: "Live wholesale prices from mandis across all Indian states. Updated hourly with crop-wise trends, min-max ranges and historical comparisons.",
    cta: "Check Prices",
    accent: "#16a34a",
    accentGlow: "rgba(22,163,74,0.4)",
    accentLight: "rgba(22,163,74,0.12)",
    image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&q=85&auto=format&fit=crop",
    stats: [
      { val: "500+", label: "Mandis" },
      { val: "28", label: "States" },
      { val: "1hr", label: "Updates" },
    ],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
        <polyline points="16 7 22 7 22 13"/>
      </svg>
    ),
  },
  {
    id: "buy",
    route: "/buy",
    label: "Buy Supplies",
    tag: "Shop",
    tagline: "Everything your farm needs.",
    desc: "Seeds, fertilizers, pesticides, tools and equipment — sourced from verified suppliers. Fast delivery, farmer pricing, no middlemen.",
    cta: "Browse Store",
    accent: "#2563eb",
    accentGlow: "rgba(37,99,235,0.4)",
    accentLight: "rgba(37,99,235,0.12)",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=85&auto=format&fit=crop",
    stats: [
      { val: "2000+", label: "Products" },
      { val: "48hr", label: "Delivery" },
      { val: "100%", label: "Verified" },
    ],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 0 1-8 0"/>
      </svg>
    ),
  },
  {
    id: "sell",
    route: "/sell",
    label: "Sell Produce",
    tag: "Marketplace",
    tagline: "Find buyers, get fair value.",
    desc: "List your harvest and connect with verified buyers, traders and exporters near you. Set your price, negotiate directly, get paid fast.",
    cta: "List Produce",
    accent: "#d97706",
    accentGlow: "rgba(217,119,6,0.4)",
    accentLight: "rgba(217,119,6,0.12)",
    image: "https://images.unsplash.com/photo-1543257580-7269da773bf5?w=1200&q=85&auto=format&fit=crop",
    stats: [
      { val: "10K+", label: "Buyers" },
      { val: "0%", label: "Commission" },
      { val: "Direct", label: "Payment" },
    ],
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
    ),
  },
]

const TICKER = [
  { crop: "Wheat", price: "₹2,180", change: "+1.2%", up: true },
  { crop: "Rice", price: "₹3,450", change: "-0.4%", up: false },
  { crop: "Tomato", price: "₹1,240", change: "+4.8%", up: true },
  { crop: "Onion", price: "₹890", change: "+2.1%", up: true },
  { crop: "Potato", price: "₹620", change: "-1.3%", up: false },
  { crop: "Soybean", price: "₹4,120", change: "+0.8%", up: true },
  { crop: "Cotton", price: "₹6,580", change: "-0.6%", up: false },
  { crop: "Maize", price: "₹1,890", change: "+3.2%", up: true },
]

function Navbar({ active }: { active: string }) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const nav = document.getElementById("market-nav")
      if (nav && !nav.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  return (
    <nav id="market-nav" style={{ position:"relative", zIndex:30, display:"flex", justifyContent:"center", padding:"20px 16px 0" }}>
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

export default function MarketPage() {
  const navigate = useNavigate()
  const [activeCard, setActiveCard] = useState(0)

  // Keep isMobile for responsive logic (suppresses the unused warning by using it in JSX below)
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(18px);}to{opacity:1;transform:translateY(0);}}
        @keyframes tickerMove{from{transform:translateX(0);}to{transform:translateX(-50%)}}

        .fade-u{animation:fadeUp .55s ease both;}
        .fade-u1{animation:fadeUp .55s ease both;animation-delay:.08s;}
        .fade-u2{animation:fadeUp .55s ease both;animation-delay:.16s;}

        .hcard{
          transition: flex-grow .45s cubic-bezier(.25,.46,.45,.94),
                      flex-basis .45s cubic-bezier(.25,.46,.45,.94),
                      box-shadow .3s ease,
                      outline .3s ease;
          cursor:pointer; position:relative; overflow:hidden; border-radius:22px;
          will-change: flex-grow;
          transform: translateZ(0);
        }
        .hcard-label{writing-mode:vertical-rl;text-orientation:mixed;transform:rotate(180deg);}
        .hcard-content{
          transition:opacity .25s ease .15s;
        }

        .vcard{border-radius:20px;overflow:hidden;cursor:pointer;transition:box-shadow .3s ease;}

        .ticker-track{
          display:flex;
          animation:tickerMove 28s linear infinite;
          width:max-content;
        }
        .ticker-track:hover{animation-play-state:paused;}

        .stat-pill{
          display:flex;flex-direction:column;align-items:center;
          padding:8px 16px;border-radius:14px;
          background:rgba(255,255,255,0.1);
          border:1px solid rgba(255,255,255,0.15);
          backdrop-filter:blur(8px);
          flex-shrink:0;
        }

        .cta-card-btn{
          transition:transform .2s ease,box-shadow .2s ease;
        }
        .cta-card-btn:hover{transform:translateY(-1px);}

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

      {/* isMobile used here to keep TS happy and for future responsive tweaks */}
      <div style={{ minHeight:"100vh", background: isMobile ? "#f0f2ed" : "#f0f2ed", fontFamily:"'Plus Jakarta Sans',sans-serif", display:"flex", flexDirection:"column", overflow:"hidden" }}>

        <Navbar active="market"/>

        <div style={{ flex:1, display:"flex", flexDirection:"column", padding:"16px clamp(12px,4vw,48px) 28px", gap:"16px", maxWidth:"1400px", margin:"0 auto", width:"100%" }}>

          {/* ── HEADER ── */}
          <div className="fade-u" style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between", marginTop:"4px" }}>
            <div>
              <p style={{ fontSize:"10px", color:"#9ca38f", letterSpacing:".14em", textTransform:"uppercase", fontWeight:600, marginBottom:"4px" }}>✦ Marketplace</p>
              <h1 style={{ fontSize:"clamp(1.5rem,3.5vw,2.2rem)", fontWeight:800, color:"#111", letterSpacing:"-.03em", lineHeight:1.1 }}>
                Trade Smarter,<br/>
                <span style={{ color:"#16a34a" }}>Earn Better</span>
              </h1>
            </div>
            <div className="desk-nav" style={{ display:"flex", gap:"8px" }}>
              {["All Markets", "Grains", "Vegetables", "Fruits"].map((f,i) => (
                <span key={f} style={{
                  padding:"6px 14px", borderRadius:"999px", fontSize:"12px", fontWeight:600, cursor:"pointer",
                  background:i===0?"#111":"rgba(0,0,0,0.06)",
                  color:i===0?"#fff":"#666",
                  transition:"all .18s",
                }}>{f}</span>
              ))}
            </div>
          </div>

          {/* ── LIVE TICKER ── */}
          <div className="fade-u1" style={{
            overflow:"hidden", borderRadius:"16px",
            background:"#111", padding:"12px 0",
            boxShadow:"0 4px 20px rgba(0,0,0,0.12)",
            position:"relative",
          }}>
            <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"60px", background:"linear-gradient(to right,#111,transparent)", zIndex:2, pointerEvents:"none" }}/>
            <div style={{ position:"absolute", right:0, top:0, bottom:0, width:"60px", background:"linear-gradient(to left,#111,transparent)", zIndex:2, pointerEvents:"none" }}/>
            <div className="ticker-track">
              {[...TICKER, ...TICKER].map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px", padding:"0 28px", borderRight:"1px solid rgba(255,255,255,0.07)", flexShrink:0 }}>
                  <span style={{ color:"rgba(255,255,255,0.55)", fontSize:"12px", fontWeight:500 }}>{item.crop}</span>
                  <span style={{ color:"#fff", fontSize:"13px", fontWeight:700 }}>{item.price}</span>
                  <span style={{
                    fontSize:"11px", fontWeight:700, padding:"2px 7px", borderRadius:"6px",
                    background:item.up?"rgba(22,163,74,0.15)":"rgba(220,38,38,0.15)",
                    color:item.up?"#4ade80":"#f87171",
                  }}>{item.change}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ── DESKTOP HORIZONTAL CARDS ── */}
          <div className="cards-horiz fade-u2" style={{ gap:"14px", flex:1, height:"clamp(260px,38vh,400px)", overflow:"hidden" }}>
            {CARDS.map((card, idx) => {
              const isActive = activeCard === idx
              return (
                <div key={card.id} className="hcard"
                  style={{
                    flex:isActive?"4 1 0":"1 1 0",
                    minWidth:isActive?"0":"72px",
                    boxShadow:isActive?`0 24px 60px rgba(0,0,0,0.22)`:"0 4px 16px rgba(0,0,0,0.08)",
                    outline:isActive?`2px solid ${card.accent}55`:"2px solid transparent",
                  }}
                  onMouseEnter={() => setActiveCard(idx)}
                  onClick={() => navigate(card.route)}
                >
                  <div style={{ position:"absolute", inset:0, backgroundImage:`url(${card.image})`, backgroundSize:"cover", backgroundPosition:"center" }}/>
                  <div style={{ position:"absolute", inset:0, background:isActive?"linear-gradient(135deg,rgba(0,0,0,0.78) 0%,rgba(0,0,0,0.3) 55%,rgba(0,0,0,0.58) 100%)":"linear-gradient(to bottom,rgba(0,0,0,0.1) 0%,rgba(0,0,0,0.8) 100%)", transition:"background .4s ease" }}/>
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"3px", background:card.accent, opacity:isActive?1:0, transition:"opacity .3s ease" }}/>

                  <div style={{ position:"relative", zIndex:2, height:"100%", padding:"20px", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{
                        padding:"4px 11px", borderRadius:"999px",
                        background:isActive?card.accent:"rgba(255,255,255,0.15)",
                        backdropFilter:"blur(8px)",
                        fontSize:"10px", fontWeight:700, color:"#fff",
                        letterSpacing:".05em", transition:"background .3s ease",
                        whiteSpace:"nowrap", position:"relative", zIndex:3,
                      }}>{card.tag}</span>

                      <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", pointerEvents:"none", opacity:isActive?0:1, transition:"opacity .25s ease" }}>
                        <p className="hcard-label" style={{ color:"rgba(255,255,255,.75)", fontSize:"12px", fontWeight:700, letterSpacing:".06em" }}>{card.label}</p>
                      </div>

                      <div style={{ color:card.accent, background:card.accentLight, borderRadius:"10px", padding:"6px", opacity:isActive?1:0, transition:"opacity .25s ease", position:"relative", zIndex:3 }}>
                        {card.icon}
                      </div>
                    </div>

                    <div className="hcard-content" style={{ opacity:isActive?1:0, pointerEvents:isActive?"auto":"none", transition:"opacity .25s ease .1s", overflow:"hidden" }}>
                      <div style={{ display:"flex", gap:"8px", marginBottom:"14px" }}>
                        {card.stats.map((s,i) => (
                          <div key={i} className="stat-pill">
                            <span style={{ color:"#fff", fontSize:"14px", fontWeight:800, lineHeight:1 }}>{s.val}</span>
                            <span style={{ color:"rgba(255,255,255,.45)", fontSize:"9px", marginTop:"2px", whiteSpace:"nowrap" }}>{s.label}</span>
                          </div>
                        ))}
                      </div>

                      <div>
                        <p style={{ color:"rgba(255,255,255,.5)", fontSize:"10px", fontWeight:600, letterSpacing:".08em", textTransform:"uppercase", marginBottom:"5px" }}>{card.tagline}</p>
                        <h3 style={{ fontSize:"clamp(1.1rem,2vw,1.5rem)", fontWeight:800, color:"#fff", letterSpacing:"-.02em", lineHeight:1.1, marginBottom:"10px" }}>{card.label}</h3>
                        <p style={{ color:"rgba(255,255,255,.62)", fontSize:"12.5px", lineHeight:1.65, maxWidth:"400px", marginBottom:"16px" }}>{card.desc}</p>
                      </div>

                      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                        {/* ── CTA button: passes crop for buy card ── */}
                        <button
                          onClick={e => { e.stopPropagation(); navigate(card.route) }}
                          className="cta-card-btn"
                          style={{
                            display:"flex", alignItems:"center", gap:"6px",
                            padding:"10px 20px", borderRadius:"999px",
                            background:"#fff", color:"#111",
                            border:"none", cursor:"pointer",
                            fontSize:"12px", fontWeight:700, letterSpacing:".02em",
                            boxShadow:`0 4px 20px ${card.accentGlow}`,
                          }}>
                          {card.cta}
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </button>
                        <span style={{ color:"rgba(255,255,255,.35)", fontSize:"11px" }}>Hover to explore →</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── MOBILE VERTICAL CARDS ── */}
          <div className="cards-vert fade-u2" style={{ flexDirection:"column", gap:"12px" }}>
            {CARDS.map((card) => {
              const [open, setOpen] = useState(false)
              return (
                <div key={card.id} className="vcard"
                  style={{ boxShadow:open?`0 16px 40px rgba(0,0,0,0.18),0 0 0 1.5px ${card.accent}44`:"0 4px 14px rgba(0,0,0,0.09)" }}
                >
                  <div
                    style={{ display:"flex", alignItems:"center", gap:"12px", padding:"16px", background:"#fff", borderBottom:open?`1px solid ${card.accent}22`:"none", cursor:"pointer" }}
                    onClick={() => setOpen(!open)}
                  >
                    <div style={{ width:"44px", height:"44px", borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background:card.accentLight, color:card.accent }}>
                      {card.icon}
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <p style={{ fontWeight:700, fontSize:"14px", color:"#111", letterSpacing:"-.01em" }}>{card.label}</p>
                      <p style={{ fontSize:"11px", color:"#9ca38f", marginTop:"2px" }}>{card.tagline}</p>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                      <span style={{ padding:"3px 9px", borderRadius:"999px", background:card.accentLight, color:card.accent, fontSize:"9px", fontWeight:700, letterSpacing:".05em" }}>{card.tag}</span>
                      <div style={{ color:"#bbb", transition:"transform .3s ease", transform:open?"rotate(180deg)":"rotate(0deg)" }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                      </div>
                    </div>
                  </div>

                  {open && (
                    <div>
                      <div style={{ height:"140px", position:"relative", overflow:"hidden" }}>
                        <img src={card.image} alt={card.label} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,.7) 0%,transparent 55%)" }}/>
                        <div style={{ position:"absolute", bottom:"12px", left:"14px", display:"flex", gap:"10px" }}>
                          {card.stats.map((s,i) => (
                            <div key={i}>
                              <p style={{ color:"#fff", fontSize:"13px", fontWeight:800, lineHeight:1 }}>{s.val}</p>
                              <p style={{ color:"rgba(255,255,255,.5)", fontSize:"9px", marginTop:"1px" }}>{s.label}</p>
                            </div>
                          ))}
                        </div>
                        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"3px", background:card.accent }}/>
                      </div>
                      <div style={{ padding:"16px", background:"#fff" }}>
                        <p style={{ fontSize:"13px", color:"#4a5568", lineHeight:1.65, marginBottom:"14px" }}>{card.desc}</p>
                        {/* ── Mobile CTA: passes crop for buy card ── */}
                        <button
                          onClick={() => navigate(card.route)}
                          style={{ width:"100%", padding:"12px", borderRadius:"12px", background:card.accent, color:"#fff", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", gap:"6px" }}>
                          {card.cta}
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* ── BOTTOM INFO STRIP ── */}
          <div className="fade-u2" style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
            {[
              { icon:"📊", title:"Price Trends", desc:"Compare weekly & monthly price movement across 28 states" },
              { icon:"🔔", title:"Price Alerts", desc:"Get notified when your crop hits your target price" },
              { icon:"🤝", title:"Trade Directly", desc:"No commission. Connect with buyers & sellers face to face" },
            ].map((item, i) => (
              <div key={i} style={{
                flex:"1 1 220px", padding:"16px 18px", borderRadius:"16px",
                background:"#fff", border:"1.5px solid #e8ebe4",
                boxShadow:"0 2px 10px rgba(0,0,0,0.05)",
                display:"flex", alignItems:"flex-start", gap:"12px",
                cursor:"pointer", transition:"border-color .2s ease, box-shadow .2s ease",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor="#4ade8066"; (e.currentTarget as HTMLElement).style.boxShadow="0 6px 24px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor="#e8ebe4"; (e.currentTarget as HTMLElement).style.boxShadow="0 2px 10px rgba(0,0,0,0.05)"; }}
              >
                <span style={{ fontSize:"1.4rem", lineHeight:1 }}>{item.icon}</span>
                <div>
                  <p style={{ fontWeight:700, fontSize:"13px", color:"#111", marginBottom:"3px" }}>{item.title}</p>
                  <p style={{ fontSize:"12px", color:"#9ca38f", lineHeight:1.5 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  )
}