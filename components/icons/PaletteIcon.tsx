import React from 'react';

export const PaletteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <circle cx="13.5" cy="6.5" r="3.5"/>
    <circle cx="17.5" cy="12.5" r="3.5"/>
    <circle cx="10.5" cy="13.5" r="3.5"/>
    <circle cx="6.5" cy="8.5" r="3.5"/>
  </svg>
);
