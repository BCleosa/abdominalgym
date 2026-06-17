import { useState, useEffect, useRef } from "react";

const testimonials = [
  { name: "Sakaaa", since: "Member sejak Sep 2024", rating: 5, comment: "Tempat gym baru, tempatnya luas nyaman alatnya bagus masih baru dan lengkap, ada 3 lantai, lt 2 ber AC, lt 3 pemandangannya bagus, ada loker sama ada free drink air galon. Harga terjangkau untuk member 170k untuk datang harian 20k, recommended bgt buat yang mau gym harian or member" },
  { name: "Khoirunnisa Marlia", since: "Member sejak Okt 2025", rating: 5, comment: "First time nyoba gym, daftar member disini beserta PT, dengan harga segitu it's really worth it tho. Pelayanannya okay banget. Bagi yang mau coba gym, tempat ini cocok kayaknya buat kalian." },
  { name: "Hoo Alfando", since: "Member sejak Ags 2025", rating: 5, comment: "Tempat gym bagus, bersih dan peralatan lengkap, sudah membership 5 bulan disini" },
  { name: "Aliah Aghocy", since: "Member sejak Nov 2024", rating: 5, comment: "parkiran luas, good sih ga panas juga. cmn kalo jam sore dr jam 3 sore keatas rame sekali. Buat kaum introvert bisa kesini di jam pagi sd siang karena lebih sunyi enak 💃🏻 overall good alat juga modern" },
  { name: "Dian Permata", since: "Member sejak Des 2024", rating: 4, comment: "Alat-alatnya banyak dan modern. Tinggal di lantai 1, 2, dan 3 jadi ga pernah antri. Harga membership juga terjangkau banget" },
  { name: "Andi Wijaya", since: "Member sejak Jan 2025", rating: 5, comment: "Abdominal Gym beda dari gym lain. Bersih, nyaman, dan pelatihnya beneran ngerti kebutuhan member" },
];

function Stars({ count }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ color: i <= count ? "#f5c518" : "#333", fontSize: "0.85rem" }}>★</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  const [current, setCurrent] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const perPage = isMobile ? 1 : 3;
  const totalPages = Math.ceil(testimonials.length / perPage);

  const next = () => setCurrent(c => (c + 1) % totalPages);
  const prev = () => setCurrent(c => (c - 1 + totalPages) % totalPages);

  useEffect(() => {
    timerRef.current = setInterval(next, 5000);
    return () => clearInterval(timerRef.current);
  }, [totalPages]);

  const resetTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(next, 5000);
  };

  const visible = testimonials.slice(current * perPage, current * perPage + perPage);

  return (
    <section id="testimonials" style={{ background: "#141414", padding: "70px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 36, flexWrap: "wrap", gap: 16 }}>
          <div>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 10 }}>
              Kata Mereka
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(1.8rem, 4vw, 3rem)", letterSpacing: "-0.02em", color: "#f0ede8", lineHeight: 1, margin: 0 }}>
              Testimoni<br />
              <span style={{ color: "rgba(240,237,232,0.35)", fontStyle: "italic" }}>Member Kami.</span>
            </h2>
          </div>
          {/* Rating summary */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2.5rem", color: "#f0ede8", lineHeight: 1 }}>4.8</div>
            <Stars count={5} />
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#555", marginTop: 4 }}>
              65 ulasan · Google Maps
            </div>
          </div>
        </div>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)", gap: 14, marginBottom: 24, minHeight: 200 }}>
          {visible.map((t, i) => (
            <div key={i} style={{ background: "#1a1a1a", border: "1px solid #242424", padding: "24px 22px", display: "flex", flexDirection: "column", gap: 12, transition: "border-color 0.2s" }}
              onMouseOver={e => e.currentTarget.style.borderColor = "#383838"}
              onMouseOut={e => e.currentTarget.style.borderColor = "#242424"}
            >
              <Stars count={t.rating} />
              <p style={{ fontSize: "0.875rem", color: "#aaa", lineHeight: 1.7, fontWeight: 300, fontStyle: "italic", flex: 1 }}>
                "{t.comment}"
              </p>
              <div style={{ borderTop: "1px solid #242424", paddingTop: 12 }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "#f0ede8" }}>{t.name}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#444", marginTop: 3 }}>{t.since}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8 }}>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => { setCurrent(i); resetTimer(); }}
                style={{ width: i === current ? 24 : 8, height: 8, borderRadius: 4, background: i === current ? "#f0ede8" : "#333", border: "none", cursor: "pointer", padding: 0, transition: "all 0.3s" }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => { prev(); resetTimer(); }}
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#aaa", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s" }}
              onMouseOver={e => { e.currentTarget.style.background = "#242424"; e.currentTarget.style.color = "#fff"; }}
              onMouseOut={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#aaa"; }}
            >←</button>
            <button onClick={() => { next(); resetTimer(); }}
              style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", color: "#aaa", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "0.9rem", transition: "all 0.2s" }}
              onMouseOver={e => { e.currentTarget.style.background = "#242424"; e.currentTarget.style.color = "#fff"; }}
              onMouseOut={e => { e.currentTarget.style.background = "#1a1a1a"; e.currentTarget.style.color = "#aaa"; }}
            >→</button>
          </div>
        </div>

        {/* Link Google Maps */}
        <div style={{ marginTop: 20, textAlign: "center" }}>
          <a href="https://maps.app.goo.gl/jb8gZ47kAM6pBBT59" target="_blank" rel="noopener"
            style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "#444", textDecoration: "none", borderBottom: "1px solid #2a2a2a", paddingBottom: 2, transition: "color 0.2s" }}
            onMouseOver={e => e.currentTarget.style.color = "#aaa"}
            onMouseOut={e => e.currentTarget.style.color = "#444"}
          >
            Lihat semua ulasan di Google Maps →
          </a>
        </div>

      </div>
    </section>
  );
}