
import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import PromptForm from './components/PromptForm';
import ColoringCanvas from './components/ColoringCanvas';
import Gallery from './components/Gallery';
import Settings from './components/Settings';
import { generateColoringPage } from './services/geminiService';

type View = 'home' | 'coloring' | 'gallery' | 'settings';

export type BrushType = 'solid' | 'spray' | 'crayon' | 'rainbow';

export interface AppSettings {
  soundEffects: boolean;
  showConfirmations: boolean;
  defaultBrush: BrushType;
  defaultSize: number;
  defaultColor: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  soundEffects: false,
  showConfirmations: true,
  defaultBrush: 'solid',
  defaultSize: 10,
  defaultColor: '#F4511E',
};


function App() {
  const [prompt, setPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('home');
  const [gallery, setGallery] = useState<string[]>([]);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    try {
      const savedGallery = localStorage.getItem('doodlebot_gallery');
      if (savedGallery) {
        setGallery(JSON.parse(savedGallery));
      }
      const savedSettings = localStorage.getItem('doodlebot_settings');
      if (savedSettings) {
        // Merge saved settings with defaults to ensure new settings are not missing
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
      }
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
    }
  }, []);
  
  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('doodlebot_settings', JSON.stringify(newSettings));
    } catch (e) {
      console.error("Failed to save settings to localStorage", e);
    }
  };

  const handleClearAllData = () => {
    if (window.confirm("This is permanent! Are you absolutely sure you want to delete all your drawings and saved palettes?")) {
      // Clear state
      setGallery([]);
      
      // Clear localStorage
      try {
        localStorage.removeItem('doodlebot_gallery');
        localStorage.removeItem('doodlebot_recent_colors');
        localStorage.removeItem('doodlebot_saved_palettes');
        alert("All your drawings and palettes have been cleared!");
        setView('home'); // Go back home after clearing
      } catch (e) {
        console.error("Failed to clear data from localStorage", e);
        alert("Oops! Something went wrong while clearing the data.");
      }
    }
  };

  const generateDrawing = useCallback(async (currentPrompt: string) => {
    if (!currentPrompt.trim() || isLoading) return;

    if (!navigator.onLine) {
        setError("You seem to be offline! Please check your connection to create new drawings.");
        return;
    }

    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    // Ensure prompt state is synced, especially if called from speech recognition
    setPrompt(currentPrompt);

    try {
      const generatedUrl = await generateColoringPage(currentPrompt);
      setImageUrl(generatedUrl);
      setView('coloring');
    } catch (err) {
      console.error(err);
      setError('Oops! DoodleBot got a bit tangled. Please try drawing something else.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    generateDrawing(prompt);
  };

  const handleSaveColoring = (imageData: string) => {
    const newGallery = [imageData, ...gallery];
    setGallery(newGallery);
    try {
      localStorage.setItem('doodlebot_gallery', JSON.stringify(newGallery));
    } catch (e) {
        console.error("Failed to save to gallery in localStorage", e);
    }
    setView('gallery');
  };
  
  const handleDeleteFromGallery = (index: number) => {
    const newGallery = gallery.filter((_, i) => i !== index);
    setGallery(newGallery);
    try {
      localStorage.setItem('doodlebot_gallery', JSON.stringify(newGallery));
    } catch (e) {
      console.error("Failed to update gallery in localStorage", e);
    }
  };

  const renderHome = () => (
    <div className="bg-amber-50 min-h-screen text-slate-800 flex flex-col items-center p-4 selection:bg-amber-300">
      <div className="w-full max-w-4xl mx-auto">
        <Header 
            onGalleryClick={() => setView('gallery')} 
            onSettingsClick={() => setView('settings')}
        />
        <main className="mt-8">
          <PromptForm 
            value={prompt}
            onValueChange={setPrompt}
            onSubmit={handleSubmit}
            onGenerate={generateDrawing}
            isLoading={isLoading}
          />
           {error && (
            <div className="mt-8 text-center p-4 bg-red-100 border-2 border-red-200 rounded-xl">
              <div className="text-5xl mb-3">😥</div>
              <p className="text-red-700 font-semibold text-xl">{error}</p>
            </div>
          )}
        </main>
         <footer className="text-center text-slate-500 mt-12 pb-6">
            <p>Crafted with magic by DoodleBot ✨</p>
        </footer>
      </div>
    </div>
  );

  const renderContent = () => {
    switch(view) {
      case 'coloring':
        return imageUrl ? (
          <ColoringCanvas 
            imageUrl={imageUrl} 
            onSave={handleSaveColoring}
            onBack={() => {
              setImageUrl(null);
              setView('home');
            }}
            settings={settings}
          />
        ) : null;
      case 'gallery':
        return <Gallery 
                  images={gallery} 
                  onBack={() => setView('home')} 
                  onDelete={handleDeleteFromGallery}
                  showConfirmations={settings.showConfirmations}
               />;
      case 'settings':
        return <Settings 
                  settings={settings}
                  onSettingsChange={handleSettingsChange}
                  onClearAllData={handleClearAllData}
                  onBack={() => setView('home')}
                />
      case 'home':
      default:
        return renderHome();
    }
  };

  return <>{renderContent()}</>;
}

export default App;
