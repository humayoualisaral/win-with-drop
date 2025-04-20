// app/dashboard/page.js

"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import WalletValidator from "../WalletValidator";
import AdminWalletAddressInput from "../AdminWalletValidator";

export default function Action() {
  const [activeSection, setActiveSection] = useState("addUsers");

  return (
    <div>
 <div className="flex space-x-2 mb-4 ml-2 mt-2 bg-gray-100 p-4">
  <button 
    onClick={() => setActiveSection("addUsers")}
    className={`px-2 py-1 text-xs rounded transition-colors ${
      activeSection === "addUsers" 
        ? "text-white" 
        : "bg-blue-100 text-blue-800 hover:bg-blue-200"
    }`}
    style={activeSection === "addUsers" ? {backgroundColor: "rgb(234, 179, 8)",cursor:'pointer'} : {cursor:'pointer'}}
  >
    Add Users
  </button>
  <button 
    onClick={() => setActiveSection("addAdmins")}
    className={`px-2 py-1 text-xs rounded transition-colors ${
      activeSection === "addAdmins" 
        ? "text-white" 
        : "bg-green-100 text-green-800 hover:bg-green-200"
    }`}
    style={activeSection === "addAdmins" ? {backgroundColor: "rgb(234, 179, 8)",cursor:'pointer'} : {cursor:'pointer'}}
  >
    Add Admins
  </button>
</div>
      
      {activeSection === "addUsers" ? <WalletValidator /> : <AdminWalletAddressInput/>}
    </div>
  );
}