import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Pricing from "./components/Pricing";
import TrainerSection from "./components/TrainerSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import GallerySection from "./components/GallerySection";
import Testimonials from "./components/Testimonials";
import AdminPanelFirebase from "./pages/AdminPanelFirebase";
import TrainerPortal from "./pages/TrainerPortal";
import OwnerPanel from "./pages/OwnerPanel";
import PelatihPanel from "./pages/PelatihPanel";
import MemberPanel from "./pages/MemberPanel";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("home");

  if (typeof window !== "undefined") {
    if (window.location.hash === "#/admin" && page === "home") setPage("admin");
    if (window.location.hash === "#/owner" && page === "home") setPage("owner");
    if (window.location.hash === "#/pelatih" && page === "home") setPage("pelatih");
    if (window.location.hash === "#/member" && page === "home") setPage("member");
  }

  if (page === "admin") return <AdminPanelFirebase onBack={() => { window.location.hash = ""; setPage("home"); }} />;
  if (page === "trainer") return <TrainerPortal onBack={() => { window.location.hash = ""; setPage("home"); }} />;
  if (page === "owner") return <OwnerPanel onBack={() => { window.location.hash = ""; setPage("home"); }} />;
  if (page === "pelatih") return <PelatihPanel onBack={() => { window.location.hash = ""; setPage("home"); }} />;
  if (page === "member") return <MemberPanel onBack={() => { window.location.hash = ""; setPage("home"); }} />;

  return (
    <div>
      <Navbar />
      <Hero />
      <div style={{
        background: "linear-gradient(180deg, #0a0a0a 0%, #1c1c1c 14%, #292929 30%, #1a1a1a 48%, #0a0a0a 62%, #1e1e1e 80%, #0a0a0a 100%)",
      }}>
        <GallerySection />
        <Pricing />
        <TrainerSection />
        <Testimonials />
        <ContactSection />
      </div>
      <Footer />

      <a href="https://wa.me/6282324720045?text=Halo%20Abdominal%20Gym!%20Saya%20ingin%20tanya%20informasi."
        target="_blank" rel="noopener"
        style={{ position: "fixed", bottom: 24, right: 24, zIndex: 998, background: "#25d366", color: "#fff", width: 56, height: 56, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 20px rgba(37,211,102,0.4)", textDecoration: "none", transition: "transform 0.2s, box-shadow 0.2s" }}
        onMouseOver={e => { e.currentTarget.style.transform = "scale(1.1)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(37,211,102,0.5)"; }}
        onMouseOut={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,211,102,0.4)"; }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}