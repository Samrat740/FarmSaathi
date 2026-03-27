import { useEffect, useRef, useState } from "react";

const stats = [
  { value: "50K+", label: "Farmers" },
  { value: "500+", label: "Mandis" },
  { value: "12+", label: "States" },
  { value: "24/7", label: "AI" },
];

// Pure SVG animated checkmark — no external dependency, zero crash risk
function AnimatedCheck() {
  return (
    <svg
      viewBox="0 0 36 36"
      width="36"
      height="36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="18"
        cy="18"
        r="15"
        stroke="#16a34a"
        strokeWidth="2.5"
        strokeDasharray="94.2"
        strokeDashoffset="94.2"
        strokeLinecap="round"
        style={{ animation: "circleIn 0.45s cubic-bezier(.4,0,.2,1) 0s forwards" }}
      />
      <path
        d="M11 18.5l5 5 9-9"
        stroke="#16a34a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="20"
        strokeDashoffset="20"
        style={{ animation: "checkIn 0.35s cubic-bezier(.4,0,.2,1) 0.35s forwards" }}
      />
    </svg>
  );
}

function Counter({ target }: { target: string }) {
  const [val, setVal] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  const done = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
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
      },
      { threshold: 0.5 }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{val}</span>;
}

type DlState = "idle" | "downloading" | "done";

function DownloadButton() {
  const [dlState, setDlState] = useState<DlState>("idle");
  const [progress, setProgress] = useState(0);

  const handleDownload = () => {
    if (dlState !== "idle") return;
    setDlState("downloading");
    setProgress(0);

    const steps = [
      { target: 15, delay: 80 },
      { target: 35, delay: 120 },
      { target: 55, delay: 200 },
      { target: 72, delay: 160 },
      { target: 88, delay: 250 },
      { target: 96, delay: 180 },
      { target: 100, delay: 300 },
    ];

    steps.forEach(({ target, delay }, i) => {
      const prevTarget = i === 0 ? 0 : steps[i - 1].target;
      const stepDelay = steps.slice(0, i).reduce((a, s) => a + s.delay, 0);

      setTimeout(() => {
        const start = performance.now();
        const animate = (now: number) => {
          const p = Math.min((now - start) / delay, 1);
          const eased = 1 - Math.pow(1 - p, 2);
          setProgress(Math.round(prevTarget + eased * (target - prevTarget)));
          if (p < 1) {
            requestAnimationFrame(animate);
          } else if (target === 100) {
            setTimeout(() => {
              setDlState("done");
              const a = document.createElement("a");
              a.href = "/FarmSaathi App.apk";
              a.download = "FarmSaathi App.apk";
              a.click();
            }, 200);
          }
        };
        requestAnimationFrame(animate);
      }, stepDelay);
    });
  };

  const reset = () => {
    setDlState("idle");
    setProgress(0);
  };

  return (
    <div className="f4" style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
      <button
        onClick={dlState === "done" ? reset : handleDownload}
        disabled={dlState === "downloading"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: dlState === "done" ? "#15803d" : "#16a34a",
          color: "#fff",
          borderRadius: 999,
          padding: "12px 22px",
          fontSize: 13,
          fontWeight: 700,
          border: "none",
          cursor: dlState === "downloading" ? "not-allowed" : "pointer",
          transition: "background 0.2s, transform 0.2s, box-shadow 0.2s",
          opacity: dlState === "downloading" ? 0.85 : 1,
          boxShadow: dlState === "downloading" ? "none" : "0 4px 14px rgba(22,163,74,0.35)",
          position: "relative",
          overflow: "hidden",
          minWidth: 160,
          justifyContent: "center",
        }}
        onMouseEnter={e => {
          if (dlState !== "downloading")
            (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
        }}
      >
        {dlState === "downloading" && (
          <span style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
            animation: "shimmer 1.2s infinite",
          }} />
        )}

        {dlState === "idle" && (
          <>
            <img src="/icon.png" alt="" style={{ width: 14, height: 14, filter: "brightness(10)", position: "relative" }} />
            <span style={{ position: "relative" }}>Download App →</span>
          </>
        )}
        {dlState === "downloading" && (
          <span style={{ position: "relative" }}>Downloading… {progress}%</span>
        )}
        {dlState === "done" && (
          <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15 }}>✓</span> Downloaded!
          </span>
        )}
      </button>

      {/* Progress bar */}
      {dlState === "downloading" && (
        <div style={{
          width: 220,
          height: 4,
          background: "rgba(22,163,74,0.18)",
          borderRadius: 999,
          overflow: "hidden",
          animation: "fadeIn 0.2s ease",
        }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #16a34a, #4ade80)",
            borderRadius: 999,
            transition: "width 0.08s linear",
            boxShadow: "0 0 6px rgba(74,222,128,0.6)",
          }} />
        </div>
      )}

      {/* Animated SVG checkmark + hint */}
      {dlState === "done" && (
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          animation: "fadeIn 0.3s ease",
        }}>
          <AnimatedCheck />
          <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>
            Install the APK from your Downloads folder
          </span>
        </div>
      )}
    </div>
  );
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
          to   { opacity: 1; transform: none; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: none; }
        }

        @keyframes shimmer {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }

        @keyframes circleIn {
          to { stroke-dashoffset: 0; }
        }

        @keyframes checkIn {
          to { stroke-dashoffset: 0; }
        }

        .f1 { animation: fadeUp .5s .05s ease both; }
        .f2 { animation: fadeUp .5s .14s ease both; }
        .f3 { animation: fadeUp .5s .23s ease both; }
        .f4 { animation: fadeUp .5s .32s ease both; }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: repeat(2,1fr) !important;
          }
        }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#eef0ec" }}>
        <div style={{ flex: 1 }}>

          {/* HERO */}
          <section style={{ maxWidth: 600, margin: "0 auto", padding: "64px 24px 40px" }}>
            <div className="f1" style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 40 }}>
              <img src="/icon.png" alt="" style={{ width: 30, height: 30, background: "#111827", borderRadius: "50%", padding: 5 }} />
              <span style={{ fontSize: 16, fontWeight: 800 }}>FarmSaathi</span>
            </div>

            <div className="f1" style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 14 }}>
              <span style={{ color: "#16a34a" }}>✦</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", letterSpacing: "0.14em" }}>OVERVIEW</span>
            </div>

            <h1 className="f2" style={{ fontSize: "clamp(38px,7vw,56px)", fontWeight: 800, lineHeight: 1.08, marginBottom: 18 }}>
              Your Smart<br />Companion<br />
              <span style={{ color: "#16a34a" }}>in Farming</span>
            </h1>

            <p className="f3" style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, maxWidth: 360, marginBottom: 28 }}>
              Real-time weather, live mandi prices, AI crop insights and government schemes — all in one place.
            </p>

            <DownloadButton />
          </section>

          {/* STATS */}
          <section style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px 40px" }}>
            <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
              {stats.map(s => (
                <div key={s.label} style={{ background: "#111827", borderRadius: 14, padding: "16px 6px", textAlign: "center" }}>
                  <div style={{ fontSize: 24, fontWeight: 800, color: "#4ade80" }}>
                    <Counter target={s.value} />
                  </div>
                  <div style={{ fontSize: 9, color: "#9ca3af", marginTop: 4, fontWeight: 600, letterSpacing: "0.08em" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* FOOTER */}
        <footer style={{ background: "#111827", padding: "10px 14px", textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <img src="/icon.png" alt="" style={{ width: 18, height: 18, background: "#1f2937", borderRadius: "50%", padding: 3 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "#ffffff" }}>FarmSaathi</span>
          </div>
          <p style={{ fontSize: 10, color: "#9ca3af", marginTop: 2 }}>Made with ❤️ for farmers</p>
        </footer>
      </div>
    </>
  );
}