import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", phone: "", interest: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: "", phone: "", interest: "", message: "" });
  };

  return (
    <section id="contact" style={{ background: "var(--black)", padding: "100px 0", position: "relative" }}>
      <div className="h-line" style={{ position: "absolute", top: 0, left: 0, right: 0 }} />

      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>
          {/* Left: Info */}
          <div>
            <div className="section-eyebrow">Hubungi Kami</div>
            <h2 className="section-title" style={{ marginBottom: 24 }}>Siap<br /><em>Bergabung?</em></h2>
            <p style={{ color: "var(--gray-mid)", fontWeight: 300, lineHeight: 1.8, marginBottom: 40, fontSize: "0.95rem" }}>
              Kunjungi kami langsung, hubungi via WhatsApp, atau follow Instagram kami. Tim Abdominal Gym siap membantu.
            </p>

            {/* Contact info cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 40 }}>
              {[
                {
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                  label: "Alamat",
                  value: "Jl. Bhakti No. 90A Burikan, Kudus, Jawa Tengah",
                  href: "https://maps.google.com/?q=Jl.+Bhakti+No.+90A+Burikan+Kudus",
                },
                {
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.02 1.18 2 2 0 012 .02h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
                  label: "WhatsApp / Telepon",
                  value: "+62 823 2472 0045",
                  href: "https://wa.me/6282324720045",
                },
                {
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>,
                  label: "Instagram",
                  value: "@abdominalgym",
                  href: "https://instagram.com/abdominalgym",
                },
                {
                  icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                  label: "Jam Buka",
                  value: "Setiap Hari · 07:00 – 22:00 WIB",
                  href: null,
                },
              ].map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <div style={{ width: 36, height: 36, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: "var(--radius)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", flexShrink: 0 }}>
                    {c.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gray-mid)", marginBottom: 3 }}>{c.label}</div>
                    {c.href ? (
                      <a href={c.href} target="_blank" rel="noopener" style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.95rem", color: "var(--white)", textDecoration: "none", transition: "color 0.2s" }}
                        onMouseOver={e => e.currentTarget.style.color = "var(--accent)"}
                        onMouseOut={e => e.currentTarget.style.color = "var(--white)"}
                      >{c.value}</a>
                    ) : (
                      <div style={{ fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.95rem", color: "var(--white)" }}>{c.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Maps embed */}
            <div style={{ borderRadius: "var(--radius)", overflow: "hidden", border: "1px solid var(--gray-dark)" }}>
              <div style={{ background: "var(--dark2)", padding: "10px 16px", borderBottom: "1px solid var(--gray-dark)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gray-mid)" }}>📍 Lokasi di Maps</span>
                <a href="https://maps.google.com/?q=Jl.+Bhakti+No.+90A+Burikan+Kudus+Jawa+Tengah" target="_blank" rel="noopener"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--accent)", textDecoration: "none" }}>
                  Buka Maps →
                </a>
              </div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3960.2!2d110.8366!3d-6.8055!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwNDgnMTkuOCJTIDExMMKwNTAnMTEuOCJF!5e0!3m2!1sen!2sid!4v1234567890"
                width="100%"
                height="240"
                style={{ border: 0, display: "block", filter: "invert(90%) hue-rotate(180deg) grayscale(30%)" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Abdominal Gym Kudus"
              />
            </div>
          </div>

          {/* Right: Form */}
          <div style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", borderRadius: "var(--radius)", padding: "40px", position: "sticky", top: 100 }}>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "1.15rem", color: "var(--white)", marginBottom: 6 }}>Formulir Pendaftaran</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.1em", color: "var(--gray-mid)", marginBottom: 28 }}>
              Isi form — kami akan menghubungi dalam 24 jam
            </div>

            {sent && (
              <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.22)", borderRadius: "var(--radius)", padding: "12px 16px", marginBottom: 20, fontFamily: "var(--font-display)", fontWeight: 600, fontSize: "0.875rem", color: "var(--accent)" }}>
                ✓ Terima kasih! Kami akan segera menghubungi kamu via WhatsApp.
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="Nama kamu" />
              </div>
              <div className="form-group">
                <label className="form-label">Nomor WhatsApp *</label>
                <input className="form-input" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} required placeholder="+62 8xx-xxxx-xxxx" />
              </div>
              <div className="form-group">
                <label className="form-label">Tertarik Dengan</label>
                <select className="form-select" value={form.interest} onChange={e => setForm({...form, interest: e.target.value})}>
                  <option value="">Pilih...</option>
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
              <div className="form-group">
                <label className="form-label">Pesan (Opsional)</label>
                <textarea className="form-textarea" value={form.message} onChange={e => setForm({...form, message: e.target.value})} placeholder="Ceritakan target fitness kamu atau tanyakan apapun..." style={{ minHeight: 80 }} />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: "100%", justifyContent: "center", fontSize: "0.875rem" }}>
                Kirim via WhatsApp →
              </button>
              <div style={{ marginTop: 16, textAlign: "center" }}>
                <a href="https://wa.me/6282324720045" target="_blank" rel="noopener" style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.08em", color: "var(--gray-mid)", textDecoration: "none" }}>
                  atau langsung hubungi +62 823 2472 0045
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
