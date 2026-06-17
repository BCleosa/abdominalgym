import { useState } from "react";

export function SearchBar({ value, onChange, placeholder = "Cari..." }) {
  return (
    <div style={{ position: "relative" }}>
      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--gray-mid)", fontSize: "0.875rem" }}>🔍</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          background: "var(--dark3)",
          border: "1px solid var(--gray-dark)",
          color: "var(--white)",
          fontFamily: "var(--font-body)",
          fontSize: "0.875rem",
          padding: "9px 12px 9px 36px",
          outline: "none",
          width: 240,
          transition: "border-color 0.2s",
        }}
        onFocus={e => e.target.style.borderColor = "var(--accent)"}
        onBlur={e => e.target.style.borderColor = "var(--gray-dark)"}
      />
    </div>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <div className="modal-title">{title}</div>
        <button className="modal-close" onClick={onClose}>✕</button>
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay">
      <div className="modal-box" style={{ maxWidth: 400 }}>
        <div className="modal-title">Konfirmasi Hapus</div>
        <p style={{ color: "var(--gray-light)", fontSize: "0.9rem", marginBottom: 24 }}>{message}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button onClick={onCancel} className="btn-outline" style={{ fontSize: "0.8rem", padding: "9px 20px" }}>Batal</button>
          <button onClick={onConfirm} style={{ background: "#c0392b", color: "var(--white)", border: "none", fontFamily: "var(--font-condensed)", fontWeight: 700, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", padding: "9px 20px", cursor: "pointer" }}>Hapus</button>
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, onAdd, addLabel = "Tambah Data" }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
      <div />
      <button onClick={onAdd} className="btn-primary" style={{ fontSize: "0.8rem", padding: "10px 20px" }}>
        + {addLabel}
      </button>
    </div>
  );
}

export function EmptyState({ message = "Tidak ada data" }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 0", color: "var(--gray-mid)" }}>
      <div style={{ fontSize: "2rem", marginBottom: 12 }}>📋</div>
      <div style={{ fontFamily: "var(--font-condensed)", fontSize: "0.875rem", letterSpacing: "0.1em" }}>{message}</div>
    </div>
  );
}

export function FormRow({ children }) {
  return <div className="grid-2">{children}</div>;
}

export function FormActions({ onCancel, submitLabel = "Simpan" }) {
  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--gray-dark)" }}>
      <button type="button" onClick={onCancel} className="btn-outline" style={{ fontSize: "0.8rem", padding: "10px 20px" }}>Batal</button>
      <button type="submit" className="btn-primary" style={{ fontSize: "0.8rem", padding: "10px 24px" }}>{submitLabel}</button>
    </div>
  );
}
