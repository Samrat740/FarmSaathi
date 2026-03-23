import { useState } from "react"
import { useNavigate } from "react-router-dom"

const CROPS = [
  { id:"wheat",     label:"Wheat",     emoji:"🌾", n:120, p:60,  k:40,  seasons:"Rabi",          days:"120–150 days" },
  { id:"rice",      label:"Rice",      emoji:"🍚", n:100, p:50,  k:50,  seasons:"Kharif",        days:"100–140 days" },
  { id:"maize",     label:"Maize",     emoji:"🌽", n:150, p:75,  k:60,  seasons:"Kharif / Rabi", days:"90–110 days" },
  { id:"tomato",    label:"Tomato",    emoji:"🍅", n:200, p:100, k:150, seasons:"Rabi / Kharif", days:"90–120 days" },
  { id:"onion",     label:"Onion",     emoji:"🧅", n:100, p:50,  k:50,  seasons:"Rabi",          days:"120–150 days" },
  { id:"cotton",    label:"Cotton",    emoji:"🌿", n:180, p:80,  k:80,  seasons:"Kharif",        days:"150–180 days" },
  { id:"soybean",   label:"Soybean",   emoji:"🫘", n:30,  p:60,  k:40,  seasons:"Kharif",        days:"90–110 days" },
  { id:"potato",    label:"Potato",    emoji:"🥔", n:180, p:100, k:180, seasons:"Rabi",          days:"90–120 days" },
  { id:"sugarcane", label:"Sugarcane", emoji:"🍬", n:250, p:80,  k:120, seasons:"Annual",        days:"12–18 months" },
  { id:"mustard",   label:"Mustard",   emoji:"🟡", n:120, p:60,  k:40,  seasons:"Rabi",          days:"110–140 days" },
]

const SOIL_MULT: Record<string,{n:number;p:number;k:number}> = {
  "Sandy":       {n:1.3, p:1.2, k:1.2},
  "Sandy Loam":  {n:1.15,p:1.1, k:1.1},
  "Loam":        {n:1.0, p:1.0, k:1.0},
  "Clay Loam":   {n:0.95,p:1.0, k:0.95},
  "Clay":        {n:0.9, p:1.05,k:0.9},
  "Black Cotton":{n:0.95,p:0.9, k:1.1},
}

const FERTS = {
  urea: { name:"Urea (46-0-0)",  price:5.32  },
  dap:  { name:"DAP (18-46-0)",  price:13.40 },
  mop:  { name:"MOP (0-0-60)",   price:17.00 },
}

interface Item { name:string; qty:number; totalCost:number; note:string }
interface Stage { title:string; timing:string; items:Item[] }
interface Result { cropLabel:string; acres:number; reqN:number; reqP:number; reqK:number; stages:Stage[]; totalCost:number; costPerAcre:number; tips:string[] }

const r1 = (n:number) => Math.round(n*10)/10

function calc(cropId:string, acres:number, soil:string, sN:string, sP:string, sK:string): Result {
  const crop = CROPS.find(c=>c.id===cropId)||CROPS[0]
  const sm   = SOIL_MULT[soil]||SOIL_MULT["Loam"]
  const eN=parseFloat(sN)||0, eP=parseFloat(sP)||0, eK=parseFloat(sK)||0

  const reqN=r1(Math.max(0,(crop.n-eN*0.1)*sm.n))
  const reqP=r1(Math.max(0,(crop.p-eP*0.2)*sm.p))
  const reqK=r1(Math.max(0,(crop.k-eK*0.15)*sm.k))

  const dapQty = r1(reqP/(46/100))
  const dapN   = r1(dapQty*(18/100))
  const ureaB  = r1(Math.max(0,(reqN*0.5-dapN))/(46/100))
  const mopB   = r1((reqK*0.5)/(60/100))
  const ureaT1 = r1((reqN*0.25)/(46/100))
  const mopT1  = r1((reqK*0.25)/(60/100))
  const ureaT2 = r1((reqN*0.25)/(46/100))
  const mopT2  = r1((reqK*0.25)/(60/100))

  const mk = (key:"urea"|"dap"|"mop", qty:number, note:string):Item => ({
    name:FERTS[key].name, qty, totalCost:r1(qty*FERTS[key].price*acres), note
  })

  const stages:Stage[] = [
    { title:"Basal Application", timing:"At sowing / during land preparation", items:[
      ...(dapQty>0.5  ? [mk("dap",  dapQty, "Full phosphorus requirement + partial nitrogen")] : []),
      ...(ureaB>0.5   ? [mk("urea", ureaB,  "Remaining 50% of nitrogen (basal dose)")] : []),
      ...(mopB>0.5    ? [mk("mop",  mopB,   "First 50% of potassium requirement")] : []),
    ]},
    { title:"1st Top Dressing", timing: cropId==="rice"||cropId==="wheat" ? "25–30 days after sowing" : "3–4 weeks after planting",
      items:[
        ...(ureaT1>0.5 ? [mk("urea", ureaT1, "Active tillering / vegetative growth")] : []),
        ...(mopT1>0.5  ? [mk("mop",  mopT1,  "Root strengthening")] : []),
      ]},
    { title:"2nd Top Dressing", timing: cropId==="rice"||cropId==="wheat" ? "45–50 days — panicle initiation" : "At flowering / fruiting stage",
      items:[
        ...(ureaT2>0.5 ? [mk("urea", ureaT2, "Grain filling / fruit development")] : []),
        ...(mopT2>0.5  ? [mk("mop",  mopT2,  "Improve quality, shelf life and marketability")] : []),
      ]},
  ].filter(s=>s.items.length>0)

  const totalCost = r1(stages.reduce((s,st)=>s+st.items.reduce((ss,i)=>ss+i.totalCost,0),0))
  const tips = [
    "Apply fertilizers when soil has adequate moisture — dry application reduces efficiency by 30–40%.",
    "Split nitrogen into 3 doses to reduce leaching and improve uptake by 15–20%.",
    soil==="Sandy"||soil==="Sandy Loam" ? "Sandy soil: consider 4 nitrogen doses — leaching risk is high." : "Mix FYM before basal application for better fertilizer efficiency.",
    eN>400 ? "Soil N is already high — reduce Urea by 20–30% to prevent lodging." : "Calibrate doses every season based on a fresh soil test for best results.",
  ]

  return { cropLabel:`${crop.emoji} ${crop.label}`, acres, reqN, reqP, reqK, stages, totalCost, costPerAcre:r1(totalCost/acres), tips }
}

export default function FertilizerCalculator() {
  const navigate = useNavigate()
  const [cropId,setCropId]     = useState("wheat")
  const [acres,setAcres]       = useState("2")
  const [soilType,setSoilType] = useState("Loam")
  const [sN,setSN]             = useState("")
  const [sP,setSP]             = useState("")
  const [sK,setSK]             = useState("")
  const [result,setResult]     = useState<Result|null>(null)

  const crop = CROPS.find(c=>c.id===cropId)!

  const inp = (val:string, set:(v:string)=>void, label:string, unit?:string) => (
    <div>
      <label style={{display:"block",fontSize:"11px",fontWeight:600,color:"#334155",letterSpacing:".06em",textTransform:"uppercase",marginBottom:"5px"}}>{label}</label>
      <div style={{position:"relative"}}>
        <input type="number" value={val} onChange={e=>set(e.target.value)} placeholder="—"
          style={{width:"100%",padding:"9px 12px",paddingRight:unit?"36px":"12px",borderRadius:"8px",border:"1.5px solid #94a3b8",background:"#fff",color:"#0f172a",fontSize:"14px",fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",transition:"border .15s"}}
          onFocus={e=>{e.target.style.borderColor="#475569";e.target.style.boxShadow="0 0 0 3px rgba(71,85,105,.12)"}}
          onBlur={e=>{e.target.style.borderColor="#94a3b8";e.target.style.boxShadow="none"}}/>
        {unit&&<span style={{position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",fontSize:"10px",color:"#475569",fontWeight:600}}>{unit}</span>}
      </div>
    </div>
  )

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes fadeIn{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        .fi{animation:fadeIn .35s ease both;} .fi1{animation:fadeIn .35s ease both;animation-delay:.07s;} .fi2{animation:fadeIn .35s ease both;animation-delay:.14s;}
        .sec{font-size:10px;font-weight:700;color:#475569;letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px;}
        select{appearance:none;-webkit-appearance:none;}
        ::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:#94a3b8;border-radius:99px;}
        tr:hover td{background:#fafafa;}
        .f-main-grid{display:grid;grid-template-columns:clamp(260px,36%,400px) 1fr;gap:28px;align-items:start;}
        .f-res-grid{display:grid;grid-template-columns:240px 1fr;gap:24px;align-items:start;}
        .f-crop-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;}
        .f-field-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
        .f-npk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;}
        .f-tips-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;}
        .f-nav-stats{display:flex;gap:16px;}
        @media(max-width:860px){
          .f-main-grid,.f-res-grid{grid-template-columns:1fr!important;}
          .f-nav-stats{display:none!important;}
        }
        @media(max-width:600px){
          .f-crop-grid{grid-template-columns:repeat(4,1fr)!important;}
          .f-field-grid{grid-template-columns:1fr!important;}
          .f-tips-grid{grid-template-columns:1fr!important;}
          .f-table-note{display:none!important;}
        }
        @media(max-width:420px){
          .f-crop-grid{grid-template-columns:repeat(3,1fr)!important;}
          .f-npk-grid{grid-template-columns:1fr 1fr!important;}
        }
      `}</style>

      <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'Plus Jakarta Sans',sans-serif",color:"#0f172a"}}>

        {/* Nav */}
        <div style={{borderBottom:"1px solid #94a3b8",background:"#fff",padding:"0 clamp(16px,4vw,48px)"}}>
          <div style={{maxWidth:"1400px",margin:"0 auto",display:"flex",alignItems:"center",gap:"12px",height:"56px"}}>
            <button onClick={()=>result?setResult(null):navigate("/lab")}
              style={{width:"32px",height:"32px",borderRadius:"8px",border:"1.5px solid #94a3b8",background:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#334155" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div style={{width:"1px",height:"20px",background:"#94a3b8"}}/>
            <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
              <span style={{fontSize:"13px",color:"#475569",cursor:"pointer"}} onClick={()=>navigate("/lab")}>Lab</span>
              <span style={{color:"#64748b"}}>›</span>
              <span style={{fontSize:"13px",fontWeight:600}}>Fertilizer Calculator</span>
            </div>
            {result && (
              <div style={{marginLeft:"auto",display:"flex",gap:"16px"}}>
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:"10px",color:"#475569"}}>Total Cost</p>
                  <p style={{fontSize:"15px",fontWeight:800,color:"#0f172a"}}>₹{result.totalCost.toLocaleString()}</p>
                </div>
                <div style={{textAlign:"right"}}>
                  <p style={{fontSize:"10px",color:"#475569"}}>Per Acre</p>
                  <p style={{fontSize:"15px",fontWeight:800,color:"#0f172a"}}>₹{result.costPerAcre.toLocaleString()}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div style={{maxWidth:"1400px",margin:"0 auto",padding:"28px clamp(16px,4vw,48px)"}}>

          {/* ── FORM ── */}
          {!result && (
            <div className="f-main-grid">

              {/* LEFT */}
              <div className="fi">
                <h1 style={{fontSize:"clamp(1.4rem,2.5vw,1.9rem)",fontWeight:800,letterSpacing:"-.03em",lineHeight:1.15,marginBottom:"8px"}}>Fertilizer<br/>Calculator</h1>
                <p style={{fontSize:"13px",color:"#334155",lineHeight:1.7,marginBottom:"24px"}}>Get the exact fertilizer quantities, schedule and cost estimate for your crop and field size.</p>

                {/* selected crop preview */}
                <div style={{padding:"18px",borderRadius:"12px",background:"#fff",border:"1.5px solid #94a3b8",marginBottom:"14px"}}>
                  <p className="sec">Standard NPK — {crop.emoji} {crop.label}</p>
                  <div className="f-npk-grid" style={{gap:"10px"}}>
                    {[{l:"Nitrogen",v:crop.n,u:"kg/ha",c:"#166534",bg:"#f0fdf4",b:"#4ade80"},
                      {l:"Phosphorus",v:crop.p,u:"kg/ha",c:"#1e40af",bg:"#eff6ff",b:"#93c5fd"},
                      {l:"Potassium",v:crop.k,u:"kg/ha",c:"#92400e",bg:"#fffbeb",b:"#fbbf24"}].map(n=>(
                      <div key={n.l} style={{padding:"12px",borderRadius:"8px",background:n.bg,border:`1px solid ${n.b}`,textAlign:"center"}}>
                        <p style={{fontSize:"1.2rem",fontWeight:800,color:n.c}}>{n.v}</p>
                        <p style={{fontSize:"9px",color:n.c,opacity:.8,marginTop:"2px"}}>{n.l}</p>
                        <p style={{fontSize:"9px",color:n.c,opacity:.65}}>{n.u}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{marginTop:"12px",paddingTop:"12px",borderTop:"1px solid #cbd5e1",display:"flex",justifyContent:"space-between"}}>
                    <span style={{fontSize:"11px",color:"#475569"}}>Season</span>
                    <span style={{fontSize:"11px",fontWeight:600,color:"#0f172a"}}>{crop.seasons}</span>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:"4px"}}>
                    <span style={{fontSize:"11px",color:"#475569"}}>Duration</span>
                    <span style={{fontSize:"11px",fontWeight:600,color:"#0f172a"}}>{crop.days}</span>
                  </div>
                </div>

                <p style={{fontSize:"11px",color:"#64748b",lineHeight:1.6}}>Soil test results will further fine-tune these values — enter them in the optional fields.</p>
              </div>

              {/* RIGHT */}
              <div className="fi1">
                <div style={{background:"#fff",border:"1.5px solid #94a3b8",borderRadius:"14px",overflow:"hidden"}}>

                  {/* Crop grid */}
                  <div style={{padding:"22px 24px",borderBottom:"1px solid #cbd5e1"}}>
                    <p className="sec">Select Crop</p>
                    <div className="f-crop-grid">
                      {CROPS.map(c=>(
                        <button key={c.id} onClick={()=>setCropId(c.id)} style={{
                          padding:"10px 6px",borderRadius:"8px",border:"none",cursor:"pointer",
                          background:cropId===c.id?"#0f172a":"#f8fafc",
                          outline:cropId===c.id?"none":"1.5px solid #94a3b8",
                          fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"all .15s",
                        }}>
                          <p style={{fontSize:"1.2rem",marginBottom:"3px"}}>{c.emoji}</p>
                          <p style={{fontSize:"10px",fontWeight:600,color:cropId===c.id?"#fff":"#334155"}}>{c.label}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Field details */}
                  <div style={{padding:"22px 24px",borderBottom:"1px solid #cbd5e1"}}>
                    <p className="sec">Field Details</p>
                    <div className="f-field-grid">
                      <div>
                        <label style={{display:"block",fontSize:"11px",fontWeight:600,color:"#334155",letterSpacing:".06em",textTransform:"uppercase",marginBottom:"5px"}}>Field Area</label>
                        <div style={{position:"relative"}}>
                          <input type="number" value={acres} onChange={e=>setAcres(e.target.value)} placeholder="2"
                            style={{width:"100%",padding:"9px 50px 9px 12px",borderRadius:"8px",border:"1.5px solid #94a3b8",background:"#fff",color:"#0f172a",fontSize:"14px",fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none"}}
                            onFocus={e=>{e.target.style.borderColor="#475569";e.target.style.boxShadow="0 0 0 3px rgba(71,85,105,.12)"}}
                            onBlur={e=>{e.target.style.borderColor="#94a3b8";e.target.style.boxShadow="none"}}/>
                          <span style={{position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",fontSize:"11px",color:"#475569",fontWeight:600}}>acres</span>
                        </div>
                      </div>
                      <div>
                        <label style={{display:"block",fontSize:"11px",fontWeight:600,color:"#334155",letterSpacing:".06em",textTransform:"uppercase",marginBottom:"5px"}}>Soil Type</label>
                        <div style={{position:"relative"}}>
                          <select value={soilType} onChange={e=>setSoilType(e.target.value)}
                            style={{width:"100%",padding:"9px 32px 9px 12px",borderRadius:"8px",border:"1.5px solid #94a3b8",background:"#fff",color:"#0f172a",fontSize:"13px",fontFamily:"'Plus Jakarta Sans',sans-serif",outline:"none",cursor:"pointer",appearance:"none"}}>
                            {Object.keys(SOIL_MULT).map(k=><option key={k}>{k}</option>)}
                          </select>
                          <svg style={{position:"absolute",right:"10px",top:"50%",transform:"translateY(-50%)",pointerEvents:"none"}} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Optional NPK */}
                  <div style={{padding:"22px 24px",borderBottom:"1px solid #cbd5e1"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"12px"}}>
                      <p className="sec" style={{marginBottom:0}}>Current Soil NPK</p>
                      <span style={{fontSize:"10px",color:"#94a3b8",fontWeight:500}}>optional</span>
                    </div>
                    <div className="f-npk-grid">
                      {inp(sN,setSN,"Nitrogen","kg/ha")}
                      {inp(sP,setSP,"Phosphorus","kg/ha")}
                      {inp(sK,setSK,"Potassium","kg/ha")}
                    </div>
                    <p style={{fontSize:"11px",color:"#64748b",marginTop:"8px"}}>Leave blank to use standard recommendations for {crop.label}.</p>
                  </div>

                  <div style={{padding:"18px 24px",background:"#f8fafc",display:"flex",alignItems:"center",justifyContent:"flex-end"}}>
                    <button onClick={()=>setResult(calc(cropId,parseFloat(acres)||1,soilType,sN,sP,sK))}
                      style={{padding:"10px 28px",borderRadius:"8px",border:"none",cursor:"pointer",background:"#0f172a",color:"#fff",fontSize:"13px",fontWeight:700,fontFamily:"'Plus Jakarta Sans',sans-serif",transition:"opacity .15s"}}
                      onMouseEnter={e=>(e.currentTarget.style.opacity=".85")}
                      onMouseLeave={e=>(e.currentTarget.style.opacity="1")}>
                      Calculate Plan →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── RESULTS ── */}
          {result && (
            <div className="f-res-grid">

              {/* LEFT sidebar */}
              <div className="fi" style={{display:"flex",flexDirection:"column",gap:"14px"}}>
                <div style={{padding:"20px",borderRadius:"12px",background:"#fff",border:"1.5px solid #94a3b8"}}>
                  <p style={{fontSize:"16px",fontWeight:800,marginBottom:"4px"}}>{result.cropLabel}</p>
                  <p style={{fontSize:"12px",color:"#475569",marginBottom:"16px"}}>{result.acres} acres · {soilType}</p>
                  <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                    {[{l:"N Required",v:result.reqN,unit:"kg/ha",c:"#166534",bg:"#f0fdf4",bar:"#22c55e"},
                      {l:"P Required",v:result.reqP,unit:"kg/ha",c:"#1e40af",bg:"#eff6ff",bar:"#60a5fa"},
                      {l:"K Required",v:result.reqK,unit:"kg/ha",c:"#92400e",bg:"#fffbeb",bar:"#fbbf24"}].map(n=>(
                      <div key={n.l} style={{padding:"10px 12px",borderRadius:"8px",background:n.bg,border:`1.5px solid ${n.bar}88`}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:"5px"}}>
                          <span style={{fontSize:"11px",fontWeight:600,color:n.c}}>{n.l}</span>
                          <span style={{fontSize:"12px",fontWeight:800,color:n.c}}>{n.v} {n.unit}</span>
                        </div>
                        <div style={{height:"4px",borderRadius:"99px",background:"rgba(0,0,0,.12)"}}>
                          <div style={{height:"100%",borderRadius:"99px",background:n.bar,width:`${Math.min(100,n.v/3)}%`}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{padding:"16px",borderRadius:"12px",background:"#0f172a",color:"#fff"}}>
                  <p style={{fontSize:"11px",color:"rgba(255,255,255,.5)",marginBottom:"4px"}}>Total Fertilizer Cost</p>
                  <p style={{fontSize:"1.6rem",fontWeight:800}}>₹{result.totalCost.toLocaleString()}</p>
                  <p style={{fontSize:"11px",color:"rgba(255,255,255,.4)",marginTop:"4px"}}>₹{result.costPerAcre.toLocaleString()} per acre</p>
                </div>

                <button onClick={()=>setResult(null)} style={{width:"100%",padding:"10px",borderRadius:"8px",border:"1.5px solid #94a3b8",background:"#fff",color:"#334155",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
                  ← New Calculation
                </button>
              </div>

              {/* RIGHT */}
              <div style={{display:"flex",flexDirection:"column",gap:"16px"}}>

                {/* Schedule */}
                {result.stages.map((stage,si)=>(
                  <div key={si} className={`fi${si}`} style={{borderRadius:"12px",background:"#fff",border:"1.5px solid #94a3b8",overflow:"hidden"}}>
                    <div style={{padding:"14px 20px",borderBottom:"1px solid #cbd5e1",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                          <span style={{width:"22px",height:"22px",borderRadius:"50%",background:"#0f172a",color:"#fff",fontSize:"11px",fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{si+1}</span>
                          <p style={{fontSize:"14px",fontWeight:700,color:"#0f172a"}}>{stage.title}</p>
                        </div>
                        <p style={{fontSize:"11px",color:"#475569",marginTop:"3px",marginLeft:"30px"}}>⏱ {stage.timing}</p>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <p style={{fontSize:"12px",fontWeight:700,color:"#334155"}}>₹{Math.round(stage.items.reduce((s,i)=>s+i.totalCost,0)).toLocaleString()}</p>
                        <p style={{fontSize:"10px",color:"#475569"}}>stage total</p>
                      </div>
                    </div>
                    <table className="f-table" style={{width:"100%",borderCollapse:"collapse"}}>
                      <thead>
                        <tr style={{background:"#f8fafc"}}>
                          {["Fertilizer","Qty / Acre","Total Cost","Application Note"].map((h,hi)=>(
                            <th key={h} className={hi===3?"f-table-note":""} style={{padding:"9px 16px",textAlign:"left",fontSize:"10px",fontWeight:700,color:"#475569",letterSpacing:".07em",textTransform:"uppercase",borderBottom:"1px solid #cbd5e1"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {stage.items.map((item,ii)=>(
                          <tr key={ii} style={{borderBottom:ii<stage.items.length-1?"1px solid #e2e8f0":"none",transition:"background .12s"}}>
                            <td style={{padding:"12px 16px",fontSize:"13px",fontWeight:600,color:"#0f172a"}}>{item.name}</td>
                            <td style={{padding:"12px 16px",fontSize:"13px",fontWeight:700,color:"#334155"}}>{item.qty} kg</td>
                            <td style={{padding:"12px 16px",fontSize:"13px",color:"#334155"}}>₹{Math.round(item.totalCost).toLocaleString()}</td>
                            <td className="f-table-note" style={{padding:"12px 16px",fontSize:"12px",color:"#334155"}}>{item.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}

                {/* Tips */}
                <div className="fi2" style={{padding:"20px 24px",borderRadius:"12px",background:"#fffbeb",border:"1.5px solid #fbbf24"}}>
                  <p style={{fontSize:"10px",fontWeight:700,color:"#92400e",letterSpacing:".1em",textTransform:"uppercase",marginBottom:"12px"}}>Application Tips</p>
                  <div className="f-tips-grid">
                    {result.tips.map((t,i)=>(
                      <div key={i} style={{display:"flex",gap:"8px",alignItems:"flex-start"}}>
                        <span style={{fontSize:"13px",flexShrink:0,color:"#d97706"}}>→</span>
                        <p style={{fontSize:"12px",color:"#78350f",lineHeight:1.6}}>{t}</p>
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