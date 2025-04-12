import { useState, useEffect } from 'react';

interface DrugCard {
  name: string;
  price: number;
  quantity: string;
  dosage: string;
  description: string;
  source: string;
  retailer?: { name: string; url: string };
  company: string;
}

interface PreferencesProps {
  currentDrug: DrugCard | null;
  onAddFavorite: (drug: DrugCard) => void;
  onRemoveFavorite: (drugName: string) => void;
  onSelectDrug: (drug: DrugCard) => void;
}

export default function Preferences({
  currentDrug,
  onAddFavorite,
  onRemoveFavorite,
  onSelectDrug,
}: PreferencesProps) {
  const [favorites, setFavorites] = useState<DrugCard[]>([]);

  useEffect(() => {
    // Load saved preferences from localStorage
    const savedFavorites = localStorage.getItem('favoriteDrugs');
    
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
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

  return null;
} 