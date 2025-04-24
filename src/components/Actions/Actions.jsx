// app/dashboard/page.js

"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import WalletValidator from "../WalletValidator";
import AdminWalletAddressInput from "../AdminWalletValidator";
import EndGiveaway from "../EndGiveaway";

export default function Action() {



  const [activeSection, setActiveSection] = useState("addUsers");
  const [giveaways, setGiveaways] = useState([
    { id: 1, title: "Free Headphones Giveaway" },
    { id: 2, title: "Amazon Gift Card $50" },
    { id: 3, title: "Netflix Subscription for 1 Year" },
  ]);
  const [selectedGiveaway, setSelectedGiveaway] = useState(null);

  const handleSelectGiveaway = (giveaway) => {
    setSelectedGiveaway(giveaway);
  };

  const handleEndGiveaway = () => {
    if (selectedGiveaway) {
      setGiveaways((prev) => prev.filter((g) => g.id !== selectedGiveaway.id));
      setSelectedGiveaway(null);
      setActiveSection("endGiveaway"); // Show End Giveaway section when giveaway is ended
    }
  };

  return (
    <div>
      <div className="flex space-x-2 mb-4 ml-2 mt-2 bg-gray-100 p-4">
        <button
          onClick={() => setActiveSection("addUsers")}
          className={`px-2 py-1 text-xs rounded transition-colors ${activeSection === "addUsers"
              ? "text-white"
              : "bg-blue-100 text-blue-800 hover:bg-blue-200"
            }`}
          style={activeSection === "addUsers" ? { backgroundColor: "rgb(234, 179, 8)", cursor: 'pointer' } : { cursor: 'pointer' }}
        >
          Add Users
        </button>
        <button
          onClick={() => setActiveSection("addAdmins")}
          className={`px-2 py-1 text-xs rounded transition-colors ${activeSection === "addAdmins"
              ? "text-white"
              : "bg-green-100 text-green-800 hover:bg-green-200"
            }`}
          style={activeSection === "addAdmins" ? { backgroundColor: "rgb(234, 179, 8)", cursor: 'pointer' } : { cursor: 'pointer' }}
        >
          Add Admins
        </button>

        {/* <button
          onClick={() => setActiveSection("endGiveaway")}
          className={`px-2 py-1 text-xs rounded transition-colors ${
            activeSection === "endGiveaway"
              ? "text-white"
              : "bg-red-100 text-red-800 hover:bg-red-200"
          }`}
          style={activeSection === "endGiveaway" ? { backgroundColor: "rgb(234, 179, 8)", cursor: "pointer" } : { cursor: "pointer" }}
        >
          End Giveaway
        </button> */}
    
      </div>
       {/* Conditional rendering based on the active section */}
       {activeSection === "addUsers" && <WalletValidator />}
      {activeSection === "addAdmins" && <AdminWalletAddressInput />}
      {/* {activeSection === "endGiveaway" && <EndGiveaway />} Render EndGiveaway component when activeSection is "endGiveaway" */}
    </div>

      // {activeSection === "addUsers" ? <WalletValidator /> : <AdminWalletAddressInput />}
  
  );
}