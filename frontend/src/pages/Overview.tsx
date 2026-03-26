import { useEffect, useRef, useState } from "react";

const stats = [
  { value: "50K+", label: "Farmers" },
  { value: "500+", label: "Mandis" },
  { value: "12+", label: "States" },
  { value: "24/7", label: "AI" },
];

function Counter({ target }: { target: string }) {
  const [val, setVal] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || done.current) return;
      done.current = true;

      const num = parseFloat(target.replace(/[^0-9.]/g, ""));
      const suf = target.replace(/[0-9.]/g, "");
      const t0 = performance.now();

      const tick = (now: number) => {
        const p = Math.min((now - t0) / 1400, 1);
        setVal(Math.floor((1 - Math.pow(1 - p, 3)) * num) + suf);
        if (p < 1) requestAnimationFrame(tick);
        else setVal(target);
      };

      requestAnimationFrame(tick);
    }, { threshold: 0.5 });

    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{val}</span>;
}

export default function Overview() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800&display=swap');

        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #eef0ec;
          color: #111827;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: none; }
        }

        .f1 { animation: fadeUp .5s .05s ease both; }
        .f2 { animation: fadeUp .5s .14s ease both; }
        .f3 { animation: fadeUp .5s .23s ease both; }
        .f4 { animation: fadeUp .5s .32s ease both; }

        .dl-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: #16a34a;
          color: #fff;
          border-radius: 999px;
          padding: 12px 22px;
          font-size: 13px;
          font-weight: 700;
          text-decoration: none;
          transition: 0.2s;
        }

        .dl-btn:hover {
          background: #15803d;
          transform: translateY(-2px);
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: repeat(2,1fr) !important;
          }
        }
      `}</style>

      {/* MAIN CONTAINER */}
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#eef0ec",
        }}
      >

        {/* CONTENT */}
        <div style={{ flex: 1 }}>

          {/* HERO */}
          <section style={{ maxWidth: 600, margin: "0 auto", padding: "64px 24px 40px" }}>
            <div className="f1" style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 40 }}>
              <img src="/icon.png" alt="" style={{ width: 30, height: 30, background: "#111827", borderRadius: "50%", padding: 5 }} />
              <span style={{ fontSize: 16, fontWeight: 800 }}>FarmSaathi</span>
            </div>

            <div className="f1" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <span style={{ color: "#16a34a" }}>✦</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: "0.14em" }}>
                OVERVIEW
              </span>
            </div>

            <h1 className="f2" style={{
              fontSize: "clamp(38px,7vw,56px)",
              fontWeight: 800,
              lineHeight: 1.08,
              marginBottom: 18
            }}>
              Your Smart<br />Companion<br />
              <span style={{ color: "#16a34a" }}>in Farming</span>
            </h1>

            <p className="f3" style={{
              fontSize: 14,
              color: "#6b7280",
              lineHeight: 1.6,
              maxWidth: 360,
              marginBottom: 28
            }}>
              Real-time weather, live mandi prices, AI crop insights and government schemes — all in one place.
            </p>

            <div className="f4">
              <a href="/FarmSaathi App.apk" download className="dl-btn">
                <img src="/icon.png" alt="" style={{ width: 14, height: 14, filter: "brightness(10)" }} />
                Download App →
              </a>
            </div>
          </section>

          {/* STATS */}
          <section style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px 40px" }}>
            <div className="stats-grid" style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 8
            }}>
              {stats.map(s => (
                <div key={s.label} style={{
                  background: "#111827",
                  borderRadius: 14,
                  padding: "16px 6px",
                  textAlign: "center"
                }}>
                  <div style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: "#4ade80"
                  }}>
                    <Counter target={s.value} />
                  </div>
                  <div style={{
                    fontSize: 9,
                    color: "#9ca3af",
                    marginTop: 4,
                    fontWeight: 600,
                    letterSpacing: "0.08em"
                  }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* SLIM FOOTER */}
        <footer style={{
          background: "#111827",
          padding: "10px 14px",
          textAlign: "center"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6
          }}>
            <img
              src="/icon.png"
              alt=""
              style={{
                width: 18,
                height: 18,
                background: "#1f2937",
                borderRadius: "50%",
                padding: 3
              }}
            />
            <span style={{
              fontSize: 12,
              fontWeight: 600,
              color: "#ffffff"
            }}>
              FarmSaathi
            </span>
          </div>

          <p style={{
            fontSize: 10,
            color: "#9ca3af",
            marginTop: 2
          }}>
            Made with ❤️ for farmers
          </p>
        </footer>

      </div>
    </>
  );
}