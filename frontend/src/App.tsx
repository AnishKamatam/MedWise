// src/App.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import DrugSearch from "./pages/DrugSearch";

function AppContent() {
  const location = useLocation();
  const [showLanding, setShowLanding] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={
              showLanding ? (
                <LandingPage onFinish={() => setShowLanding(false)} />
              ) : (
                <DrugSearch />
              )
            } />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
