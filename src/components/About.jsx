import { useState } from "react";

function FeatureCard({ f }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ background: hovered ? "var(--dark2)" : "var(--dark)", padding: "32px 28px", cursor: "default", transition: "background 0.25s", position: "relative", overflow: "hidden" }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, width: hovered ? "100%" : 0, height: 2, background: "var(--accent)", transition: "width 0.4s ease" }} />
      <div style={{ fontSize: "1.6rem", marginBottom: 16 }}>{f.icon}</div>
      <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "0.95rem", color: "var(--white)", marginBottom: 10 }}>{f.title}</h3>
      <p style={{ fontSize: "0.825rem", color: "var(--gray-mid)", lineHeight: 1.65, fontWeight: 300 }}>{f.desc}</p>
    </div>
  );
}

export default function About() {
  const features = [
    { icon: "📍", title: "Lokasi Strategis", desc: "Jl. Bhakti No. 90A Burikan, Kudus — dekat dari pusat kota, mudah dijangkau dari berbagai arah." },
    { icon: "👥", title: "Pelatih Pria & Wanita", desc: "Tersedia pelatih pria dan wanita bersertifikat, siap membimbing program latihanmu secara personal." },
    { icon: "🕐", title: "Buka Setiap Hari", desc: "Operasional 07:00–22:00 WIB, 7 hari seminggu. Fleksibel mengikuti jadwal aktivitasmu." },
    { icon: "💪", title: "50+ Peralatan", desc: "Leg press, lat pulldown, treadmill, cable machine, dan puluhan alat gym profesional lainnya." },
  ];

  return (
    <section id="about" style={{ background: "var(--dark)", padding: "100px 0", position: "relative", overflow: "hidden" }}>
      <div className="h-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
      <div style={{ position: "absolute", right: -20, top: "50%", transform: "translateY(-50%)", fontFamily: "var(--font-display)", fontSize: "22vw", fontWeight: 800, color: "rgba(200,245,60,0.025)", lineHeight: 1, pointerEvents: "none", userSelect: "none", letterSpacing: "-0.05em" }}>2024</div>

      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "end", marginBottom: 64 }}>
          <div>
            <div className="section-eyebrow">Tentang Kami</div>
            <h2 className="section-title">Gym Modern<br /><em>Kota Kudus</em></h2>
          </div>
          <div>
            <p style={{ color: "var(--gray-light)", fontSize: "1rem", lineHeight: 1.8, fontWeight: 300, marginBottom: 20 }}>
              Abdominal Gym hadir sejak <strong style={{ color: "var(--white)" }}>Agustus 2024</strong> sebagai pusat kebugaran modern pertama yang berfokus pada kualitas di Kudus.
            </p>
            <p style={{ color: "var(--gray-mid)", fontSize: "0.9rem", lineHeight: 1.8, fontWeight: 300, marginBottom: 28 }}>
              Berlokasi di Jl. Bhakti No. 90A Burikan, Kudus — dekat dari pusat kota dengan fasilitas lengkap dan tim pelatih berdedikasi.
            </p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <a href="https://instagram.com/abdominalgym" target="_blank" rel="noopener" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--white)", textDecoration: "none", border: "1px solid rgba(255,255,255,0.22)", padding: "8px 16px", borderRadius: "var(--radius)", transition: "all 0.2s" }}
                onMouseOver={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
                onMouseOut={e => e.currentTarget.style.background = "transparent"}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                @abdominalgym
              </a>
              <a href="tel:+6282324720045" style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-mono)", fontSize: "0.7rem", letterSpacing: "0.1em", color: "var(--gray-light)", textDecoration: "none", border: "1px solid var(--gray-dark)", padding: "8px 16px", borderRadius: "var(--radius)", transition: "all 0.2s" }}
                onMouseOver={e => { e.currentTarget.style.borderColor = "var(--gray)"; e.currentTarget.style.color = "var(--white)"; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = "var(--gray-dark)"; e.currentTarget.style.color = "var(--gray-light)"; }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.02 1.18 2 2 0 012 .02h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                +62 823 2472 0045
              </a>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "var(--gray-dark)" }}>
          {features.map((f, i) => <FeatureCard key={i} f={f} />)}
        </div>

        <div style={{ marginTop: 48, padding: "40px", background: "var(--dark2)", border: "1px solid var(--gray-dark)", display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.2em", color: "var(--white)", marginBottom: 8, textTransform: "uppercase" }}>Didirikan</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "2.8rem", fontWeight: 800, color: "var(--white)", lineHeight: 1, letterSpacing: "-0.03em" }}>AGUSTUS<br />2024</div>
          </div>
          <div style={{ width: 1, height: 80, background: "var(--gray-dark)", flexShrink: 0 }} />
          <div style={{ flex: 3, minWidth: 200 }}>
            <p style={{ color: "var(--gray-light)", fontSize: "0.95rem", lineHeight: 1.8, fontWeight: 300 }}>
              Berangkat dari mimpi membangun gym yang terjangkau namun berkualitas di Kudus, Abdominal Gym kini menjadi tempat latihan pilihan warga Kudus dan sekitarnya. Dengan peralatan lengkap dan tim pelatih berdedikasi, kami hadir untuk mendampingi perjalanan fitness setiap member.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
