import { useState } from "react";

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", phone: "", interest: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Buka WhatsApp langsung dengan pesan
    const msg = `Halo Abdominal Gym! Nama saya ${form.name}, nomor HP ${form.phone}. Saya tertarik dengan ${form.interest || "informasi gym"}.`;
    window.open(`https://wa.me/6282324720045?text=${encodeURIComponent(msg)}`, "_blank");
    setSent(true);
    setTimeout(() => setSent(false), 3000);
    setForm({ name: "", phone: "", interest: "" });
  };

  return (
    <section id="contact" style={{ background: "#0a0a0a", padding: "90px 0" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>

        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 10 }}>Hubungi Kami</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em", color: "#f0ede8", lineHeight: 1 }}>
            Join Us Today <br />
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>

          {/* Info kiri */}
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 36 }}>
              {[
                { label: "Alamat", val: "Jl. Bhakti No. 90A Burikan, Kudus, Jawa Tengah", href: "https://maps.google.com/?q=Jl+Bhakti+90A+Burikan+Kudus" },
                { label: "WhatsApp", val: "+62 823 2472 0045", href: "https://wa.me/6282324720045" },
                { label: "Instagram", val: "@abdominalgym", href: "https://instagram.com/abdominalgym" },
                { label: "Jam Buka", val: "Setiap hari · 07.00 – 22.00 WIB", href: null },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 0, padding: "16px 0", borderBottom: "1px solid #151515" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", width: 100, paddingTop: 2, flexShrink: 0 }}>{c.label}</div>
                  {c.href ? (
                    <a href={c.href} target="_blank" rel="noopener" style={{ fontSize: "0.875rem", color: "#aaa", textDecoration: "none", fontWeight: 400, transition: "color 0.2s", lineHeight: 1.5 }}
                      onMouseOver={e => e.currentTarget.style.color = "#fff"}
                      onMouseOut={e => e.currentTarget.style.color = "#aaa"}
                    >{c.val}</a>
                  ) : (
                    <span style={{ fontSize: "0.875rem", color: "#aaa", lineHeight: 1.5 }}>{c.val}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Maps */}
            <div style={{ border: "1px solid #1a1a1a", overflow: "hidden" }}>
              <div style={{ background: "#0f0f0f", padding: "9px 14px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444" }}>Lokasi</span>
                <a href="https://maps.google.com/?q=Jl+Bhakti+90A+Burikan+Kudus" target="_blank" rel="noopener"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", color: "#666", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.color = "#fff"}
                  onMouseOut={e => e.currentTarget.style.color = "#666"}
                >
                  Buka di Maps →
                </a>
              </div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.734113961124!2d110.8518716!3d-6.802166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e70c5a1c14c0cbf%3A0xd3fbc01690aca6f9!2sAbdominal%20Gym!5e0!3m2!1sid!2sid!4v1780473718204!5m2!1sid!2sid"
                width="100%"
                height="220"
                style={{ border: 0, display: "block", filter: "grayscale(100%) invert(92%) contrast(90%) brightness(0.4)" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Abdominal Gym Kudus"
              />
            </div>
          </div>

          {/* Form kanan */}
          <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "32px 28px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "#f0ede8", marginBottom: 4, letterSpacing: "-0.01em" }}>
              Kirim pesan
            </div>
            <p style={{ fontSize: "0.8rem", color: "#555", fontWeight: 300, marginBottom: 24, lineHeight: 1.6 }}>
              Isi form — langsung terhubung ke WhatsApp kami.
            </p>

            {sent && (
              <div style={{ background: "#0f1f0f", border: "1px solid #1a3a1a", padding: "10px 14px", marginBottom: 18, fontSize: "0.825rem", color: "#4caf50" }}>
                Berhasil dikirim ke WhatsApp ✓
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#444", marginBottom: 6 }}>Nama</label>
                <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Nama kamu"
                  style={{ width: "100%", background: "#161616", border: "1px solid #222", color: "#f0ede8", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "10px 14px", outline: "none", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#444"}
                  onBlur={e => e.target.style.borderColor = "#222"}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#444", marginBottom: 6 }}>Nomor HP / WA</label>
                <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required placeholder="08xx-xxxx-xxxx"
                  style={{ width: "100%", background: "#161616", border: "1px solid #222", color: "#f0ede8", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "10px 14px", outline: "none", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#444"}
                  onBlur={e => e.target.style.borderColor = "#222"}
                />
              </div>
              <div style={{ marginBottom: 22 }}>
                <label style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "#444", marginBottom: 6 }}>Tertarik dengan</label>
                <select value={form.interest} onChange={e => setForm({...form, interest: e.target.value})}
                  style={{ width: "100%", background: "#161616", border: "1px solid #222", color: form.interest ? "#f0ede8" : "#555", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "10px 14px", outline: "none", transition: "border-color 0.2s", appearance: "none" }}
                  onFocus={e => e.target.style.borderColor = "#444"}
                  onBlur={e => e.target.style.borderColor = "#222"}
                >
                  <option value="">Pilih paket...</option>
                  <option>Insidentil (Rp 30.000)</option>
                  <option>Monthly (Rp 160.000/bln)</option>
                  <option>Silver 3 Bulan (Rp 420.000)</option>
                  <option>Gold 6 Bulan (Rp 730.000)</option>
                  <option>Platinum 12 Bulan (Rp 1.240.000)</option>
                  <option>Personal Training - Trial (Rp 150.000)</option>
                  <option>Personal Training - 8× (Rp 600.000)</option>
                  <option>Personal Training - 12× (Rp 800.000)</option>
                  <option>Personal Training - 16× (Rp 1.000.000)</option>
                </select>
              </div>
              <button type="submit" style={{
                width: "100%", background: "#fff", color: "#080808",
                fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.875rem",
                padding: "12px", border: "none", cursor: "pointer",
                transition: "opacity 0.2s",
              }}
              onMouseOver={e => e.currentTarget.style.opacity = "0.85"}
              onMouseOut={e => e.currentTarget.style.opacity = "1"}
              >
                Kirim via WhatsApp →
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
