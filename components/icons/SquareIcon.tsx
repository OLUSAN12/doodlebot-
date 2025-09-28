import React from 'react';

export const SquareIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="2" />
  </svg>
);
