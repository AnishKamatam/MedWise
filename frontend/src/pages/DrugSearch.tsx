import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiLoader, FiAlertCircle, FiExternalLink } from "react-icons/fi";

interface DrugCard {
  name: string;
  price: number;
  quantity: string;
  dosage: string;
  description: string;
  source: string;
  retailer?: { name: string; url: string };
}

export default function DrugSearch() {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState<any>(null);
  const [generics, setGenerics] = useState<DrugCard[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDrugInfo = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setBrand(null);
    setGenerics([]);
    try {
      const res = await fetch(`http://localhost:5001/drug-info?name=${query}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      setBrand(data.brand);
      setGenerics(data.generics);
      setError("");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchDrugInfo();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text">
          Find Affordable Alternatives
        </h1>
        <p className="text-gray-400 text-lg">
          Search for your medication to find generic alternatives and save money
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto mb-12"
      >
        <div className="relative">
          <input
            className="w-full p-4 pl-12 rounded-xl bg-gray-800 border border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            type="text"
            placeholder="Enter a brand drug (e.g. Dramamine)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={fetchDrugInfo}
            disabled={loading}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg transition-colors"
          >
            {loading ? <FiLoader className="animate-spin" /> : "Search"}
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto mb-8 p-4 bg-red-900/50 border border-red-800 rounded-xl flex items-center"
          >
            <FiAlertCircle className="text-red-400 mr-3" />
            <p className="text-red-400">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {brand && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto mb-12 p-6 bg-gray-800/50 rounded-xl border border-gray-700"
          >
            <h2 className="text-2xl font-bold mb-4">{brand.name}</h2>
            <p className="text-gray-300 mb-4">{brand.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="bg-gray-900/50 p-3 rounded-lg">
                <span className="text-gray-400">Dosage</span>
                <p className="font-medium">{brand.dosage}</p>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-lg">
                <span className="text-gray-400">Quantity</span>
                <p className="font-medium">{brand.quantity}</p>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-lg">
                <span className="text-gray-400">Price</span>
                <p className="font-medium">${brand.price}</p>
              </div>
              <div className="bg-gray-900/50 p-3 rounded-lg">
                <span className="text-gray-400">Manufacturer</span>
                <p className="font-medium">{brand.company}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {generics.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-12"
          >
            <h3 className="text-2xl font-bold mb-6 text-center">Generic Alternatives</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generics.map((g, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-gray-800/50 p-6 rounded-xl border border-gray-700"
                >
                  <h4 className="text-xl font-bold mb-3">{g.name}</h4>
                  <p className="text-gray-300 mb-4">{g.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Dosage</span>
                      <span className="font-medium">{g.dosage}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Quantity</span>
                      <span className="font-medium">{g.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price</span>
                      <span className="font-medium">${g.price}</span>
                    </div>
                    {g.retailer?.name && (
                      <div className="mt-4">
                        <a
                          href={g.retailer.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center text-blue-400 hover:text-blue-300"
                        >
                          <span>{g.retailer.name}</span>
                          <FiExternalLink className="ml-2" />
                        </a>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
