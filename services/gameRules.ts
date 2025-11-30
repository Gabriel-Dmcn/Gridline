/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { AIGoal, BuildingType, CityStats, Grid, NewsItem } from "../types";

// --- Geração de Metas (Local - Sem IA) ---
// Agora as metas são geradas dinamicamente com base no estado ATUAL + incremento.
// Isso evita que a missão já nasça completada ou que seja a mesma de antes.

const TEMPLATES_QUESTS = [
    {
        id: 'pop_growth',
        condition: (stats: CityStats) => stats.population < 500,
        generate: (stats: CityStats) => ({
            id: 'pop_growth_' + Date.now(),
            description: "A cidade precisa crescer! Aumente a população.",
            targetType: 'population' as const,
            targetValue: stats.population + 30, // Meta incremental
            reward: 300
        })
    },
    {
        id: 'energy_crisis',
        condition: (stats: CityStats) => stats.energy.balance < 5,
        generate: (stats: CityStats) => ({
            id: 'energy_crisis_' + Date.now(),
            description: "Precisamos de margem energética! Construa fontes de energia.",
            targetType: 'building_count' as const,
            buildingType: BuildingType.WindTurbine,
            targetValue: 2, // Aqui é contagem total, o App verifica se aumentou
            reward: 350
        })
    },
    {
        id: 'satisfaction_boost',
        condition: (stats: CityStats) => stats.satisfaction.total < 70,
        generate: (stats: CityStats) => ({
            id: 'satisfaction_boost_' + Date.now(),
            description: "Melhore o ambiente urbano com Parques.",
            targetType: 'building_count' as const,
            buildingType: BuildingType.Park,
            targetValue: 3, // O jogo vai checar a quantidade total
            reward: 200
        })
    },
    {
        id: 'economic_boom',
        condition: (stats: CityStats) => true,
        generate: (stats: CityStats) => ({
            id: 'economic_boom_' + Date.now(),
            description: "Encha os cofres da prefeitura.",
            targetType: 'cookies' as const,
            targetValue: stats.cookies + 500, // Meta incremental
            reward: 150
        })
    },
    {
        id: 'expansion',
        condition: (stats: CityStats) => true, // Fallback
        generate: (stats: CityStats) => ({
            id: 'expansion_' + Date.now(),
            description: "Grande expansão urbana! Atraia mais residentes.",
            targetType: 'population' as const,
            targetValue: Math.floor(stats.population * 1.2) + 20,
            reward: 500
        })
    }
];

export const generateCityGoal = async (stats: CityStats, grid: Grid, lastGoalId?: string): Promise<AIGoal | null> => {
    // Simula delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Filtra templates possíveis
    let availableTemplates = TEMPLATES_QUESTS.filter(t => t.condition(stats));
    
    // Filtro rigoroso para evitar repetição do mesmo tipo de missão
    if (lastGoalId && availableTemplates.length > 1) {
        // Extrai o ID base da missão anterior (ex: remove o timestamp)
        const lastBaseId = TEMPLATES_QUESTS.find(t => lastGoalId.startsWith(t.id))?.id;
        if (lastBaseId) {
             availableTemplates = availableTemplates.filter(t => t.id !== lastBaseId);
        }
    }
    
    // Se filtrou tudo (todos eram iguais ao anterior), reseta
    if (availableTemplates.length === 0) {
        availableTemplates = TEMPLATES_QUESTS;
    }

    const template = availableTemplates[Math.floor(Math.random() * availableTemplates.length)];
    
    if (template) {
        // Se for building_count, precisamos garantir que o targetValue seja > contagem atual
        const goal = template.generate(stats);
        
        if (goal.targetType === 'building_count' && goal.buildingType) {
            let currentCount = 0;
            grid.flat().forEach(t => { if(t.buildingType === goal.buildingType) currentCount++; });
            goal.targetValue = currentCount + (goal.targetValue || 1);
        }

        return { ...goal, completed: false };
    }

    return null;
};

// --- Geração de Notícias (Local - Sem IA) ---

const TEMPLATES_NEWS = {
    positive: [
        "Morador: 'Adoro as novas árvores do parque!'",
        "Turista: 'A tecnologia dessa cidade é incrível.'",
        "O trânsito está fluindo muito bem hoje.",
        "A qualidade do ar atingiu níveis excelentes.",
        "Nova startup de Cookies abriu no centro!"
    ],
    negative: [
        "Reclamação: 'Falta energia no meu bairro!'",
        "Cidadão: 'Precisamos de mais escolas.'",
        "Trânsito caótico na avenida principal.",
        "A poluição das fábricas está incomodando.",
        "Moradores pedem mais segurança à noite."
    ],
    neutral: [
        "Previsão do tempo: Possibilidade de bits caindo do céu.",
        "O mercado de ações está agitado hoje.",
        "Eleições para síndico do prédio residencial.",
        "Festival de tecnologia agendado para o fim de semana.",
        "Lembrete: Atualize seu ID Digital."
    ]
};

export const generateNewsEvent = async (stats: CityStats): Promise<NewsItem | null> => {
    let type: 'positive' | 'negative' | 'neutral' = 'neutral';
    const roll = Math.random();

    if (stats.satisfaction.total > 70) {
        type = roll > 0.3 ? 'positive' : 'neutral';
    } else if (stats.satisfaction.total < 40) {
        type = roll > 0.3 ? 'negative' : 'neutral';
    } else {
        type = roll > 0.6 ? 'positive' : roll > 0.3 ? 'negative' : 'neutral';
    }

    const list = TEMPLATES_NEWS[type];
    const text = list[Math.floor(Math.random() * list.length)];

    return {
        id: Date.now().toString() + Math.random(),
        text: text,
        type: type
    };
};