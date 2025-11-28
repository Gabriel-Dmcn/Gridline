
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export enum BuildingType {
  None = 'None',
  Road = 'Road',
  Residential = 'Residential',
  Commercial = 'Commercial',
  Industrial = 'Industrial',
  Park = 'Park',
  // Novos Empreendimentos
  BeachResort = 'BeachResort',
  DataCenter = 'DataCenter',
  WindTurbine = 'WindTurbine',
  // Novas Adições
  Metro = 'Metro',
  School = 'School',
  CityHall = 'CityHall',
  Hospital = 'Hospital',
  SolarFarm = 'SolarFarm',
}

export interface BuildingConfig {
  type: BuildingType;
  cost: number;
  name: string;
  description: string;
  color: string; // Cor principal para material 3D
  emoji: string; // Icone UI
  popGen: number; // Geração de população por tick
  cookieGen: number; // Geração de Cookies por tick
  unlockPop: number; // População necessária para desbloquear
  energyDelta: number; // Consumo (-) ou Produção (+) de energia
  satisfactionBonus?: {
    type: 'transport' | 'environment' | 'education' | 'safety' | 'leisure';
    amount: number;
  };
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  targetType: BuildingType | 'Global';
  multiplier: number; // Ex: 1.5 aumenta em 50%
  purchased: boolean;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  costPerTick: number;
  active: boolean;
  effect: {
    target: 'satisfaction' | 'cookies' | 'population';
    value: number; // value to add or multiply
    type: 'flat' | 'multiplier';
  };
}

export interface Stock {
  id: string;
  symbol: string;
  name: string;
  description: string;
  price: number;
  volatility: number; // Quão agressiva é a mudança de preço (0.01 a 0.1)
  owned: number;
  history: number[]; // Histórico de preços para o gráfico
}

export interface TileData {
  x: number;
  y: number;
  buildingType: BuildingType;
  variant?: number;
}

export type Grid = TileData[][];

export type WeatherType = 'sunny' | 'rain' | 'night';

export interface SatisfactionStats {
  total: number;
  transport: number;
  environment: number;
  safety: number;
  education: number;
  leisure: number;
}

export interface CityStats {
  cookies: number; 
  lifetimeCookies: number; // Total acumulado para o ID Digital
  population: number;
  day: number;
  weather: WeatherType;
  satisfaction: SatisfactionStats;
  energy: {
    produced: number;
    consumed: number;
    balance: number;
  };
  activePolicies: string[]; // IDs of active policies
}

export interface AIGoal {
  description: string;
  targetType: 'population' | 'cookies' | 'building_count';
  targetValue: number;
  buildingType?: BuildingType; 
  reward: number; // Em cookies
  completed: boolean;
}

export interface NewsItem {
  id: string;
  text: string;
  type: 'positive' | 'negative' | 'neutral';
}

export type HatType = 'none' | 'cap' | 'tophat' | 'helmet';
export type FaceType = 'happy' | 'cool' | 'surprised';

export interface PlayerConfig {
  name: string;
  color: string; // Shirt Color
  pantsColor: string;
  shoeColor: string;
  face: FaceType;
  hat: HatType;
  x: number;
  y: number;
  path: {x: number, y: number}[]; // Movement queue
}
