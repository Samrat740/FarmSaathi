import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

type Mode = "crop" | "seed"

interface CropResult {
  success: boolean
  disease?: string
  cause?: string
  reason?: string
  raw_disease?: string
  confidence?: number
  message?: string
  recommendations?: any
  error?: string
}

interface SeedResult {
  success: boolean
  quality?: string
  reason?: string
  advice?: string
  raw_prediction?: string
  recommendations?: any
  error?: string
}

type Result = CropResult | SeedResult

const LeafIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M26 4C26 4 24 9 20 13C16 17 9 18 5 28" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M26 4C26 4 14 4 9 10C4 16 5 28 5 28C5 28 10 22 15 19C20 16 26 14 26 4Z" fill="currentColor" opacity="0.9"/>
  </svg>
)

function ConfidenceBar({ value }: { value: number }) {
  const c = value >= 80 ? "#16a34a" : value >= 60 ? "#d97706" : "#dc2626"
  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
        <span style={{ fontSize:"11px", fontWeight:600, color:"#94a3b8", letterSpacing:".07em", textTransform:"uppercase" }}>Confidence</span>
        <span style={{ fontSize:"12px", fontWeight:700, color:c }}>{value}%</span>
      </div>
      <div style={{ height:"5px", borderRadius:"99px", background:"#f1f5f9" }}>
        <div style={{ height:"100%", borderRadius:"99px", background:c, width:`${value}%`, transition:"width .6s ease" }}/>
      </div>
    </div>
  )
}

const isCrop = (r: Result): r is CropResult => "disease" in r
const isSeed = (r: Result): r is SeedResult => "quality" in r

export default function CropAnalysisPage() {
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)

  const [mode, setMode]       = useState<Mode>("crop")
  const [image, setImage]     = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState<Result | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [dragging, setDragging] = useState(false)

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image file."); return }
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setResult(null); setError(null)
  }

  const reset = () => { setImage(null); setPreview(null); setResult(null); setError(null) }

  const switchMode = (m: Mode) => { setMode(m); reset() }

  const analyze = async () => {
    if (!image) return
    setLoading(true); setError(null); setResult(null)
    try {
      const fd = new FormData()
      fd.append("file", image)
      const url = mode === "crop" ? "/crop/analyze-crop" : "/seed/analyze-seed"
      const res = await api.post(url, fd, { headers:{ "Content-Type":"multipart/form-data" } })
      setResult(res.data)
    } catch (e: any) {
      setError(e?.response?.data?.detail || e?.message || "Analysis failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Status colours
  const healthy  = result && isCrop(result) && result.raw_disease?.includes("healthy")
  const seedGood = result && isSeed(result) && result.raw_prediction === "Good"
  const seedAvg  = result && isSeed(result) && result.raw_prediction === "Average"
  const statusColor = !result ? "#64748b" : isCrop(result) ? (healthy ? "#16a34a" : "#dc2626") : (seedGood ? "#16a34a" : seedAvg ? "#d97706" : "#dc2626")
  const statusBg    = !result ? "#f8fafc"  : isCrop(result) ? (healthy ? "#f0fdf4" : "#fef2f2") : (seedGood ? "#f0fdf4" : seedAvg ? "#fffbeb" : "#fef2f2")

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes shimmer{0%{background-position:-200% 0;}100%{background-position:200% 0;}}
        .fin{animation:fadeIn .35s ease both;}
        .split{display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start;}
        .dropzone{border:2px dashed #e2e8f0;border-radius:14px;cursor:pointer;transition:border-color .18s,background .18s;}
        .dropzone:hover,.dropzone.drag{border-color:#94a3b8;background:#f8fafc;}
        .dropzone.filled{border-style:solid;cursor:default;}
        .skel{border-radius:10px;background:linear-gradient(90deg,#f1f5f9 25%,#e8edf2 50%,#f1f5f9 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#e2e8f0;border-radius:99px;}
        .nav-toggle-mobile{display:none;}
        .nav-toggle-desktop{display:flex;}
        @media(max-width:768px){
          .split{grid-template-columns:1fr!important;}
          .nav-toggle-mobile{display:block;}
          .nav-toggle-desktop{display:none!important;}
        }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#0f172a" }}>

        {/* ── NAV ── */}
        <div style={{ borderBottom:"1px solid #e2e8f0", background:"#fff", padding:"0 clamp(16px,4vw,48px)" }}>
          <div style={{ maxWidth:"1200px", margin:"0 auto" }}>

            {/* Top row: back + breadcrumb + toggle (desktop) */}
            <div style={{ display:"flex", alignItems:"center", gap:"12px", height:"56px" }}>

              <button onClick={() => navigate("/farm")}
                style={{ width:"32px", height:"32px", borderRadius:"8px", border:"1.5px solid #e2e8f0", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
              </button>

              <div style={{ width:"1px", height:"20px", background:"#e2e8f0", flexShrink:0 }}/>

              <div style={{ display:"flex", alignItems:"center", gap:"6px", minWidth:0, flex:1 }}>
                <span style={{ fontSize:"13px", color:"#94a3b8", cursor:"pointer", whiteSpace:"nowrap" }} onClick={() => navigate("/farm")}>Farm</span>
                <span style={{ color:"#cbd5e1", flexShrink:0 }}>›</span>
                <span style={{ fontSize:"13px", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                  {mode === "crop" ? "Crop Analysis" : "Seed Analysis"}
                </span>
              </div>

              {/* Radio toggle — hidden on mobile, shown inline on desktop */}
              <div className="nav-toggle-desktop" style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"3px", padding:"3px", borderRadius:"9px", background:"#f1f5f9", border:"1px solid #e2e8f0", flexShrink:0 }}>
                {(["crop","seed"] as Mode[]).map(m => (
                  <label key={m} style={{
                    display:"flex", alignItems:"center", gap:"6px",
                    padding:"5px 14px", borderRadius:"6px", cursor:"pointer",
                    background: mode===m ? "#fff" : "transparent",
                    boxShadow: mode===m ? "0 1px 3px rgba(0,0,0,0.09)" : "none",
                    transition:"all .15s",
                  }}>
                    <input type="radio" name="mode" value={m} checked={mode===m} onChange={()=>switchMode(m)} style={{ display:"none" }}/>
                    <span style={{ fontSize:"13px", fontWeight:600, color: mode===m ? "#0f172a" : "#94a3b8" }}>
                      {m === "crop" ? "🌿 Crop" : "🌱 Seed"}
                    </span>
                  </label>
                ))}
              </div>

            </div>

            {/* Mobile-only toggle row */}
            <div className="nav-toggle-mobile" style={{ paddingBottom:"12px" }}>
              <div style={{ display:"flex", gap:"8px" }}>
                {(["crop","seed"] as Mode[]).map(m => (
                  <button key={m} onClick={() => switchMode(m)} style={{
                    flex:1, padding:"9px 0", borderRadius:"10px", cursor:"pointer",
                    fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:"13.5px", fontWeight:700,
                    border: mode===m ? "none" : "1.5px solid #e2e8f0",
                    background: mode===m ? "#16a34a" : "#fff",
                    color: mode===m ? "#fff" : "#64748b",
                    transition:"all .15s",
                  }}>
                    {m === "crop" ? "🌿 Crop" : "🌱 Seed"}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* ── CONTENT ── */}
        <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"28px clamp(16px,4vw,48px) 48px" }}>

          {/* Page header */}
          <div className="fin" style={{ marginBottom:"24px" }}>
            <h1 style={{ fontSize:"clamp(1.3rem,2.5vw,1.75rem)", fontWeight:800, letterSpacing:"-.03em", marginBottom:"4px" }}>
              {mode === "crop" ? "Crop Disease Analysis" : "Seed Quality Analysis"}
            </h1>
            <p style={{ fontSize:"13px", color:"#64748b" }}>
              {mode === "crop"
                ? "Upload a clear photo of a crop leaf. Our AI detects diseases and recommends treatment."
                : "Upload a clear photo of seeds. Our AI assesses quality and suitability for planting."}
            </p>
          </div>

          <div className="split">

            {/* ── LEFT: Upload ── */}
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>

              {/* Drop zone */}
              <div
                className={`dropzone${preview?" filled":""}${dragging?" drag":""}`}
                style={{ position:"relative", overflow:"hidden" }}
                onClick={() => !preview && fileRef.current?.click()}
                onDragOver={e=>{ e.preventDefault(); setDragging(true) }}
                onDragLeave={()=>setDragging(false)}
                onDrop={e=>{ e.preventDefault(); setDragging(false); const f=e.dataTransfer.files?.[0]; if(f) handleFile(f) }}
              >
                {preview ? (
                  <>
                    <img src={preview} alt="preview"
                      style={{ width:"100%", aspectRatio:"4/3", objectFit:"cover", display:"block", borderRadius:"12px" }}/>
                    <button onClick={e=>{ e.stopPropagation(); reset() }}
                      style={{ position:"absolute", top:"10px", right:"10px", width:"28px", height:"28px", borderRadius:"50%", background:"rgba(0,0,0,0.55)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                    <div style={{ position:"absolute", bottom:"10px", left:"10px", padding:"3px 10px", borderRadius:"6px", background:"rgba(0,0,0,0.5)", backdropFilter:"blur(6px)" }}>
                      <span style={{ fontSize:"10px", color:"#fff", fontWeight:500 }}>{image?.name}</span>
                    </div>
                  </>
                ) : (
                  <div style={{ padding:"44px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:"10px" }}>
                    <div style={{ width:"48px", height:"48px", borderRadius:"12px", background:"#f1f5f9", border:"1.5px solid #e2e8f0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.4rem" }}>
                      {mode === "crop" ? "🌿" : "🌱"}
                    </div>
                    <p style={{ fontSize:"13px", fontWeight:600, color:"#334155" }}>Drop image here or click to browse</p>
                    <p style={{ fontSize:"11px", color:"#94a3b8" }}>JPG, PNG supported</p>
                  </div>
                )}
              </div>

              <input ref={fileRef} type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(f) handleFile(f) }} style={{ display:"none" }}/>

              {/* Photo tips */}
              <div style={{ padding:"14px 16px", borderRadius:"12px", background:"#fff", border:"1.5px solid #e2e8f0" }}>
                <p style={{ fontSize:"10px", fontWeight:700, color:"#94a3b8", letterSpacing:".08em", textTransform:"uppercase", marginBottom:"8px" }}>Tips for best results</p>
                {(mode === "crop"
                  ? ["Clear close-up of a single leaf","Good natural lighting, avoid flash","Affected area must be visible","Warning : Upload of irrevelant images may lead to inaccurate results"]
                  : ["Spread seeds on a flat white surface","Use good natural lighting, avoid shadows","Keep camera close and steady","Warning : Upload of irrevelant images may lead to inaccurate results"]
                ).map((tip,i) => (
                  <div key={i} style={{ display:"flex", gap:"7px", alignItems:"flex-start", marginBottom:i<3?"5px":"0" }}>
                    <span style={{ color:"#16a34a", fontSize:"11px", flexShrink:0, marginTop:"1px" }}>✓</span>
                    <p style={{ fontSize:"12px", color:"#64748b" }}>{tip}</p>
                  </div>
                ))}
              </div>

              {/* Error */}
              {error && (
                <div style={{ padding:"11px 14px", borderRadius:"10px", background:"#fef2f2", border:"1px solid #fecaca" }}>
                  <p style={{ fontSize:"12.5px", color:"#991b1b" }}>⚠ {error}</p>
                </div>
              )}

              {/* CTA */}
              <button onClick={analyze} disabled={!image || loading}
                style={{
                  width:"100%", padding:"12px", borderRadius:"10px", border:"none",
                  cursor: image && !loading ? "pointer" : "not-allowed",
                  background: image && !loading ? "#0f172a" : "#e2e8f0",
                  color: image && !loading ? "#fff" : "#94a3b8",
                  fontSize:"14px", fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                  transition:"all .18s",
                }}>
                {loading ? (
                  <>
                    <div style={{ width:"15px", height:"15px", borderRadius:"50%", border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", animation:"spin .7s linear infinite" }}/>
                    Analyzing…
                  </>
                ) : (
                  <><LeafIcon/>{mode === "crop" ? "Analyze Crop" : "Analyze Seed"}</>
                )}
              </button>
            </div>

            {/* ── RIGHT: Results ── */}
            <div>

              {/* Loader */}
              {loading && (
                <div style={{ padding:"60px 24px", borderRadius:"14px", background:"#fff", border:"1.5px solid #e2e8f0", display:"flex", flexDirection:"column", alignItems:"center", gap:"18px" }}>
                  <div style={{ position:"relative", width:"52px", height:"52px" }}>
                    <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid #e2e8f0" }}/>
                    <div style={{ position:"absolute", inset:0, borderRadius:"50%", border:"3px solid transparent", borderTopColor:"#16a34a", animation:"spin .75s linear infinite" }}/>
                    <div style={{ position:"absolute", inset:"10px", borderRadius:"50%", border:"2px solid transparent", borderTopColor:"#86efac", animation:"spin .55s linear infinite reverse" }}/>
                  </div>
                  <div style={{ textAlign:"center" }}>
                    <p style={{ fontSize:"13.5px", fontWeight:700, color:"#334155", marginBottom:"4px" }}>Analyzing {mode === "crop" ? "crop" : "seed"}…</p>
                    <p style={{ fontSize:"12px", color:"#94a3b8" }}>AI is processing your image</p>
                  </div>
                </div>
              )}

              {/* Empty placeholder */}
              {!loading && !result && (
                <div style={{ padding:"52px 24px", borderRadius:"14px", background:"#fff", border:"1.5px solid #e2e8f0", textAlign:"center" }}>
                  <p style={{ fontSize:"2.2rem", marginBottom:"12px" }}>{mode === "crop" ? "🔬" : "🔍"}</p>
                  <p style={{ fontSize:"14px", fontWeight:600, color:"#334155", marginBottom:"5px" }}>
                    Results will appear here
                  </p>
                  <p style={{ fontSize:"12px", color:"#94a3b8" }}>
                    Upload an image and click Analyze
                  </p>
                </div>
              )}

              {/* Success results */}
              {!loading && result?.success && (
                <div className="fin" style={{ display:"flex", flexDirection:"column", gap:"12px" }}>

                  {/* Primary diagnosis card */}
                  <div style={{ padding:"18px 20px", borderRadius:"14px", background:statusBg, border:`1.5px solid ${statusColor}28` }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
                      <div>
                        <p style={{ fontSize:"10px", fontWeight:700, color:"#94a3b8", letterSpacing:".08em", textTransform:"uppercase", marginBottom:"4px" }}>
                          {isCrop(result) ? "Diagnosis" : "Quality Assessment"}
                        </p>
                        <p style={{ fontSize:"1.1rem", fontWeight:800, color:statusColor, letterSpacing:"-.01em" }}>
                          {isCrop(result) ? result.disease : isSeed(result) ? result.quality : ""}
                        </p>
                      </div>
                      <span style={{ fontSize:"1.5rem" }}>
                        {isCrop(result) ? (healthy ? "✅" : "🍂") : (seedGood ? "✅" : seedAvg ? "⚠️" : "❌")}
                      </span>
                    </div>
                    {isCrop(result) && result.confidence !== undefined && (
                      <ConfidenceBar value={result.confidence}/>
                    )}
                  </div>

                  {/* Cause + reason */}
                  {isCrop(result) && (result.cause || result.reason) && (
                    <div style={{ padding:"16px", borderRadius:"12px", background:"#fff", border:"1.5px solid #e2e8f0" }}>
                      {result.cause && (
                        <div style={{ marginBottom: result.reason ? "10px" : 0 }}>
                          <p style={{ fontSize:"10px", fontWeight:700, color:"#94a3b8", letterSpacing:".08em", textTransform:"uppercase", marginBottom:"3px" }}>Cause</p>
                          <p style={{ fontSize:"13px", color:"#334155", lineHeight:1.6 }}>{result.cause}</p>
                        </div>
                      )}
                      {result.reason && (
                        <div>
                          <p style={{ fontSize:"10px", fontWeight:700, color:"#94a3b8", letterSpacing:".08em", textTransform:"uppercase", marginBottom:"3px" }}>Why it happened</p>
                          <p style={{ fontSize:"13px", color:"#64748b", lineHeight:1.6 }}>{result.reason}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Seed reason + advice */}
                  {isSeed(result) && (result.reason || result.advice) && (
                    <div style={{ padding:"16px", borderRadius:"12px", background:"#fff", border:"1.5px solid #e2e8f0" }}>
                      {result.reason && (
                        <div style={{ marginBottom: result.advice ? "10px" : 0 }}>
                          <p style={{ fontSize:"10px", fontWeight:700, color:"#94a3b8", letterSpacing:".08em", textTransform:"uppercase", marginBottom:"3px" }}>Assessment</p>
                          <p style={{ fontSize:"13px", color:"#334155", lineHeight:1.6 }}>{result.reason}</p>
                        </div>
                      )}
                      {result.advice && (
                        <div style={{ padding:"10px 12px", borderRadius:"8px", background:`${statusColor}0d`, border:`1px solid ${statusColor}22` }}>
                          <p style={{ fontSize:"13px", fontWeight:600, color:statusColor, lineHeight:1.5 }}>→ {result.advice}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Low confidence notice */}
                  {isCrop(result) && result.message && (
                    <div style={{ padding:"11px 14px", borderRadius:"10px", background:"#fffbeb", border:"1px solid #fde68a" }}>
                      <p style={{ fontSize:"12.5px", color:"#92400e" }}>⚠ {result.message}</p>
                    </div>
                  )}

                  {/* Recommendations */}
                  {result.recommendations && (
                    <div style={{ padding:"16px", borderRadius:"12px", background:"#fff", border:"1.5px solid #e2e8f0" }}>
                      <p style={{ fontSize:"10px", fontWeight:700, color:"#94a3b8", letterSpacing:".08em", textTransform:"uppercase", marginBottom:"12px" }}>Recommendations</p>
                      {typeof result.recommendations === "string" ? (
                        <p style={{ fontSize:"13px", color:"#334155", lineHeight:1.7 }}>{result.recommendations}</p>
                      ) : Array.isArray(result.recommendations) ? (
                        <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                          {(result.recommendations as string[]).map((r,i) => (
                            <div key={i} style={{ display:"flex", gap:"8px" }}>
                              <span style={{ color:"#16a34a", flexShrink:0, marginTop:"1px" }}>→</span>
                              <p style={{ fontSize:"13px", color:"#334155", lineHeight:1.6 }}>{r}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                          {Object.entries(result.recommendations as Record<string,unknown>).map(([k,v]) => (
                            <div key={k} style={{ padding:"10px 12px", borderRadius:"8px", background:"#f8fafc", border:"1px solid #e2e8f0" }}>
                              <p style={{ fontSize:"10px", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em", marginBottom:"3px" }}>{k.replace(/_/g," ")}</p>
                              <p style={{ fontSize:"12.5px", color:"#334155", lineHeight:1.6 }}>{String(v)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <button onClick={reset}
                    style={{ width:"100%", padding:"10px", borderRadius:"10px", border:"1.5px solid #e2e8f0", background:"#fff", color:"#334155", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                    ↑ Analyze another image
                  </button>
                </div>
              )}

              {/* API failure */}
              {!loading && result && !result.success && (
                <div style={{ padding:"20px", borderRadius:"14px", background:"#fef2f2", border:"1.5px solid #fecaca" }}>
                  <p style={{ fontSize:"14px", fontWeight:700, color:"#991b1b", marginBottom:"6px" }}>Analysis Failed</p>
                  <p style={{ fontSize:"13px", color:"#7f1d1d" }}>
                    {(result as any).error || "An unexpected error occurred. Please try again."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}