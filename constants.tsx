
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { BuildingConfig, BuildingType, Upgrade, Stock } from './types';

// Configurações do Mapa
export const GRID_SIZE = 15;

// Configurações do Jogo
export const TICK_RATE_MS = 120000; // 2 minutos por tick
export const INITIAL_COOKIES = 1500;

export const BUILDINGS: Record<BuildingType, BuildingConfig> = {
  [BuildingType.None]: {
    type: BuildingType.None,
    cost: 0,
    name: 'Demolir',
    description: 'Limpar terreno',
    color: '#ef4444', 
    emoji: '❌',
    popGen: 0,
    cookieGen: 0,
  },
  [BuildingType.Road]: {
    type: BuildingType.Road,
    cost: 5,
    name: 'Estrada',
    description: 'Conecta áreas',
    color: '#374151',
    emoji: '🛣️',
    popGen: 0,
    cookieGen: 0,
    satisfactionBonus: { type: 'transport', amount: 2 }
  },
  [BuildingType.Residential]: {
    type: BuildingType.Residential,
    cost: 50,
    name: 'Residência',
    description: '+5 Habitantes',
    color: '#f87171', 
    emoji: '🏠',
    popGen: 5,
    cookieGen: 0,
  },
  [BuildingType.Commercial]: {
    type: BuildingType.Commercial,
    cost: 150,
    name: 'Mercado',
    description: '+15 Cookies',
    color: '#60a5fa', 
    emoji: '🏪',
    popGen: 0,
    cookieGen: 15,
  },
  [BuildingType.Industrial]: {
    type: BuildingType.Industrial,
    cost: 300,
    name: 'Fábrica Tech',
    description: '+40 Cookies',
    color: '#facc15', 
    emoji: '🏭',
    popGen: 0,
    cookieGen: 40,
  },
  [BuildingType.Park]: {
    type: BuildingType.Park,
    cost: 30,
    name: 'Praça',
    description: 'Qualidade de vida',
    color: '#4ade80', 
    emoji: '🌳',
    popGen: 2,
    cookieGen: 0,
    satisfactionBonus: { type: 'environment', amount: 10 }
  },
  [BuildingType.WindTurbine]: {
    type: BuildingType.WindTurbine,
    cost: 100,
    name: 'Eólica',
    description: '+10 Cookies (Sustentável)',
    color: '#a3e635',
    emoji: '💨',
    popGen: 0,
    cookieGen: 10,
    satisfactionBonus: { type: 'environment', amount: 5 }
  },
  [BuildingType.DataCenter]: {
    type: BuildingType.DataCenter,
    cost: 500,
    name: 'Data Center',
    description: '+80 Cookies',
    color: '#6366f1',
    emoji: '💾',
    popGen: 0,
    cookieGen: 80,
  },
  [BuildingType.BeachResort]: {
    type: BuildingType.BeachResort,
    cost: 1000,
    name: 'Resort',
    description: '+150 Cookies',
    color: '#f472b6',
    emoji: '🏖️',
    popGen: 10,
    cookieGen: 150,
    satisfactionBonus: { type: 'leisure', amount: 15 }
  },
  [BuildingType.Metro]: {
    type: BuildingType.Metro,
    cost: 400,
    name: 'Metrô',
    description: 'Transporte rápido (+20 Pop)',
    color: '#dc2626',
    emoji: '🚇',
    popGen: 20,
    cookieGen: 5,
    satisfactionBonus: { type: 'transport', amount: 10 }
  },
  [BuildingType.School]: {
    type: BuildingType.School,
    cost: 600,
    name: 'Escola',
    description: 'Educação Tech (+5 Pop, +10 Cookies)',
    color: '#fb923c',
    emoji: '🏫',
    popGen: 5,
    cookieGen: 10,
    satisfactionBonus: { type: 'education', amount: 20 }
  },
  [BuildingType.Hospital]: {
    type: BuildingType.Hospital,
    cost: 800,
    name: 'Hospital',
    description: 'Saúde (+30 Pop)',
    color: '#ffffff',
    emoji: '🏥',
    popGen: 30,
    cookieGen: 0,
    satisfactionBonus: { type: 'safety', amount: 20 }
  },
  [BuildingType.CityHall]: {
    type: BuildingType.CityHall,
    cost: 2000,
    name: 'Prefeitura',
    description: 'Centro Adm (+100 Cookies)',
    color: '#e2e8f0',
    emoji: '🏛️',
    popGen: 5,
    cookieGen: 100,
    satisfactionBonus: { type: 'safety', amount: 10 }
  },
  [BuildingType.SolarFarm]: {
    type: BuildingType.SolarFarm,
    cost: 350,
    name: 'Solar',
    description: '+25 Cookies (Sustentável)',
    color: '#1e3a8a',
    emoji: '☀️',
    popGen: 0,
    cookieGen: 25,
    satisfactionBonus: { type: 'environment', amount: 8 }
  },
};

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'wifi_6g',
    name: 'Wi-Fi 6G Público',
    description: 'Residências geram renda passiva via home office.',
    cost: 500,
    targetType: BuildingType.Residential,
    multiplier: 1, 
    purchased: false,
  },
  {
    id: 'delivery_drones',
    name: 'Drones de Entrega',
    description: 'Mercados geram 50% mais Cookies.',
    cost: 1200,
    targetType: BuildingType.Commercial,
    multiplier: 1.5,
    purchased: false,
  },
  {
    id: 'ai_optimization',
    name: 'Otimização IA',
    description: 'Fábricas Tech e Data Centers produzem 30% mais.',
    cost: 2500,
    targetType: BuildingType.Industrial, // Simplificação: afeta industrial principal
    multiplier: 1.3,
    purchased: false,
  },
  {
    id: 'tourism_ads',
    name: 'Propaganda Turística',
    description: 'Resorts geram o dobro de Cookies.',
    cost: 5000,
    targetType: BuildingType.BeachResort,
    multiplier: 2.0,
    purchased: false,
  },
  {
    id: 'smart_grid',
    name: 'Smart Grid',
    description: 'Turbinas Eólicas 50% mais eficientes.',
    cost: 800,
    targetType: BuildingType.WindTurbine,
    multiplier: 1.5,
    purchased: false,
  },
  {
    id: 'subway_expansion',
    name: 'Trens Magnéticos',
    description: 'Metrôs suportam o dobro de população.',
    cost: 1500,
    targetType: BuildingType.Metro,
    multiplier: 2.0,
    purchased: false,
  },
  {
    id: 'edtech',
    name: 'Plataforma EdTech',
    description: 'Escolas geram renda além de educação.',
    cost: 1000,
    targetType: BuildingType.School,
    multiplier: 2.0,
    purchased: false,
  }
];

export const INITIAL_STOCKS: Stock[] = [
  {
    id: 's1',
    symbol: 'CRNCH',
    name: 'Cookie Crunch Ltd',
    description: 'Conglomerado de alimentos básicos.',
    price: 10,
    volatility: 0.02, // Baixa volatilidade
    owned: 0,
    history: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
  },
  {
    id: 's2',
    symbol: 'VOLT',
    name: 'Gridline Energy',
    description: 'Infraestrutura e energia renovável.',
    price: 50,
    volatility: 0.05, // Média volatilidade
    owned: 0,
    history: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
  },
  {
    id: 's3',
    symbol: 'NANO',
    name: 'NanoFuture Tech',
    description: 'Startups de alta tecnologia e IA.',
    price: 100,
    volatility: 0.15, // Alta volatilidade (risco alto)
    owned: 0,
    history: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
  }
];
