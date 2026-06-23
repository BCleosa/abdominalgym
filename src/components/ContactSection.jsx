import { useState, useEffect } from "react";
import { api } from "../utils/api";
import MemberIdCard from "./MemberIdCard";

const fmt = (n) => "Rp " + Number(n).toLocaleString("id-ID");
const ADMIN_FEE = 20000;

const PAKET_OPTIONS = [
  { value: "Monthly", label: "Monthly 1 Bulan", price: 160000 },
  { value: "Silver", label: "Silver 3 Bulan", price: 420000 },
  { value: "Gold", label: "Gold 6 Bulan", price: 730000 },
  { value: "Platinum", label: "Platinum 12 Bulan", price: 1240000 },
];

const PAKET_PT_OPTIONS = [
  { value: "Trial", label: "1 Day Trial", price: 150000 },
  { value: "8x", label: "8× Coaching", price: 700000 },
  { value: "12x", label: "12× Coaching", price: 950000 },
  { value: "16x", label: "16× Coaching", price: 1200000 },
];

const emptyForm = {
  nama: "", noHp: "", jenisKelamin: "Perempuan", paket: "Monthly",
  pakaiPelatih: false, pelatihDiminta: "", paketPT: "8x", metodeBayar: "ditempat",
};

export default function ContactSection() {
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [result, setResult] = useState(null);
  const [pelatihInfo, setPelatihInfo] = useState(null);
  const [qrisConfirmed, setQrisConfirmed] = useState(false);

  useEffect(() => {
    if (form.pakaiPelatih && !pelatihInfo) {
      api.get("/public/pelatih-tersedia").then(setPelatihInfo).catch(() => {});
    }
  }, [form.pakaiPelatih]);

  const inputStyle = {
    width: "100%", background: "#161616", border: "1px solid #222",
    color: "#f0ede8", fontFamily: "var(--font-body)", fontSize: "0.875rem",
    padding: "10px 14px", outline: "none", transition: "border-color 0.2s",
  };
  const labelStyle = {
    display: "block", fontFamily: "var(--font-mono)", fontSize: "0.6rem",
    letterSpacing: "0.15em", textTransform: "uppercase", color: "#444", marginBottom: 6,
  };

  const pkg = PAKET_OPTIONS.find(p => p.value === form.paket);
  const ptPkg = form.pakaiPelatih ? PAKET_PT_OPTIONS.find(p => p.value === form.paketPT) : null;
  const total = (pkg?.price || 0) + ADMIN_FEE + (ptPkg?.price || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setErrMsg(""); setResult(null); setQrisConfirmed(false);
    try {
      const data = await api.post("/public/daftar", form);
      setResult(data);
      setForm(emptyForm);
    } catch (err) {
      setErrMsg(err.message || "Gagal mendaftar. Coba lagi.");
    }
    setLoading(false);
  };

  const contacts = [
    { label: "Alamat", val: "Jl. Bhakti No. 90A Burikan, Kudus, Jawa Tengah", href: "https://maps.google.com/?q=Jl+Bhakti+90A+Burikan+Kudus" },
    { label: "WhatsApp", val: "+62 823 2472 0045", href: "https://wa.me/6282324720045" },
    { label: "Instagram", val: "@abdominalgym", href: "https://instagram.com/abdominalgym" },
    { label: "Jam Buka", val: "Setiap hari · 07.00 – 22.00 WIB", href: null },
  ];

  return (
    <section id="contact" style={{ background: "transparent", padding: "50px 0 40px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 28px" }}>

        <div style={{ marginBottom: 28 }}>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#555", marginBottom: 10 }}>Daftar Online</p>
          <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.5rem)", letterSpacing: "-0.02em", color: "#f0ede8", lineHeight: 1 }}>
            Join Us Today
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>

          {/* Kiri — Info & Maps */}
          <div>
            <div style={{ marginBottom: 36 }}>
              {contacts.map((c, i) => (
                <div key={i} style={{ display: "flex", padding: "16px 0", borderBottom: "1px solid #151515" }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444", width: 100, paddingTop: 2, flexShrink: 0 }}>
                    {c.label}
                  </div>
                  {c.href ? (
                    <a href={c.href} target="_blank" rel="noopener"
                      style={{ fontSize: "0.875rem", color: "#aaa", textDecoration: "none", lineHeight: 1.5, transition: "color 0.2s" }}
                      onMouseOver={e => e.currentTarget.style.color = "#fff"}
                      onMouseOut={e => e.currentTarget.style.color = "#aaa"}
                    >{c.val}</a>
                  ) : (
                    <span style={{ fontSize: "0.875rem", color: "#aaa", lineHeight: 1.5 }}>{c.val}</span>
                  )}
                </div>
              ))}
            </div>

            <div style={{ border: "1px solid #1a1a1a", overflow: "hidden" }}>
              <div style={{ background: "#0f0f0f", padding: "9px 14px", borderBottom: "1px solid #1a1a1a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "#444" }}>Lokasi</span>
                <a href="https://maps.google.com/?q=Jl+Bhakti+90A+Burikan+Kudus" target="_blank" rel="noopener"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", letterSpacing: "0.1em", color: "#666", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseOver={e => e.currentTarget.style.color = "#fff"}
                  onMouseOut={e => e.currentTarget.style.color = "#666"}
                >Buka di Maps →</a>
              </div>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3961.734113961124!2d110.8518716!3d-6.802166!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e70c5a1c14c0cbf%3A0xd3fbc01690aca6f9!2sAbdominal%20Gym!5e0!3m2!1sid!2sid!4v1780473718204!5m2!1sid!2sid"
                width="100%" height="220"
                style={{ border: 0, display: "block", filter: "grayscale(100%) invert(92%) contrast(90%) brightness(0.4)" }}
                allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi Abdominal Gym Kudus"
              />
            </div>
          </div>

          {/* Kanan — Form Pendaftaran */}
          <div style={{ background: "#0f0f0f", border: "1px solid #1a1a1a", padding: "32px 28px" }}>

            {result ? (
              result.metodeBayar === "qris" && !qrisConfirmed ? (
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.15rem", color: "#f0ede8", marginBottom: 10 }}>
                    Selesaikan Pembayaran
                  </div>
                  <p style={{ fontSize: "0.875rem", color: "#999", fontWeight: 300, lineHeight: 1.6, marginBottom: 16 }}>
                    Halo {result.nama}, scan QRIS di bawah untuk membayar. Kartu member kamu akan muncul setelah pembayaran selesai.
                  </p>

                  <div style={{ background: "#161616", border: "1px solid #2a2a2a", padding: "16px 18px", marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.825rem", color: "#999", marginBottom: 6 }}>
                      <span>Paket {result.paket}</span><span>{fmt(result.biayaPaket)}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.825rem", color: "#999", marginBottom: 10 }}>
                      <span>Biaya admin (pendaftaran baru)</span><span>{fmt(result.biayaAdmin)}</span>
                    </div>
                    {result.pakaiPelatih && result.biayaPT > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.825rem", color: "#999", marginBottom: 10 }}>
                        <span>Paket PT {result.paketPT}</span><span>{fmt(result.biayaPT)}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "#f0ede8", borderTop: "1px solid #2a2a2a", paddingTop: 10 }}>
                      <span>Total</span><span>{fmt(result.totalBayar)}</span>
                    </div>
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <p style={{ fontSize: "0.8rem", color: "#777", marginBottom: 10 }}>Scan QRIS berikut untuk membayar:</p>
                    <img src="/qris.jpg" alt="QRIS Abdominal Gym" style={{ width: "100%", maxWidth: 220, display: "block" }}
                      onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }} />
                    <p style={{ display: "none", fontSize: "0.78rem", color: "#777" }}>QRIS belum tersedia saat ini, silakan konfirmasi metode bayar lain ke admin.</p>
                  </div>

                  <button onClick={() => setQrisConfirmed(true)} style={{
                    width: "100%", background: "#fff", color: "#080808",
                    fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.875rem",
                    padding: "12px", border: "none", cursor: "pointer",
                  }}>
                    Saya Sudah Bayar →
                  </button>
                </div>
              ) : (
              <div>
                {result.status === "aktif" ? (
                  <>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.15rem", color: "#81c784", marginBottom: 10 }}>
                      Selamat, Anda Sudah Menjadi Member! 🎉
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "#9bbf9b", fontWeight: 300, lineHeight: 1.6, marginBottom: 16 }}>
                      Halo {result.nama}, pendaftaran kamu langsung aktif. Simpan kartu member di bawah ini, tunjukkan QR-nya saat check-in di gym.
                    </p>
                  </>
                ) : (
                  <>
                    <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.15rem", color: "#f0c040", marginBottom: 10 }}>
                      Pendaftaran Berhasil Dikirim ✓
                    </div>
                    <p style={{ fontSize: "0.875rem", color: "#b0a060", fontWeight: 300, lineHeight: 1.6, marginBottom: 16 }}>
                      Halo {result.nama}, status kamu masih menunggu pembayaran di tempat. Silakan datang & bayar paling lambat <strong>{result.batasBayar}</strong>, kartu member akan aktif sepenuhnya setelah pembayaran berhasil
                    </p>
                  </>
                )}

                <div style={{ background: "#161616", border: "1px solid #2a2a2a", padding: "16px 18px", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.825rem", color: "#999", marginBottom: 6 }}>
                    <span>Paket {result.paket}</span><span>{fmt(result.biayaPaket)}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.825rem", color: "#999", marginBottom: 10 }}>
                    <span>Biaya admin (pendaftaran baru)</span><span>{fmt(result.biayaAdmin)}</span>
                  </div>
                  {result.pakaiPelatih && result.biayaPT > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.825rem", color: "#999", marginBottom: 10 }}>
                      <span>Paket PT {result.paketPT}</span><span>{fmt(result.biayaPT)}</span>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1rem", color: "#f0ede8", borderTop: "1px solid #2a2a2a", paddingTop: 10 }}>
                    <span>Total</span><span>{fmt(result.totalBayar)}</span>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <MemberIdCard id={result.id} nama={result.nama} paket={result.paket} tanggalAkhir={result.tanggalAkhir} />
                </div>

                <a href={`https://wa.me/6282324720045?text=${encodeURIComponent(`Halo Admin Abdominal Gym, saya ${result.nama} sudah daftar online paket ${result.paket}.`)}`}
                  target="_blank" rel="noopener"
                  style={{ display: "block", textAlign: "center", background: "#fff", color: "#080808", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.875rem", padding: "12px", textDecoration: "none" }}>
                  Hubungi Admin via WhatsApp →
                </a>

                <button onClick={() => { setResult(null); setQrisConfirmed(false); }} style={{ display: "block", width: "100%", marginTop: 10, background: "none", border: "1px solid #2a2a2a", color: "#777", fontFamily: "var(--font-body)", fontSize: "0.8rem", padding: "10px", cursor: "pointer" }}>
                  Daftar lagi
                </button>
              </div>
              )
            ) : (
              <>
                <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.1rem", color: "#f0ede8", marginBottom: 4 }}>
                  Daftar jadi Member
                </div>
                <p style={{ fontSize: "0.8rem", color: "#555", fontWeight: 300, marginBottom: 24, lineHeight: 1.6 }}>
                  Isi data di bawah ini, status member kamu aktif setelah admin konfirmasi pembayaran.
                </p>

                {errMsg && (
                  <div style={{ background: "#1f0f0f", border: "1px solid #3a1a1a", padding: "10px 14px", marginBottom: 18, fontSize: "0.825rem", color: "#e57373" }}>
                    {errMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Nama Lengkap</label>
                    <input value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} required placeholder="Sesuai KTP/identitas"
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = "#444"}
                      onBlur={e => e.target.style.borderColor = "#222"}
                    />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                    <div>
                      <label style={labelStyle}>Nomor HP / WA</label>
                      <input value={form.noHp} onChange={e => setForm({ ...form, noHp: e.target.value })} required placeholder="08xx-xxxx-xxxx"
                        style={inputStyle}
                        onFocus={e => e.target.style.borderColor = "#444"}
                        onBlur={e => e.target.style.borderColor = "#222"}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Jenis Kelamin</label>
                      <select value={form.jenisKelamin} onChange={e => setForm({ ...form, jenisKelamin: e.target.value })}
                        style={{ ...inputStyle, appearance: "none" }}>
                        <option>Perempuan</option>
                        <option>Laki-laki</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <label style={labelStyle}>Paket Membership</label>
                    <select value={form.paket} onChange={e => setForm({ ...form, paket: e.target.value })}
                      style={{ ...inputStyle, appearance: "none" }}>
                      {PAKET_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label} ({fmt(p.price)})</option>)}
                    </select>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "0.8rem", color: "#aaa" }}>
                      <input type="checkbox" checked={form.pakaiPelatih} onChange={e => setForm({ ...form, pakaiPelatih: e.target.checked })} />
                      Mau pakai Personal Trainer juga? (opsional)
                    </label>
                    {form.pakaiPelatih && (
                      <div style={{ marginTop: 10 }}>
                        {pelatihInfo && (
                          <p style={{ fontSize: "0.75rem", color: "#777", marginBottom: 8, lineHeight: 1.6 }}>
                            Sisa slot pelatih saat ini: <strong style={{ color: "#aaa" }}>{pelatihInfo.slotLakiLaki}</strong> untuk Laki-laki, <strong style={{ color: "#aaa" }}>{pelatihInfo.slotPerempuan}</strong> untuk Perempuan.
                          </p>
                        )}
                        <select value={form.pelatihDiminta} onChange={e => setForm({ ...form, pelatihDiminta: e.target.value })}
                          style={{ ...inputStyle, appearance: "none", color: form.pelatihDiminta ? "#f0ede8" : "#555" }}>
                          <option value="">Tidak ada preferensi</option>
                          {pelatihInfo?.daftarLakiLaki?.map(n => <option key={n} value={n}>{n} (Laki-laki)</option>)}
                          {pelatihInfo?.daftarPerempuan?.map(n => <option key={n} value={n}>{n} (Perempuan)</option>)}
                        </select>
                        <div style={{ marginTop: 10 }}>
                          <label style={labelStyle}>Paket Personal Trainer</label>
                          <select value={form.paketPT} onChange={e => setForm({ ...form, paketPT: e.target.value })}
                            style={{ ...inputStyle, appearance: "none" }}>
                            {PAKET_PT_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label} ({fmt(p.price)})</option>)}
                          </select>
                        </div>
                        <p style={{ fontSize: "0.72rem", color: "#555", marginTop: 6, fontWeight: 300 }}>
                          Jadwal sesi PT akan dibahas langsung dengan admin/pelatih.
                        </p>
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={labelStyle}>Metode Pembayaran</label>
                    <div style={{ display: "flex", gap: 10 }}>
                      {[["ditempat", "Bayar di Tempat"], ["qris", "QRIS"]].map(([val, lbl]) => (
                        <label key={val} style={{
                          flex: 1, textAlign: "center", padding: "10px", cursor: "pointer",
                          border: `1px solid ${form.metodeBayar === val ? "#fff" : "#222"}`,
                          color: form.metodeBayar === val ? "#fff" : "#777",
                          fontSize: "0.8rem", fontFamily: "var(--font-body)",
                        }}>
                          <input type="radio" name="metodeBayar" value={val} checked={form.metodeBayar === val}
                            onChange={() => setForm({ ...form, metodeBayar: val })}
                            style={{ display: "none" }} />
                          {lbl}
                        </label>
                      ))}
                    </div>
                    <p style={{ fontSize: "0.7rem", color: "#555", marginTop: 8, fontWeight: 300 }}>
                      {form.metodeBayar === "qris"
                        ? "Bayar via QRIS, member langsung aktif."
                        : "Bayar di tempat, status menunggu aktif maksimal 1 hari sejak daftar."}
                    </p>
                  </div>

                  <div style={{ background: "#161616", border: "1px solid #2a2a2a", padding: "12px 16px", marginBottom: 18, fontSize: "0.8rem", color: "#999" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: ptPkg ? 4 : 0 }}>
                      <span>Paket {pkg?.label} + admin {fmt(ADMIN_FEE)}</span>
                      <span>{fmt((pkg?.price || 0) + ADMIN_FEE)}</span>
                    </div>
                    {ptPkg && (
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span>Paket PT {ptPkg.label}</span>
                        <span>{fmt(ptPkg.price)}</span>
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, color: "#f0ede8", borderTop: "1px solid #2a2a2a", marginTop: 8, paddingTop: 8 }}>
                      <span>Total</span>
                      <span>{fmt(total)}</span>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} style={{
                    width: "100%", background: "#fff", color: "#080808",
                    fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "0.875rem",
                    padding: "12px", border: "none", cursor: loading ? "default" : "pointer",
                    opacity: loading ? 0.6 : 1, transition: "opacity 0.2s",
                  }}>
                    {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
                  </button>

                  <p style={{ marginTop: 10, fontSize: "0.7rem", color: "#444", fontWeight: 300 }}>
                    Biaya admin Rp 20.000 hanya untuk pendaftaran baru, tidak dikenakan saat perpanjang.
                  </p>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}