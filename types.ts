
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
}

export interface BuildingConfig {
  type: BuildingType;
  cost: number;
  name: string;
  description: string;
  color: string; // Cor principal para material 3D
  popGen: number; // Geração de população por tick
  cookieGen: number; // Geração de Cookies por tick
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

export interface CityStats {
  cookies: number; 
  lifetimeCookies: number; // Total acumulado para o ID Digital
  population: number;
  day: number;
  weather: WeatherType;
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

export interface PlayerConfig {
  name: string;
  color: string;
  hat: HatType;
  x: number;
  y: number;
  path: {x: number, y: number}[]; // Movement queue
}
