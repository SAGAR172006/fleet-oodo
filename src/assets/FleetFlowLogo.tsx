import React from 'react';

export const FleetFlowLogo = ({ className = "w-8 h-8" }: { className?: string }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Truck body */}
      <rect x="35" y="45" width="45" height="25" rx="3" fill="currentColor" opacity="0.9" />
      
      {/* Truck cabin */}
      <path
        d="M25 50 L25 65 L35 65 L35 50 L30 45 Z"
        fill="currentColor"
      />
      
      {/* Wheels */}
      <circle cx="45" cy="72" r="6" fill="currentColor" />
      <circle cx="70" cy="72" r="6" fill="currentColor" />
      <circle cx="45" cy="72" r="3" fill="white" opacity="0.3" />
      <circle cx="70" cy="72" r="3" fill="white" opacity="0.3" />
      
      {/* Flow lines (representing movement/tracking) */}
      <path
        d="M15 30 Q20 28 25 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M10 38 Q18 36 26 38"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <path
        d="M12 46 Q20 44 28 46"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  );
};
