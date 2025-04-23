'use client'

import StatCards from "../StatCards";
import StatsSection from "../StateSection";
// import CountdownTimer from "../Timer";
import DataTable from "../UsersTable";


const stats = [
  { title: "Total Users", value: "100,000,000" },
  { title: "Owner Address", value: "0x0000000000000000000" },
  { title: "Winner Email Address", value: "xyz111@gmail.com" },
];


export default function Stats() {
  return (
    <div className="mt-15">
      {/* <div className="w-full flex justify-end   mt-15">
        <div className="w-[30%] pt-[30px]">
          <h2 className="text-[20px] font-bold text-[#FFDD60]">Giveaway Interval</h2>
          <CountdownTimer targetDate={'2025-07-15'} />
        </div>
      </div> */}
      <StatCards stats={stats} />
      <div className="pt-[30px]">
        <DataTable />
      </div>
      <StatsSection />

    </div>
  );
}