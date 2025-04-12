import React, { useState } from "react";

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
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6">💊 Generic Drug Finder</h1>

      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 p-3 rounded bg-gray-800 placeholder:text-gray-400"
          type="text"
          placeholder="Enter a brand drug (e.g. Dramamine)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={fetchDrugInfo}
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-500"
        >
          Search
        </button>
      </div>

      {loading && <p className="text-blue-300">Loading...</p>}
      {error && <p className="text-red-400">{error}</p>}

      {brand && (
        <div className="bg-gray-900 p-5 rounded mb-6 shadow">
          <h2 className="text-xl font-semibold">{brand.name}</h2>
          <p className="mb-2">{brand.description}</p>
          <p>💊 <strong>{brand.dosage}</strong>, 📦 {brand.quantity}</p>
          <p>💰 ${brand.price} — {brand.source}</p>
          <p>🏢 <strong>Manufacturer:</strong> {brand.company}</p>
        </div>
      )}

      {generics.length > 0 && (
        <div>
          <h3 className="text-2xl font-semibold mb-2">🧪 Generic Alternatives</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {generics.map((g, idx) => (
              <div key={idx} className="bg-gray-800 p-4 rounded shadow">
                <h4 className="text-lg font-bold">{g.name}</h4>
                <p>{g.description}</p>
                <p className="mt-1">💊 {g.dosage}, 📦 {g.quantity}</p>
                <p>💰 ${g.price} — {g.source}</p>
                {g.retailer?.name && (
                  <p>
                    🏬{" "}
                    <a
                      href={g.retailer.url}
                      className="underline text-blue-400"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {g.retailer.name}
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
