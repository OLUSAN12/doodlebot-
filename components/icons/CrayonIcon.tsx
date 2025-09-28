import React from 'react';

export const CrayonIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M17 3l4 4" />
    <path d="M13 7L4.5 15.5a2.828 2.828 0 104 4L17 11" />
    <path d="M21 7h-4" />
    <path d="M17 11H7" />
  </svg>
);
