// src/pages/LandingPage.tsx
import { motion } from "framer-motion";
import { useEffect } from "react";

interface Props {
  onFinish: () => void;
}

export default function LandingPage({ onFinish }: Props) {
  useEffect(() => {
    const timeout = setTimeout(() => {
      onFinish();
    }, 2000);
    return () => clearTimeout(timeout);
  }, [onFinish]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="text-center"
      >
        <motion.h1
          className="text-6xl md:text-7xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text"
        >
          MedWise
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="text-xl text-gray-400"
        >
          Find affordable generic alternatives
        </motion.p>
      </motion.div>
    </div>
  );
}
