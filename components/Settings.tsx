import React from 'react';
import { AppSettings, BrushType } from '../App';
import { CloseIcon } from './icons/CloseIcon';
import ToggleSwitch from './ToggleSwitch';
import { BrushIcon } from './icons/BrushIcon';
import { SprayIcon } from './icons/SprayIcon';
import { CrayonIcon } from './icons/CrayonIcon';
import { RainbowIcon } from './icons/RainbowIcon';

interface SettingsProps {
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void;
  onClearAllData: () => void;
  onBack: () => void;
}

const BRUSH_TYPES: BrushType[] = ['solid', 'spray', 'crayon', 'rainbow'];
const BRUSH_SIZES = [5, 10, 20, 30];

const BrushIconComponent = ({ type, ...props }: { type: BrushType } & React.SVGProps<SVGSVGElement>) => {
  switch (type) {
    case 'solid': return <BrushIcon {...props} />;
    case 'spray': return <SprayIcon {...props} />;
    case 'crayon': return <CrayonIcon {...props} />;
    case 'rainbow': return <RainbowIcon {...props} />;
    default: return null;
  }
};

const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange, onClearAllData, onBack }) => {

  const handleSettingChange = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  return (
    <div className="fixed inset-0 bg-amber-50 p-4 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-xl mx-auto">
        <header className="flex items-center justify-between pb-4 mb-4 border-b-2 border-amber-200">
          <h1 className="text-3xl sm:text-4xl font-bold text-sky-600">Settings</h1>
          <button
            onClick={onBack}
            className="p-3 bg-white rounded-full shadow-md text-slate-600 hover:bg-slate-100 transition-transform transform hover:scale-105"
            aria-label="Back to home"
          >
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="space-y-8">
            {/* General Settings */}
            <div>
                <h2 className="text-xl font-bold text-slate-700 mb-4">General</h2>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
                    <ToggleSwitch 
                        label="Sound Effects"
                        enabled={settings.soundEffects}
                        onChange={() => handleSettingChange('soundEffects', !settings.soundEffects)}
                        description="Play fun sounds when you color. (Coming soon!)"
                        disabled={true}
                    />
                    <ToggleSwitch 
                        label="Show Confirmations"
                        enabled={settings.showConfirmations}
                        onChange={() => handleSettingChange('showConfirmations', !settings.showConfirmations)}
                        description="Ask before clearing or deleting your artwork."
                    />
                </div>
            </div>

            {/* Default Tool Settings */}
            <div>
                <h2 className="text-xl font-bold text-slate-700 mb-4">Default Tool Settings</h2>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
                    <div>
                        <h3 className="font-semibold text-slate-800 mb-2">Default Brush</h3>
                        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                           {BRUSH_TYPES.map(type => (
                                <button key={type} onClick={() => handleSettingChange('defaultBrush', type)} className={`flex-1 p-2 rounded-md transition capitalize text-sm font-semibold flex items-center justify-center gap-2 ${settings.defaultBrush === type ? 'bg-white shadow' : 'text-slate-500 hover:bg-slate-200'}`}>
                                    <BrushIconComponent type={type} className="w-5 h-5" />
                                    {type}
                                </button>
                           ))}
                        </div>
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 mb-2">Default Size</h3>
                         <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                            {BRUSH_SIZES.map(size => (
                                <button key={size} onClick={() => handleSettingChange('defaultSize', size)} className={`flex-1 p-2 rounded-md transition text-sm font-semibold ${settings.defaultSize === size ? 'bg-white shadow' : 'text-slate-500 hover:bg-slate-200'}`}>
                                    {size}px
                                </button>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-semibold text-slate-800 mb-2">Default Color</h3>
                         <div className="flex items-center gap-3">
                            <input 
                                type="color" 
                                value={settings.defaultColor} 
                                onChange={(e) => handleSettingChange('defaultColor', e.target.value)}
                                className="w-12 h-10 p-1 bg-white border-2 border-slate-200 rounded-lg cursor-pointer"
                                aria-label="Select default color"
                             />
                             <span className="font-mono text-slate-600 bg-slate-100 px-3 py-1 rounded-md">{settings.defaultColor}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Data Management */}
            <div>
                <h2 className="text-xl font-bold text-slate-700 mb-4">Danger Zone</h2>
                 <div className="bg-white p-4 rounded-xl shadow-sm border-2 border-red-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <h3 className="font-semibold text-red-800">Clear All Data</h3>
                            <p className="text-sm text-slate-500 mt-1 max-w-md">Permanently delete all of your saved drawings and custom color palettes.</p>
                        </div>
                        <button 
                            onClick={onClearAllData}
                            className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0 bg-red-500 text-white font-bold py-2 px-4 rounded-lg shadow-md hover:bg-red-600 transition focus:outline-none focus:ring-4 focus:ring-red-300"
                        >
                            Clear Data
                        </button>
                    </div>
                </div>
            </div>
             {/* About Section */}
            <div>
                <h2 className="text-xl font-bold text-slate-700 mb-4">About</h2>
                 <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                     <h3 className="font-semibold text-slate-800 text-lg flex items-center gap-2">🤖 DoodleBot's Mission</h3>
                     <p className="text-slate-600 mt-2">
                        Hi, I'm DoodleBot! I was created to bring children's imaginations to life. My mission is to create endless pages of coloring fun, turning any idea—no matter how silly or magical—into a beautiful drawing ready for your artistic touch. Happy coloring!
                    </p>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;