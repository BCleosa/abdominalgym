import { useState } from "react";
import { initialFinances } from "../../data/initialData";
import { SearchBar, Modal, ConfirmModal, EmptyState, FormActions } from "./CrudComponents";

const STORAGE_KEY = "gym_finances";
const emptyForm = {
  date: new Date().toISOString().split("T")[0],
  type: "pemasukan", category: "Iuran Member",
  description: "", amount: "", method: "Transfer"
};

const incomeCategories = ["Iuran Member","Personal Training","Group Class","Merchandise","Sewa Fasilitas","Lain-lain"];
const expenseCategories = ["Gaji","Operasional","Perawatan","Pembelian Alat","Marketing","Kebersihan","Utilitas","Lain-lain"];
const methods = ["Transfer","Cash","QRIS","Kartu Debit","Kartu Kredit"];

const fmt = (n) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);

export default function FinancePage() {
  const [records, setRecords] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || initialFinances; } catch { return initialFinances; }
  });
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Semua");
  const [filterMonth, setFilterMonth] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const save = (data) => { setRecords(data); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); };
  const openAdd = (type = "pemasukan") => {
    setForm({ ...emptyForm, type });
    setEditId(null);
    setShowModal(true);
  };
  const openEdit = (r) => { setForm({...r, amount: r.amount.toString()}); setEditId(r.id); setShowModal(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    const processed = { ...form, amount: parseFloat(form.amount) || 0 };
    if (editId) {
      save(records.map(r => r.id === editId ? { ...processed, id: editId } : r));
    } else {
      save([{ ...processed, id: Math.max(0, ...records.map(r => r.id)) + 1 }, ...records]);
    }
    setShowModal(false);
  };

  const filtered = records.filter(r => {
    const matchSearch = r.description.toLowerCase().includes(search.toLowerCase()) || r.category.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "Semua" || r.type === filterType;
    const matchMonth = !filterMonth || r.date.startsWith(filterMonth);
    return matchSearch && matchType && matchMonth;
  });

  const totalIncome = filtered.filter(r => r.type === "pemasukan").reduce((s, r) => s + r.amount, 0);
  const totalExpense = filtered.filter(r => r.type === "pengeluaran").reduce((s, r) => s + r.amount, 0);
  const balance = totalIncome - totalExpense;

  const f = form;
  const sf = (k, v) => setForm(p => ({...p, [k]: v}));
  const cats = f.type === "pemasukan" ? incomeCategories : expenseCategories;

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Pemasukan", value: fmt(totalIncome), color: "#4caf50", icon: "↑" },
          { label: "Pengeluaran", value: fmt(totalExpense), color: "#f44336", icon: "↓" },
          { label: "Saldo Bersih", value: fmt(balance), color: balance >= 0 ? "var(--accent)" : "#f44336", icon: "=" },
          { label: "Total Transaksi", value: filtered.length, color: "#5ba3d9", icon: "#" },
        ].map((s, i) => (
          <div key={i} style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", padding: "20px", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: s.color }} />
            <div style={{ fontFamily: "var(--font-condensed)", fontSize: "1.5rem", fontWeight: 800, color: s.color }}>{s.value}</div>
            <div style={{ fontFamily: "var(--font-condensed)", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--gray-mid)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <SearchBar value={search} onChange={setSearch} placeholder="Cari transaksi..." />
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            style={{ background: "var(--dark3)", border: "1px solid var(--gray-dark)", color: "var(--white)", fontFamily: "var(--font-condensed)", fontSize: "0.8rem", padding: "9px 14px", outline: "none" }}>
            <option>Semua</option>
            <option value="pemasukan">Pemasukan</option>
            <option value="pengeluaran">Pengeluaran</option>
          </select>
          <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
            style={{ background: "var(--dark3)", border: "1px solid var(--gray-dark)", color: "var(--white)", fontFamily: "var(--font-body)", fontSize: "0.875rem", padding: "9px 12px", outline: "none" }} />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => openAdd("pemasukan")}
            style={{ background: "rgba(76,175,80,0.15)", border: "1px solid rgba(76,175,80,0.4)", color: "#4caf50", fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 16px", cursor: "pointer" }}>
            + Pemasukan
          </button>
          <button onClick={() => openAdd("pengeluaran")}
            style={{ background: "rgba(244,67,54,0.15)", border: "1px solid rgba(244,67,54,0.4)", color: "#f44336", fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "10px 16px", cursor: "pointer" }}>
            + Pengeluaran
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "var(--dark2)", border: "1px solid var(--gray-dark)", overflow: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Tipe</th>
              <th>Kategori</th>
              <th>Keterangan</th>
              <th>Metode</th>
              <th style={{ textAlign: "right" }}>Jumlah</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7}><EmptyState message="Tidak ada transaksi ditemukan" /></td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id}>
                <td style={{ fontFamily: "var(--font-condensed)", fontSize: "0.85rem" }}>{r.date}</td>
                <td>
                  <span style={{
                    background: r.type === "pemasukan" ? "rgba(76,175,80,0.15)" : "rgba(244,67,54,0.15)",
                    color: r.type === "pemasukan" ? "#4caf50" : "#f44336",
                    fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "0.68rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 2,
                  }}>
                    {r.type === "pemasukan" ? "↑ Masuk" : "↓ Keluar"}
                  </span>
                </td>
                <td style={{ fontFamily: "var(--font-condensed)", fontSize: "0.825rem", color: "var(--gray-light)" }}>{r.category}</td>
                <td style={{ fontSize: "0.875rem", maxWidth: 250 }}>{r.description}</td>
                <td style={{ fontFamily: "var(--font-condensed)", fontSize: "0.8rem", color: "var(--gray-mid)" }}>{r.method}</td>
                <td style={{ textAlign: "right", fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "0.95rem", color: r.type === "pemasukan" ? "#4caf50" : "#f44336" }}>
                  {r.type === "pemasukan" ? "+" : "-"}{fmt(r.amount)}
                </td>
                <td>
                  <button className="action-btn action-btn-edit" onClick={() => openEdit(r)}>Edit</button>
                  <button className="action-btn action-btn-delete" onClick={() => { setDeleteId(r.id); setShowConfirm(true); }}>Hapus</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Running total row */}
      {filtered.length > 0 && (
        <div style={{ background: "var(--dark3)", border: "1px solid var(--gray-dark)", borderTop: "none", padding: "12px 16px", display: "flex", justifyContent: "flex-end", gap: 32 }}>
          <span style={{ fontFamily: "var(--font-condensed)", fontSize: "0.8rem", color: "#4caf50" }}>Pemasukan: {fmt(totalIncome)}</span>
          <span style={{ fontFamily: "var(--font-condensed)", fontSize: "0.8rem", color: "#f44336" }}>Pengeluaran: {fmt(totalExpense)}</span>
          <span style={{ fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "0.85rem", color: balance >= 0 ? "var(--accent)" : "#f44336" }}>Saldo: {fmt(balance)}</span>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <Modal title={editId ? "Edit Transaksi" : f.type === "pemasukan" ? "Tambah Pemasukan" : "Tambah Pengeluaran"} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Tipe Transaksi</label>
                <select className="form-select" value={f.type} onChange={e => sf("type", e.target.value)}>
                  <option value="pemasukan">Pemasukan</option>
                  <option value="pengeluaran">Pengeluaran</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal *</label>
                <input className="form-input" type="date" value={f.date} onChange={e => sf("date", e.target.value)} required />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Kategori *</label>
                <select className="form-select" value={f.category} onChange={e => sf("category", e.target.value)}>
                  {cats.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Metode Pembayaran</label>
                <select className="form-select" value={f.method} onChange={e => sf("method", e.target.value)}>
                  {methods.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Keterangan / Deskripsi *</label>
              <input className="form-input" value={f.description} onChange={e => sf("description", e.target.value)} required placeholder="Misal: Pembayaran membership - Nama Member" />
            </div>
            <div className="form-group">
              <label className="form-label">Jumlah (Rp) *</label>
              <input className="form-input" type="number" min={0} value={f.amount} onChange={e => sf("amount", e.target.value)} required placeholder="Masukkan nominal" />
            </div>
            <FormActions onCancel={() => setShowModal(false)} submitLabel={editId ? "Simpan Perubahan" : "Tambah Transaksi"} />
          </form>
        </Modal>
      )}

      {showConfirm && (
        <ConfirmModal
          message="Yakin ingin menghapus transaksi ini? Data yang dihapus tidak dapat dikembalikan."
          onConfirm={() => { save(records.filter(r => r.id !== deleteId)); setShowConfirm(false); }}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
}
