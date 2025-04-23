'use client';

import { useState } from 'react';

const colors = {
  primary: "#000",
  secondary: "#0891b2",
  success: "rgb(234 179 8)",
  error: "#dc2626",
  background: "#f8fafc",
  card: "#ffffff",
  text: "#0f172a",
  lightText: "#64748b",
  border: "#e2e8f0",
  highlight: "rgb(255 221 96)",
};

const initialGiveaways = [
  { id: 1, title: 'Free Headphones', status: 'Ongoing' },
  { id: 2, title: 'Amazon Gift Card', status: 'Ongoing' },
  { id: 3, title: 'Netflix Subscription', status: 'Ended' },
];

export default function StatsSection() {
  const [giveaways, setGiveaways] = useState(initialGiveaways);

  const handleEndGiveaway = (id) => {
    const updated = giveaways.map(g =>
      g.id === id ? { ...g, status: 'Ended' } : g
    );
    setGiveaways(updated);
  };

  return (
    <section
      className="w-full px-6 py-10"
      style={{ color: colors.text }}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-3xl font-bold text-center mb-6">Giveaway Stats</h2>

        {giveaways.map((giveaway) => (
          <div
            key={giveaway.id}
            className="flex items-center justify-between p-4 rounded-lg shadow-md"
            style={{
              backgroundColor: colors.card,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div>
              <h3 className="font-semibold text-lg">{giveaway.title}</h3>
              <p
                className="text-sm mt-1"
                style={{
                  color:
                    giveaway.status === 'Ongoing'
                      ? colors.secondary
                      : colors.error,
                  fontWeight: 'bold',
                }}
              >
                {giveaway.status}
              </p>
            </div>

            {giveaway.status === 'Ongoing' && (
              <button
                onClick={() => handleEndGiveaway(giveaway.id)}
                className="px-4 py-2 text-white rounded-md font-semibold"
                style={{ backgroundColor: colors.error }}
              >
                End
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
