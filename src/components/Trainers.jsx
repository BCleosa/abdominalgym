import { useState } from "react";

const trainers = [
  {
    name: "Tyo",
    gender: "♂ Pria",
    role: "Head Trainer",
    spec: "Strength & Conditioning",
    bio: "Pelatih utama Abdominal Gym dengan keahlian di bidang strength training dan body conditioning. Tyo juga merangkap sebagai karyawan jaga harian.",
    color: "#5ba3d9",
    photo: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=400&q=80",
  },
  {
    name: "Elia",
    gender: "♀ Wanita",
    role: "Personal Trainer",
    spec: "Fat Loss & Toning",
    bio: "Pelatih wanita berdedikasi yang spesialis dalam program penurunan berat badan dan pembentukan tubuh. Elia sangat sabar dan suportif untuk member baru.",
    color: "#f48fb1",
    photo: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=400&q=80",
  },
  {
    name: "Indah",
    gender: "♀ Wanita",
    role: "Personal Trainer",
    spec: "Cardio & Flexibility",
    bio: "Pelatih wanita energetik yang ahli dalam program kardio dan fleksibilitas. Indah cocok untuk kamu yang ingin meningkatkan stamina dan kebugaran umum.",
    color: "#a5d6a7",
    photo: "https://images.unsplash.com/photo-1548690312-e3b507d8c110?w=400&q=80",
  },
];

export default function Trainers() {
  const [active, setActive] = useState(0);

  const ptPackages = [
    { label: "1 Day Trial", price: "Rp 150.000" },
    { label: "8× Coaching", price: "Rp 600.000" },
    { label: "12× Coaching", price: "Rp 800.000" },
    { label: "16× Coaching", price: "Rp 1.000.000" },
  ];

  return (
    <section id="trainers" style={{ background: "var(--black)", padding: "100px 0", position: "relative", overflow: "hidden" }}>
      <div className="h-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />

      {/* BG text */}
      <div style={{ position: "absolute", right: -40, bottom: -20, fontFamily: "var(--font-display)", fontSize: "18vw", fontWeight: 800, color: "rgba(200,245,60,0.025)", lineHeight: 1, pointerEvents: "none", userSelect: "none", letterSpacing: "-0.05em" }}>TRAINER</div>

      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56, flexWrap: "wrap", gap: 24 }}>
          <div>
            <div className="section-eyebrow">Tim Pelatih</div>
            <h2 className="section-title">Pelatih Pria<br /><em>& Wanita</em></h2>
          </div>
          <p style={{ color: "var(--gray-mid)", maxWidth: 360, fontWeight: 300, lineHeight: 1.75, fontSize: "0.9rem" }}>
            3 pelatih berdedikasi — 2 pelatih wanita dan 1 pelatih pria — siap membimbing latihanmu sesuai target.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: "var(--gray-dark)", marginBottom: 48 }}>
          {trainers.map((t, i) => (
            <div key={i} onClick={() => setActive(i)}
              style={{
                background: active === i ? "var(--dark3)" : "var(--dark2)",
                cursor: "pointer", position: "relative", transition: "background 0.25s", overflow: "hidden",
              }}>
              {active === i && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: t.color }} />}

              {/* Photo */}
              <div style={{ height: 280, overflow: "hidden", position: "relative" }}>
                <img src={t.photo} alt={t.name} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", filter: active === i ? "grayscale(0%) brightness(0.8)" : "grayscale(60%) brightness(0.5)", transition: "all 0.4s" }} />
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", background: "linear-gradient(to top, var(--dark3), transparent)" }} />
                {/* Gender badge */}
                <div style={{ position: "absolute", top: 14, right: 14, background: active === i ? t.color : "var(--dark3)", color: active === i ? "var(--black)" : "var(--gray-mid)", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", padding: "4px 10px", borderRadius: "20px", transition: "all 0.3s" }}>
                  {t.gender}
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: "24px" }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: t.color, marginBottom: 4 }}>{t.role}</div>
                <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.4rem", letterSpacing: "-0.02em", color: "var(--white)", marginBottom: 4 }}>{t.name}</h3>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.85rem", color: "var(--gray-mid)", marginBottom: active === i ? 16 : 0 }}>{t.spec}</div>

                {active === i && (
                  <div style={{ borderTop: "1px solid var(--gray-dark)", paddingTop: 16 }}>
                    <p style={{ fontSize: "0.825rem", color: "var(--gray-light)", lineHeight: 1.7, fontWeight: 300 }}>{t.bio}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* PT Pricing table */}
        <div style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", borderRadius: "var(--radius)", overflow: "hidden" }}>
          <div style={{ background: "var(--dark3)", padding: "20px 28px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--accent)" }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--white)", marginBottom: 4 }}>Paket Personal Training</div>
              <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.1rem", color: "var(--white)" }}>Harga Sesi Pelatih Pilihan</div>
            </div>
            <a href="#contact" className="btn btn-primary" style={{ textDecoration: "none", fontSize: "0.78rem", padding: "10px 20px" }}>Booking PT →</a>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
            {ptPackages.map((pkg, i) => (
              <div key={i} style={{ padding: "24px", borderRight: i < ptPackages.length - 1 ? "1px solid var(--gray-dark)" : "none", textAlign: "center" }}>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.3rem", color: "var(--white)", letterSpacing: "-0.02em", marginBottom: 6 }}>{pkg.price}</div>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.875rem", color: "var(--white)", marginBottom: 4 }}>{pkg.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
