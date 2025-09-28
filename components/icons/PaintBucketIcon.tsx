import React from 'react';

export const PaintBucketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
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
    <path d="M12 1.5l-8.5 8.5a1 1 0 000 1.41l7.09 7.09a1 1 0 001.41 0L20.5 11.41a1 1 0 000-1.41L12 1.5z" />
    <path d="M12 1.5L22.5 12" />
    <path d="M3 21h18" />
  </svg>
);
