import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { GalleryIcon } from './icons/GalleryIcon';
import { SettingsIcon } from './icons/SettingsIcon';

interface HeaderProps {
    onGalleryClick: () => void;
    onSettingsClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onGalleryClick, onSettingsClick }) => {
  return (
    <header className="text-center relative">
      <div className="inline-block bg-white p-4 rounded-full shadow-lg">
        <span className="text-5xl" role="img" aria-label="Robot face">🤖</span>
      </div>
      <h1 className="mt-4 text-4xl md:text-5xl font-bold text-sky-600 flex items-center justify-center gap-3">
        DoodleBot's Magic Coloring
        <SparklesIcon className="w-8 h-8 text-amber-400" />
      </h1>
      <p className="mt-2 text-lg text-slate-600">
        Hi! I'm DoodleBot. What magical picture should we draw today?
      </p>
      <div className="absolute top-0 right-0 mt-2 mr-2 flex items-center gap-2">
         <button 
            onClick={onSettingsClick}
            className="flex items-center justify-center w-12 h-12 sm:w-auto sm:h-auto sm:gap-2 bg-slate-400 text-white font-bold py-2 px-3 sm:px-4 rounded-full shadow-md hover:bg-slate-500 transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-300"
            aria-label="Open settings"
          >
            <SettingsIcon className="w-6 h-6"/>
            <span className="hidden sm:inline">Settings</span>
          </button>
          <button 
            onClick={onGalleryClick}
            className="flex items-center justify-center w-12 h-12 sm:w-auto sm:h-auto sm:gap-2 bg-pink-400 text-white font-bold py-2 px-3 sm:px-4 rounded-full shadow-md hover:bg-pink-500 transform hover:-translate-y-0.5 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-pink-300"
            aria-label="Open my gallery"
          >
            <GalleryIcon className="w-6 h-6"/>
            <span className="hidden sm:inline">My Gallery</span>
          </button>
      </div>
    </header>
  );
};

export default Header;