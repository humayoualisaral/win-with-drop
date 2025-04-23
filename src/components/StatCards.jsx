import React from "react";

const StatCards = ({ stats }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {stats.map((stat, index) => (
        <div key={index} className="rounded-lg p-6 bg-[#FFDD60] flex-1">
          <h2 className="text-lg font-medium text-black mb-2">{stat.title}</h2>
          <h6 className="text-2xl font-bold text-black">{stat.value}</h6>
          {stat.subtitle && (
            <h6 className="italic font-bold text-black">{stat.subtitle}</h6>
          )}
        </div>
      ))}
    </div>
  );
};

export default StatCards;
