import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiSearch, FiLoader, FiAlertCircle, FiExternalLink } from "react-icons/fi";
import Preferences from "../components/Preferences";

interface DrugCard {
  name: string;
  price: number;
  quantity: string;
  dosage: string;
  description: string;
  source: string;
  retailer?: { name: string; url: string };
  company: string;
  conditions?: string[];
}

export default function DrugSearch() {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState<any>(null);
  const [generics, setGenerics] = useState<DrugCard[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<DrugCard[]>([]);
  const [favorites, setFavorites] = useState<DrugCard[]>([]);

  const fetchDrugInfo = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setBrand(null);
    setGenerics([]);
    try {
      const formattedQuery = query
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      
      const res = await fetch(`http://localhost:5002/drug-info?name=${formattedQuery}`);
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setLoading(false);
        return;
      }
      setBrand(data.brand);
      setGenerics(data.generics);
      setError("");
      
      if (data.brand && !history.some(item => item.name === data.brand.name)) {
        setHistory(prev => {
          const newHistory = [data.brand, ...prev];
          if (newHistory.length > 3) {
            newHistory.pop(); // Remove oldest item
          }
          return newHistory;
        });
      }
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

  const hasResults = brand || generics.length > 0;

  const handleAddFavorite = (drug: DrugCard) => {
    setFavorites(prev => [...prev, drug]);
  };

  const handleRemoveFavorite = (drugName: string) => {
    setFavorites(prev => prev.filter(drug => drug.name !== drugName));
  };

  const handleSelectDrug = async (drug: DrugCard) => {
    setQuery(drug.name);
    await fetchDrugInfo();
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
      <AnimatePresence>
        {loading ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-24 left-0 w-full px-4 z-40"
          >
            <div className="max-w-4xl mx-auto">
              <div className="p-4 bg-blue-900/50 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FiLoader className="text-blue-400 w-6 h-6 loading-spinner mr-3" />
                <p className="text-blue-400">Searching for drug information...</p>
              </div>
            </div>
          </motion.div>
        ) : error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed top-24 left-0 w-full px-4 z-40"
          >
            <div className="max-w-4xl mx-auto">
              <div className="p-4 bg-red-900/50 rounded-xl flex items-center backdrop-blur-sm">
                <FiAlertCircle className="text-red-400 mr-3" />
                <p className="text-red-400">{error}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Preferences
        currentDrug={brand}
        onAddFavorite={handleAddFavorite}
        onRemoveFavorite={handleRemoveFavorite}
        onSelectDrug={handleSelectDrug}
      />

      <div className="pt-32 relative z-30">
        <div className="max-w-7xl mx-auto px-4 flex gap-8">
          <div className="flex-1">
            <AnimatePresence>
              {brand && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-8"
                >
                  <div className="p-6 bg-gray-800/80 backdrop-blur-sm rounded-xl">
                    <h2 className="text-2xl font-bold mb-4">{brand.name}</h2>
                    {brand.conditions && brand.conditions.length > 0 && (
                      <p className="text-gray-300 mb-4">Used to treat: {brand.conditions.join(", ")}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-gray-900/50 p-3 rounded-lg">
                        <span className="text-gray-400">Price</span>
                        <p className="font-medium">${brand.price?.toFixed(2) || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-900/50 p-3 rounded-lg">
                        <span className="text-gray-400">Quantity</span>
                        <p className="font-medium">{brand.quantity || 'N/A'}</p>
                      </div>
                      <div className="bg-gray-900/50 p-3 rounded-lg">
                        <span className="text-gray-400">Manufacturer</span>
                        <p className="font-medium">{brand.company || 'N/A'}</p>
                      </div>
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
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {generics.map((g, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-xl"
                      >
                        <h4 className="text-xl font-bold mb-3">{g.name}</h4>
                        {g.description && (
                          <p className="text-gray-300 mb-4">{g.description}</p>
                        )}
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Price</span>
                            <span className="font-medium">${g.price?.toFixed(2) || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Quantity</span>
                            <span className="font-medium">{g.quantity || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Manufacturer</span>
                            <span className="font-medium">{g.manufacturer || 'N/A'}</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {history.length > 0 && (
            <div className="w-80">
              <div className="sticky top-32 space-y-6">
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
                  <h3 className="text-xl font-bold mb-4">Recent Searches</h3>
                  <div className="space-y-4">
                    {history.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-900/50 p-4 rounded-lg cursor-pointer hover:bg-gray-900/70 transition-colors"
                        onClick={() => {
                          setQuery(item.name);
                          fetchDrugInfo();
                        }}
                      >
                        <h4 className="font-medium mb-1">{item.name}</h4>
                        <p className="text-sm text-gray-400">${item.price}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Favorites</h3>
                    {brand && !favorites.some(fav => fav.name === brand.name) && (
                      <button
                        onClick={() => handleAddFavorite(brand)}
                        className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm"
                      >
                        Add Current
                      </button>
                    )}
                  </div>
                  <div className="space-y-4">
                    {favorites.map((drug) => (
                      <div
                        key={drug.name}
                        className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg cursor-pointer hover:bg-gray-900/70 transition-colors"
                        onClick={() => handleSelectDrug(drug)}
                      >
                        <div>
                          <h4 className="font-medium mb-1">{drug.name}</h4>
                          <p className="text-sm text-gray-400">${drug.price}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFavorite(drug.name);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="fixed top-0 left-0 w-full z-50">
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: 0 }}
          className="px-4 py-4 bg-gray-900/50 backdrop-blur-sm"
        >
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <input
                className={`w-full p-4 pl-12 pr-4 rounded-xl bg-gray-800/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500/20 transition-all ${
                  loading ? 'opacity-50' : ''
                }`}
                type="text"
                placeholder="Enter a brand drug (e.g. Dramamine)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              {loading ? (
                <FiLoader className="absolute left-4 top-1/2 transform -translate-y-1/2 text-blue-400 w-5 h-5 loading-spinner" />
              ) : (
                <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-gray-900 to-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{ zIndex: 0 }}
      >
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          initial={{ backgroundPosition: "0% 0%" }}
          animate={{ backgroundPosition: "100% 100%" }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "linear"
          }}
          style={{
            backgroundImage: "radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)",
            backgroundSize: "200% 200%"
          }}
        />
        
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0.8 }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut"
          }}
          style={{
            backgroundImage: "radial-gradient(circle at 30% 30%, rgba(139, 92, 246, 0.15) 0%, transparent 50%)",
            backgroundSize: "200% 200%"
          }}
        />

        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                opacity: [0.2, 0.8, 0.2]
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>

        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        />
      </motion.div>
    </div>
  );
}
