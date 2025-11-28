
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useEffect, useRef } from 'react';
import { BuildingType, CityStats, AIGoal, NewsItem } from '../types';
import { BUILDINGS } from '../constants';

interface UIOverlayProps {
  stats: CityStats;
  selectedTool: BuildingType | null;
  onSelectTool: (type: BuildingType | null) => void;
  currentGoal: AIGoal | null;
  newsFeed: NewsItem[];
  onClaimReward: () => void;
  isGeneratingGoal: boolean;
  aiEnabled: boolean;
  onOpenID: () => void;
  onOpenMarket: () => void;
}

const tools = [
  BuildingType.Road,
  BuildingType.Residential,
  BuildingType.Commercial,
  BuildingType.Industrial,
  BuildingType.Park,
  BuildingType.WindTurbine,
  BuildingType.SolarFarm,
  BuildingType.Metro,
  BuildingType.School,
  BuildingType.Hospital,
  BuildingType.DataCenter,
  BuildingType.BeachResort,
  BuildingType.CityHall,
  BuildingType.None,
];

const ToolButton: React.FC<{
  type: BuildingType;
  isSelected: boolean;
  onClick: () => void;
  cookies: number;
}> = ({ type, isSelected, onClick, cookies }) => {
  const config = BUILDINGS[type];
  const canAfford = cookies >= config.cost;
  const isBulldoze = type === BuildingType.None;
  
  return (
    <button
      onClick={onClick}
      disabled={!isBulldoze && !canAfford}
      className={`
        relative flex flex-col items-center justify-center border-2 transition-all flex-shrink-0 group
        w-16 h-16 md:w-20 md:h-20
        ${isSelected ? 'border-yellow-400 bg-blue-900 z-10 scale-105 shadow-[0_0_15px_rgba(250,204,21,0.5)]' : 'border-gray-600 bg-gray-900 hover:bg-gray-800'}
        ${!isBulldoze && !canAfford ? 'opacity-60 grayscale cursor-not-allowed' : 'cursor-pointer'}
        rounded-xl
      `}
      title={config.description}
    >
      <div className={`text-3xl md:text-4xl mb-1 filter drop-shadow-md transition-transform group-hover:scale-110`}>
        {config.emoji}
      </div>
      <span className="text-xs font-vt323 text-white uppercase tracking-wider leading-none text-center truncate w-full px-1">{config.name}</span>
      {config.cost > 0 && (
        <span className={`text-xs font-vt323 leading-none mt-1 ${canAfford ? 'text-yellow-300' : 'text-red-400'}`}>C${config.cost}</span>
      )}
    </button>
  );
};

const CursorButton: React.FC<{
  isSelected: boolean;
  onClick: () => void;
}> = ({ isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-center border-2 transition-all flex-shrink-0 group
        w-16 h-16 md:w-20 md:h-20
        ${isSelected ? 'border-cyan-400 bg-blue-900 z-10 scale-105 shadow-[0_0_15px_rgba(34,211,238,0.5)]' : 'border-gray-600 bg-gray-900 hover:bg-gray-800'}
        rounded-xl cursor-pointer mr-2
      `}
      title="Selecionar / Mover (Nenhum item selecionado)"
    >
      <div className={`text-3xl md:text-4xl mb-1 filter drop-shadow-md`}>
        👆
      </div>
      <span className="text-xs font-vt323 text-white uppercase tracking-wider leading-none text-center w-full px-1">CURSOR</span>
    </button>
  );
};

const UIOverlay: React.FC<UIOverlayProps> = ({
  stats,
  selectedTool,
  onSelectTool,
  currentGoal,
  newsFeed,
  onClaimReward,
  isGeneratingGoal,
  aiEnabled,
  onOpenID,
  onOpenMarket
}) => {
  const newsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (newsRef.current) {
      newsRef.current.scrollTop = newsRef.current.scrollHeight;
    }
  }, [newsFeed]);

  const satisfactionColor = stats.satisfaction.total > 70 ? 'text-green-400' : stats.satisfaction.total > 40 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 font-vt323 text-lg z-10">
      
      {/* Top Bar: Gridline OS Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start pointer-events-auto gap-4 w-full">
        
        {/* Status Bar */}
        <div className="flex gap-2">
            <div className="bg-slate-900 text-white p-3 rounded-md border-2 border-slate-600 shadow-xl flex gap-6 items-center w-full md:w-auto min-w-[300px]">
            <div className="flex flex-col items-center">
                {/* Cookie Icon */}
                <div className="w-8 h-8 rounded-full bg-yellow-500 border-2 border-yellow-700 flex items-center justify-center text-yellow-900 font-bold text-xl shadow-sm">C</div>
            </div>
            <div className="flex flex-col">
                <span className="text-slate-400 uppercase text-sm tracking-wider">Saldo</span>
                <span className="text-2xl text-yellow-400 tracking-widest">C$ {stats.cookies.toLocaleString()}</span>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div className="flex flex-col">
                <span className="text-slate-400 uppercase text-sm tracking-wider">Habitantes</span>
                <span className="text-2xl text-cyan-300">{stats.population.toLocaleString()}</span>
            </div>
            <div className="w-px h-8 bg-slate-700"></div>
            <div className="flex flex-col">
                <span className="text-slate-400 uppercase text-sm tracking-wider">Satisfação</span>
                <span className={`text-2xl ${satisfactionColor}`}>{stats.satisfaction.total}%</span>
            </div>
            <div className="flex-grow"></div>
            <div className="flex flex-col items-end">
                <span className="text-slate-400 uppercase text-sm">
                    {stats.weather === 'sunny' ? 'ENSOLARADO' : stats.weather === 'rain' ? 'CHUVOSO' : 'NOITE'}
                </span>
                <span className="text-xl text-white">Dia {stats.day}</span>
            </div>
            </div>

            {/* Market Button */}
            <button 
                onClick={onOpenMarket}
                className="bg-emerald-800 hover:bg-emerald-700 text-white p-3 rounded-md border-2 border-emerald-500 shadow-xl flex flex-col items-center justify-center h-full w-20 transition-all active:translate-y-1"
                title="Bolsa de Valores"
            >
                <span className="text-2xl">📈</span>
                <span className="text-xs uppercase">Bolsa</span>
            </button>

            {/* ID Digital Button */}
            <button 
                onClick={onOpenID}
                className="bg-cyan-700 hover:bg-cyan-600 text-white p-3 rounded-md border-2 border-cyan-500 shadow-xl flex flex-col items-center justify-center h-full w-20 transition-all active:translate-y-1"
                title="Abrir ID Digital"
            >
                <span className="text-2xl">🆔</span>
                <span className="text-xs uppercase">ID</span>
            </button>
        </div>

        {/* Quest Panel / Notification */}
        {aiEnabled && (
        <div className={`w-full md:w-96 bg-blue-900 text-white rounded-md border-2 border-blue-500 shadow-lg overflow-hidden transition-all flex flex-col`}>
          <div className="bg-blue-800 px-3 py-1 flex justify-between items-center border-b-2 border-blue-700">
            <span className="uppercase text-sm tracking-widest flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isGeneratingGoal ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`}></span>
              Sistema Gridline
            </span>
          </div>
          
          <div className="p-4 bg-blue-900/90 min-h-[100px] flex flex-col justify-center">
              {currentGoal ? (
                <>
                  <p className="text-cyan-100 mb-2 leading-tight">"{currentGoal.description}"</p>
                  
                  <div className="flex justify-between items-center mt-2 bg-blue-950 p-2 rounded border border-blue-800">
                    <div className="text-sm text-gray-300">
                      Meta: <span className="text-white">
                        {currentGoal.targetType === 'building_count' ? BUILDINGS[currentGoal.buildingType!].name : 
                         currentGoal.targetType === 'cookies' ? 'C$' : 'Pop.'} {currentGoal.targetValue}
                      </span>
                    </div>
                    <div className="text-yellow-300">
                      Prêmio: C${currentGoal.reward}
                    </div>
                  </div>
  
                  {currentGoal.completed && (
                    <button
                      onClick={onClaimReward}
                      className="mt-2 w-full bg-green-600 hover:bg-green-500 text-white py-1 px-4 rounded border-b-4 border-green-800 active:border-b-0 active:mt-3 mb-1"
                    >
                      RESGATAR RECOMPENSA
                    </button>
                  )}
                </>
              ) : (
                <div className="text-gray-400 text-center animate-pulse">
                  ... Conectando à Rede ...
                </div>
              )}
          </div>
        </div>
        )}
      </div>

      {/* Bottom Interface: Phone/Dock */}
      <div className="flex flex-col-reverse md:flex-row md:justify-between md:items-end pointer-events-auto mt-auto gap-4 w-full">
        
        {/* Dock / Toolbar */}
        <div className="bg-gray-800 p-2 rounded-t-xl md:rounded-xl border-t-2 md:border-2 border-gray-600 shadow-2xl w-full md:w-auto overflow-hidden">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 justify-start w-full max-w-[90vw] md:max-w-none scrollbar-thin scrollbar-thumb-gray-600">
            {/* Cursor Button (Deselect) - Always visible and pinned */}
            <div className="sticky left-0 z-20 bg-gray-800 pr-2 border-r border-gray-600">
                <CursorButton 
                isSelected={selectedTool === null} 
                onClick={() => onSelectTool(null)} 
                />
            </div>
            
            {tools.map((type) => (
              <ToolButton
                key={type}
                type={type}
                isSelected={selectedTool === type}
                onClick={() => onSelectTool(type)}
                cookies={stats.cookies}
              />
            ))}
          </div>
        </div>

        {/* News Feed / Chat */}
        <div className="w-full md:w-80 h-40 bg-black text-green-400 rounded-md border-2 border-gray-700 shadow-2xl flex flex-col relative font-mono text-sm">
          <div className="bg-gray-800 px-2 py-1 text-gray-300 border-b border-gray-700 flex justify-between items-center">
            <span>GRID_NEWS_FEED</span>
            <span className="text-xs">{newsFeed.length} msgs</span>
          </div>
          
          <div ref={newsRef} className="flex-1 overflow-y-auto p-2 space-y-1">
            {newsFeed.length === 0 && <div className="text-gray-600 text-center mt-10">Aguardando sinal...</div>}
            {newsFeed.map((news) => (
              <div key={news.id} className="mb-2 border-b border-gray-900 pb-1">
                <span className="text-gray-500 text-xs">[{new Date(Number(news.id.split('.')[0])).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}]</span>{' '}
                <span className={news.type === 'positive' ? 'text-green-400' : news.type === 'negative' ? 'text-red-400' : 'text-blue-300'}>
                  {news.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UIOverlay;
