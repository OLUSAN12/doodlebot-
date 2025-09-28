import React from 'react';

export const EraserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M21 13.46l-6.4-6.4a2 2 0 00-2.82 0l-8.59 8.59a2 2 0 000 2.82l6.4 6.4a2 2 0 002.82 0l8.59-8.59a2 2 0 000-2.82z" />
    <line x1="18" y1="5" x2="14" y2="9" />
  </svg>
);
