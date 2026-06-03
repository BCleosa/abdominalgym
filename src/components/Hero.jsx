import { useEffect, useState } from "react";

export default function Hero() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  const fade = (d = 0) => ({
    opacity: show ? 1 : 0,
    transform: show ? "translateY(0)" : "translateY(24px)",
    transition: `opacity 0.65s ease ${d}s, transform 0.65s ease ${d}s`,
  });

  return (
    <section id="hero" style={{ minHeight: "100vh", background: "#080808", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column" }}>

      {/* BG */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(105deg, #080808 0%, rgba(8,8,8,0.85) 50%, rgba(8,8,8,0.25) 100%), url('gym.png') center/cover no-repeat",
      }} />

      {/* Subtle grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
        backgroundSize: "64px 64px",
      }} />

      {/* Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "120px 28px 80px", maxWidth: 1100, margin: "0 auto", width: "100%", position: "relative", zIndex: 2 }}>

        <h1 style={{
          ...fade(0.2),
          fontFamily: "var(--font-display)", fontWeight: 800,
          fontSize: "clamp(3rem, 5vw, 6rem)",
          lineHeight: 0.92, letterSpacing: "-0.03em",
          color: "#f0ede8", marginBottom: 28,
        }}>
          Train Hard<br />
          <span style={{ color: "rgba(240,237,232,0.45)", fontStyle: "italic" }}>Live Strong</span>
        </h1>

        <p style={{
          ...fade(0.3),
          fontSize: "1rem", color: "#888", lineHeight: 1.75,
          fontWeight: 300, maxWidth: 420, marginBottom: 36,
        }}>
          Gym di Kudus dengan peralatan lengkap, pelatih pria & wanita, dan suasana yang bikin kamu betah latihan tiap hari.
        </p>

        <div style={{ ...fade(0.4), display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 56 }}>
          <a href="#contact" style={{
            background: "#fff", color: "#080808",
            fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.875rem",
            padding: "13px 28px", textDecoration: "none", transition: "opacity 0.2s",
          }}
          onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
          onMouseOut={e => e.currentTarget.style.opacity = "1"}
          >
            Mulai Latihan →
          </a>
          <a href="#pricing" style={{
            background: "transparent", color: "#aaa",
            fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "0.875rem",
            padding: "12px 28px", textDecoration: "none",
            border: "1px solid #2a2a2a", transition: "all 0.2s",
          }}
          onMouseOver={e => { e.currentTarget.style.borderColor = "#555"; e.currentTarget.style.color = "#fff"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = "#2a2a2a"; e.currentTarget.style.color = "#aaa"; }}
          >
            Lihat Harga
          </a>
          <a href="tel:+6282324720045" style={{
            display: "flex", alignItems: "center", gap: 7,
            color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.72rem",
            letterSpacing: "0.06em", textDecoration: "none", transition: "color 0.2s",
          }}
          onMouseOver={e => e.currentTarget.style.color = "#aaa"}
          onMouseOut={e => e.currentTarget.style.color = "#666"}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.02 1.18 2 2 0 012 .02h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            +62 823 2472 0045
          </a>
        </div>

        {/* Stats */}
        <div style={{ ...fade(0.5), display: "flex", gap: 0, paddingTop: 28, borderTop: "1px solid #1e1e1e", flexWrap: "wrap" }}>
          {[
            { v: "50+", l: "Peralatan" },
            { v: "3", l: "Pelatih" },
            { v: "07–22", l: "Jam Buka" },
            { v: "Ags 2024", l: "Berdiri" },
          ].map((s, i, a) => (
            <div key={i} style={{ paddingRight: 28, marginRight: 28, borderRight: i < a.length - 1 ? "1px solid #1e1e1e" : "none", marginBottom: 8 }}>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.6rem", color: "#f0ede8", lineHeight: 1, letterSpacing: "-0.02em" }}>{s.v}</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#444", marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom strip */}
      <div style={{ background: "#fff", height: 36, overflow: "hidden", display: "flex", alignItems: "center", position: "relative", zIndex: 2 }}>
        <div style={{ display: "flex", animation: "marquee 20s linear infinite", whiteSpace: "nowrap" }}>
          {Array(10).fill("  ABDOMINAL GYM  ·  KUDUS  ·  FITNESS  ·  STRENGTH  ·  CARDIO  ·  PERSONAL TRAINING  ·").map((t, i) => (
            <span key={i} style={{ fontFamily: "var(--font-mono)", fontSize: "0.68rem", letterSpacing: "0.2em", color: "#080808" }}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
