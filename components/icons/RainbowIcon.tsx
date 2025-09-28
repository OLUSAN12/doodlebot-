import React from 'react';

export const RainbowIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M22 17a10 10 0 00-20 0" />
    <path d="M18 17a6 6 0 00-12 0" />
    <path d="M14 17a2 2 0 00-4 0" />
  </svg>
);
