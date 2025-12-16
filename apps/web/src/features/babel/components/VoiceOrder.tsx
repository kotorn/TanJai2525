'use client';

import { useState } from 'react';
import { Mic, MicOff, Globe, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function VoiceOrder() {
  const [isListening, setIsListening] = useState(false);
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [isLoading, setIsLoading] = useState(false);

  // Real Web Speech API with fallback
  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      // Stop recognition logic if managed globally, but here we just toggle state for UI
      window.speechRecognitionInstance?.stop();
      toast.success('Voice capture stopped');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error('Browser does not support Voice Recognition. Using simulation.');
      setIsListening(true);
      setTimeout(() => {
         setInputText('ข้าวมันไก่ผสม (Simulated)');
         setIsListening(false);
      }, 2000);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'th-TH'; // Default to Thai for street food
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info('Listening... (Speak Thai)');
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      toast.success(`Heard: "${transcript}"`);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech error', event.error);
      setIsListening(false);
      toast.error(`Error: ${event.error}`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    (window as any).speechRecognitionInstance = recognition;
    recognition.start();
  };

  const handleTranslate = async () => {
    if (!inputText) return;
    
    setIsLoading(true);
    try {
      const res = await fetch('/api/babel-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, targetLang }),
      });
      
      const data = await res.json();
      if (data.translated) {
        setTranslatedText(data.translated);
      }
    } catch (e) {
      toast.error('Translation failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl shadow-lg max-w-md w-full border border-gray-100">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-indigo-100 rounded-full text-indigo-600">
            <Globe className="w-6 h-6" />
        </div>
        <div>
            <h2 className="text-xl font-bold text-gray-900">Babel Order</h2>
            <p className="text-sm text-gray-500">Speak any language</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Language Selector */}
        <div className="flex gap-2">
           <select 
             className="flex-1 p-2 border rounded-lg bg-gray-50 text-sm font-medium"
             value={targetLang}
             onChange={(e) => setTargetLang(e.target.value)}
           >
             <option value="en">Translate to English</option>
             <option value="my">Translate to Myanmar</option>
             <option value="km">Translate to Khmer</option>
             <option value="la">Translate to Lao</option>
             <option value="th-isan">Translate to Thai (Isan)</option>
           </select>
        </div>

        {/* Input Area */}
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type or record order..."
            className="w-full p-4 pr-12 border-2 focus:border-indigo-500 rounded-xl min-h-[100px] resize-none transition-colors"
          />
          <button
            onClick={toggleListening}
            className={`absolute right-3 bottom-3 p-2 rounded-full transition-all ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
        </div>

        {/* Action Button */}
        <button
          onClick={handleTranslate}
          disabled={isLoading || !inputText}
          className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Translate <ArrowRight className="w-5 h-5" /></>}
        </button>

        {/* Result Area */}
        {translatedText && (
          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-100 animate-in fade-in slide-in-from-bottom-2">
            <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Result</p>
            <p className="text-lg font-medium text-gray-800">{translatedText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
