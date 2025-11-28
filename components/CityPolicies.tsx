
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Policy } from '../types';

interface CityPoliciesProps {
  policies: Policy[];
  activePolicies: string[];
  onTogglePolicy: (id: string) => void;
  onClose: () => void;
  cookiesPerTick: number; // For estimating impact
}

const CityPolicies: React.FC<CityPoliciesProps> = ({ policies, activePolicies, onTogglePolicy, onClose }) => {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 w-full max-w-2xl rounded-xl border-4 border-slate-600 shadow-2xl flex flex-col overflow-hidden font-vt323 text-white">
        
        {/* Header */}
        <div className="bg-slate-900 p-4 border-b-2 border-slate-700 flex justify-between items-center">
          <h2 className="text-3xl text-purple-400 tracking-wider flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-purple-900 flex items-center justify-center text-white font-bold text-lg">📜</div>
             PREFEITURA: POLÍTICAS PÚBLICAS
          </h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 text-2xl">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-800 space-y-4">
            <div className="bg-purple-900/30 p-3 rounded text-center text-purple-200 border border-purple-800/50 mb-4">
                Ative leis para beneficiar a cidade. Custo é descontado a cada ciclo.
            </div>

            {policies.map(policy => {
                const isActive = activePolicies.includes(policy.id);
                return (
                    <div key={policy.id} className={`flex justify-between items-center p-4 rounded border-2 transition-all ${isActive ? 'bg-purple-900/40 border-purple-500' : 'bg-slate-700 border-slate-600'}`}>
                        <div className="flex-1 pr-4">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-xl font-bold text-white">{policy.name}</h3>
                                {isActive && <span className="bg-green-600 text-[10px] px-2 py-0.5 rounded font-bold">ATIVA</span>}
                            </div>
                            <p className="text-slate-300 text-sm mb-2">{policy.description}</p>
                            <div className="flex gap-4 text-xs font-mono">
                                <span className="text-red-300">Custo: {policy.costPerTick} C$/tick</span>
                                <span className="text-green-300">Efeito: +{policy.effect.value}{policy.effect.type === 'multiplier' ? 'x' : ''} {policy.effect.target.toUpperCase()}</span>
                            </div>
                        </div>

                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                className="sr-only peer" 
                                checked={isActive}
                                onChange={() => onTogglePolicy(policy.id)}
                            />
                            <div className="w-14 h-7 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                        </label>
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};

export default CityPolicies;
