
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { BuildingType, BuildingConfig, Upgrade, CityStats } from '../types';
import { BUILDINGS } from '../constants';

interface BuildingInspectorProps {
  type: BuildingType;
  stats: CityStats;
  availableUpgrades: Upgrade[];
  onUpgrade: (id: string) => void;
  onClose: () => void;
}

const BuildingInspector: React.FC<BuildingInspectorProps> = ({ type, stats, availableUpgrades, onUpgrade, onClose }) => {
  const config = BUILDINGS[type];
  
  // Calculate level based on purchased upgrades for this building
  const purchasedCount = availableUpgrades.filter(u => u.purchased).length;
  const currentLevel = 1 + purchasedCount;

  // Calculate current output with multipliers
  let cookieMultiplier = 1;
  let popMultiplier = 1;
  availableUpgrades.forEach(u => {
      if (u.purchased) {
          cookieMultiplier *= u.multiplier;
          popMultiplier *= u.multiplier; // Assuming upgrades generally buff effectiveness
      }
  });

  const currentCookies = Math.floor(config.cookieGen * cookieMultiplier);
  const currentPop = Math.floor(config.popGen * popMultiplier);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-50 border-4 border-slate-300 rounded-xl shadow-2xl font-sans overflow-hidden">
        
        {/* Header - Blue Bar */}
        <div className="bg-[#0ea5e9] p-4 flex justify-between items-center text-white border-b-4 border-[#0284c7]">
            <div className="flex items-center gap-3">
                 <button onClick={onClose} className="border-2 border-white/50 rounded px-2 text-sm hover:bg-white/20">
                    ← Voltar ao Mapa
                 </button>
            </div>
            <h2 className="text-xl font-bold flex items-center gap-2 drop-shadow-md">
                {config.emoji} {config.name}
            </h2>
            <div className="bg-white/20 px-3 py-1 rounded-full border border-white/40 text-sm font-bold">
                Nível {currentLevel}
            </div>
        </div>

        <div className="flex flex-col md:flex-row h-full max-h-[70vh] md:max-h-[500px]">
            {/* Left Column: Stats & Info */}
            <div className="p-6 md:w-1/2 flex flex-col gap-6 bg-[#f8fafc] border-r border-slate-200">
                
                {/* Image Box */}
                <div className="w-full h-40 bg-white border-2 border-black rounded-xl flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="text-8xl filter drop-shadow-lg transform hover:scale-110 transition-transform cursor-help">
                        {config.emoji}
                    </div>
                </div>

                <div>
                    <h3 className="flex items-center gap-2 font-bold text-slate-700 mb-2">
                        📄 Sobre o Local
                    </h3>
                    <div className="h-0.5 w-full bg-[#0ea5e9] mb-2"></div>
                    <p className="text-slate-500 text-sm leading-relaxed">
                        {config.description}
                        {config.satisfactionBonus && (
                            <span className="block mt-1 text-green-600 font-semibold">
                                * Aumenta {config.satisfactionBonus.type === 'environment' ? 'Meio Ambiente' : config.satisfactionBonus.type === 'leisure' ? 'Lazer' : config.satisfactionBonus.type === 'safety' ? 'Segurança' : config.satisfactionBonus.type === 'education' ? 'Educação' : 'Transporte'}
                            </span>
                        )}
                    </p>
                </div>

                <div className="bg-slate-200/50 p-4 rounded-lg border border-slate-300 mt-auto">
                    <h4 className="font-bold text-slate-600 mb-2 flex items-center gap-2">
                        📊 Estatísticas Atuais
                    </h4>
                    <div className="text-xs font-mono text-slate-600 space-y-1">
                        <div className="flex justify-between">
                            <span>Produção:</span>
                            <span className="font-bold text-slate-800">{currentCookies > 0 ? `${currentCookies} Cookies/dia` : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Habitação/Capacidade:</span>
                            <span className="font-bold text-slate-800">{currentPop > 0 ? `${currentPop} pessoas` : '-'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Satisfação:</span>
                            <span className="font-bold text-slate-800">{config.satisfactionBonus ? `+${config.satisfactionBonus.amount}%` : 'Neutro'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Upgrades */}
            <div className="p-6 md:w-1/2 bg-white overflow-y-auto">
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    🛠️ Melhorias Disponíveis
                </h3>
                <div className="h-0.5 w-full bg-slate-200 mb-4"></div>

                <div className="space-y-4">
                    {availableUpgrades.length === 0 ? (
                        <div className="text-center text-slate-400 py-10 italic">
                            Nenhuma melhoria tecnológica disponível para esta estrutura no momento.
                        </div>
                    ) : (
                        availableUpgrades.map(upgrade => {
                            const canAfford = stats.cookies >= upgrade.cost;
                            return (
                                <div key={upgrade.id} className={`border-2 rounded-lg p-3 ${upgrade.purchased ? 'border-green-500 bg-green-50' : 'border-slate-300'}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <h4 className="font-bold text-slate-800">{upgrade.name}</h4>
                                        <span className="bg-slate-600 text-white text-[10px] px-1.5 py-0.5 rounded">
                                            {upgrade.purchased ? 'INSTALADO' : 'TECH'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-3">
                                        {upgrade.description}
                                    </p>
                                    
                                    {!upgrade.purchased ? (
                                        <>
                                            <div className={`mb-2 font-bold text-sm ${canAfford ? 'text-green-600' : 'text-red-500'}`}>
                                                {canAfford ? `+${(upgrade.multiplier - 1)*100}% Eficiência` : 'Fundos Insuficientes'}
                                            </div>
                                            
                                            <button 
                                                onClick={() => onUpgrade(upgrade.id)}
                                                disabled={!canAfford}
                                                className={`w-full py-2 rounded font-bold text-sm border-2 shadow-sm transition-all
                                                    ${canAfford 
                                                        ? 'bg-yellow-100 border-yellow-400 text-yellow-800 hover:bg-yellow-200' 
                                                        : 'bg-slate-100 border-slate-300 text-slate-400 cursor-not-allowed'}
                                                `}
                                            >
                                                {canAfford ? `🍪 Investir C$ ${upgrade.cost}` : `Necessário C$ ${upgrade.cost}`}
                                            </button>
                                        </>
                                    ) : (
                                        <button disabled className="w-full py-2 bg-slate-200 text-slate-500 font-bold text-sm rounded border border-slate-300 cursor-default">
                                            ✔ Melhoria Ativa
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default BuildingInspector;
