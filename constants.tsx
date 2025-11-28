/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { BuildingConfig, BuildingType, Upgrade, Stock, Policy } from './types';

// Configurações Globais do Mapa
export const GRID_SIZE = 15; // Tamanho da grade (15x15 tiles)

// Configurações de Gameplay
export const TICK_RATE_MS = 60000; // Duração de um "dia" no jogo em milissegundos (60 segundos)
export const INITIAL_COOKIES = 1500; // Quantidade inicial de Cookies (Dinheiro)

/**
 * Definição de todos os prédios e suas propriedades.
 * Contém custo, geração de recursos, requisitos de desbloqueio e bônus.
 * 
 * NOTA: Todos os textos de exibição estão em Português do Brasil.
 */
export const BUILDINGS: Record<BuildingType, BuildingConfig> = {
  [BuildingType.None]: {
    type: BuildingType.None,
    cost: 0,
    name: 'Demolir',
    description: 'Limpar terreno para novas obras',
    color: '#ef4444', 
    emoji: '❌',
    popGen: 0,
    cookieGen: 0,
    unlockPop: 0,
    energyDelta: 0
  },
  [BuildingType.Road]: {
    type: BuildingType.Road,
    cost: 5,
    name: 'Estrada',
    description: 'Conecta áreas e melhora o transporte',
    color: '#374151',
    emoji: '🛣️',
    popGen: 0,
    cookieGen: 0,
    unlockPop: 0,
    energyDelta: 0,
    satisfactionBonus: { type: 'transport', amount: 2 }
  },
  [BuildingType.Residential]: {
    type: BuildingType.Residential,
    cost: 50,
    name: 'Residência',
    description: 'Lar para novos moradores (+5 Hab)',
    color: '#f87171', 
    emoji: '🏠',
    popGen: 5,
    cookieGen: 5, // Pequena taxa de impostos residenciais
    unlockPop: 0,
    energyDelta: -1, // Consome energia
  },
  [BuildingType.Commercial]: {
    type: BuildingType.Commercial,
    cost: 150,
    name: 'Mercado',
    description: 'Gera renda com comércio (+15 Cookies)',
    color: '#60a5fa', 
    emoji: '🏪',
    popGen: 0,
    cookieGen: 15,
    unlockPop: 20,
    energyDelta: -2,
  },
  [BuildingType.Industrial]: {
    type: BuildingType.Industrial,
    cost: 300,
    name: 'Fábrica Tech',
    description: 'Alta produção de Cookies (+40 Cookies)',
    color: '#facc15', 
    emoji: '🏭',
    popGen: 0,
    cookieGen: 40,
    unlockPop: 50,
    energyDelta: -5, // Consome bastante energia
  },
  [BuildingType.Park]: {
    type: BuildingType.Park,
    cost: 30,
    name: 'Praça',
    description: 'Aumenta a qualidade de vida e o verde',
    color: '#4ade80', 
    emoji: '🌳',
    popGen: 2,
    cookieGen: 0,
    unlockPop: 0,
    energyDelta: 0,
    satisfactionBonus: { type: 'environment', amount: 10 }
  },
  [BuildingType.WindTurbine]: {
    type: BuildingType.WindTurbine,
    cost: 100,
    name: 'Eólica',
    description: 'Energia limpa e sustentável (+8 Energia)',
    color: '#a3e635',
    emoji: '💨',
    popGen: 0,
    cookieGen: 5,
    unlockPop: 0,
    energyDelta: 8, // Produz energia para a cidade
    satisfactionBonus: { type: 'environment', amount: 5 }
  },
  [BuildingType.DataCenter]: {
    type: BuildingType.DataCenter,
    cost: 500,
    name: 'Data Center',
    description: 'Hub de tecnologia (+80 Cookies)',
    color: '#6366f1',
    emoji: '💾',
    popGen: 0,
    cookieGen: 80,
    unlockPop: 150,
    energyDelta: -15, // Altíssimo consumo de energia
  },
  [BuildingType.BeachResort]: {
    type: BuildingType.BeachResort,
    cost: 1000,
    name: 'Resort',
    description: 'Turismo de luxo na orla (+150 Cookies)',
    color: '#f472b6',
    emoji: '🏖️',
    popGen: 10,
    cookieGen: 150,
    unlockPop: 300,
    energyDelta: -10,
    satisfactionBonus: { type: 'leisure', amount: 15 }
  },
  [BuildingType.Metro]: {
    type: BuildingType.Metro,
    cost: 400,
    name: 'Metrô',
    description: 'Transporte rápido de massa (+20 Pop)',
    color: '#dc2626',
    emoji: '🚇',
    popGen: 20,
    cookieGen: 5,
    unlockPop: 200,
    energyDelta: -5,
    satisfactionBonus: { type: 'transport', amount: 10 }
  },
  [BuildingType.School]: {
    type: BuildingType.School,
    cost: 600,
    name: 'Escola',
    description: 'Educação Tech para o futuro (+Educação)',
    color: '#fb923c',
    emoji: '🏫',
    popGen: 5,
    cookieGen: 10,
    unlockPop: 100,
    energyDelta: -3,
    satisfactionBonus: { type: 'education', amount: 20 }
  },
  [BuildingType.Hospital]: {
    type: BuildingType.Hospital,
    cost: 800,
    name: 'Hospital',
    description: 'Serviços de saúde essenciais (+Saúde)',
    color: '#ffffff',
    emoji: '🏥',
    popGen: 30,
    cookieGen: 0,
    unlockPop: 150,
    energyDelta: -6,
    satisfactionBonus: { type: 'safety', amount: 20 }
  },
  [BuildingType.CityHall]: {
    type: BuildingType.CityHall,
    cost: 2000,
    name: 'Prefeitura',
    description: 'Centro administrativo. Habilita Leis.',
    color: '#e2e8f0',
    emoji: '🏛️',
    popGen: 5,
    cookieGen: 50,
    unlockPop: 250,
    energyDelta: -4,
    satisfactionBonus: { type: 'safety', amount: 10 }
  },
  [BuildingType.SolarFarm]: {
    type: BuildingType.SolarFarm,
    cost: 350,
    name: 'Solar',
    description: 'Alta geração de energia limpa (+15 Energia)',
    color: '#1e3a8a',
    emoji: '☀️',
    popGen: 0,
    cookieGen: 10,
    unlockPop: 80,
    energyDelta: 15, // Alta Produção
    satisfactionBonus: { type: 'environment', amount: 8 }
  },
};

/**
 * Lista inicial de melhorias (Upgrades) disponíveis para compra no ID Digital.
 */
export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'wifi_6g',
    name: 'Wi-Fi 6G Público',
    description: 'Residências geram renda passiva via home office.',
    cost: 500,
    targetType: BuildingType.Residential,
    multiplier: 1.5, 
    purchased: false,
  },
  {
    id: 'delivery_drones',
    name: 'Drones de Entrega',
    description: 'Mercados geram 50% mais Cookies com entregas rápidas.',
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
    targetType: BuildingType.Industrial, 
    multiplier: 1.3,
    purchased: false,
  },
  {
    id: 'tourism_ads',
    name: 'Propaganda Turística',
    description: 'Resorts geram o dobro de Cookies atraindo turistas.',
    cost: 5000,
    targetType: BuildingType.BeachResort,
    multiplier: 2.0,
    purchased: false,
  },
  {
    id: 'smart_grid',
    name: 'Rede Inteligente (Smart Grid)',
    description: 'Turbinas Eólicas e Solar tornam-se 50% mais eficientes.',
    cost: 800,
    targetType: BuildingType.WindTurbine, // Afeta também Solar na lógica
    multiplier: 1.5,
    purchased: false,
  },
  {
    id: 'subway_expansion',
    name: 'Trens Magnéticos',
    description: 'Metrôs suportam o dobro de população com levitação magnética.',
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

/**
 * Lista inicial de Ações na Bolsa de Valores.
 */
export const INITIAL_STOCKS: Stock[] = [
  {
    id: 's1',
    symbol: 'CRNCH',
    name: 'Cookie Crunch Ltda',
    description: 'Conglomerado de alimentos básicos.',
    price: 10,
    volatility: 0.02, 
    owned: 0,
    history: [10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
  },
  {
    id: 's2',
    symbol: 'VOLT',
    name: 'Gridline Energia',
    description: 'Infraestrutura e energia renovável.',
    price: 50,
    volatility: 0.05, 
    owned: 0,
    history: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50]
  },
  {
    id: 's3',
    symbol: 'NANO',
    name: 'NanoFuture Tech',
    description: 'Startups de alta tecnologia e IA.',
    price: 100,
    volatility: 0.15,
    owned: 0,
    history: [100, 100, 100, 100, 100, 100, 100, 100, 100, 100]
  }
];

/**
 * Políticas Públicas disponíveis na Prefeitura.
 */
export const POLICIES: Policy[] = [
  {
    id: 'tax_break',
    name: 'Incentivo Fiscal Tecnológico',
    description: 'Reduz impostos para atrair empresas. Produção de Cookies +20%, mas custa 10 C$/tick.',
    costPerTick: 10,
    active: false,
    effect: { target: 'cookies', value: 1.2, type: 'multiplier' }
  },
  {
    id: 'green_city',
    name: 'Cidade Verde',
    description: 'Foco total em sustentabilidade. Satisfação +10, mas custa 15 C$/tick.',
    costPerTick: 15,
    active: false,
    effect: { target: 'satisfaction', value: 10, type: 'flat' }
  },
  {
    id: 'night_life',
    name: 'Vida Noturna Vibrante',
    description: 'Incentiva comércio 24h. Bônus de população +10%, Custo 5 C$/tick.',
    costPerTick: 5,
    active: false,
    effect: { target: 'population', value: 1.1, type: 'multiplier' }
  },
  {
    id: 'safety_first',
    name: 'Vigilância Inteligente',
    description: 'Câmeras e IA para segurança. Satisfação +5, Custo 8 C$/tick.',
    costPerTick: 8,
    active: false,
    effect: { target: 'satisfaction', value: 5, type: 'flat' }
  }
];