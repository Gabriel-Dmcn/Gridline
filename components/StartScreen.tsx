/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';

interface StartScreenProps {
  onStart: (aiEnabled: boolean) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [aiEnabled, setAiEnabled] = useState(true);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-50 text-white font-vt323 p-6 bg-slate-900/80 backdrop-blur-sm">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl border-4 border-cyan-500 shadow-2xl relative overflow-hidden animate-fade-in text-center">
        
        <h1 className="text-6xl font-normal mb-2 text-cyan-400 tracking-wider">
          GRIDLINE
        </h1>
        <p className="text-xl text-yellow-300 mb-8 uppercase tracking-widest border-b-2 border-slate-600 pb-4">
          Cidade Inteligente Litorânea
        </p>

        <div className="bg-slate-900 p-5 rounded border-2 border-slate-700 mb-8 text-left">
          <label className="flex items-center justify-between cursor-pointer group">
            <div className="flex flex-col">
              <span className="text-2xl text-white group-hover:text-cyan-300 transition-colors">
                Sistema IA (Gemini)
              </span>
              <span className="text-lg text-slate-500">
                Ativar Metas e Notícias Inteligentes
              </span>
            </div>
            
            <div className="relative flex-shrink-0 ml-4">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
              />
              <div className="w-12 h-6 bg-slate-700 rounded-none border border-slate-500 peer peer-checked:bg-cyan-600 transition-colors"></div>
              <div className={`absolute top-1 left-1 bg-white w-4 h-4 transition-transform ${aiEnabled ? 'translate-x-6' : ''}`}></div>
            </div>
          </label>
        </div>

        <button 
          onClick={() => onStart(aiEnabled)}
          className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-bold text-2xl rounded shadow-lg border-b-4 border-yellow-700 active:border-b-0 active:translate-y-1 transition-all"
        >
          INICIAR CIDADE
        </button>

        <div className="mt-8 text-sm text-slate-500 font-mono">
            PROJETO INF-11 - GRIDLINE
        </div>
      </div>
    </div>
  );
};

export default StartScreen;