import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Pricing from "./components/Pricing";
import TrainerSection from "./components/TrainerSection";
import ContactSection from "./components/ContactSection";
import Footer from "./components/Footer";
import AdminPanel from "./pages/AdminPanel";
import TrainerPortal from "./pages/TrainerPortal";
import "./index.css";

export default function App() {
  const [page, setPage] = useState("home");

  if (page === "admin") return <AdminPanel onBack={() => setPage("home")} />;
  if (page === "trainer") return <TrainerPortal onBack={() => setPage("home")} />;

  return (
    <div>
      <Navbar />
      <Hero />
      <Pricing />
      <TrainerSection />
      <ContactSection />
      <Footer
        onAdmin={() => setPage("admin")}
        onTrainer={() => setPage("trainer")}
      />
    </div>
  );
}
