import { useState } from "react"
import { useNavigate } from "react-router-dom"

interface SoilData {
  ph: string; nitrogen: string; phosphorus: string; potassium: string
  organicMatter: string; moisture: string; texture: string; cropType: string
}
interface SoilReport {
  overallScore: number; grade: string
  phStatus: { label: string; tone: string; advice: string }
  npk: { n: { status: string; tone: string; advice: string }; p: { status: string; tone: string; advice: string }; k: { status: string; tone: string; advice: string } }
  amendments: { name: string; qty: string; timing: string; cost: string; priority: "high" | "medium" | "low" }[]
  suitableCrops: string[]; warnings: string[]; tips: string[]
}

const CROPS    = ["Wheat","Rice","Maize","Tomato","Onion","Cotton","Soybean","Sugarcane","Potato","Mustard"]
const TEXTURES = ["Sandy","Sandy Loam","Loam","Clay Loam","Clay","Black Cotton","Red Laterite"]

const TONE: Record<string,{bg:string;text:string;border:string}> = {
  good:   { bg:"#f0fdf4", text:"#166534", border:"#4ade80" },
  warn:   { bg:"#fffbeb", text:"#92400e", border:"#fbbf24" },
  danger: { bg:"#fef2f2", text:"#991b1b", border:"#f87171" },
  neutral:{ bg:"#f8fafc", text:"#334155", border:"#94a3b8" },
}

function analyze(d: SoilData): SoilReport {
  const ph=parseFloat(d.ph)||7, n=parseFloat(d.nitrogen)||0, p=parseFloat(d.phosphorus)||0
  const k=parseFloat(d.potassium)||0, om=parseFloat(d.organicMatter)||0, moist=parseFloat(d.moisture)||0

  const phStatus = ph<5.5 ? { label:"Very Acidic", tone:"danger", advice:"Apply agricultural lime (2–3 t/ha). Avoid acidifying fertilizers." }
    : ph<6.0 ? { label:"Acidic", tone:"warn", advice:"Apply lime at 1–1.5 t/ha. Consider dolomite for magnesium." }
    : ph<=7.5 ? { label:"Optimal", tone:"good", advice:"pH is ideal for most crops. Maintain with balanced fertilization." }
    : ph<=8.5 ? { label:"Alkaline", tone:"warn", advice:"Apply gypsum or sulphur 200–500 kg/ha to reduce pH gradually." }
    : { label:"Very Alkaline", tone:"danger", advice:"Apply elemental sulphur 500+ kg/ha. Consult a soil expert urgently." }

  const nS = n<200 ? { status:"Deficient", tone:"danger", advice:"Apply Urea (46%N) at 100–120 kg/ha in split doses." }
    : n<400 ? { status:"Moderate", tone:"warn", advice:"Top-up with 50–60 kg/ha Urea. Monitor at peak growth." }
    : { status:"Adequate", tone:"good", advice:"Nitrogen is sufficient. Avoid excess — causes lodging." }
  const pS = p<15 ? { status:"Deficient", tone:"danger", advice:"Apply SSP at 150–200 kg/ha before sowing." }
    : p<30 ? { status:"Moderate", tone:"warn", advice:"Apply DAP at 50–75 kg/ha as basal dose." }
    : { status:"Adequate", tone:"good", advice:"Skip additional phosphorus this season." }
  const kS = k<120 ? { status:"Deficient", tone:"danger", advice:"Apply MOP at 60–80 kg/ha. Critical for root crops." }
    : k<280 ? { status:"Moderate", tone:"warn", advice:"Apply MOP at 30–40 kg/ha as basal or split." }
    : { status:"Adequate", tone:"good", advice:"No additional potassium needed." }

  const amendments: SoilReport["amendments"] = []
  if (ph<6.0) amendments.push({ name:"Agricultural Lime", qty:`${ph<5.5?"2–3":"1–1.5"} t/ha`, timing:"2–4 weeks before sowing", cost:"₹1,200–2,400/t", priority:"high" })
  if (ph>8.0) amendments.push({ name:"Gypsum / Sulphur", qty:"300–500 kg/ha", timing:"1 month before sowing", cost:"₹800–1,200/bag", priority:"high" })
  if (n<250) amendments.push({ name:"Urea (46% N)", qty:"100–120 kg/ha", timing:"50% basal + 50% top-dress", cost:"₹266/bag (50kg)", priority:n<200?"high":"medium" })
  if (p<20)  amendments.push({ name:"Single Super Phosphate", qty:"150–200 kg/ha", timing:"Basal at sowing", cost:"₹450/bag (50kg)", priority:"high" })
  if (k<150) amendments.push({ name:"Muriate of Potash (MOP)", qty:"60–80 kg/ha", timing:"Basal + 1 top-dress", cost:"₹900/bag (50kg)", priority:k<120?"high":"medium" })
  if (om<0.5) amendments.push({ name:"FYM / Compost", qty:"10–15 t/ha", timing:"4–6 weeks before sowing", cost:"₹800–1,500/t", priority:"medium" })

  let score=55
  if (ph>=6&&ph<=7.5) score+=18; else if (ph>=5.5&&ph<=8) score+=8
  if (n>=300) score+=10; else if (n>=200) score+=5
  if (p>=25) score+=8; else if (p>=15) score+=4
  if (k>=200) score+=8; else if (k>=120) score+=4
  if (om>=1) score+=6; else if (om>=0.5) score+=3
  score=Math.min(100,score)

  const suitable: string[] = []
  if (ph>=6&&ph<=7.5) suitable.push("Wheat","Maize","Soybean")
  if (ph>=5.5&&ph<=6.5) suitable.push("Rice")
  if (ph>=6.5&&ph<=8) suitable.push("Cotton","Sugarcane","Mustard")
  if (ph>=5.8&&ph<=7) suitable.push("Tomato","Potato","Onion")

  const warnings: string[] = []
  if (ph<5.5||ph>8.5) warnings.push("Extreme pH — most nutrients are locked out. Correct before planting.")
  if (n<150) warnings.push("Critically low nitrogen — severe yield impact expected.")
  if (moist>80) warnings.push("Waterlogging risk. Improve field drainage before sowing.")
  if (moist<15) warnings.push("Soil too dry. Irrigate before sowing for good germination.")
  if (om<0.3) warnings.push("Very low organic matter. Add compost urgently to improve soil structure.")

  const tips = [
    "Test soil every 2–3 years for accurate nutrient management.",
    "Apply fertilizers in split doses to reduce leaching loss.",
    "Incorporate crop residue to gradually improve organic matter.",
    om<0.5 ? "Green manuring (dhaincha/sunhemp) is the fastest way to raise organic matter." : "Maintain organic matter levels — it buffers pH and retains moisture.",
  ]

  const grade=score>=85?"A":score>=70?"B":score>=55?"C":"D"
  return { overallScore:score, grade, phStatus, npk:{n:nS,p:pS,k:kS}, amendments, suitableCrops:[...new Set(suitable)], warnings, tips }
}

// ── UI Atoms ──────────────────────────────────────────────────────────────────
const Field = ({ label, value, onChange, placeholder, unit, hint }: { label:string; value:string; onChange:(v:string)=>void; placeholder:string; unit?:string; hint?:string }) => (
  <div>
    <label style={{ display:"block", fontSize:"11px", fontWeight:600, color:"#334155", letterSpacing:".06em", textTransform:"uppercase", marginBottom:"5px" }}>{label}</label>
    <div style={{ position:"relative" }}>
      <input type="number" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{ width:"100%", padding:"9px 12px", paddingRight:unit?"38px":"12px", borderRadius:"8px", border:"1.5px solid #94a3b8", background:"#fff", color:"#0f172a", fontSize:"14px", fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none", transition:"border .15s" }}
        onFocus={e=>{e.target.style.borderColor="#475569"; e.target.style.boxShadow="0 0 0 3px rgba(71,85,105,.12)"}}
        onBlur={e=>{e.target.style.borderColor="#94a3b8"; e.target.style.boxShadow="none"}}/>
      {unit && <span style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", fontSize:"11px", color:"#475569", fontWeight:600 }}>{unit}</span>}
    </div>
    {hint && <p style={{ fontSize:"10px", color:"#64748b", marginTop:"3px" }}>{hint}</p>}
  </div>
)

const Select = ({ label, value, onChange, options }: { label:string; value:string; onChange:(v:string)=>void; options:string[] }) => (
  <div>
    <label style={{ display:"block", fontSize:"11px", fontWeight:600, color:"#334155", letterSpacing:".06em", textTransform:"uppercase", marginBottom:"5px" }}>{label}</label>
    <div style={{ position:"relative" }}>
      <select value={value} onChange={e=>onChange(e.target.value)}
        style={{ width:"100%", padding:"9px 32px 9px 12px", borderRadius:"8px", border:"1.5px solid #94a3b8", background:"#fff", color:"#0f172a", fontSize:"13px", fontFamily:"'Plus Jakarta Sans',sans-serif", outline:"none", appearance:"none", cursor:"pointer" }}>
        {options.map(o=><option key={o}>{o}</option>)}
      </select>
      <svg style={{ position:"absolute", right:"10px", top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
    </div>
  </div>
)

const NutrientBar = ({ label, value, max, tone }: { label:string; value:number; max:number; tone:string }) => {
  const pct = Math.min(100, (value/max)*100)
  const colors = { good:"#16a34a", warn:"#d97706", danger:"#dc2626" }
  const c = colors[tone as keyof typeof colors] || "#94a3b8"
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
      <span style={{ fontSize:"11px", fontWeight:600, color:"#64748b", width:"80px", flexShrink:0 }}>{label}</span>
      <div style={{ flex:1, height:"6px", borderRadius:"99px", background:"#cbd5e1" }}>
        <div style={{ height:"100%", borderRadius:"99px", background:c, width:`${pct}%`, transition:"width .6s ease" }}/>
      </div>
      <span style={{ fontSize:"12px", fontWeight:700, color:c, width:"36px", textAlign:"right", flexShrink:0 }}>{value}</span>
    </div>
  )
}

const Badge = ({ tone, label }: { tone:string; label:string }) => {
  const t = TONE[tone] || TONE.neutral
  return <span style={{ display:"inline-flex", alignItems:"center", padding:"2px 10px", borderRadius:"99px", fontSize:"11px", fontWeight:600, background:t.bg, color:t.text, border:`1px solid ${t.border}` }}>{label}</span>
}

const PriorityDot = ({ p }: { p:string }) => {
  const c = p==="high"?"#ef4444":p==="medium"?"#f59e0b":"#22c55e"
  return <span style={{ display:"inline-block", width:"7px", height:"7px", borderRadius:"50%", background:c, flexShrink:0 }}/>
}

export default function SoilAnalyzer() {
  const navigate = useNavigate()
  const [data, setData] = useState<SoilData>({ ph:"", nitrogen:"", phosphorus:"", potassium:"", organicMatter:"", moisture:"", texture:"Loam", cropType:"Wheat" })
  const [report, setReport] = useState<SoilReport | null>(null)
  const up = (k:keyof SoilData) => (v:string) => setData(p=>({...p,[k]:v}))
  const canRun = !!(data.ph && data.nitrogen && data.phosphorus && data.potassium)

  const GRADE_COLOR: Record<string,string> = {A:"#166534",B:"#1e40af",C:"#92400e",D:"#991b1b"}
  const GRADE_BG:    Record<string,string> = {A:"#f0fdf4",B:"#eff6ff",C:"#fffbeb",D:"#fef2f2"}
  const gradeColor = report ? (GRADE_COLOR[report.grade] || "#111") : "#111"
  const gradeBg    = report ? (GRADE_BG[report.grade]    || "#f8fafc") : "#f8fafc"

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        .fin{animation:fadeIn .35s ease both;}
        .fin1{animation:fadeIn .35s ease both;animation-delay:.05s;}
        .fin2{animation:fadeIn .35s ease both;animation-delay:.1s;}
        .fin3{animation:fadeIn .35s ease both;animation-delay:.15s;}
        ::-webkit-scrollbar{width:4px;}
        ::-webkit-scrollbar-thumb{background:#94a3b8;border-radius:99px;}
        .sec-title{font-size:10px;font-weight:700;color:#475569;letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px;}
        .form-grid{display:grid;grid-template-columns:clamp(280px,38%,420px) 1fr;gap:28px;align-items:start;}
        .results-grid{display:grid;grid-template-columns:260px 1fr;gap:24px;align-items:start;}
        .npk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}
        .core-grid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:14px;}
        .soil-row{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .tips-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        @media(max-width:860px){
          .form-grid,.results-grid{grid-template-columns:1fr!important;}
          .npk-grid,.core-grid,.tips-grid{grid-template-columns:1fr 1fr!important;}
          .soil-row{grid-template-columns:1fr 1fr!important;}
          .hide-mob{display:none!important;}
          .amend-table th:nth-child(3),.amend-table td:nth-child(3),
          .amend-table th:nth-child(4),.amend-table td:nth-child(4){display:none!important;}
          .results-left-row{display:grid!important;grid-template-columns:1fr 1fr;gap:12px;}
        }
        @media(max-width:480px){
          .npk-grid,.core-grid,.soil-row,.tips-grid{grid-template-columns:1fr!important;}
          .results-left-row{grid-template-columns:1fr!important;}
        }
      `}</style>

      <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"'Plus Jakarta Sans',sans-serif", color:"#0f172a" }}>

        {/* Top nav */}
        <div style={{ borderBottom:"1px solid #94a3b8", background:"#fff", padding:"0 clamp(16px,4vw,48px)" }}>
          <div style={{ maxWidth:"1400px", margin:"0 auto", display:"flex", alignItems:"center", gap:"12px", height:"56px" }}>
            <button onClick={()=>report?setReport(null):navigate("/lab")}
              style={{ width:"32px", height:"32px", borderRadius:"8px", border:"1.5px solid #94a3b8", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", flexShrink:0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div style={{ width:"1px", height:"20px", background:"#94a3b8" }}/>
            <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
              <span style={{ fontSize:"13px", color:"#475569", cursor:"pointer" }} onClick={()=>navigate("/lab")}>Lab</span>
              <span style={{ color:"#64748b" }}>›</span>
              <span style={{ fontSize:"13px", fontWeight:600, color:"#0f172a" }}>Soil Health Analyzer</span>
            </div>
            {report && (
              <div style={{ marginLeft:"auto", display:"flex", alignItems:"center", gap:"6px", padding:"4px 14px", borderRadius:"8px", background:gradeBg, border:`1px solid ${gradeColor}33` }}>
                <span style={{ fontSize:"18px", fontWeight:800, color:gradeColor }}>{report.grade}</span>
                <span style={{ fontSize:"12px", fontWeight:600, color:gradeColor }}>{report.overallScore}/100</span>
              </div>
            )}
          </div>
        </div>

        <div style={{ maxWidth:"1400px", margin:"0 auto", padding:"28px clamp(16px,4vw,48px)" }}>

          {/* ── FORM ── */}
          {!report && (
            <div className="form-grid fin">

              {/* LEFT — intro + reference */}
              <div>
                <h1 style={{ fontSize:"clamp(1.4rem,2.5vw,1.9rem)", fontWeight:800, letterSpacing:"-.03em", lineHeight:1.15, marginBottom:"8px" }}>Soil Health<br/>Analyzer</h1>
                <p style={{ fontSize:"13px", color:"#64748b", lineHeight:1.7, marginBottom:"24px" }}>Enter your soil test values to get a comprehensive health report, deficiency diagnosis and amendment plan.</p>

                {/* Reference card */}
                <div style={{ padding:"18px", borderRadius:"12px", background:"#fff", border:"1.5px solid #94a3b8" }}>
                  <p className="sec-title">Ideal Reference Ranges</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                    {[["pH","6.0 – 7.5"],["Nitrogen (N)","280 – 560 kg/ha"],["Phosphorus (P)","22 – 56 kg/ha"],["Potassium (K)","140 – 280 kg/ha"],["Organic Matter","≥ 0.75%"],["Moisture","30 – 70%"]].map(([l,v])=>(
                      <div key={l} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", paddingBottom:"6px", borderBottom:"1px solid #cbd5e1" }}>
                        <span style={{ fontSize:"12px", color:"#334155" }}>{l}</span>
                        <span style={{ fontSize:"12px", fontWeight:600, color:"#0f172a" }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p style={{ fontSize:"11px", color:"#64748b", marginTop:"14px", lineHeight:1.6 }}>Get your soil tested at the nearest Krishi Vigyan Kendra (KVK) or use a portable soil test kit for values.</p>
              </div>

              {/* RIGHT — form */}
              <div className="fin1">
                <div style={{ background:"#fff", border:"1.5px solid #94a3b8", borderRadius:"14px", overflow:"hidden" }}>

                  {/* Core */}
                  <div style={{ padding:"22px 24px", borderBottom:"1px solid #cbd5e1" }}>
                    <p className="sec-title">Core Parameters <span style={{ color:"#ef4444" }}>*</span></p>
                    <div className="core-grid">
                      <Field label="Soil pH" value={data.ph} onChange={up("ph")} placeholder="6.5" unit="pH"/>
                      <Field label="Organic Matter" value={data.organicMatter} onChange={up("organicMatter")} placeholder="0.8" unit="%"/>
                      <Field label="Moisture" value={data.moisture} onChange={up("moisture")} placeholder="45" unit="%"/>
                    </div>
                  </div>

                  {/* NPK */}
                  <div style={{ padding:"22px 24px", borderBottom:"1px solid #cbd5e1" }}>
                    <p className="sec-title">NPK Nutrients (kg/ha) <span style={{ color:"#ef4444" }}>*</span></p>
                    <div className="npk-grid">
                      <Field label="Nitrogen (N)" value={data.nitrogen} onChange={up("nitrogen")} placeholder="280"/>
                      <Field label="Phosphorus (P)" value={data.phosphorus} onChange={up("phosphorus")} placeholder="22"/>
                      <Field label="Potassium (K)" value={data.potassium} onChange={up("potassium")} placeholder="190"/>
                    </div>
                  </div>

                  {/* Soil & Crop */}
                  <div style={{ padding:"22px 24px", borderBottom:"1px solid #cbd5e1" }}>
                    <p className="sec-title">Soil & Crop</p>
                    <div className="soil-row">
                      <Select label="Soil Texture" value={data.texture} onChange={up("texture")} options={TEXTURES}/>
                      <Select label="Planned Crop" value={data.cropType} onChange={up("cropType")} options={CROPS}/>
                    </div>
                  </div>

                  {/* CTA */}
                  <div style={{ padding:"18px 24px", background:"#f8fafc" }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"10px" }}>
                      <p style={{ fontSize:"12px", color:"#475569" }}>{!canRun?"Fill pH, N, P, K to continue":"Ready to analyze"}</p>
                      <button onClick={()=>canRun&&setReport(analyze(data))} disabled={!canRun}
                        style={{ padding:"10px 24px", borderRadius:"8px", border:"none", cursor:canRun?"pointer":"not-allowed", background:canRun?"#0f172a":"#cbd5e1", color:canRun?"#fff":"#64748b", fontSize:"13px", fontWeight:700, fontFamily:"'Plus Jakarta Sans',sans-serif", transition:"all .18s" }}>
                        Analyze Soil →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── RESULTS ── */}
          {report && (
            <div className="results-grid">

              {/* LEFT — score + grade */}
              <div className="fin" style={{ display:"flex", flexDirection:"column", gap:"14px" }}>

                {/* Grade */}
                <div style={{ padding:"24px", borderRadius:"12px", background:gradeBg, border:`1.5px solid ${gradeColor}22`, textAlign:"center" }}>
                  <div style={{ fontSize:"4rem", fontWeight:900, color:gradeColor, lineHeight:1 }}>{report.grade}</div>
                  <div style={{ fontSize:"1.2rem", fontWeight:700, color:gradeColor, marginTop:"2px" }}>{report.overallScore}<span style={{ fontSize:"0.9rem", fontWeight:500 }}>/100</span></div>
                  <p style={{ fontSize:"12px", color:"#64748b", marginTop:"8px" }}>
                    {report.overallScore>=85?"Excellent soil":report.overallScore>=70?"Good condition":report.overallScore>=55?"Moderate quality":"Needs correction"}

                  </p>
                </div>

                {/* pH status */}
                <div style={{ padding:"14px 16px", borderRadius:"12px", background:"#fff", border:"1.5px solid #94a3b8" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                    <span style={{ fontSize:"12px", fontWeight:600, color:"#334155" }}>Soil pH — {data.ph}</span>
                    <Badge tone={report.phStatus.tone} label={report.phStatus.label}/>
                  </div>
                  <p style={{ fontSize:"11.5px", color:"#334155", lineHeight:1.6 }}>{report.phStatus.advice}</p>
                </div>

                {/* Suitable crops */}
                <div style={{ padding:"14px 16px", borderRadius:"12px", background:"#fff", border:"1.5px solid #94a3b8" }}>
                  <p style={{ fontSize:"11px", fontWeight:700, color:"#475569", letterSpacing:".08em", textTransform:"uppercase", marginBottom:"10px" }}>Suitable Crops</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"5px" }}>
                    {(report.suitableCrops.length>0?report.suitableCrops:["Correct pH first"]).map((c,i)=>(
                      <span key={i} style={{ padding:"3px 10px", borderRadius:"6px", fontSize:"11.5px", fontWeight:500, background:"#f1f5f9", color:"#334155", border:"1px solid #94a3b8" }}>{c}</span>
                    ))}
                  </div>
                </div>

                <button onClick={()=>setReport(null)} style={{ width:"100%", padding:"10px", borderRadius:"8px", border:"1.5px solid #94a3b8", background:"#fff", color:"#334155", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"'Plus Jakarta Sans',sans-serif" }}>
                  ← New Analysis
                </button>
              </div>

              {/* RIGHT — detail */}
              <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>

                {/* NPK */}
                <div className="fin1" style={{ padding:"22px 24px", borderRadius:"12px", background:"#fff", border:"1.5px solid #94a3b8" }}>
                  <p className="sec-title">NPK Status</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                        <span style={{ fontSize:"12px", fontWeight:600, color:"#334155" }}>Nitrogen (N) — {data.nitrogen} kg/ha</span>
                        <Badge tone={report.npk.n.tone} label={report.npk.n.status}/>
                      </div>
                      <NutrientBar label="" value={parseFloat(data.nitrogen)||0} max={560} tone={report.npk.n.tone}/>
                      <p style={{ fontSize:"11.5px", color:"#334155", marginTop:"6px", lineHeight:1.6 }}>{report.npk.n.advice}</p>
                    </div>
                    <div style={{ height:"1px", background:"#cbd5e1" }}/>
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                        <span style={{ fontSize:"12px", fontWeight:600, color:"#334155" }}>Phosphorus (P) — {data.phosphorus} kg/ha</span>
                        <Badge tone={report.npk.p.tone} label={report.npk.p.status}/>
                      </div>
                      <NutrientBar label="" value={parseFloat(data.phosphorus)||0} max={56} tone={report.npk.p.tone}/>
                      <p style={{ fontSize:"11.5px", color:"#334155", marginTop:"6px", lineHeight:1.6 }}>{report.npk.p.advice}</p>
                    </div>
                    <div style={{ height:"1px", background:"#cbd5e1" }}/>
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                        <span style={{ fontSize:"12px", fontWeight:600, color:"#334155" }}>Potassium (K) — {data.potassium} kg/ha</span>
                        <Badge tone={report.npk.k.tone} label={report.npk.k.status}/>
                      </div>
                      <NutrientBar label="" value={parseFloat(data.potassium)||0} max={280} tone={report.npk.k.tone}/>
                      <p style={{ fontSize:"11.5px", color:"#334155", marginTop:"6px", lineHeight:1.6 }}>{report.npk.k.advice}</p>
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {report.warnings.length>0 && (
                  <div className="fin2" style={{ padding:"16px 20px", borderRadius:"12px", background:"#fef2f2", border:"1.5px solid #f87171" }}>
                    <p style={{ fontSize:"11px", fontWeight:700, color:"#991b1b", letterSpacing:".08em", textTransform:"uppercase", marginBottom:"10px" }}>⚠ Warnings</p>
                    {report.warnings.map((w,i)=><p key={i} style={{ fontSize:"12.5px", color:"#7f1d1d", lineHeight:1.6, marginBottom:i<report.warnings.length-1?"6px":"0" }}>— {w}</p>)}
                  </div>
                )}

                {/* Amendments table */}
                {report.amendments.length>0 && (
                  <div className="fin2" style={{ borderRadius:"12px", background:"#fff", border:"1.5px solid #94a3b8", overflow:"hidden" }}>
                    <div style={{ padding:"16px 20px", borderBottom:"1px solid #cbd5e1" }}>
                      <p className="sec-title" style={{ marginBottom:0 }}>Recommended Amendments</p>
                    </div>
                    <table style={{ width:"100%", borderCollapse:"collapse" }}>
                      <thead>
                        <tr style={{ background:"#f8fafc" }}>
                          {["Input","Quantity","Timing","Est. Cost","Priority"].map(h=>(
                            <th key={h} style={{ padding:"10px 16px", textAlign:"left", fontSize:"10px", fontWeight:700, color:"#475569", letterSpacing:".08em", textTransform:"uppercase", borderBottom:"1px solid #cbd5e1" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {report.amendments.map((a,i)=>(
                          <tr key={i} style={{ borderBottom:i<report.amendments.length-1?"1px solid #e2e8f0":"none" }}>
                            <td style={{ padding:"12px 16px", fontSize:"13px", fontWeight:600, color:"#0f172a" }}>{a.name}</td>
                            <td style={{ padding:"12px 16px", fontSize:"12px", color:"#334155" }}>{a.qty}</td>
                            <td style={{ padding:"12px 16px", fontSize:"12px", color:"#334155" }}>{a.timing}</td>
                            <td style={{ padding:"12px 16px", fontSize:"12px", color:"#334155" }}>{a.cost}</td>
                            <td style={{ padding:"12px 16px" }}><div style={{ display:"flex", alignItems:"center", gap:"6px" }}><PriorityDot p={a.priority}/><span style={{ fontSize:"11px", color:"#334155", textTransform:"capitalize" }}>{a.priority}</span></div></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Tips */}
                <div className="fin3" style={{ padding:"20px 24px", borderRadius:"12px", background:"#fffbeb", border:"1.5px solid #fbbf24" }}>
                  <p style={{ fontSize:"11px", fontWeight:700, color:"#92400e", letterSpacing:".08em", textTransform:"uppercase", marginBottom:"12px" }}>Expert Tips</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                    {report.tips.map((t,i)=>(
                      <div key={i} style={{ display:"flex", gap:"8px", alignItems:"flex-start" }}>
                        <span style={{ fontSize:"13px", flexShrink:0 }}>→</span>
                        <p style={{ fontSize:"12px", color:"#78350f", lineHeight:1.6 }}>{t}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}