'use client'

import {useEffect } from "react";
import StatCards from "../StatCards";
// import CountdownTimer from "../Timer";
import DataTable from "../UsersTable";
import { useActiveGiveaway } from "@/context/ActiveGiveaway";




export default function Stats() {
  const { activeGiveaways, activeGiveaway, changeActiveGiveaway } = useActiveGiveaway();
  const stats = [
    { title: "Giveaway Name", value: activeGiveaway?.name },
    { title: "Giveaway Id", value: activeGiveaway?.id },
    { title: "Total Participants", value: activeGiveaway?.totalParticipants },
    { title: "Winner Email Address", value: activeGiveaway?.winner?activeGiveaway?.winner:"Pending" },
  ];
useEffect(()=>{
  console.log("this is active",activeGiveaway)
},[activeGiveaway])
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
        <DataTable giveawayId={activeGiveaway?.id.toString()} />
      </div>
    </div>
  );
}