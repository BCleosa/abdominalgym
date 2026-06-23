const trainers = [
  {
    name: "Tyo",
    gender: "Pria",
    photo: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=500&q=80",
  },
  {
    name: "Elia",
    gender: "Wanita",
    photo: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=500&q=80",
  },
  {
    name: "Indah",
    gender: "Wanita",
    photo: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=500&q=80",
  },
];

export default function TrainerSection() {
  return (
    <section id="trainers" style={{ background: "transparent", padding: "50px 0 20px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 10 }}>Tim Pelatih</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em", color: "#f0ede8", lineHeight: 1 }}>
            Your Personal Coach<br />
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {trainers.map((t, i) => (
            <TrainerCard key={i} t={t} />
          ))}
        </div>

        <div style={{ marginTop: 20, padding: "20px 24px", background: "#0f0f0f", border: "1px solid #1e1e1e", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ color: "#555", fontSize: "0.825rem", fontWeight: 300 }}>
            Bisa pilih pelatih sesuai preferensimu — pria atau wanita.
          </p>
          <a href="#pricing" style={{ color: "#888", fontFamily: "var(--font-body)", fontSize: "0.8rem", textDecoration: "none", borderBottom: "1px solid #333", paddingBottom: 2, transition: "color 0.2s" }}
            onMouseOver={e => e.currentTarget.style.color = "#fff"}
            onMouseOut={e => e.currentTarget.style.color = "#888"}
          >
            Lihat harga PT →
          </a>
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
function TrainerCard({ t }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: "#0f0f0f", border: `1px solid ${hovered ? "#333" : "#1a1a1a"}`, overflow: "hidden", transition: "border-color 0.25s" }}
    >
      <div style={{ height: 300, overflow: "hidden", position: "relative" }}>
        <img src={t.photo} alt={t.name}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", filter: hovered ? "grayscale(0%) brightness(0.75)" : "grayscale(40%) brightness(0.55)", transition: "all 0.45s" }}
        />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "55%", background: "linear-gradient(to top, #0f0f0f, transparent)" }} />
        <div style={{ position: "absolute", top: 12, right: 12, background: "#0f0f0f", color: "#666", fontFamily: "var(--font-mono)", fontSize: "0.58rem", letterSpacing: "0.12em", textTransform: "uppercase", padding: "3px 9px", border: "1px solid #2a2a2a" }}>
          {t.gender}
        </div>
      </div>
      <div style={{ padding: "18px 20px" }}>
        <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.35rem", color: "#f0ede8", letterSpacing: "-0.02em", marginBottom: 4 }}>{t.name}</div>
        <div style={{ fontSize: "0.8rem", color: "#555", fontWeight: 300 }}>{t.spec}</div>
      </div>
    </div>
  );
}
