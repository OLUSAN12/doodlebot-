import React from 'react';

export const SprayIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    {...props}
  >
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="16.5" cy="8.5" r="1" />
    <circle cx="7.5" cy="15.5" r="1" />
    <circle cx="8" cy="8" r="1.5" />
    <circle cx="16" cy="16" r="1.5" />
    <circle cx="19" cy="12" r="1" />
    <circle cx="5" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);
