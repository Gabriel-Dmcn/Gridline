/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Enumeração (Enum) dos Tipos de Construções disponíveis no jogo.
 * Define o que cada tile (quadrado do grid) pode conter.
 */
export enum BuildingType {
  None = 'None',          // Terreno Vazio / Ação de Demolir
  Road = 'Road',          // Estrada (Transporte)
  Residential = 'Residential', // Zona Residencial (Gera População)
  Commercial = 'Commercial',   // Zona Comercial (Gera Cookies)
  Industrial = 'Industrial',   // Zona Industrial (Gera muitos Cookies, polui)
  Park = 'Park',          // Parque / Praça (Melhora o ambiente)
  // Novos Empreendimentos (Expansão)
  BeachResort = 'BeachResort', // Resort de Praia (Lazer de luxo)
  DataCenter = 'DataCenter',   // Centro de Dados (Alta tecnologia)
  WindTurbine = 'WindTurbine', // Turbina Eólica (Energia Limpa)
  // Infraestrutura Pública
  Metro = 'Metro',        // Estação de Metrô (Transporte de massa)
  School = 'School',      // Escola (Educação)
  CityHall = 'CityHall',  // Prefeitura (Gestão de Leis)
  Hospital = 'Hospital',  // Hospital (Saúde)
  SolarFarm = 'SolarFarm', // Fazenda Solar (Energia Limpa)
}

/**
 * Interface de Configuração de cada construção.
 * Define custo, geração de recursos e requisitos para construir.
 */
export interface BuildingConfig {
  type: BuildingType;  // Tipo do prédio
  cost: number;        // Custo em Cookies para construir
  name: string;        // Nome de exibição na interface (PT-BR)
  description: string; // Descrição curta explicativa (PT-BR)
  color: string;       // Cor principal usada no material 3D
  emoji: string;       // Ícone (emoji) usado na interface
  popGen: number;      // Geração de população por tick (ciclo do jogo)
  cookieGen: number;   // Geração de Cookies (dinheiro) por tick
  unlockPop: number;   // População mínima necessária para desbloquear
  energyDelta: number; // Consumo (-) ou Produção (+) de energia
  satisfactionBonus?: { // Bônus de satisfação opcional que o prédio fornece
    type: 'transport' | 'environment' | 'education' | 'safety' | 'leisure'; // Tipo do bônus
    amount: number; // Quantidade do bônus (ex: +10%)
  };
}

/**
 * Representa uma Melhoria (Upgrade) tecnológica comprada no ID Digital.
 * Aumenta a eficiência de certos tipos de construções.
 */
export interface Upgrade {
  id: string;          // Identificador único
  name: string;        // Nome da melhoria
  description: string; // O que a melhoria faz
  cost: number;        // Custo em Cookies
  targetType: BuildingType | 'Global'; // Qual prédio ela melhora (ou Global para tudo)
  multiplier: number;  // Multiplicador de eficiência (Ex: 1.5 = +50%)
  purchased: boolean;  // Estado: Se já foi comprado pelo jogador
}

/**
 * Representa uma Política Pública (Lei) ativada na Prefeitura.
 * Permite ao jogador gerenciar a cidade através de decretos.
 */
export interface Policy {
  id: string;          // Identificador único
  name: string;        // Nome da Lei
  description: string; // Explicação do efeito
  costPerTick: number; // Custo de manutenção (Cookies descontados por ciclo)
  active: boolean;     // Se a lei está atualmente em vigor
  effect: {
    target: 'satisfaction' | 'cookies' | 'population'; // O que a lei afeta (Satisfação, Dinheiro ou População)
    value: number;       // Valor numérico do efeito
    type: 'flat' | 'multiplier'; // 'flat' (soma direta) ou 'multiplier' (multiplicação percentual)
  };
}

/**
 * Representa uma Ação na Bolsa de Valores (Stock Market).
 */
export interface Stock {
  id: string;          // ID da ação
  symbol: string;      // Símbolo do mercado (ex: PETR4)
  name: string;        // Nome da Empresa
  description: string; // Descrição da empresa
  price: number;       // Preço atual da ação
  volatility: number;  // Volatilidade (O quão rápido o preço muda: 0.01 a 0.1)
  owned: number;       // Quantidade de ações que o jogador possui
  history: number[];   // Histórico de preços para renderizar o gráfico
}

/**
 * Dados de um único "Tile" (quadrado) do mapa 3D.
 */
export interface TileData {
  x: number; // Coordenada X no grid
  y: number; // Coordenada Y no grid
  buildingType: BuildingType; // O que está construído aqui
  variant?: number; // Variação visual (para prédios não parecerem todos iguais)
}

// O Grid é uma matriz bidimensional (Array de Arrays) de Tiles
export type Grid = TileData[][];

// Tipos de Clima disponíveis no sistema
export type WeatherType = 'sunny' | 'rain' | 'night'; // Ensolarado, Chuvoso, Noite

/**
 * Estatísticas detalhadas de Satisfação da cidade.
 */
export interface SatisfactionStats {
  total: number;       // Média geral (0 a 100)
  transport: number;   // Nota de Transporte
  environment: number; // Nota de Meio Ambiente
  safety: number;      // Nota de Segurança
  education: number;   // Nota de Educação
  leisure: number;     // Nota de Lazer
}

/**
 * Estado Global da Cidade (Estatísticas principais).
 */
export interface CityStats {
  cookies: number;         // Saldo atual de Cookies (Dinheiro)
  lifetimeCookies: number; // Total acumulado na carreira (usado para calcular nível)
  population: number;      // População total
  day: number;             // Contador de dias passados
  weather: WeatherType;    // Clima atual
  satisfaction: SatisfactionStats; // Objeto de satisfação detalhada
  energy: {
    produced: number; // Total produzido
    consumed: number; // Total consumido
    balance: number;  // Saldo (Produção - Consumo)
  };
  activePolicies: string[]; // Lista de IDs das políticas que estão ativas
}

/**
 * Meta (Quest) gerada pela Inteligência Artificial.
 */
export interface AIGoal {
  description: string; // Descrição da missão em texto
  targetType: 'population' | 'cookies' | 'building_count'; // Tipo de objetivo a alcançar
  targetValue: number; // Valor numérico alvo
  buildingType?: BuildingType; // Qual prédio construir (se o objetivo for building_count)
  reward: number;      // Recompensa em Cookies por completar
  completed: boolean;  // Se a missão foi concluída
}

/**
 * Item do Feed de Notícias (Grid News).
 */
export interface NewsItem {
  id: string; // ID único (timestamp)
  text: string; // Texto da notícia
  type: 'positive' | 'negative' | 'neutral'; // Tipo para coloração (Verde, Vermelho, Azul)
}

// Tipos de personalização do Avatar do jogador
export type HatType = 'none' | 'cap' | 'tophat' | 'helmet'; // Tipos de chapéu
export type FaceType = 'happy' | 'cool' | 'surprised'; // Tipos de rosto

/**
 * Configuração do Jogador (Avatar).
 * Salvo no LocalStorage.
 */
export interface PlayerConfig {
  name: string;        // Nome do Prefeito
  color: string;       // Cor da camisa (Hex)
  pantsColor: string;  // Cor da calça (Hex)
  shoeColor: string;   // Cor do sapato (Hex)
  face: FaceType;      // Expressão facial
  hat: HatType;        // Acessório de cabeça
  x: number;           // Posição X atual no mapa
  y: number;           // Posição Y atual no mapa
  path: {x: number, y: number}[]; // Fila de coordenadas para movimento (Pathfinding)
}