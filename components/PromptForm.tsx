import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { MicrophoneIcon } from './icons/MicrophoneIcon';

// Polyfill for browser compatibility
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface PromptFormProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

const PromptForm: React.FC<PromptFormProps> = ({ value, onValueChange, onSubmit, onGenerate, isLoading }) => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupport, setSpeechSupport] = useState(false);
  const recognitionRef = useRef<any | null>(null);
  const finalTranscriptRef = useRef('');

  // Use a ref to hold the latest props, preventing stale closures in callbacks.
  const propsRef = useRef({ onValueChange, onGenerate, isLoading });
  useEffect(() => {
    propsRef.current = { onValueChange, onGenerate, isLoading };
  });

  // This effect runs only once on mount to set up the speech recognition instance and its handlers.
  useEffect(() => {
    if (!SpeechRecognition) {
      setSpeechSupport(false);
      return;
    }
    
    setSpeechSupport(true);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognitionRef.current = recognition;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }
      
      const fullTranscript = finalTranscript || interimTranscript;
      propsRef.current.onValueChange(fullTranscript);

      if (finalTranscript) {
        finalTranscriptRef.current = finalTranscript.trim();
      }
    };
    
    recognition.onend = () => {
      setIsListening(false);
      // If we have a final result and we're not already loading, generate the image.
      if (finalTranscriptRef.current && !propsRef.current.isLoading) {
        propsRef.current.onGenerate(finalTranscriptRef.current);
        finalTranscriptRef.current = ''; // Reset for the next time.
      }
    };

    recognition.onerror = (event: any) => {
      // Ignore 'aborted' error which can happen if the user stops it manually or on cleanup.
      if (event.error !== 'aborted') {
        console.error('Speech recognition error:', event.error);
      }
      setIsListening(false);
    };
    
    // Cleanup on unmount to prevent resource leaks.
    return () => {
      recognition.abort();
    };
  }, []); // Empty dependency array ensures this runs only once.


  const handleToggleListen = () => {
    if (isLoading || !recognitionRef.current) return;
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      onValueChange(''); // Clear previous text
      finalTranscriptRef.current = '';
      recognitionRef.current.start();
      setIsListening(true);
    }
  };


  return (
    <form onSubmit={onSubmit} className="bg-white p-6 rounded-2xl shadow-lg border-2 border-slate-100">
      <label htmlFor="prompt" className="block text-lg font-semibold text-slate-700 mb-2">
        Tell me your idea!
      </label>
      <div className="relative w-full">
        <textarea
          id="prompt"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder="e.g., 'a happy unicorn eating ice cream' or 'a dinosaur on a skateboard'"
          className="w-full h-28 p-4 pr-16 text-lg border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-amber-300 focus:border-amber-400 transition duration-300 resize-none"
          disabled={isLoading}
        />
        {speechSupport && (
          <button
            type="button"
            onClick={handleToggleListen}
            disabled={isLoading}
            className={`absolute top-1/2 right-4 -translate-y-1/2 p-2 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            aria-label={isListening ? 'Stop listening' : 'Start listening'}
          >
            <MicrophoneIcon className="w-6 h-6" />
          </button>
        )}
      </div>
      <button
        type="submit"
        disabled={isLoading || !value.trim()}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-sky-500 text-white font-bold text-xl py-4 px-6 rounded-xl shadow-md hover:bg-sky-600 disabled:bg-slate-300 disabled:cursor-not-allowed transform hover:-translate-y-1 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-sky-300"
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Doodling...
          </>
        ) : (
          <>
            <SparklesIcon className="w-6 h-6" />
            Create My Coloring Page!
          </>
        )}
      </button>
    </form>
  );
};

export default PromptForm;