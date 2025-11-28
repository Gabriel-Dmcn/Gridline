/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { BuildingConfig, BuildingType, Upgrade } from './types';

// Configurações do Mapa
export const GRID_SIZE = 15;

// Configurações do Jogo
export const TICK_RATE_MS = 120000; // 2 minutos por tick (120.000 ms)
export const INITIAL_COOKIES = 750; // Cookies Iniciais (C$)

export const BUILDINGS: Record<BuildingType, BuildingConfig> = {
  [BuildingType.None]: {
    type: BuildingType.None,
    cost: 0,
    name: 'Demolir',
    description: 'Limpar terreno',
    color: '#ef4444', 
    popGen: 0,
    cookieGen: 0,
  },
  [BuildingType.Road]: {
    type: BuildingType.Road,
    cost: 5,
    name: 'Estrada',
    description: 'Conecta áreas',
    color: '#374151',
    popGen: 0,
    cookieGen: 0,
  },
  [BuildingType.Residential]: {
    type: BuildingType.Residential,
    cost: 50,
    name: 'Residência',
    description: '+5 Habitantes',
    color: '#f87171', 
    popGen: 5,
    cookieGen: 0,
  },
  [BuildingType.Commercial]: {
    type: BuildingType.Commercial,
    cost: 150,
    name: 'Mercado',
    description: '+15 Cookies',
    color: '#60a5fa', 
    popGen: 0,
    cookieGen: 15,
  },
  [BuildingType.Industrial]: {
    type: BuildingType.Industrial,
    cost: 300,
    name: 'Fábrica Tech',
    description: '+40 Cookies',
    color: '#facc15', 
    popGen: 0,
    cookieGen: 40,
  },
  [BuildingType.Park]: {
    type: BuildingType.Park,
    cost: 30,
    name: 'Praça',
    description: 'Qualidade de vida',
    color: '#4ade80', 
    popGen: 2,
    cookieGen: 0,
  },
  [BuildingType.WindTurbine]: {
    type: BuildingType.WindTurbine,
    cost: 100,
    name: 'Eólica',
    description: '+10 Cookies (Sustentável)',
    color: '#a3e635',
    popGen: 0,
    cookieGen: 10,
  },
  [BuildingType.DataCenter]: {
    type: BuildingType.DataCenter,
    cost: 500,
    name: 'Data Center',
    description: '+80 Cookies',
    color: '#6366f1',
    popGen: 0,
    cookieGen: 80,
  },
  [BuildingType.BeachResort]: {
    type: BuildingType.BeachResort,
    cost: 1000,
    name: 'Resort',
    description: '+150 Cookies',
    color: '#f472b6',
    popGen: 10,
    cookieGen: 150,
  },
};

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'wifi_6g',
    name: 'Wi-Fi 6G Público',
    description: 'Residências geram renda passiva via home office.',
    cost: 500,
    targetType: BuildingType.Residential,
    multiplier: 1, // Não multiplica, adiciona lógica especial ou apenas flavor, vamos usar pra aumentar pop speed ou algo
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
  }
];