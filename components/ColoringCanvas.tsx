import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AppSettings, BrushType } from '../App';
import { BrushIcon } from './icons/BrushIcon';
import { EraserIcon } from './icons/EraserIcon';
import { UndoIcon } from './icons/UndoIcon';
import { SaveIcon } from './icons/SaveIcon';
import { CloseIcon } from './icons/CloseIcon';
import { SprayIcon } from './icons/SprayIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PaintBucketIcon } from './icons/PaintBucketIcon';
import ColorPicker from './ColorPicker';
import { PaletteIcon } from './icons/PaletteIcon';
import { OpacityIcon } from './icons/OpacityIcon';
import { CrayonIcon } from './icons/CrayonIcon';
import { RainbowIcon } from './icons/RainbowIcon';
import { LayoutDashboardIcon } from './icons/LayoutDashboardIcon';

type SavedPalette = {
  name: string;
  colors: string[];
};

interface ColoringCanvasProps {
  imageUrl: string;
  onSave: (imageDataUrl: string) => void;
  onBack: () => void;
  settings: AppSettings;
}

const BRUSH_SIZES = [5, 10, 20, 30];
const SIMPLE_COLORS = [
  '#E53935', '#F4511E', '#FFB300', '#4CAF50', '#00ACC1', 
  '#1E88E5', '#5E35B1', '#D81B60', '#FFFFFF', '#000000'
];
const FLOOD_FILL_TOLERANCE = 32;

const hexToRgba = (hex: string, alpha: number): [number, number, number, number] => {
  if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) return [0, 0, 0, Math.round(alpha * 255)];
  let c = hex.substring(1).split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  const num = parseInt(c.join(''), 16);
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255, Math.round(alpha * 255)];
};

const rgbaToString = (rgba: [number, number, number, number]): string => {
  return `rgba(${rgba[0]}, ${rgba[1]}, ${rgba[2]}, ${rgba[3] / 255})`;
};


const ColoringCanvas: React.FC<ColoringCanvasProps> = ({ imageUrl, onSave, onBack, settings }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(settings.defaultColor);
  const [brushSize, setBrushSize] = useState(settings.defaultSize);
  const [opacity, setOpacity] = useState(1);
  const [activeTool, setActiveTool] = useState<'brush' | 'eraser' | 'fill'>('brush');
  const [activeBrush, setActiveBrush] = useState<BrushType>(settings.defaultBrush);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const [recentColors, setRecentColors] = useState<string[]>([]);
  const [savedPalettes, setSavedPalettes] = useState<SavedPalette[]>([]);
  const [isCanvasReady, setIsCanvasReady] = useState(false);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);

  const history = useRef<ImageData[]>([]);
  const rainbowHue = useRef(0);
  // Fix: Use ReturnType<typeof setTimeout> for browser compatibility instead of NodeJS.Timeout.
  const toolbarTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToolbar = useCallback(() => {
    if (toolbarTimeoutRef.current) {
      clearTimeout(toolbarTimeoutRef.current);
    }
    setIsToolbarVisible(true);
    toolbarTimeoutRef.current = setTimeout(() => {
      setIsToolbarVisible(false);
    }, 4000); // Auto-hide after 4 seconds of inactivity
  }, []);

  const toggleToolbar = () => {
    if (toolbarTimeoutRef.current) {
      clearTimeout(toolbarTimeoutRef.current);
      toolbarTimeoutRef.current = null;
    }
    setIsToolbarVisible(prev => !prev);
  };

  useEffect(() => {
    showToolbar(); // Show on mount and start timer
    return () => {
      if (toolbarTimeoutRef.current) {
        clearTimeout(toolbarTimeoutRef.current);
      }
    };
  }, [showToolbar]);

  useEffect(() => {
    try {
      const savedRecent = localStorage.getItem('doodlebot_recent_colors');
      if (savedRecent) setRecentColors(JSON.parse(savedRecent));
      const savedPalettesData = localStorage.getItem('doodlebot_saved_palettes');
      if (savedPalettesData) setSavedPalettes(JSON.parse(savedPalettesData));
    } catch (e) {
      console.error("Failed to load colors from localStorage", e);
    }
  }, []);

  const updateRecentColors = (newColor: string) => {
    const updated = [newColor, ...recentColors.filter(c => c !== newColor)].slice(0, 10);
    setRecentColors(updated);
    localStorage.setItem('doodlebot_recent_colors', JSON.stringify(updated));
  };
  
  const handleColorSelect = (newColor: string) => {
    setColor(newColor);
    updateRecentColors(newColor);
    setIsColorPickerOpen(false);
  };
  
  const handleSavePalettes = (palettes: SavedPalette[]) => {
    setSavedPalettes(palettes);
     localStorage.setItem('doodlebot_saved_palettes', JSON.stringify(palettes));
  }


  const saveToHistory = useCallback(() => {
    if (canvasRef.current && contextRef.current) {
      const imageData = contextRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
      history.current.push(imageData);
      if (history.current.length > 20) {
        history.current.shift();
      }
    }
  }, []);
  
  const handleUndo = () => {
    if (history.current.length > 1 && contextRef.current) {
      history.current.pop();
      const lastState = history.current[history.current.length - 1];
      contextRef.current.putImageData(lastState, 0, 0);
    }
  };

  const resetCanvasToImage = useCallback(() => {
    setIsCanvasReady(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d', { willReadFrequently: true });
    if (!canvas || !ctx) return;

    contextRef.current = ctx;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.src = imageUrl;
    image.onload = () => {
      const MAX_DIMENSION = 1200;
      let newWidth = image.naturalWidth;
      let newHeight = image.naturalHeight;

      if (newWidth > MAX_DIMENSION || newHeight > MAX_DIMENSION) {
        const aspectRatio = newWidth / newHeight;
        if (newWidth > newHeight) {
          newWidth = MAX_DIMENSION;
          newHeight = newWidth / aspectRatio;
        } else {
          newHeight = MAX_DIMENSION;
          newWidth = newHeight * aspectRatio;
        }
      }
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      
      const initialImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      history.current = [initialImageData];
      setIsCanvasReady(true);
    };
  }, [imageUrl]);

  useEffect(() => {
    resetCanvasToImage();
  }, [resetCanvasToImage]);

  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e.nativeEvent ? e.nativeEvent.touches[0].clientX : e.nativeEvent.clientX;
    const clientY = 'touches' in e.nativeEvent ? e.nativeEvent.touches[0].clientY : e.nativeEvent.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const floodFill = (startX: number, startY: number) => {
      const ctx = contextRef.current;
      if (!ctx) return;
      saveToHistory();

      const canvas = canvasRef.current!;
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const startPos = (Math.round(startY) * canvas.width + Math.round(startX)) * 4;
      
      const targetColor = [data[startPos], data[startPos + 1], data[startPos + 2], data[startPos + 3]];
      const fillColor = hexToRgba(color, opacity);
      
      const isLine = targetColor[0] < 50 && targetColor[1] < 50 && targetColor[2] < 50;
      if (isLine) {
        return; // Clicked on a line, don't fill.
      }

      if (
        targetColor[0] === fillColor[0] &&
        targetColor[1] === fillColor[1] &&
        targetColor[2] === fillColor[2] &&
        targetColor[3] === fillColor[3]
      ) {
        return; // Clicked on a color that is already the fill color
      }

      const pixelStack = [[Math.round(startX), Math.round(startY)]];
      
      while (pixelStack.length > 0) {
        const [x, y] = pixelStack.pop()!;
        if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
        
        const currentPos = (y * canvas.width + x) * 4;
        const currentColor = [data[currentPos], data[currentPos + 1], data[currentPos + 2], data[currentPos + 3]];

        const colorDistance = Math.sqrt(
            Math.pow(currentColor[0] - targetColor[0], 2) +
            Math.pow(currentColor[1] - targetColor[1], 2) +
            Math.pow(currentColor[2] - targetColor[2], 2)
        );

        if (colorDistance < FLOOD_FILL_TOLERANCE) {
            data[currentPos] = fillColor[0];
            data[currentPos + 1] = fillColor[1];
            data[currentPos + 2] = fillColor[2];
            data[currentPos + 3] = fillColor[3];

            pixelStack.push([x + 1, y]);
            pixelStack.push([x - 1, y]);
            pixelStack.push([x, y + 1]);
            pixelStack.push([x, y - 1]);
        }
      }
      ctx.putImageData(imageData, 0, 0);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isCanvasReady) return;
    if (activeTool === 'fill') {
      const { x, y } = getCoords(e);
      floodFill(x, y);
    } else {
      startDrawing(e);
    }
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const ctx = contextRef.current;
    if (!ctx) return;
    saveToHistory();
    const { x, y } = getCoords(e);
    setIsDrawing(true);
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    draw(e);
  };

  const stopDrawing = () => {
    const ctx = contextRef.current;
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const ctx = contextRef.current;
    if (!ctx) return;
    const { x, y } = getCoords(e);
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = brushSize;
    
    let currentOpacity = opacity;
    let currentColor = color;

    if (activeTool === 'eraser') {
      ctx.strokeStyle = 'white';
    } else {
       switch (activeBrush) {
        case 'spray': {
            const sprayRadius = brushSize;
            for (let i = 0; i < sprayRadius * 2; i++) {
                const angle = Math.random() * 2 * Math.PI;
                const radius = Math.random() * sprayRadius;
                const dotX = x + Math.cos(angle) * radius;
                const dotY = y + Math.sin(angle) * radius;
                ctx.fillStyle = rgbaToString(hexToRgba(currentColor, currentOpacity * 0.5));
                ctx.beginPath();
                ctx.arc(dotX, dotY, 1, 0, Math.PI * 2);
                ctx.fill();
            }
            return; // spray is fill-based, not stroke-based
        }
        case 'crayon':
            currentOpacity *= 0.7; // Crayon is less opaque
            break;
        case 'rainbow':
            rainbowHue.current = (rainbowHue.current + 3) % 360;
            currentColor = `hsl(${rainbowHue.current}, 90%, 60%)`;
            break;
        case 'solid':
        default:
            // use default color and opacity
            break;
      }
      ctx.strokeStyle = rgbaToString(hexToRgba(currentColor, currentOpacity));
    }
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      onSave(canvas.toDataURL('image/png'));
    }
  };
  
  const handleClearCanvas = () => {
    const performClear = () => {
        resetCanvasToImage();
    };

    if (settings.showConfirmations) {
        if (window.confirm("Are you sure you want to start over? This will erase all your coloring.")) {
            performClear();
        }
    } else {
        performClear();
    }
  };

  const handleActivity = () => {
    showToolbar();
  };

  return (
    <div 
      className="w-screen h-screen bg-slate-200 flex flex-col items-center justify-center overflow-hidden"
      onMouseMove={handleActivity}
      onTouchStart={handleActivity}
      >

      <button 
        onClick={toggleToolbar} 
        className="absolute top-4 right-4 z-30 bg-white/70 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-white transition-all duration-300"
        aria-label="Toggle Toolbar"
      >
        <LayoutDashboardIcon className="w-6 h-6 text-slate-700" />
      </button>

      <header className={`w-full bg-white/80 backdrop-blur-sm p-3 landscape:py-1.5 shadow-md z-20 flex justify-between items-center transition-transform duration-300 ease-in-out ${isToolbarVisible ? 'translate-y-0' : '-translate-y-full'}`}>
        <button onClick={onBack} className="flex items-center gap-2 bg-slate-100 text-slate-700 p-2 rounded-lg hover:bg-slate-200 transition" aria-label="Go back">
            <CloseIcon className="w-6 h-6" />
            <span className="font-semibold hidden sm:inline">Home</span>
        </button>
        <div className="flex gap-2 sm:gap-3">
         <button onClick={handleClearCanvas} disabled={!isCanvasReady} className="bg-red-100 text-red-600 p-2 rounded-lg hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Clear canvas">
            <TrashIcon className="w-6 h-6" />
        </button>
         <button onClick={handleSave} disabled={!isCanvasReady} className="flex items-center gap-2 bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Save coloring">
            <SaveIcon className="w-6 h-6" />
            <span className="font-bold hidden sm:inline">Save</span>
        </button>
        </div>
      </header>
      
      <main className="relative flex-grow w-full overflow-auto p-4">
        {!isCanvasReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-sm z-20">
                <svg className="animate-spin h-10 w-10 text-sky-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-3 text-slate-700 font-semibold text-lg">Preparing your drawing...</p>
            </div>
        )}
        <canvas
          ref={canvasRef}
          onMouseDown={handleCanvasMouseDown}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onMouseMove={draw}
          onTouchStart={handleCanvasMouseDown}
          onTouchEnd={stopDrawing}
          onTouchMove={draw}
          className="bg-white rounded-lg shadow-2xl touch-none block mx-auto my-4"
          style={{ cursor: activeTool === 'fill' ? 'copy' : 'crosshair', visibility: isCanvasReady ? 'visible' : 'hidden' }}
        />
      </main>

      <footer className={`w-full bg-white/80 backdrop-blur-sm p-2 landscape:py-1 shadow-inner z-20 transition-transform duration-300 ease-in-out ${isToolbarVisible ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className={`w-full max-w-3xl mx-auto p-1 sm:p-2 rounded-2xl flex flex-col gap-2 ${!isCanvasReady ? 'opacity-50 cursor-not-allowed' : ''}`}>
            
            <div className="flex items-center justify-between gap-1 sm:gap-3 flex-wrap">
                <div className="flex items-center gap-1 sm:gap-2">
                    <button onClick={handleUndo} disabled={!isCanvasReady || history.current.length <= 1} className="p-2 rounded-lg transition hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Undo"><UndoIcon className="w-6 h-6 text-slate-600"/></button>
                    <div className="h-6 w-px bg-slate-300"></div>
                    <button onClick={() => setActiveTool('brush')} disabled={!isCanvasReady} className={`p-2 rounded-lg transition ${activeTool === 'brush' ? 'bg-sky-200' : 'hover:bg-slate-100'}`} aria-label="Brush"><BrushIcon className="w-6 h-6 text-sky-600"/></button>
                    <button onClick={() => setActiveTool('eraser')} disabled={!isCanvasReady} className={`p-2 rounded-lg transition ${activeTool === 'eraser' ? 'bg-red-200' : 'hover:bg-slate-100'}`} aria-label="Eraser"><EraserIcon className="w-6 h-6 text-red-500"/></button>
                    <button onClick={() => setActiveTool('fill')} disabled={!isCanvasReady} className={`p-2 rounded-lg transition ${activeTool === 'fill' ? 'bg-amber-200' : 'hover:bg-slate-100'}`} aria-label="Fill"><PaintBucketIcon className="w-6 h-6 text-amber-600"/></button>
                    <div className="h-6 w-px bg-slate-300"></div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-slate-200 p-1 rounded-full">
                        {SIMPLE_COLORS.map(c => (
                            <button
                                key={c}
                                onClick={() => { setColor(c); updateRecentColors(c); }}
                                style={{ backgroundColor: c }}
                                className={`w-6 h-6 rounded-full transition transform hover:scale-110 ${color.toUpperCase() === c.toUpperCase() ? 'ring-2 ring-offset-1 ring-sky-500' : 'ring-1 ring-slate-300'}`}
                                aria-label={`Select color ${c}`}
                            />
                        ))}
                    </div>
                    <button 
                        onClick={() => setIsColorPickerOpen(true)}
                        disabled={!isCanvasReady}
                        className="w-8 h-8 rounded-full ring-2 ring-offset-1 ring-slate-300 transition transform hover:scale-110 disabled:cursor-not-allowed flex items-center justify-center bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500"
                        aria-label="Open advanced color picker"
                    >
                        <PaletteIcon className="w-5 h-5 text-white/90" />
                    </button>
                    <div className="hidden sm:flex items-center gap-2 w-28">
                        <OpacityIcon className="text-slate-500 w-5 h-5" />
                        <input type="range" min="0.05" max="1" step="0.05" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} disabled={!isCanvasReady} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-500" aria-label="Color opacity" />
                    </div>
                </div>
            </div>

            {activeTool === 'brush' && (
            <>
                <div className="h-px bg-slate-200 my-1"></div>
                <div className="flex items-center justify-between gap-1 sm:gap-3 flex-wrap">
                    <div className="flex items-center gap-1 sm:gap-2">
                        <div className="flex items-center bg-slate-200 rounded-lg p-0.5">
                            <button onClick={() => setActiveBrush('solid')} disabled={!isCanvasReady} className={`p-1.5 rounded-md transition ${activeBrush === 'solid' ? 'bg-white shadow-sm' : 'text-slate-500 hover:bg-slate-300'}`} aria-label="Solid Brush"><BrushIcon className="w-5 h-5"/></button>
                            <button onClick={() => setActiveBrush('spray')} disabled={!isCanvasReady} className={`p-1.5 rounded-md transition ${activeBrush === 'spray' ? 'bg-white shadow-sm' : 'text-slate-500 hover:bg-slate-300'}`} aria-label="Spray Brush"><SprayIcon className="w-5 h-5"/></button>
                            <button onClick={() => setActiveBrush('crayon')} disabled={!isCanvasReady} className={`p-1.5 rounded-md transition ${activeBrush === 'crayon' ? 'bg-white shadow-sm' : 'text-slate-500 hover:bg-slate-300'}`} aria-label="Crayon Brush"><CrayonIcon className="w-5 h-5"/></button>
                            <button onClick={() => setActiveBrush('rainbow')} disabled={!isCanvasReady} className={`p-1.5 rounded-md transition ${activeBrush === 'rainbow' ? 'bg-white shadow-sm' : 'text-slate-500 hover:bg-slate-300'}`} aria-label="Rainbow Brush"><RainbowIcon className="w-5 h-5"/></button>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2">
                        {BRUSH_SIZES.map(size => (
                            <button key={size} onClick={() => setBrushSize(size)} disabled={!isCanvasReady} className={`bg-slate-200 rounded-full transition ${brushSize === size ? 'ring-2 ring-sky-400' : 'hover:bg-slate-300'}`} style={{width: size+10, height: size+10}} aria-label={`Brush size ${size}`}></button>
                        ))}
                    </div>
                </div>
            </>
            )}
        </div>
      </footer>
       {isColorPickerOpen && (
        <ColorPicker
          initialColor={color}
          onColorSelect={handleColorSelect}
          onClose={() => setIsColorPickerOpen(false)}
          recentColors={recentColors}
          savedPalettes={savedPalettes}
          onSavePalettes={handleSavePalettes}
        />
      )}
    </div>
  );
};

export default ColoringCanvas;