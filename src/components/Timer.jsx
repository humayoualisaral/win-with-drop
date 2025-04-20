import React from "react";
import { useState, useEffect } from "react";

const CountdownTimer = ({ targetDate }) => {
  const useCountdown = (targetDate) => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date();
      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };
  
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  
    useEffect(() => {
      const timer = setInterval(() => {
        setTimeLeft(calculateTimeLeft());
      }, 1000);
  
      return () => clearInterval(timer);
    }, [targetDate]);
  
    return timeLeft;
  };
  
  const { days, hours, minutes, seconds } = useCountdown(targetDate);
  
  // Common style for all timer units
  const timerStyle = {
    borderColor: "#FFDD60",
  };
  
  return (
    <div className="flex justify-between gap-8">
      <span className="border border-solid rounded-lg font-medium text-2xl text-black w-full grid place-items-center text-center py-5 px-5 my-5" style={timerStyle}>
        {days} <strong className="font-normal text-xs">Days</strong>
      </span>
      <span className="border border-solid rounded-lg font-medium text-2xl text-black w-full grid place-items-center text-center py-5 px-5 my-5" style={timerStyle}>
        {hours} <strong className="font-normal text-xs">Hours</strong>
      </span>
      <span className="border border-solid rounded-lg font-medium text-2xl text-black w-full grid place-items-center text-center py-5 px-5 my-5" style={timerStyle}>
        {minutes} <strong className="font-normal text-xs">Mins</strong>
      </span>
      <span className="border border-solid rounded-lg font-medium text-2xl text-black w-full grid place-items-center text-center py-5 px-5 my-5" style={timerStyle}>
        {seconds} <strong className="font-normal text-xs">Secs</strong>
      </span>
    </div>
  );
};

export default CountdownTimer;