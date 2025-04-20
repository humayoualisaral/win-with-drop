import React from "react";

const StatCards = () => {
  return (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      <div className="rounded-lg p-6 bg-[#FFDD60] flex-1">
        <h2 className="text-lg font-medium text-#fff-500 mb-2">Total Users</h2>
        <h6 className="text-2xl font-bold text-black">100,000,000</h6>
        <h6 className="italic font-bold text-black"></h6>
      </div>

      <div className="rounded-lg p-6 bg-[#FFDD60] flex-1">
        <h2 className="text-lg font-medium text-#fff-500 mb-2">Owner Address</h2>
        <h6 className="text-2xl font-bold text-black">0x0000000000000000000</h6>
        <h6 className="italic font-bold text-black"></h6>
      </div>

      <div className="rounded-lg p-6 bg-[#FFDD60] flex-1">
        <h2 className="text-lg font-medium text-#fff-500 mb-2">Total Admins</h2>
        <h6 className="text-2xl font-bold text-black">5</h6>
        <h6 className="italic font-bold text-black"></h6>
      </div>
    </div>
  );
};

export default StatCards;