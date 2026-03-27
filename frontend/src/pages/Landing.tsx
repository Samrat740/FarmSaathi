import { useState } from "react"
import { useNavigate } from "react-router-dom"

const LeafIcon = ({ size = 16, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M26 4C26 4 24 9 20 13C16 17 9 18 5 28"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M26 4C26 4 14 4 9 10C4 16 5 28 5 28C5 28 10 22 15 19C20 16 26 14 26 4Z"
      fill={color}
      opacity="0.9"
    />
  </svg>
)

export default function Landing() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />

      <style>{`
        * { box-sizing: border-box; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes menuSlide {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .hero-title { animation: fadeUp .75s ease both; animation-delay: .15s; }
        .hero-sub   { animation: fadeUp .75s ease both; animation-delay: .28s; }
        .hero-cta   { animation: fadeUp .75s ease both; animation-delay: .42s; }
        .nav-anim   { animation: fadeIn .5s ease both; }
        .menu-slide { animation: menuSlide .2s ease both; }

        .nav-link {
          position: relative; cursor: pointer;
          transition: color .18s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 50%; right: 50%;
          height: 1.5px; background: #4ade80;
          transition: left .22s ease, right .22s ease;
          border-radius: 99px;
        }
        .nav-link:hover { color: #fff !important; }
        .nav-link:hover::after { left: 0; right: 0; }

        .cta-btn {
          transition: transform .2s ease, filter .2s ease;
        }
        .cta-btn:hover  { transform: translateY(-1px); filter: brightness(1.08); }
        .cta-btn:active { transform: scale(.97); }

        .hamburger-line {
          display: block;
          width: 20px; height: 2px;
          background: rgba(255,255,255,0.8);
          border-radius: 99px;
          transition: all .22s ease;
        }
      `}</style>

      <div
        className="relative min-h-screen w-full overflow-hidden flex flex-col"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >

        {/* BG IMAGE */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url('/back1.png')`,
            backgroundSize: "cover",
            backgroundPosition: "center 30%",
            filter: "brightness(.72)",
          }}
        />

        {/* Overlays */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(to bottom, rgba(0,0,0,.5) 0%, rgba(0,0,0,.04) 38%, rgba(0,0,0,.0) 55%, rgba(0,0,0,.85) 100%)",
          }}
        />
        <div
          className="absolute inset-0 z-0"
          style={{
            background: "linear-gradient(to right, rgba(0,0,0,.55) 0%, rgba(0,0,0,.0) 52%)",
          }}
        />

        {/* ── NAVBAR ── */}
        <nav className="nav-anim relative z-30 flex justify-center pt-5 px-4">

          {/* Desktop */}
          <div
            className="hidden md:flex items-center justify-between px-7 py-3.5"
            style={{
              background: "rgba(2,2,2,0.95)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "9999px",
              boxShadow: "0 8px 48px rgba(0,0,0,0.75), inset 0 1px 0 rgba(255,255,255,0.04)",
              width: "min(680px, 92vw)",
            }}
          >
            {/* Logo + Name */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <LeafIcon size={18} color="white" />
              <span style={{ fontWeight: 700, fontSize: "0.92rem", color: "#fff", letterSpacing: "0.01em", whiteSpace: "nowrap" }}>
                FarmSaathi
              </span>
            </div>

            {/* Center links */}
            <div className="flex items-center gap-8">
              {["Home", "Farm", "Market", "Lab"].map((item) => (
                <span
                  key={item}
                  className="nav-link text-sm font-medium"
                  style={{
                    color: item === "Home" ? "#fff" : "rgba(255,255,255,0.42)",
                    letterSpacing: "0.02em",
                  }}
                  onClick={() => { if (item !== "Home") navigate(`/${item.toLowerCase()}`) }}
                >
                  {item}
                </span>
              ))}
            </div>

            {/* Overview */}
            <span
              className="nav-link text-sm font-medium flex-shrink-0"
              style={{ color: "#fff", letterSpacing: "0.02em" }}
              onClick={() => navigate("/overview") }
            >
              Download
            </span>
          </div>

          {/* Mobile */}
          <div
            className="md:hidden flex items-center justify-between w-full px-5 py-3"
            style={{
              background: "rgba(2,2,2,0.95)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "9999px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
              maxWidth: "calc(100vw - 32px)",
              margin: "0 auto",
            }}
          >
            <div className="flex items-center gap-2">
              <LeafIcon size={16} color="white" />
              <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#fff" }}>FarmSaathi</span>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex flex-col gap-[5px] items-center justify-center p-1"
              style={{ background: "none", border: "none", cursor: "pointer" }}
            >
              <span className="hamburger-line" />
              <span className="hamburger-line" style={{ width: "14px" }} />
              <span className="hamburger-line" />
            </button>
          </div>

          {/* Mobile dropdown */}
          {menuOpen && (
            <div
              className="menu-slide md:hidden absolute top-[72px] left-4 right-4 rounded-2xl overflow-hidden z-50"
              style={{
                background: "rgba(4,4,4,0.97)",
                backdropFilter: "blur(28px)",
                border: "1px solid rgba(255,255,255,0.07)",
                boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
              }}
            >
              {["Farm", "Market", "Lab", "Download"].map((item, i, arr) => (
                <div
                  key={item}
                  onClick={() => { setMenuOpen(false); item === "Download" ? navigate("/overview") : item !== "Home" && navigate(`/${item.toLowerCase()}`) }}
                  className="flex items-center justify-between px-5 py-4 cursor-pointer"
                  style={{
                    borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                    color: item === "Home" ? "#fff" : "rgba(255,255,255,0.52)",
                    fontSize: "14px",
                    fontWeight: 500,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.04)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span>{item}</span>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </div>
              ))}
            </div>
          )}
        </nav>

        {/* ── HERO BODY — bottom aligned ── */}
        <div className="relative z-10 flex-1 flex flex-col justify-end px-6 md:px-14 lg:px-20 pb-16 md:pb-20">
          <div className="flex flex-col" style={{ maxWidth: "520px" }}>

            <h1
              className="hero-title text-white leading-[1.06] mb-5"
              style={{
                fontSize: "clamp(2.6rem, 5.5vw, 4.2rem)",
                fontWeight: 800,
                letterSpacing: "-0.025em",
                textShadow: "0 2px 24px rgba(0,0,0,0.3)",
              }}
            >
              Your Smart<br />
              Companion<br />
              <span style={{ color: "#86efac" }}>in Farming</span>
            </h1>

            <p
              className="hero-sub mb-9 leading-relaxed"
              style={{
                color: "rgba(255,255,255,0.46)",
                fontSize: "clamp(0.8rem, 1.3vw, 0.9rem)",
                fontWeight: 400,
                maxWidth: "370px",
                letterSpacing: "0.005em",
              }}
            >
              Real-time weather, live mandi prices, AI crop insights and
              government schemes — all in one place, built for every farmer.
            </p>

            {/* CTA */}
            <div className="hero-cta">
              <button
                onClick={() => navigate("/farm")}
                className="cta-btn flex items-center gap-3 px-7 py-3.5 rounded-full font-semibold text-sm"
                style={{
                  background: "#1c4a30",
                  border: "1px solid rgba(74,222,128,0.28)",
                  color: "#a3f0be",
                  letterSpacing: "0.03em",
                }}
              >
                <LeafIcon size={15} color="#a3f0be" />
                Let's Harvest
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </button>
            </div>

          </div>
        </div>

      </div>
    </>
  )
}