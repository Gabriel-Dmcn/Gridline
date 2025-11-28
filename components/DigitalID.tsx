
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { CityStats, Upgrade, BuildingType } from '../types';
import { BUILDINGS } from '../constants';

interface DigitalIDProps {
  stats: CityStats;
  upgrades: Upgrade[];
  onPurchaseUpgrade: (id: string) => void;
  onClose: () => void;
  buildingCounts: Record<string, number>;
}

const DigitalID: React.FC<DigitalIDProps> = ({ stats, upgrades, onPurchaseUpgrade, onClose, buildingCounts }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'upgrades'>('profile');

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-800 w-full max-w-2xl rounded-xl border-4 border-slate-600 shadow-2xl flex flex-col overflow-hidden font-vt323 text-white max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 p-4 border-b-2 border-slate-700 flex justify-between items-center shrink-0">
          <h2 className="text-3xl text-cyan-400 tracking-wider flex items-center gap-3">
             <div className="w-8 h-8 rounded bg-cyan-700 flex items-center justify-center text-white font-bold">ID</div>
             ID DIGITAL GRIDLINE
          </h2>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 text-2xl">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-700 shrink-0">
            <button 
                onClick={() => setActiveTab('profile')}
                className={`flex-1 py-2 text-xl ${activeTab === 'profile' ? 'bg-slate-600 text-yellow-300' : 'text-slate-400 hover:bg-slate-600'}`}
            >
                PERFIL DA CIDADE
            </button>
            <button 
                onClick={() => setActiveTab('upgrades')}
                className={`flex-1 py-2 text-xl ${activeTab === 'upgrades' ? 'bg-slate-600 text-yellow-300' : 'text-slate-400 hover:bg-slate-600'}`}
            >
                MELHORIAS (SHOP)
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-800 min-h-0">
            
            {activeTab === 'profile' && (
                <div className="space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-cyan-900 rounded-full border-4 border-cyan-500 flex items-center justify-center text-4xl shrink-0">
                            🏙️
                        </div>
                        <div>
                            <h3 className="text-4xl text-white">Prefeito Gridliano</h3>
                            <p className="text-slate-400 text-lg">Administrador Nível {(Math.floor(stats.lifetimeCookies / 1000) + 1)}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900 p-4 rounded border border-slate-700">
                            <p className="text-slate-400 text-sm uppercase">Cookies Acumulados</p>
                            <p className="text-3xl text-yellow-400">C$ {stats.lifetimeCookies.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-900 p-4 rounded border border-slate-700">
                            <p className="text-slate-400 text-sm uppercase">Saldo Atual</p>
                            <p className="text-3xl text-green-400">C$ {stats.cookies.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-900 p-4 rounded border border-slate-700">
                            <p className="text-slate-400 text-sm uppercase">População</p>
                            <p className="text-3xl text-cyan-400">{stats.population.toLocaleString()}</p>
                        </div>
                        <div className="bg-slate-900 p-4 rounded border border-slate-700">
                            <p className="text-slate-400 text-sm uppercase">Edifícios</p>
                            <p className="text-3xl text-purple-400">{Object.values(buildingCounts).reduce((a: number, b: number)=>a+b, 0)}</p>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xl text-yellow-300 mb-2 border-b border-slate-600 pb-1">Inventário de Estruturas</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                             {Object.keys(buildingCounts).map(key => (
                                 <div key={key} className="flex justify-between bg-slate-700/50 p-2 rounded items-center">
                                     <span className="text-sm truncate mr-2">{BUILDINGS[key as BuildingType].name}</span>
                                     <span className="font-bold bg-slate-900 px-2 rounded text-cyan-300">{buildingCounts[key]}</span>
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'upgrades' && (
                <div className="space-y-4">
                    <div className="bg-blue-900/50 p-3 rounded text-center text-cyan-200 mb-4 border border-blue-800">
                        Compre tecnologias para aumentar a eficiência dos seus empreendimentos!
                    </div>
                    {upgrades.map(upgrade => {
                         const canAfford = stats.cookies >= upgrade.cost;
                         return (
                            <div key={upgrade.id} className={`flex flex-col md:flex-row justify-between items-center p-4 rounded border-2 gap-4 ${upgrade.purchased ? 'bg-green-900/30 border-green-700 opacity-70' : 'bg-slate-900 border-slate-700'}`}>
                                <div className="flex-1 text-center md:text-left">
                                    <h4 className="text-xl text-yellow-300">{upgrade.name} {upgrade.purchased && '(Adquirido)'}</h4>
                                    <p className="text-slate-300 text-sm">{upgrade.description}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Alvo: {upgrade.targetType === 'Global' ? 'Todos' : BUILDINGS[upgrade.targetType as BuildingType].name}
                                    </p>
                                </div>
                                
                                {upgrade.purchased ? (
                                    <div className="px-4 py-2 bg-green-800 text-green-200 rounded font-bold">
                                        ATIVO
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => onPurchaseUpgrade(upgrade.id)}
                                        disabled={!canAfford}
                                        className={`px-6 py-3 rounded font-bold text-lg border-b-4 transition-all min-w-[120px] ${canAfford ? 'bg-cyan-600 hover:bg-cyan-500 border-cyan-800 text-white active:translate-y-1 active:border-b-0' : 'bg-slate-700 border-slate-900 text-slate-500 cursor-not-allowed'}`}
                                    >
                                        C$ {upgrade.cost}
                                    </button>
                                )}
                            </div>
                         )
                    })}
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default DigitalID;
