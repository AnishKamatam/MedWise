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
    }, 3000);
    return () => clearTimeout(timeout);
  }, [onFinish]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="text-center"
      >
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text"
        >
          MedWise
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1 }}
          className="text-xl text-gray-400 mb-8"
        >
          Find affordable generic alternatives to your medications
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="flex flex-col items-center space-y-4"
        >
          <div className="flex space-x-4">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center"
            >
              💊
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center"
            >
              💰
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center"
            >
              🏥
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
