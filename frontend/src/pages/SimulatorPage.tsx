import { useNavigate } from "react-router-dom"
export default function SimulatorPage() {
  const navigate = useNavigate()
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet"/>
      <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'Plus Jakarta Sans',sans-serif",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"24px",textAlign:"center"}}>
        <div style={{display:"inline-flex",alignItems:"center",gap:"6px",padding:"4px 12px",borderRadius:"999px",background:"#f3f0ff",border:"1px solid #ddd6fe",marginBottom:"16px"}}>
          <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"#7c3aed"}}/>
          <span style={{fontSize:"11px",fontWeight:700,color:"#6d28d9",letterSpacing:".08em",textTransform:"uppercase"}}>Coming Soon</span>
        </div>
        <h1 style={{fontSize:"clamp(1.6rem,4vw,2.2rem)",fontWeight:800,color:"#0f172a",letterSpacing:"-.03em",marginBottom:"10px"}}>Crop Simulator</h1>
        <p style={{fontSize:"14px",color:"#64748b",maxWidth:"360px",lineHeight:1.7,marginBottom:"32px"}}>A visual 2D farm game where you make real decisions — sowing, irrigation, pest control — and watch your yield unfold season by season.</p>
        <div style={{display:"flex",gap:"10px",flexWrap:"wrap",justifyContent:"center",marginBottom:"40px"}}>
          {["Visual farm scene","Weather events","4 growth phases","Score & profit report"].map((f,i)=>(
            <span key={i} style={{padding:"5px 14px",borderRadius:"8px",fontSize:"12px",fontWeight:500,background:"#fff",border:"1.5px solid #e2e8f0",color:"#475569"}}>✓ {f}</span>
          ))}
        </div>
        <button onClick={()=>navigate("/lab")} style={{padding:"10px 24px",borderRadius:"8px",border:"1.5px solid #e2e8f0",background:"#fff",color:"#334155",fontSize:"13px",fontWeight:600,cursor:"pointer",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>← Back to Lab</button>
      </div>
    </>
  )
}