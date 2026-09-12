import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RoadSafetyChatbot from "@/components/RoadSafetyChatbot";

import Home from "@/pages/Home";
import Analyze from "@/pages/Analyze";

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-navy-950 text-white">

        {/* ================= NAVBAR ================= */}
        <Navbar />

        {/* ================= PAGES ================= */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analyze" element={<Analyze />} />
        </Routes>

        {/* ================= FOOTER ================= */}
        <Footer />

        {/* ================= ROAD SAFETY CHATBOT ================= */}
        <RoadSafetyChatbot />

      </div>
    </BrowserRouter>
  );
}

export default App;