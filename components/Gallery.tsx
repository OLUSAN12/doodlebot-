import React from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { TrashIcon } from './icons/TrashIcon';

interface GalleryProps {
  images: string[];
  onBack: () => void;
  onDelete: (index: number) => void;
  showConfirmations: boolean;
}

const Gallery: React.FC<GalleryProps> = ({ images, onBack, onDelete, showConfirmations }) => {
  
  const handleDeleteClick = (index: number) => {
    const performDelete = () => {
      onDelete(index);
    };

    if (showConfirmations) {
      if (window.confirm("Are you sure you want to delete this drawing? It cannot be undone.")) {
        performDelete();
      }
    } else {
      performDelete();
    }
  };

  return (
    <div className="fixed inset-0 bg-amber-50 p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-6xl mx-auto">
        <header className="flex items-center justify-between pb-4 mb-4 border-b-2 border-amber-200">
          <h1 className="text-3xl sm:text-4xl font-bold text-sky-600">My Gallery</h1>
          <button
            onClick={onBack}
            className="p-3 bg-white rounded-full shadow-md text-slate-600 hover:bg-slate-100 transition-transform transform hover:scale-105"
            aria-label="Back to home"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        {images.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🖼️</div>
            <h2 className="text-2xl font-semibold text-slate-700">Your gallery is empty!</h2>
            <p className="text-slate-500 mt-2">Create and save a coloring page, and it will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {images.map((imgSrc, index) => (
              <div key={index} className="group relative aspect-square bg-white p-2 rounded-lg shadow-lg border-2 border-slate-100 overflow-hidden">
                <img
                  src={imgSrc}
                  alt={`Colored page ${index + 1}`}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => handleDeleteClick(index)}
                  className="absolute top-1 right-1 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                  aria-label={`Delete image ${index + 1}`}
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Gallery;