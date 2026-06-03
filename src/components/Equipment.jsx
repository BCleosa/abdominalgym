import { useState } from "react";

function EquipCard({ item }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ background: "var(--dark2)", border: `1px solid ${hovered ? "var(--accent)" : "var(--gray-dark)"}`, overflow: "hidden", transition: "all 0.25s", transform: hovered ? "translateY(-4px)" : "translateY(0)", borderRadius: "var(--radius)" }}>
      <div style={{ height: 200, overflow: "hidden", position: "relative", background: "var(--dark3)" }}>
        <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", transform: hovered ? "scale(1.07)" : "scale(1)", filter: "grayscale(20%) brightness(0.7)" }} />
        <div style={{ position: "absolute", top: 12, right: 12, background: "var(--accent)", color: "var(--black)", fontFamily: "var(--font-mono)", fontWeight: 500, fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", padding: "4px 10px", borderRadius: "20px" }}>{item.category}</div>
      </div>
      <div style={{ padding: "20px" }}>
        <h3 style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--white)", marginBottom: 6, letterSpacing: "-0.01em" }}>{item.name}</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--gray-mid)", lineHeight: 1.6, fontWeight: 300 }}>{item.desc}</p>
      </div>
    </div>
  );
}

export default function Equipment() {
  const equipment = [
    { name: "Leg Press", category: "Lower Body", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80", desc: "Melatih otot quadriceps, hamstring, dan glutes secara efektif dengan beban yang bisa disesuaikan." },
    { name: "Lat Pulldown", category: "Upper Body", image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600&q=80", desc: "Alat pull-down untuk melatih otot punggung atas (latissimus dorsi) dan bicep." },
    { name: "Treadmill", category: "Cardio", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80", desc: "Lari atau jalan santai di atas treadmill motorized dengan monitor kecepatan dan kalori." },
    { name: "Cable Machine", category: "Functional", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80", desc: "Mesin kabel serbaguna untuk latihan chest fly, tricep pushdown, row, dan banyak variasi lain." },
    { name: "Dumbbell & Barbell", category: "Free Weight", image: "https://images.unsplash.com/photo-1540496905036-5937c10647cc?w=600&q=80", desc: "Area free weight lengkap dengan dumbbell berbagai ukuran dan barbel untuk compound movement." },
    { name: "Bench Press", category: "Chest", image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&q=80", desc: "Bangku press flat dan incline untuk melatih otot dada, bahu anterior, dan tricep." },
    { name: "Rowing Machine", category: "Cardio", image: "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=600&q=80", desc: "Full body cardio dengan dampak rendah pada sendi. Efektif untuk pembakaran kalori tinggi." },
    { name: "Smith Machine", category: "Multi", image: "https://images.unsplash.com/photo-1590487988256-9ed24133863e?w=600&q=80", desc: "Alat serba guna untuk squat, shoulder press, dan berbagai gerakan compound dengan jalur terkontrol." },
  ];

  return (
    <section id="equipment" style={{ background: "var(--dark)", padding: "100px 0", position: "relative" }}>
      <div className="h-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />
      <div style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: "25%", height: "60%", background: "radial-gradient(ellipse at left, rgba(255,255,255,0.04), transparent 70%)", pointerEvents: "none" }} />

      <div className="container">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 56, flexWrap: "wrap", gap: 24 }}>
          <div>
            <div className="section-eyebrow">Fasilitas Lengkap</div>
            <h2 className="section-title">Peralatan<br /><em>Gym Kami</em></h2>
          </div>
          <p style={{ color: "var(--gray-mid)", maxWidth: 360, fontWeight: 300, lineHeight: 1.75, fontSize: "0.9rem" }}>
            50+ peralatan gym profesional untuk melatih seluruh kelompok otot. Kondisi terawat, selalu siap pakai.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
          {equipment.map((item, i) => <EquipCard key={i} item={item} />)}
        </div>

        {/* Photo placeholder note */}
        <div style={{ marginTop: 40, padding: "32px", background: "var(--dark2)", border: "1px dashed var(--gray-dark)", borderRadius: "var(--radius)", textAlign: "center" }}>
          <div style={{ fontSize: "2rem", marginBottom: 12 }}>📷</div>
          <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "var(--gray-light)", marginBottom: 8 }}>Tambahkan Foto Asli Alat Gym Kamu</div>
          <p style={{ fontSize: "0.825rem", color: "var(--gray-mid)", fontWeight: 300 }}>
            Ganti URL gambar di <code style={{ color: "var(--accent)", background: "var(--dark3)", padding: "2px 8px", borderRadius: 3, fontSize: "0.8rem" }}>Equipment.jsx</code> dengan foto nyata peralatan gym Abdominal Gym
          </p>
        </div>
      </div>
    </section>
  );
}
