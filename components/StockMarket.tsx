
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React from 'react';
import { Stock, CityStats } from '../types';

interface StockMarketProps {
  stats: CityStats;
  stocks: Stock[];
  onBuy: (stockId: string, amount: number) => void;
  onSell: (stockId: string, amount: number) => void;
  onClose: () => void;
}

const StockGraph: React.FC<{ history: number[], color: string }> = ({ history, color }) => {
    const min = Math.min(...history);
    const max = Math.max(...history);
    const range = max - min || 1;
    const height = 40;
    const width = 100;

    const points = history.map((val, i) => {
        const x = (i / (history.length - 1)) * width;
        const y = height - ((val - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-12 bg-slate-900/50 rounded border border-slate-700">
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="2"
                points={points}
            />
        </svg>
    )
}

const StockMarket: React.FC<StockMarketProps> = ({ stats, stocks, onBuy, onSell, onClose }) => {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 w-full max-w-3xl rounded-xl border-4 border-emerald-600 shadow-2xl flex flex-col overflow-hidden font-vt323 text-white">
        
        {/* Header */}
        <div className="bg-slate-900 p-4 border-b-2 border-emerald-700 flex justify-between items-center">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-emerald-800 flex items-center justify-center text-white font-bold text-2xl">📈</div>
              <div>
                  <h2 className="text-3xl text-emerald-400 tracking-wider leading-none">GRIDMARKET</h2>
                  <span className="text-slate-400 text-sm uppercase">Bolsa de Valores Oficial</span>
              </div>
          </div>
          
          <div className="text-right">
              <p className="text-sm text-slate-400 uppercase">Saldo Disponível</p>
              <p className="text-2xl text-yellow-400">C$ {stats.cookies.toLocaleString()}</p>
          </div>
          
          <button onClick={onClose} className="ml-4 text-red-400 hover:text-red-300 text-2xl font-bold px-3 py-1 hover:bg-slate-700 rounded transition-colors">✕</button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-800 space-y-4">
            <div className="bg-blue-900/30 p-3 rounded border border-blue-800/50 text-center text-cyan-200 text-lg">
                O mercado é volátil! Preços atualizam a cada 5 segundos. Compre na baixa, venda na alta.
            </div>

            <div className="grid grid-cols-1 gap-4">
                {stocks.map(stock => {
                    const currentPrice = stock.price;
                    const previousPrice = stock.history[stock.history.length - 2] || currentPrice;
                    const isUp = currentPrice >= previousPrice;
                    const colorClass = isUp ? 'text-emerald-400' : 'text-rose-400';
                    const graphColor = isUp ? '#34d399' : '#fb7185';
                    
                    const canBuy1 = stats.cookies >= currentPrice;
                    const canBuy10 = stats.cookies >= currentPrice * 10;
                    const canSell1 = stock.owned >= 1;
                    const canSell10 = stock.owned >= 10;

                    return (
                        <div key={stock.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700 shadow-lg flex flex-col md:flex-row gap-4 items-center">
                            
                            {/* Stock Info */}
                            <div className="flex-1 min-w-[200px]">
                                <div className="flex justify-between items-end mb-1">
                                    <h3 className="text-2xl font-bold text-white">{stock.symbol}</h3>
                                    <span className={`text-2xl ${colorClass}`}>C$ {currentPrice.toFixed(2)}</span>
                                </div>
                                <p className="text-slate-400 text-sm mb-2">{stock.name}</p>
                                <StockGraph history={stock.history} color={graphColor} />
                            </div>

                            {/* Holdings */}
                            <div className="flex flex-col items-center justify-center bg-slate-800 p-3 rounded border border-slate-600 min-w-[120px]">
                                <span className="text-slate-500 text-xs uppercase">Sua Carteira</span>
                                <span className="text-3xl text-white">{stock.owned}</span>
                                <span className="text-slate-400 text-xs">Valor: C$ {(stock.owned * currentPrice).toFixed(0)}</span>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2 min-w-[150px]">
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onBuy(stock.id, 1)}
                                        disabled={!canBuy1}
                                        className={`flex-1 py-1 text-sm font-bold rounded ${canBuy1 ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                                    >
                                        COMPRAR 1
                                    </button>
                                    <button 
                                        onClick={() => onBuy(stock.id, 10)}
                                        disabled={!canBuy10}
                                        className={`flex-1 py-1 text-sm font-bold rounded ${canBuy10 ? 'bg-emerald-700 hover:bg-emerald-600 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                                    >
                                        10
                                    </button>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onSell(stock.id, 1)}
                                        disabled={!canSell1}
                                        className={`flex-1 py-1 text-sm font-bold rounded ${canSell1 ? 'bg-rose-700 hover:bg-rose-600 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                                    >
                                        VENDER 1
                                    </button>
                                    <button 
                                        onClick={() => onSell(stock.id, 10)}
                                        disabled={!canSell10}
                                        className={`flex-1 py-1 text-sm font-bold rounded ${canSell10 ? 'bg-rose-700 hover:bg-rose-600 text-white' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
                                    >
                                        10
                                    </button>
                                </div>
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default StockMarket;
