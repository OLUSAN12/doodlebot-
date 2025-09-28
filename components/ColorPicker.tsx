import React, { useState, useRef, useEffect, useCallback } from 'react';
import { CloseIcon } from './icons/CloseIcon';
import { TrashIcon } from './icons/TrashIcon';

type SavedPalette = {
  name: string;
  colors: string[];
};

interface ColorPickerProps {
  initialColor: string;
  onColorSelect: (color: string) => void;
  onClose: () => void;
  recentColors: string[];
  savedPalettes: SavedPalette[];
  onSavePalettes: (palettes: SavedPalette[]) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  initialColor,
  onColorSelect,
  onClose,
  recentColors,
  savedPalettes,
  onSavePalettes,
}) => {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(100);
  const [lightness, setLightness] = useState(50);
  const [showPaletteSave, setShowPaletteSave] = useState(false);
  const [newPaletteName, setNewPaletteName] = useState('');

  const colorSquareRef = useRef<HTMLDivElement>(null);
  const hueSliderRef = useRef<HTMLDivElement>(null);

  const hslToHex = (h: number, s: number, l: number): string => {
    l /= 100;
    const a = (s * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + h / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color).toString(16).padStart(2, '0');
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };
  
  const hexToHsl = (hex: string): { h: number; s: number; l: number } => {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  useEffect(() => {
    const hsl = hexToHsl(initialColor);
    setHue(hsl.h);
    setSaturation(hsl.s);
    setLightness(hsl.l);
  }, [initialColor]);
  
  const currentColor = hslToHex(hue, saturation, lightness);

  const handleMouseEvent = (ref: React.RefObject<HTMLDivElement>, callback: (x: number, y: number, rect: DOMRect) => void) => (e: React.MouseEvent) => {
    if (e.buttons !== 1) return;
    const rect = ref.current!.getBoundingClientRect();
    callback(e.clientX, e.clientY, rect);
  };
  
  const handleTouchEvent = (ref: React.RefObject<HTMLDivElement>, callback: (x: number, y: number, rect: DOMRect) => void) => (e: React.TouchEvent) => {
    const rect = ref.current!.getBoundingClientRect();
    callback(e.touches[0].clientX, e.touches[0].clientY, rect);
  };
  
  const updateColorFromSquare = (clientX: number, clientY: number, rect: DOMRect) => {
    const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
    const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
    setSaturation((x / rect.width) * 100);
    setLightness(100 - (y / rect.height) * 100);
  };

  const updateHueFromSlider = (clientX: number, clientY: number, rect: DOMRect) => {
     const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
     setHue((x / rect.width) * 360);
  }

  const handleSavePalette = () => {
    if (newPaletteName.trim() && recentColors.length > 0) {
        const newPalette: SavedPalette = {
            name: newPaletteName.trim(),
            colors: [...recentColors]
        };
        onSavePalettes([...savedPalettes, newPalette]);
        setNewPaletteName('');
        setShowPaletteSave(false);
    }
  }

  const handleLoadPalette = (palette: SavedPalette) => {
      palette.colors.forEach(color => onColorSelect(color));
      onClose(); // Close picker after loading
  }

  const handleDeletePalette = (index: number) => {
      const updatedPalettes = savedPalettes.filter((_, i) => i !== index);
      onSavePalettes(updatedPalettes);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-2 sm:p-4" onMouseDown={onClose}>
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-3 sm:p-4 flex flex-col gap-3 sm:gap-4 max-h-[95vh] overflow-y-auto" onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">Choose a Color</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100"><CloseIcon className="w-6 h-6 text-slate-600"/></button>
        </div>

        <div className="relative h-48 w-full rounded-lg overflow-hidden cursor-crosshair" 
             ref={colorSquareRef}
             style={{backgroundColor: `hsl(${hue}, 100%, 50%)`}}
             onMouseDown={handleMouseEvent(colorSquareRef, updateColorFromSquare)}
             onMouseMove={handleMouseEvent(colorSquareRef, updateColorFromSquare)}
             onTouchStart={handleTouchEvent(colorSquareRef, updateColorFromSquare)}
             onTouchMove={handleTouchEvent(colorSquareRef, updateColorFromSquare)}
        >
            <div className="absolute inset-0" style={{background: 'linear-gradient(to right, white, transparent)'}} />
            <div className="absolute inset-0" style={{background: 'linear-gradient(to top, black, transparent)'}} />
            <div className="absolute w-4 h-4 rounded-full border-2 border-white shadow-md pointer-events-none"
                 style={{
                     left: `calc(${saturation}% - 8px)`,
                     top: `calc(${100 - lightness}% - 8px)`,
                     backgroundColor: currentColor
                 }}
            />
        </div>
        
        <div className="relative h-6 w-full rounded-full cursor-pointer"
             ref={hueSliderRef}
             style={{background: 'linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)'}}
             onMouseDown={handleMouseEvent(hueSliderRef, updateHueFromSlider)}
             onMouseMove={handleMouseEvent(hueSliderRef, updateHueFromSlider)}
             onTouchStart={handleTouchEvent(hueSliderRef, updateHueFromSlider)}
             onTouchMove={handleTouchEvent(hueSliderRef, updateHueFromSlider)}
        >
            <div className="absolute w-5 h-5 rounded-full border-2 border-white bg-white shadow-md pointer-events-none -translate-y-1/2 top-1/2"
                 style={{ left: `calc(${(hue/360)*100}% - 10px)` }}
            />
        </div>

        <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl border-2 border-slate-200" style={{backgroundColor: currentColor}}></div>
            <div className="flex-grow flex flex-col gap-1">
                <span className="font-mono text-center bg-slate-100 text-slate-700 rounded-md py-1">{currentColor}</span>
                <button onClick={() => onColorSelect(currentColor)} className="w-full bg-sky-500 text-white font-bold py-2 rounded-lg hover:bg-sky-600 transition">
                    Select
                </button>
            </div>
        </div>

        <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-2">Recent Colors</h3>
            <div className="flex items-center gap-2 flex-wrap">
                {recentColors.map((c) => (
                    <button key={c} onClick={() => onColorSelect(c)} style={{backgroundColor: c}} className="w-8 h-8 rounded-full ring-2 ring-white hover:ring-sky-400 transition" />
                ))}
            </div>
        </div>

        <div className="h-px bg-slate-200"></div>

        <div>
            <h3 className="text-sm font-semibold text-slate-600 mb-2">My Palettes</h3>
            <div className="flex flex-col gap-2 max-h-24 overflow-y-auto pr-2">
                {savedPalettes.map((palette, index) => (
                    <div key={index} className="flex items-center justify-between group">
                        <button onClick={() => handleLoadPalette(palette)} className="flex items-center gap-2 text-left hover:bg-slate-100 p-1 rounded-md w-full">
                            <span className="font-semibold text-slate-700">{palette.name}</span>
                            <div className="flex gap-1">{palette.colors.slice(0, 5).map(c => <div key={c} style={{backgroundColor: c}} className="w-4 h-4 rounded-full"/>)}</div>
                        </button>
                        <button onClick={() => handleDeletePalette(index)} className="p-1 opacity-0 group-hover:opacity-100 transition">
                            <TrashIcon className="w-4 h-4 text-red-500"/>
                        </button>
                    </div>
                ))}
            </div>
             {showPaletteSave ? (
                <div className="flex gap-2 mt-2">
                    <input type="text" value={newPaletteName} onChange={e => setNewPaletteName(e.target.value)} placeholder="Palette name" className="w-full text-sm border-2 border-slate-200 rounded-md p-1.5 focus:ring-2 focus:ring-amber-300 focus:border-amber-400"/>
                    <button onClick={handleSavePalette} className="bg-amber-400 text-white font-bold px-3 rounded-md hover:bg-amber-500 text-sm">Save</button>
                    <button onClick={() => setShowPaletteSave(false)} className="bg-slate-200 text-slate-600 px-2 rounded-md hover:bg-slate-300 text-sm">X</button>
                </div>
             ) : (
                <button onClick={() => setShowPaletteSave(true)} className="text-sm text-sky-600 font-semibold hover:underline mt-2">+ Save current recent colors as palette</button>
             )}
        </div>

      </div>
    </div>
  );
};

export default ColorPicker;