
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { CityStats, BuildingType } from '../types';
import { BUILDINGS } from '../constants';

interface CityReportProps {
  stats: CityStats;
  buildingCounts: Record<string, number>;
  onClose: () => void;
}

const CityReport: React.FC<CityReportProps> = ({ stats, buildingCounts, onClose }) => {
  // Calcular investimento total
  let totalInvestment = 0;
  Object.entries(buildingCounts).forEach(([type, count]) => {
    if (type !== BuildingType.None && type !== BuildingType.Road) {
      totalInvestment += (BUILDINGS[type as BuildingType].cost * count);
    }
  });

  const ProgressBar = ({ label, value, color }: { label: string, value: number, color: string }) => (
    <div className="mb-3">
      <div className="flex justify-between text-sm mb-1 uppercase tracking-wider text-slate-300">
        <span>{label}</span>
        <span>{Math.floor(value)}%</span>
      </div>
      <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden border border-slate-600">
        <div 
          className={`h-full ${color} transition-all duration-1000`} 
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="absolute inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-800 w-full max-w-4xl rounded-xl border-4 border-slate-500 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden font-vt323 text-white">
        
        {/* Header */}
        <div className="bg-slate-900 p-4 border-b-2 border-slate-600 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center text-2xl border border-slate-500">📊</div>
             <div>
               <h2 className="text-3xl text-yellow-400 tracking-wider leading-none">RELATÓRIO DA CIDADE</h2>
               <span className="text-slate-400 text-sm uppercase">Dados Governamentais &bull; Ano Fiscal {Math.floor(stats.day / 30) + 1}</span>
             </div>
          </div>
          <button onClick={onClose} className="text-red-400 hover:text-red-300 text-3xl font-bold px-3 hover:bg-slate-700 rounded transition-colors">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-800">
            
            {/* Coluna 1: Geral e Financeiro */}
            <div className="space-y-6">
                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-xl text-cyan-400 mb-4 border-b border-slate-700 pb-2">RESUMO EXECUTIVO</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-slate-400 text-xs uppercase">População Total</p>
                            <p className="text-3xl text-white">{stats.population.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs uppercase">Saldo em Caixa</p>
                            <p className="text-3xl text-green-400">C$ {stats.cookies.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs uppercase">Dias de Governo</p>
                            <p className="text-3xl text-white">{stats.day}</p>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs uppercase">Satisfação Média</p>
                            <p className={`text-3xl ${stats.satisfaction.total >= 70 ? 'text-green-400' : stats.satisfaction.total >= 40 ? 'text-yellow-400' : 'text-red-400'}`}>
                                {stats.satisfaction.total}%
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
                    <h3 className="text-xl text-yellow-400 mb-4 border-b border-slate-700 pb-2">FINANÇAS & INFRAESTRUTURA</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-300">Valor Investido em Obras:</span>
                            <span className="text-xl text-yellow-300">C$ {totalInvestment.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-300">Total de Edifícios:</span>
                            <span className="text-xl text-white">
                                {Object.values(buildingCounts).reduce((a, b) => a + b, 0)}
                            </span>
                        </div>
                        <div className="h-px bg-slate-700 my-2"></div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-300">Balanço Energético:</span>
                            <span className={`text-xl ${stats.energy.balance >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                                {stats.energy.balance >= 0 ? '+' : ''}{stats.energy.balance} MW
                            </span>
                        </div>
                        <div className="w-full bg-slate-700 h-4 rounded-full overflow-hidden flex text-[10px] items-center text-center font-bold relative">
                             <div className="bg-red-500 h-full flex items-center justify-center" style={{ width: `${(stats.energy.consumed / (stats.energy.produced + 1)) * 100}%` }}></div>
                             <div className="absolute inset-0 flex justify-center items-center drop-shadow-md">
                                 {stats.energy.consumed} Consumido / {stats.energy.produced} Produzido
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Coluna 2: Índices Sociais */}
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 h-full">
                <h3 className="text-xl text-purple-400 mb-6 border-b border-slate-700 pb-2">ÍNDICES DE QUALIDADE DE VIDA</h3>
                
                <div className="space-y-2">
                    <ProgressBar label="Transporte & Mobilidade" value={stats.satisfaction.transport} color="bg-blue-500" />
                    <ProgressBar label="Meio Ambiente & Sustentabilidade" value={stats.satisfaction.environment} color="bg-green-500" />
                    <ProgressBar label="Segurança & Saúde" value={stats.satisfaction.safety} color="bg-red-500" />
                    <ProgressBar label="Educação & Futuro" value={stats.satisfaction.education} color="bg-orange-500" />
                    <ProgressBar label="Lazer & Cultura" value={stats.satisfaction.leisure} color="bg-pink-500" />
                </div>

                <div className="mt-8 p-4 bg-slate-800 rounded border border-slate-600 text-sm text-slate-400 italic">
                    <p>"Índices calculados com base na proporção de serviços disponíveis versus densidade populacional e industrial."</p>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default CityReport;
