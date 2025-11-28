
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { PlayerConfig, HatType } from '../types';

interface CharacterCreatorProps {
  initialConfig: PlayerConfig;
  onSave: (config: PlayerConfig) => void;
  isInitialSetup: boolean;
}

const COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#a855f7', // purple
  '#ec4899', // pink
  '#1f2937', // dark gray
  '#f3f4f6', // white
];

const CharacterCreator: React.FC<CharacterCreatorProps> = ({ initialConfig, onSave, isInitialSetup }) => {
  const [name, setName] = useState(initialConfig.name);
  const [color, setColor] = useState(initialConfig.color);
  const [hat, setHat] = useState<HatType>(initialConfig.hat);

  const handleSave = () => {
    onSave({
      ...initialConfig,
      name: name || 'Prefeito',
      color,
      hat
    });
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
      <div className="bg-slate-800 border-4 border-cyan-500 rounded-xl p-6 w-full max-w-md shadow-2xl font-vt323 text-white">
        
        <h2 className="text-4xl text-center text-cyan-400 mb-6 border-b-2 border-slate-600 pb-2">
          {isInitialSetup ? 'CRIAR PERSONAGEM' : 'EDITAR VISUAL'}
        </h2>

        {/* Visual Preview */}
        <div className="flex justify-center mb-8">
            <div className="relative w-32 h-32 bg-slate-700 rounded-full border-4 border-slate-500 flex items-center justify-center shadow-inner">
                {/* Simple CSS representation of the character */}
                <div className="flex flex-col items-center animate-bounce-slow">
                    {/* Hat */}
                    {hat === 'tophat' && <div className="w-10 h-8 bg-black mb-[-2px] relative z-10"><div className="absolute bottom-0 -left-2 w-14 h-1 bg-black"></div></div>}
                    {hat === 'cap' && <div className="w-10 h-4 bg-blue-600 rounded-t-lg mb-[-2px] relative z-10"><div className="absolute bottom-0 left-0 w-12 h-1 bg-blue-600 origin-left rotate-12"></div></div>}
                    {hat === 'helmet' && <div className="w-12 h-6 bg-yellow-400 rounded-t-xl mb-[-4px] relative z-10 border-b-2 border-yellow-600"></div>}

                    {/* Head */}
                    <div className="w-12 h-12 bg-[#ffccaa] rounded-full relative z-0 border-2 border-black/10">
                         <div className="absolute top-4 left-3 w-1 h-1 bg-black rounded-full"></div>
                         <div className="absolute top-4 right-3 w-1 h-1 bg-black rounded-full"></div>
                         <div className="absolute bottom-3 left-4 w-4 h-1 bg-black/20 rounded-full"></div>
                    </div>
                    {/* Body */}
                    <div className="w-14 h-16 rounded-t-xl mt-[-4px] relative -z-10 shadow-lg" style={{ backgroundColor: color }}>
                        <div className="absolute top-4 w-full h-1 bg-black/10"></div>
                    </div>
                </div>
            </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
            
            {/* Name */}
            <div>
                <label className="block text-slate-400 mb-1 text-lg">NOME</label>
                <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    maxLength={15}
                    className="w-full bg-slate-900 border-2 border-slate-600 rounded p-2 text-xl text-white focus:border-cyan-400 outline-none transition-colors"
                    placeholder="Nome do Prefeito"
                />
            </div>

            {/* Hat Selection */}
            <div>
                <label className="block text-slate-400 mb-1 text-lg">ACESSÓRIO</label>
                <div className="flex gap-2 justify-center bg-slate-900 p-2 rounded border border-slate-600">
                    {(['none', 'cap', 'tophat', 'helmet'] as HatType[]).map(h => (
                        <button
                            key={h}
                            onClick={() => setHat(h)}
                            className={`px-3 py-1 rounded text-lg border-2 transition-all ${hat === h ? 'border-yellow-400 bg-slate-700 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
                        >
                            {h === 'none' ? 'NADA' : h === 'cap' ? 'BONÉ' : h === 'tophat' ? 'CARTOLA' : 'CAPACETE'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Selection */}
            <div>
                <label className="block text-slate-400 mb-1 text-lg">COR DA ROUPA</label>
                <div className="flex flex-wrap gap-2 justify-center bg-slate-900 p-3 rounded border border-slate-600">
                    {COLORS.map(c => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${color === c ? 'border-white scale-110 shadow-[0_0_10px_rgba(255,255,255,0.5)]' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>
        </div>

        {/* Action Button */}
        <button 
            onClick={handleSave}
            className="w-full mt-8 py-3 bg-green-600 hover:bg-green-500 text-white font-bold text-2xl rounded shadow-lg border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all"
        >
            {isInitialSetup ? 'INICIAR JORNADA' : 'SALVAR ALTERAÇÕES'}
        </button>

      </div>
    </div>
  );
};

export default CharacterCreator;
