import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DrugCard {
  name: string;
  price: number;
  dosage: string;
  quantity: string;
  company: string;
  description: string;
}

interface PreferencesProps {
  currentDrug: DrugCard | null;
  onAddFavorite: (drug: DrugCard) => void;
  onRemoveFavorite: (drugName: string) => void;
  onSetAlert: (drugName: string, targetPrice: number) => void;
  onRemoveAlert: (drugName: string) => void;
}

export default function Preferences({
  currentDrug,
  onAddFavorite,
  onRemoveFavorite,
  onSetAlert,
  onRemoveAlert,
}: PreferencesProps) {
  const [favorites, setFavorites] = useState<DrugCard[]>([]);
  const [alerts, setAlerts] = useState<{ [key: string]: number }>({});
  const [showPreferences, setShowPreferences] = useState(false);
  const [targetPrice, setTargetPrice] = useState('');

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedFavorites = localStorage.getItem('favoriteDrugs');
    const savedAlerts = localStorage.getItem('priceAlerts');
    
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    if (savedAlerts) {
      setAlerts(JSON.parse(savedAlerts));
    }
  }, []);

  const handleAddFavorite = () => {
    if (currentDrug && !favorites.some(fav => fav.name === currentDrug.name)) {
      const newFavorites = [...favorites, currentDrug];
      setFavorites(newFavorites);
      localStorage.setItem('favoriteDrugs', JSON.stringify(newFavorites));
      onAddFavorite(currentDrug);
    }
  };

  const handleRemoveFavorite = (drugName: string) => {
    const newFavorites = favorites.filter(fav => fav.name !== drugName);
    setFavorites(newFavorites);
    localStorage.setItem('favoriteDrugs', JSON.stringify(newFavorites));
    onRemoveFavorite(drugName);
  };

  const handleSetAlert = () => {
    if (currentDrug && targetPrice) {
      const newAlerts = { ...alerts, [currentDrug.name]: parseFloat(targetPrice) };
      setAlerts(newAlerts);
      localStorage.setItem('priceAlerts', JSON.stringify(newAlerts));
      onSetAlert(currentDrug.name, parseFloat(targetPrice));
      setTargetPrice('');
    }
  };

  const handleRemoveAlert = (drugName: string) => {
    const newAlerts = { ...alerts };
    delete newAlerts[drugName];
    setAlerts(newAlerts);
    localStorage.setItem('priceAlerts', JSON.stringify(newAlerts));
    onRemoveAlert(drugName);
  };

  return (
    <div className="fixed right-4 top-4 z-50">
      <button
        onClick={() => setShowPreferences(!showPreferences)}
        className="p-2 bg-gray-800/80 backdrop-blur-sm rounded-lg hover:bg-gray-700/80 transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      </button>

      <AnimatePresence>
        {showPreferences && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute right-0 top-12 w-80 bg-gray-800/80 backdrop-blur-sm rounded-lg p-4 shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-4">Preferences</h3>
            
            {/* Favorites Section */}
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Favorites</h4>
              {currentDrug && !favorites.some(fav => fav.name === currentDrug.name) && (
                <button
                  onClick={handleAddFavorite}
                  className="w-full mb-2 p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                >
                  Add to Favorites
                </button>
              )}
              <div className="space-y-2">
                {favorites.map((drug) => (
                  <div
                    key={drug.name}
                    className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg"
                  >
                    <span className="text-sm">{drug.name}</span>
                    <button
                      onClick={() => handleRemoveFavorite(drug.name)}
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

            {/* Price Alerts Section */}
            <div>
              <h4 className="text-sm font-medium text-gray-400 mb-2">Price Alerts</h4>
              {currentDrug && !alerts[currentDrug.name] && (
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="Target price"
                    className="flex-1 p-2 bg-gray-900/50 rounded-lg text-sm"
                  />
                  <button
                    onClick={handleSetAlert}
                    className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    Set Alert
                  </button>
                </div>
              )}
              <div className="space-y-2">
                {Object.entries(alerts).map(([drugName, targetPrice]) => (
                  <div
                    key={drugName}
                    className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg"
                  >
                    <div>
                      <span className="text-sm block">{drugName}</span>
                      <span className="text-xs text-gray-400">Alert at ${targetPrice}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveAlert(drugName)}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 