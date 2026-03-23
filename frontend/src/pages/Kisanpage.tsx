import { useEffect, useRef, useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  role: "user" | "ai"
  text: string
  ts: string
}

type VoiceState = "idle" | "listening" | "thinking" | "speaking"

// ── Helpers ───────────────────────────────────────────────────────────────────

function nowLabel() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const LeafIcon = ({ size = 16, color = "white" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
    <path d="M26 4C26 4 24 9 20 13C16 17 9 18 5 28" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M26 4C26 4 14 4 9 10C4 16 5 28 5 28C5 28 10 22 15 19C20 16 26 14 26 4Z" fill={color} opacity="0.9" />
  </svg>
)

const SendIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
)

const MicIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="11" rx="3" />
    <path d="M5 10a7 7 0 0 0 14 0" />
    <line x1="12" y1="19" x2="12" y2="22" />
    <line x1="8" y1="22" x2="16" y2="22" />
  </svg>
)

const StopIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <rect x="4" y="4" width="16" height="16" rx="3" />
  </svg>
)

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

// ── Suggested prompts ─────────────────────────────────────────────────────────

const SUGGESTIONS = [
  "What crop should I grow now?",
  "How to deal with yellow leaves?",
  "Best fertilizer for wheat?",
  "When should I irrigate rice?",
  "How to prevent pest attacks?",
  "What's the ideal pH for soil?",
]

// ── Typing dots ───────────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: "5px", alignItems: "center", padding: "4px 0" }}>
      {[0, 1, 2].map(i => (
        <span key={i} style={{
          width: "7px", height: "7px", borderRadius: "50%",
          background: "#16a34a", display: "block",
          animation: `dotBounce 1.2s ${i * 0.2}s ease-in-out infinite`,
        }} />
      ))}
    </div>
  )
}

// ── Waveform bars ─────────────────────────────────────────────────────────────

function Waveform({ state }: { state: VoiceState }) {
  const bars = [3, 6, 10, 14, 10, 14, 7, 10, 4, 7, 10, 7, 4]
  const color = state === "speaking" ? "#4ade80" : state === "listening" ? "#fff" : "rgba(255,255,255,0.25)"
  const animated = state === "listening" || state === "speaking"

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", height: "44px" }}>
      {bars.map((h, i) => (
        <div key={i} style={{
          width: "4px",
          height: animated ? `${h}px` : "4px",
          borderRadius: "99px",
          background: color,
          transition: "height .3s ease, background .4s ease",
          animation: animated ? `waveBar 0.85s ${(i * 0.06).toFixed(2)}s ease-in-out infinite alternate` : "none",
        }} />
      ))}
    </div>
  )
}

// ── Voice Modal ───────────────────────────────────────────────────────────────

interface VoiceModalProps {
  voiceState: VoiceState
  transcript: string
  aiReply: string
  onStop: () => void
  onClose: () => void
  onStartListening: () => void
}

function VoiceModal({ voiceState, transcript, aiReply, onStop, onClose, onStartListening }: VoiceModalProps) {
  const stateLabel: Record<VoiceState, string> = {
    idle:      "Tap the orb to speak",
    listening: "Listening...",
    thinking:  "Thinking...",
    speaking:  "Speaking...",
  }
  const stateColor: Record<VoiceState, string> = {
    idle:      "rgba(255,255,255,0.35)",
    listening: "#fff",
    thinking:  "#fde68a",
    speaking:  "#4ade80",
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "0 0 28px", animation: "backdropIn .22s ease both" }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(14px)" }} />

      {/* Card */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "min(500px, calc(100vw - 32px))",
        background: "linear-gradient(165deg, #0c2416 0%, #0e1d0e 55%, #0d0d0d 100%)",
        borderRadius: "28px",
        border: "1px solid rgba(74,222,128,0.14)",
        boxShadow: "0 40px 100px rgba(0,0,0,0.7), inset 0 0 0 1px rgba(74,222,128,0.06)",
        overflow: "hidden",
        animation: "modalSlideUp .35s cubic-bezier(.34,1.24,.64,1) both",
      }}>
        {/* Top glow bar */}
        <div style={{
          height: "2px",
          backgroundSize: "300% 100%",
          background: voiceState === "listening"
            ? "linear-gradient(90deg, transparent 20%, #4ade80 50%, transparent 80%)"
            : voiceState === "speaking"
            ? "linear-gradient(90deg, transparent 20%, #86efac 50%, transparent 80%)"
            : "linear-gradient(90deg, transparent, rgba(74,222,128,0.25), transparent)",
          animation: (voiceState === "listening" || voiceState === "speaking") ? "glowSweep 2s ease-in-out infinite" : "none",
        }} />

        <div style={{ padding: "24px 24px 30px" }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "11px" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "50%",
                background: "linear-gradient(135deg,#16a34a,#4ade80)",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: voiceState === "speaking" ? "0 0 22px rgba(74,222,128,0.55)" : "0 2px 12px rgba(22,163,74,0.3)",
                transition: "box-shadow .35s ease",
              }}>
                <LeafIcon size={17} color="#fff" />
              </div>
              <div>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: "14px", letterSpacing: "-.01em" }}>Kisan Voice</p>
                <p style={{ fontSize: "11.5px", fontWeight: 600, transition: "color .3s ease", color: stateColor[voiceState] }}>
                  {stateLabel[voiceState]}
                </p>
              </div>
            </div>
            <button onClick={onClose} style={{
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "50%", width: "34px", height: "34px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "rgba(255,255,255,0.45)",
              transition: "background .15s",
            }}>
              <CloseIcon />
            </button>
          </div>

          {/* Orb + Waveform */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "22px", padding: "4px 0 28px" }}>
            {/* Orb */}
            <div style={{ position: "relative", width: "120px", height: "120px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Outer rings */}
              {["-14px", "-26px"].map((inset, ri) => (
                <div key={ri} style={{
                  position: "absolute",
                  inset: inset,
                  borderRadius: "50%",
                  border: `${ri === 0 ? 2 : 1.5}px solid rgba(74,222,128,${voiceState === "listening" ? (ri === 0 ? "0.35" : "0.18") : "0.08"})`,
                  transition: "border-color .4s ease",
                  animation: voiceState === "listening" ? `ringPulse 1.6s ${ri * 0.3}s ease-in-out infinite` : "none",
                }} />
              ))}
              {/* Core */}
              <div
                onClick={voiceState === "idle" ? onStartListening : undefined}
                title={voiceState === "idle" ? "Tap to speak" : undefined}
                style={{
                  width: "120px", height: "120px", borderRadius: "50%",
                  background: voiceState === "listening"
                    ? "radial-gradient(circle at 38% 38%, #22c55e 0%, #16a34a 45%, #0d5c27 100%)"
                    : voiceState === "speaking"
                    ? "radial-gradient(circle at 38% 38%, #4ade80 0%, #16a34a 40%, #0d5c27 100%)"
                    : voiceState === "thinking"
                    ? "radial-gradient(circle, #1e3a20 0%, #0f1a0f 100%)"
                    : "radial-gradient(circle, #172617 0%, #0d0d0d 100%)",
                  boxShadow: voiceState === "listening"
                    ? "0 0 50px rgba(22,163,74,0.65), 0 0 100px rgba(22,163,74,0.2)"
                    : voiceState === "speaking"
                    ? "0 0 40px rgba(74,222,128,0.5), 0 0 80px rgba(74,222,128,0.15)"
                    : "0 0 20px rgba(22,163,74,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all .45s ease",
                  animation: voiceState === "listening" ? "orbPulse 1.3s ease-in-out infinite" : "none",
                  cursor: voiceState === "idle" ? "pointer" : "default",
                  position: "relative",
                }}>
                {voiceState === "thinking"
                  ? <div style={{ display: "flex", gap: "7px" }}>
                      {[0,1,2].map(i => (
                        <span key={i} style={{ width:"9px", height:"9px", borderRadius:"50%", background:"#4ade80", display:"block", animation:`dotBounce 1.2s ${i*0.2}s ease-in-out infinite` }} />
                      ))}
                    </div>
                  : voiceState === "idle"
                  ? <>
                      <MicIcon size={40} />
                      {/* "Tap to speak" hint ring */}
                      <div style={{
                        position: "absolute", inset: 0, borderRadius: "50%",
                        background: "rgba(74,222,128,0.07)",
                        display: "flex", alignItems: "flex-end", justifyContent: "center",
                        paddingBottom: "10px",
                        pointerEvents: "none",
                      }}>
                        <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase" }}>tap</span>
                      </div>
                    </>
                  : <LeafIcon size={44} color="#fff" />
                }
              </div>
            </div>

            {/* Waveform */}
            <Waveform state={voiceState} />
          </div>

          {/* You said */}
          {transcript && (
            <div style={{
              background: "rgba(22,163,74,0.1)", border: "1px solid rgba(22,163,74,0.22)",
              borderRadius: "16px", padding: "13px 17px", marginBottom: "10px",
              animation: "fadeSlideIn .25s ease both",
            }}>
              <p style={{ fontSize: "9.5px", color: "#4ade80", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: "6px" }}>You said</p>
              <p style={{ color: "#dff0d8", fontSize: "14px", lineHeight: 1.6, fontWeight: 500 }}>{transcript}</p>
            </div>
          )}

          {/* AI reply */}
          {aiReply && (
            <div style={{
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
              borderRadius: "16px", padding: "13px 17px", marginBottom: "22px",
              animation: "fadeSlideIn .3s .05s ease both",
            }}>
              <p style={{ fontSize: "9.5px", color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: "6px" }}>Kisan AI</p>
              <p style={{ color: "rgba(255,255,255,0.82)", fontSize: "13.5px", lineHeight: 1.65 }}>{aiReply}</p>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            {voiceState === "listening" && (
              <button onClick={onStop} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "12px 32px", borderRadius: "999px",
                background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.28)",
                color: "#fca5a5", fontSize: "13px", fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                animation: "fadeSlideIn .2s ease both",
              }}>
                <StopIcon /> Stop Listening
              </button>
            )}
            {voiceState === "speaking" && (
              <button onClick={onStop} style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "12px 32px", borderRadius: "999px",
                background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)",
                color: "#4ade80", fontSize: "13px", fontWeight: 700,
                cursor: "pointer", fontFamily: "inherit",
                animation: "fadeSlideIn .2s ease both",
              }}>
                Stop Speaking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Message bubble ────────────────────────────────────────────────────────────

function Bubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user"
  return (
    <div style={{
      display: "flex", flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-end", gap: "10px",
      animation: "msgIn .28s cubic-bezier(.34,1.4,.64,1) both",
    }}>
      {!isUser && (
        <div style={{
          width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(135deg,#16a34a,#4ade80)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 2px 10px rgba(22,163,74,0.35)",
        }}>
          <LeafIcon size={15} color="#fff" />
        </div>
      )}
      <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isUser ? "flex-end" : "flex-start", gap: "4px" }}>
        <div style={{
          padding: "12px 16px",
          borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
          background: isUser ? "linear-gradient(135deg,#16a34a,#15803d)" : "#fff",
          color: isUser ? "#fff" : "#111",
          fontSize: "13.5px", lineHeight: 1.65,
          boxShadow: isUser ? "0 4px 16px rgba(22,163,74,0.28)" : "0 2px 12px rgba(0,0,0,0.08)",
          border: isUser ? "none" : "1px solid #e8ebe4",
          whiteSpace: "pre-wrap", wordBreak: "break-word",
        }}>
          {msg.text}
        </div>
        <span style={{ fontSize: "10px", color: "rgba(0,0,0,0.28)", marginTop: "1px" }}>{msg.ts}</span>
      </div>
    </div>
  )
}

// ── Navbar ─────────────────────────────────────────────────────────────────────

function Navbar() {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      const nav = document.getElementById("kisan-mob-nav")
      if (nav && !nav.contains(e.target as Node)) setMenuOpen(false)
    }
    if (menuOpen) document.addEventListener("mousedown", handle)
    return () => document.removeEventListener("mousedown", handle)
  }, [menuOpen])

  const navItems = ["Home", "Farm", "Market", "Lab"]

  return (
    <nav id="kisan-mob-nav" style={{ position: "relative", zIndex: 30, display: "flex", justifyContent: "center", padding: "20px 16px 0" }}>
      <div className="kd-nav" style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "10px 28px", background: "rgba(2,2,2,0.93)", backdropFilter: "blur(28px)",
        border: "1px solid rgba(255,255,255,0.06)", borderRadius: "9999px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)", width: "min(680px,92vw)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "9px", cursor: "pointer" }} onClick={() => navigate("/")}>
          <LeafIcon size={17} color="white" />
          <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#fff" }}>FarmSaathi</span>
        </div>
        <div style={{ display: "flex", gap: "28px" }}>
          {navItems.map(item => (
            <span key={item} onClick={() => navigate(item === "Home" ? "/" : `/${item.toLowerCase()}`)}
              style={{ cursor: "pointer", fontSize: "0.85rem", fontWeight: 500, position: "relative", color: item === "Farm" ? "#fff" : "rgba(255,255,255,0.42)" }}>
              {item}
              {item === "Farm" && <span style={{ position: "absolute", bottom: "-3px", left: 0, right: 0, height: "1.5px", background: "#4ade80", borderRadius: "99px" }} />}
            </span>
          ))}
        </div>
        <span onClick={() => navigate("/")} style={{ cursor: "pointer", fontSize: "0.85rem", fontWeight: 500, color: "rgba(255,255,255,0.42)" }}>Overview</span>
      </div>

      <div className="km-nav" style={{
        display: "none", alignItems: "center", justifyContent: "space-between",
        width: "100%", maxWidth: "calc(100vw - 32px)", padding: "10px 20px",
        background: "rgba(2,2,2,0.93)", backdropFilter: "blur(28px)",
        border: "1px solid rgba(255,255,255,0.06)", borderRadius: "9999px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }} onClick={() => navigate("/")}>
          <LeafIcon size={15} color="white" />
          <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#fff" }}>FarmSaathi</span>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: "5px", padding: "4px" }}>
          {[0, 1, 2].map(i => <span key={i} style={{ display: "block", height: "2px", width: i === 1 ? "14px" : "20px", background: "rgba(255,255,255,0.8)", borderRadius: "99px" }} />)}
        </button>
      </div>

      {menuOpen && (
        <div style={{
          position: "absolute", top: "72px", left: "16px", right: "16px", zIndex: 50,
          background: "rgba(4,4,4,0.97)", backdropFilter: "blur(28px)",
          border: "1px solid rgba(255,255,255,0.07)", borderRadius: "20px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.7)", overflow: "hidden",
        }}>
          {navItems.map((item, i, arr) => (
            <div key={item}
              onClick={() => { setMenuOpen(false); navigate(item === "Home" ? "/" : `/${item.toLowerCase()}`) }}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 20px", cursor: "pointer",
                borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                color: "rgba(255,255,255,0.52)", fontSize: "14px", fontWeight: 500,
              }}>
              <span>{item}</span>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
          ))}
        </div>
      )}
    </nav>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function KisanPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [coords, setCoords] = useState<{ lat: number; lon: number }>({ lat: 31.326, lon: 75.5762 })

  // Voice modal
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [voiceState, setVoiceState] = useState<VoiceState>("idle")
  const [voiceTranscript, setVoiceTranscript] = useState("")
  const [voiceReply, setVoiceReply] = useState("")

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef(window.speechSynthesis)

  // Geolocation
  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      p => setCoords({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => {}
    )
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // ── TTS ─────────────────────────────────────────────────────────────────

  const speak = useCallback((text: string, onEnd?: () => void) => {
    synthRef.current.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.lang = "en-IN"
    utter.rate = 0.95
    utter.pitch = 1.05
    const voices = synthRef.current.getVoices()
    const preferred = voices.find(v =>
      v.lang.startsWith("en") && (v.name.includes("Google") || v.name.includes("Natural") || v.name.includes("India"))
    )
    if (preferred) utter.voice = preferred
    utter.onend = () => onEnd?.()
    utter.onerror = () => onEnd?.()
    synthRef.current.speak(utter)
  }, [])

  const stopSpeaking = useCallback(() => {
    synthRef.current.cancel()
  }, [])

  // ── Send message ─────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (text?: string, fromVoice = false) => {
    const msg = (text ?? input).trim()
    if (!msg || loading) return

    setInput("")
    if (inputRef.current) inputRef.current.style.height = "auto"

    const userMsg: Message = { role: "user", text: msg, ts: nowLabel() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    if (fromVoice) setVoiceState("thinking")

    try {
      const res = await api.post(
        `/chatbot/ask?message=${encodeURIComponent(msg)}&lat=${coords.lat}&lon=${coords.lon}`
      )
      const answer: string = res.data.answer ?? "No response."
      const aiMsg: Message = { role: "ai", text: answer, ts: nowLabel() }
      setMessages(prev => [...prev, aiMsg])

      if (fromVoice) {
        setVoiceReply(answer)
        setVoiceState("speaking")
        speak(answer, () => setVoiceState("idle"))
      }
    } catch {
      const errText = "Sorry, I couldn't reach the server. Please try again."
      setMessages(prev => [...prev, { role: "ai", text: errText, ts: nowLabel() }])
      if (fromVoice) {
        setVoiceReply(errText)
        setVoiceState("speaking")
        speak(errText, () => setVoiceState("idle"))
      }
    } finally {
      setLoading(false)
    }
  }, [input, loading, coords, speak])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = "auto"
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px"
  }

  // ── Voice modal ───────────────────────────────────────────────────────────

  const startVoiceSession = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SR) { alert("Voice input is not supported in this browser. Try Chrome."); return }

    setVoiceOpen(true)
    setVoiceTranscript("")
    setVoiceReply("")
    setVoiceState("listening")

    const rec = new SR()
    rec.lang = "en-IN"
    rec.interimResults = true
    rec.continuous = false

    let finalTranscript = ""

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = ""
      finalTranscript = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalTranscript += t
        else interim += t
      }
      setVoiceTranscript(finalTranscript || interim)
    }

    rec.onend = () => {
      if (finalTranscript.trim()) {
        sendMessage(finalTranscript.trim(), true)
      } else {
        setVoiceState("idle")
      }
    }

    rec.onerror = () => setVoiceState("idle")
    recognitionRef.current = rec
    rec.start()
  }

  const restartListening = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const w = window as any
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SR || voiceState !== "idle") return

    setVoiceTranscript("")
    setVoiceReply("")
    setVoiceState("listening")

    const rec = new SR()
    rec.lang = "en-IN"
    rec.interimResults = true
    rec.continuous = false

    let finalTranscript = ""

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rec.onresult = (e: any) => {
      let interim = ""
      finalTranscript = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) finalTranscript += t
        else interim += t
      }
      setVoiceTranscript(finalTranscript || interim)
    }

    rec.onend = () => {
      if (finalTranscript.trim()) {
        sendMessage(finalTranscript.trim(), true)
      } else {
        setVoiceState("idle")
      }
    }

    rec.onerror = () => setVoiceState("idle")
    recognitionRef.current = rec
    rec.start()
  }

  const handleVoiceStop = () => {
    if (voiceState === "listening") {
      recognitionRef.current?.stop()
      recognitionRef.current = null
    } else if (voiceState === "speaking") {
      stopSpeaking()
      setVoiceState("idle")
    }
  }

  const closeVoiceModal = () => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    stopSpeaking()
    setVoiceOpen(false)
    setVoiceState("idle")
    setVoiceTranscript("")
    setVoiceReply("")
  }

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop()
      synthRef.current.cancel()
    }
  }, [])

  const isEmpty = messages.length === 0

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes msgIn {
          from { opacity: 0; transform: translateY(10px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: .5; }
          40%            { transform: translateY(-7px); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes waveBar {
          from { transform: scaleY(0.35); opacity: 0.55; }
          to   { transform: scaleY(1.25); opacity: 1; }
        }
        @keyframes orbPulse {
          0%,100% { transform: scale(1);    box-shadow: 0 0 50px rgba(22,163,74,0.65), 0 0 100px rgba(22,163,74,0.2); }
          50%     { transform: scale(1.07); box-shadow: 0 0 70px rgba(22,163,74,0.85), 0 0 120px rgba(22,163,74,0.3); }
        }
        @keyframes ringPulse {
          0%,100% { transform: scale(1);    opacity: 0.4; }
          50%     { transform: scale(1.14); opacity: 0.08; }
        }
        @keyframes backdropIn {
          from { opacity: 0; } to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(48px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes glowSweep {
          0%   { background-position: -200% center; }
          100% { background-position: 300% center; }
        }

        .kisan-page {
          min-height: 100vh; background: #f0f2ed;
          font-family: 'Plus Jakarta Sans', sans-serif;
          display: flex; flex-direction: column;
        }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: transparent; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }

        .sugg-pill {
          padding: 8px 16px; border-radius: 999px; border: 1px solid #d4e0cb;
          background: #fff; color: #374151; font-size: 12.5px; font-weight: 600;
          cursor: pointer; font-family: inherit; white-space: nowrap;
          transition: background .18s, border-color .18s, transform .15s;
          animation: fadeUp .5s ease both;
        }
        .sugg-pill:hover { background: #f0faf0; border-color: #86efac; transform: translateY(-1px); }

        .kisan-input {
          flex: 1; resize: none; border: none; outline: none; background: transparent;
          font-family: inherit; font-size: 14px; color: #111; line-height: 1.55;
          padding: 0; max-height: 120px; overflow-y: auto;
        }
        .kisan-input::placeholder { color: rgba(0,0,0,0.3); }

        .send-btn {
          width: 40px; height: 40px; border-radius: 50%; border: none;
          background: linear-gradient(135deg, #16a34a, #15803d); color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          transition: transform .15s, box-shadow .15s;
          box-shadow: 0 4px 14px rgba(22,163,74,0.35);
        }
        .send-btn:hover:not(:disabled) { transform: scale(1.07); box-shadow: 0 6px 20px rgba(22,163,74,0.45); }
        .send-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .voice-fab {
          width: 42px; height: 42px; border-radius: 50%;
          background: linear-gradient(135deg, #0c2416, #163d20);
          color: #4ade80; border: 1px solid rgba(74,222,128,0.22);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
          transition: transform .15s, box-shadow .15s;
          box-shadow: 0 4px 16px rgba(22,163,74,0.22);
        }
        .voice-fab:hover { transform: scale(1.08); box-shadow: 0 6px 24px rgba(22,163,74,0.42); }

        @media(max-width: 767px) { .kd-nav { display: none !important; } .km-nav { display: flex !important; } }
        @media(min-width: 768px) { .km-nav { display: none !important; } .kd-nav { display: flex !important; } }
      `}</style>

      <div className="kisan-page">
        <Navbar />

        <div style={{
          flex: 1, display: "flex", flexDirection: "column",
          maxWidth: "780px", width: "100%", margin: "0 auto",
          padding: "20px clamp(12px,4vw,24px) 0",
        }}>

          {/* Messages */}
          <div className="chat-scroll" style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:"16px", paddingBottom:"12px", minHeight:0 }}>
            {isEmpty && (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flex:1, gap:"16px", padding:"32px 0 20px", animation:"fadeUp .5s ease both" }}>
                <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:"linear-gradient(135deg,#16a34a,#4ade80)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 8px 32px rgba(22,163,74,0.3)" }}>
                  <LeafIcon size={34} color="#fff" />
                </div>
                <div style={{ textAlign:"center" }}>
                  <h2 style={{ fontWeight:800, fontSize:"clamp(1.2rem,3vw,1.6rem)", color:"#111", letterSpacing:"-.02em", marginBottom:"6px" }}>Namaste, Kisan!</h2>
                  <p style={{ color:"#6b7280", fontSize:"13.5px", lineHeight:1.6, maxWidth:"340px" }}>Ask me anything about farming — crops, fertilizers, weather, pests, government schemes, and more.</p>
                </div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"center", maxWidth:"520px", marginTop:"4px" }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button key={s} className="sugg-pill" style={{ animationDelay:`${i * 0.07}s` }} onClick={() => sendMessage(s)}>{s}</button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => <Bubble key={i} msg={m} />)}

            {loading && !voiceOpen && (
              <div style={{ display:"flex", alignItems:"flex-end", gap:"10px", animation:"msgIn .28s ease both" }}>
                <div style={{ width:"34px", height:"34px", borderRadius:"50%", flexShrink:0, background:"linear-gradient(135deg,#16a34a,#4ade80)", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 2px 10px rgba(22,163,74,0.35)" }}>
                  <LeafIcon size={15} color="#fff" />
                </div>
                <div style={{ padding:"12px 16px", borderRadius:"18px 18px 18px 4px", background:"#fff", border:"1px solid #e8ebe4", boxShadow:"0 2px 12px rgba(0,0,0,0.07)" }}>
                  <TypingDots />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div style={{ position:"sticky", bottom:0, background:"linear-gradient(to top, #f0f2ed 80%, transparent)", padding:"12px 0 20px" }}>
            {!isEmpty && !loading && (
              <div style={{ display:"flex", gap:"7px", overflowX:"auto", paddingBottom:"10px", scrollbarWidth:"none" }}>
                {SUGGESTIONS.slice(0,4).map(s => (
                  <button key={s} className="sugg-pill" style={{ fontSize:"11.5px", padding:"6px 13px" }} onClick={() => sendMessage(s)}>{s}</button>
                ))}
              </div>
            )}
            <div style={{ display:"flex", alignItems:"flex-end", gap:"10px", background:"#fff", border:"1px solid #e0e5da", borderRadius:"20px", padding:"12px 12px 12px 18px", boxShadow:"0 4px 24px rgba(0,0,0,0.08)" }}>
              <textarea ref={inputRef} className="kisan-input" rows={1}
                placeholder="Ask about crops, fertilizers, weather..."
                value={input} onChange={handleInput} onKeyDown={handleKeyDown} disabled={loading}
              />
              <div style={{ display:"flex", gap:"7px", alignItems:"center" }}>
                <button className="voice-fab" onClick={startVoiceSession} title="Voice mode">
                  <MicIcon size={18} />
                </button>
                <button className="send-btn" onClick={() => sendMessage()} disabled={!input.trim() || loading}>
                  <SendIcon />
                </button>
              </div>
            </div>
            <p style={{ textAlign:"center", fontSize:"10px", color:"rgba(0,0,0,0.25)", marginTop:"8px", fontWeight:500 }}>
              Powered by Llama 3 · Tap 🎤 for hands-free voice mode
            </p>
          </div>
        </div>
      </div>

      {/* Voice Modal */}
      {voiceOpen && (
        <VoiceModal
          voiceState={voiceState}
          transcript={voiceTranscript}
          aiReply={voiceReply}
          onStop={handleVoiceStop}
          onClose={closeVoiceModal}
          onStartListening={restartListening}
        />
      )}
    </>
  )
}