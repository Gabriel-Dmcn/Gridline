
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { AIGoal, BuildingType, CityStats, Grid, NewsItem } from "../types";

// --- Geração de Metas (Local - Sem IA) ---

const TEMPLATES_QUESTS = [
    {
        condition: (stats: CityStats) => stats.population < 20,
        generate: () => ({
            description: "A cidade está deserta! Construa novas zonas residenciais para atrair moradores.",
            targetType: 'population' as const,
            targetValue: 50,
            reward: 200
        })
    },
    {
        condition: (stats: CityStats) => stats.energy.balance < 5,
        generate: () => ({
            description: "Crise energética iminente! Precisamos de mais energia limpa (Eólica ou Solar).",
            targetType: 'building_count' as const,
            buildingType: BuildingType.WindTurbine,
            targetValue: 3,
            reward: 350
        })
    },
    {
        condition: (stats: CityStats) => stats.satisfaction.total < 60,
        generate: () => ({
            description: "Os cidadãos estão infelizes. Construa parques para melhorar o ambiente.",
            targetType: 'building_count' as const,
            buildingType: BuildingType.Park,
            targetValue: 4,
            reward: 150
        })
    },
    {
        condition: (stats: CityStats) => stats.cookies < 500,
        generate: () => ({
            description: "Os cofres estão vazios. Invista em Comércio para gerar impostos.",
            targetType: 'cookies' as const,
            targetValue: 1000,
            reward: 100
        })
    },
    {
        condition: (stats: CityStats) => true, // Fallback genérico
        generate: (stats: CityStats) => ({
            description: "Expansão urbana! Aumente a população da Gridline.",
            targetType: 'population' as const,
            targetValue: Math.floor(stats.population * 1.5) + 50,
            reward: 500
        })
    }
];

export const generateCityGoal = async (stats: CityStats, grid: Grid): Promise<AIGoal | null> => {
    // Simula um delay de "pensamento"
    await new Promise(resolve => setTimeout(resolve, 500));

    // Procura uma quest que se encaixe na situação atual
    const template = TEMPLATES_QUESTS.find(t => t.condition(stats));
    
    if (template) {
        return { ...template.generate(stats), completed: false };
    }

    // Default
    return {
        description: "Construa uma Prefeitura para organizar a gestão da cidade.",
        targetType: 'building_count',
        buildingType: BuildingType.CityHall,
        targetValue: 1,
        reward: 2000,
        completed: false
    };
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
    // Escolhe o tipo baseado na satisfação
    let type: 'positive' | 'negative' | 'neutral' = 'neutral';
    const roll = Math.random();

    if (stats.satisfaction.total > 70) {
        type = roll > 0.3 ? 'positive' : 'neutral';
    } else if (stats.satisfaction.total < 40) {
        type = roll > 0.3 ? 'negative' : 'neutral';
    } else {
        type = roll > 0.6 ? 'positive' : roll > 0.3 ? 'negative' : 'neutral';
    }

    // Seleciona texto aleatório
    const list = TEMPLATES_NEWS[type];
    const text = list[Math.floor(Math.random() * list.length)];

    return {
        id: Date.now().toString() + Math.random(),
        text: text,
        type: type
    };
};
