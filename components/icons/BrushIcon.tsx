import React from 'react';

export const BrushIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M9.06 11.9L3 17.96V21h3.04l5.96-9.06" />
    <path d="M18.1 3.91a2.12 2.12 0 013 3l-6.84 6.84-3.04-3.04L18.1 3.91z" />
  </svg>
);
