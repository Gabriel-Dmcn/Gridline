
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { PlayerConfig, HatType, FaceType } from '../types';

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
  '#57534e', // brown
];

const CharacterCreator: React.FC<CharacterCreatorProps> = ({ initialConfig, onSave, isInitialSetup }) => {
  const [name, setName] = useState(initialConfig.name);
  const [shirtColor, setShirtColor] = useState(initialConfig.color);
  const [pantsColor, setPantsColor] = useState(initialConfig.pantsColor || '#1e293b');
  const [shoeColor, setShoeColor] = useState(initialConfig.shoeColor || '#000000');
  const [hat, setHat] = useState<HatType>(initialConfig.hat);
  const [face, setFace] = useState<FaceType>(initialConfig.face || 'happy');
  const [activeTab, setActiveTab] = useState<'body' | 'clothes'>('body');

  const handleSave = () => {
    onSave({
      ...initialConfig,
      name: name || 'Prefeito',
      color: shirtColor,
      pantsColor,
      shoeColor,
      hat,
      face
    });
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
      <div className="bg-slate-800 border-4 border-cyan-500 rounded-xl p-6 w-full max-w-lg shadow-2xl font-vt323 text-white flex flex-col md:flex-row gap-6">
        
        {/* Left Side: Preview */}
        <div className="flex flex-col items-center justify-center min-w-[150px]">
            <h2 className="text-3xl text-cyan-400 mb-4 border-b-2 border-slate-600 pb-2 w-full text-center">
                {isInitialSetup ? 'NOVO AVATAR' : 'EDITAR'}
            </h2>
            <div className="relative w-40 h-40 bg-slate-700 rounded-full border-4 border-slate-500 flex items-center justify-center shadow-inner mb-4 overflow-hidden">
                {/* Visual Representation */}
                <div className="flex flex-col items-center animate-bounce-slow scale-125 pt-8">
                    {/* Hat */}
                    {hat === 'tophat' && <div className="w-10 h-8 bg-black mb-[-2px] relative z-20"><div className="absolute bottom-0 -left-2 w-14 h-1 bg-black"></div></div>}
                    {hat === 'cap' && <div className="w-10 h-4 bg-blue-600 rounded-t-lg mb-[-2px] relative z-20"><div className="absolute bottom-0 left-0 w-12 h-1 bg-blue-600 origin-left rotate-12"></div></div>}
                    {hat === 'helmet' && <div className="w-12 h-6 bg-yellow-400 rounded-t-xl mb-[-4px] relative z-20 border-b-2 border-yellow-600"></div>}

                    {/* Head */}
                    <div className="w-12 h-12 bg-[#ffccaa] rounded-full relative z-10 border-2 border-black/10 flex justify-center items-center">
                         {/* Face Expression */}
                         {face === 'happy' && (
                             <>
                                <div className="absolute top-4 left-3 w-1.5 h-1.5 bg-black rounded-full"></div>
                                <div className="absolute top-4 right-3 w-1.5 h-1.5 bg-black rounded-full"></div>
                                <div className="absolute bottom-3 w-6 h-2 border-b-2 border-black rounded-full"></div>
                             </>
                         )}
                         {face === 'cool' && (
                             <>
                                <div className="absolute top-4 w-8 h-2 bg-black"></div>
                                <div className="absolute bottom-3 w-4 h-1 bg-black/50 rounded-full"></div>
                             </>
                         )}
                         {face === 'surprised' && (
                             <>
                                <div className="absolute top-3 left-3 w-1.5 h-1.5 bg-black rounded-full"></div>
                                <div className="absolute top-3 right-3 w-1.5 h-1.5 bg-black rounded-full"></div>
                                <div className="absolute bottom-2 w-3 h-3 border-2 border-black rounded-full"></div>
                             </>
                         )}
                    </div>
                    {/* Body (Shirt) */}
                    <div className="w-14 h-12 rounded-t-xl mt-[-4px] relative z-0 shadow-lg" style={{ backgroundColor: shirtColor }}></div>
                    {/* Legs (Pants) */}
                    <div className="w-14 h-10 flex justify-center gap-1 z-0">
                         <div className="w-6 h-full" style={{ backgroundColor: pantsColor }}></div>
                         <div className="w-6 h-full" style={{ backgroundColor: pantsColor }}></div>
                    </div>
                    {/* Shoes */}
                    <div className="w-16 h-3 flex justify-center gap-1 mt-[-2px] z-10">
                        <div className="w-7 h-3 rounded-b" style={{ backgroundColor: shoeColor }}></div>
                        <div className="w-7 h-3 rounded-b" style={{ backgroundColor: shoeColor }}></div>
                    </div>
                </div>
            </div>
            
            <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                maxLength={15}
                className="w-full bg-slate-900 border-b-2 border-slate-600 text-center text-xl text-white focus:border-cyan-400 outline-none transition-colors"
                placeholder="Nome..."
            />
        </div>

        {/* Right Side: Options */}
        <div className="flex-1 flex flex-col h-full">
            <div className="flex gap-2 mb-4 border-b border-slate-600">
                <button onClick={() => setActiveTab('body')} className={`px-4 py-1 text-lg ${activeTab === 'body' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-slate-400'}`}>CORPO</button>
                <button onClick={() => setActiveTab('clothes')} className={`px-4 py-1 text-lg ${activeTab === 'clothes' ? 'text-yellow-400 border-b-2 border-yellow-400' : 'text-slate-400'}`}>ROUPAS</button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-6 max-h-[300px]">
                
                {activeTab === 'body' && (
                    <>
                        {/* Hat Selection */}
                        <div>
                            <label className="block text-slate-400 mb-1 text-lg">ACESSÓRIO</label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['none', 'cap', 'tophat', 'helmet'] as HatType[]).map(h => (
                                    <button key={h} onClick={() => setHat(h)} className={`px-2 py-1 rounded text-lg border-2 ${hat === h ? 'border-yellow-400 bg-slate-700' : 'border-slate-600 hover:bg-slate-700'}`}>
                                        {h.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Face Selection */}
                        <div>
                            <label className="block text-slate-400 mb-1 text-lg">ROSTO</label>
                            <div className="flex gap-2">
                                {(['happy', 'cool', 'surprised'] as FaceType[]).map(f => (
                                    <button key={f} onClick={() => setFace(f)} className={`flex-1 py-1 rounded text-lg border-2 ${face === f ? 'border-yellow-400 bg-slate-700' : 'border-slate-600 hover:bg-slate-700'}`}>
                                        {f === 'happy' ? '🙂' : f === 'cool' ? '😎' : '😮'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'clothes' && (
                    <>
                        {/* Shirt Color */}
                        <div>
                            <label className="block text-slate-400 mb-1 text-lg">CAMISA</label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map(c => (
                                    <button key={c} onClick={() => setShirtColor(c)} className={`w-8 h-8 rounded-full border-2 ${shirtColor === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                                ))}
                            </div>
                        </div>

                        {/* Pants Color */}
                        <div>
                            <label className="block text-slate-400 mb-1 text-lg">CALÇA</label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map(c => (
                                    <button key={c} onClick={() => setPantsColor(c)} className={`w-8 h-8 rounded-full border-2 ${pantsColor === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                                ))}
                            </div>
                        </div>

                        {/* Shoe Color */}
                        <div>
                            <label className="block text-slate-400 mb-1 text-lg">SAPATOS</label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map(c => (
                                    <button key={c} onClick={() => setShoeColor(c)} className={`w-8 h-8 rounded-sm border-2 ${shoeColor === c ? 'border-white scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <button 
                onClick={handleSave}
                className="w-full mt-4 py-2 bg-green-600 hover:bg-green-500 text-white font-bold text-xl rounded shadow-lg border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all"
            >
                {isInitialSetup ? 'INICIAR' : 'SALVAR'}
            </button>
        </div>

      </div>
    </div>
  );
};

export default CharacterCreator;
