"use client";

import { useState } from "react";

const colors = {
  primary: "#000", // Deeper indigo - more authoritative
  secondary: "#0891b2", // Cyan - complementary to indigo
  success: "rgb(234 179 8)", // Emerald - keep as is for success states
  error: "#dc2626", // Darker red - less harsh but still clear
  background: "#f8fafc", // Lighter background for better contrast
  card: "#ffffff", // White for cards
  text: "#0f172a", // Slate-900 - deeper text for better readability
  lightText: "#64748b", // Slate-500 - softer secondary text
  border: "#e2e8f0", // Subtle border color
  highlight: "rgb(255 221 96)", // Very light blue for highlights
};

export default function EndGiveaway() {
  const [giveaways, setGiveaways] = useState([
    { id: 1, title: "Free Headphones Giveaway" },
    { id: 2, title: "Amazon Gift Card $50" },
    { id: 3, title: "Netflix Subscription for 1 Year" },
  ]);
  const [selectedGiveaway, setSelectedGiveaway] = useState(null);

  const handleSelect = (giveaway) => {
    setSelectedGiveaway(giveaway);
  };

  const handleEndGiveaway = () => {
    if (selectedGiveaway) {
      setGiveaways((prev) => prev.filter((g) => g.id !== selectedGiveaway.id));
      setSelectedGiveaway(null);
    }
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen p-4"
      style={{ backgroundColor: colors.background }}
    >
      <div
        className="w-full max-w-lg bg-card p-6 rounded-lg shadow-md"
        style={{
          backgroundColor: colors.card,
          borderColor: colors.border,
          borderWidth: "1px",
        }}
      >
        <h2
          className="text-2xl font-bold text-center mb-4"
          style={{ color: colors.text }}
        >
          Giveaways
        </h2>

        <ul className="space-y-3">
          {giveaways.map((giveaway) => (
            <li
              key={giveaway.id}
              onClick={() => handleSelect(giveaway)}
              className={`cursor-pointer p-4 rounded-md border ${
                selectedGiveaway?.id === giveaway.id
                  ? "bg-secondary text-white"
                  : " bg-[#FFDD60] text-lightText"
              } hover:bg-highlight transition`}
              style={{
                borderColor: colors.border,
                color: colors.text,
              }}
            >
              {giveaway.title}
            </li>
          ))}
        </ul>

        {selectedGiveaway && (
          <div className="mt-6 text-center">
            <p
              className="mb-2"
              style={{ color: colors.text }}
            >
              Selected: <strong>{selectedGiveaway.title}</strong>
            </p>
            <button
              onClick={handleEndGiveaway}
              className="bg-error hover:bg-red-700 px-4 py-2 rounded font-semibold"
              style={{
                backgroundColor: colors.error,
                borderColor: colors.border,
                color: "#ffffff",
              }}
            >
              End Giveaway
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
