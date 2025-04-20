'use client'

import StatCards from "../StatCards";
import CountdownTimer from "../Timer";
import DataTable from "../UsersTable";

export default function Stats() {
  return (
   <div>
      <div className="w-full flex justify-end">
      <div className="w-[30%] pt-[30px]">
       <h2 className="text-[20px] font-bold text-[#FFDD60]">Giveaway Interval</h2>
      <CountdownTimer targetDate={'2025-07-15'}/>
      </div>
     </div>
     <StatCards/>
     <div className="pt-[30px]">
     <DataTable/>
     </div>
   </div>
  );
}