/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Type } from "@google/genai";
import { AIGoal, BuildingType, CityStats, Grid, NewsItem } from "../types";
import { BUILDINGS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelId = 'gemini-2.5-flash';

// --- Geração de Metas ---

const goalSchema = {
  type: Type.OBJECT,
  properties: {
    description: {
      type: Type.STRING,
      description: "Uma descrição curta e engajadora da missão para o prefeito da Gridline, em Português.",
    },
    targetType: {
      type: Type.STRING,
      enum: ['population', 'cookies', 'building_count'],
      description: "A métrica para rastrear.",
    },
    targetValue: {
      type: Type.INTEGER,
      description: "O valor numérico alvo a alcançar.",
    },
    buildingType: {
      type: Type.STRING,
      enum: [
        BuildingType.Residential, 
        BuildingType.Commercial, 
        BuildingType.Industrial, 
        BuildingType.Park, 
        BuildingType.Road,
        BuildingType.WindTurbine,
        BuildingType.DataCenter,
        BuildingType.BeachResort
      ],
      description: "Necessário se targetType for building_count.",
    },
    reward: {
      type: Type.INTEGER,
      description: "Recompensa em Cookies por completar.",
    },
  },
  required: ['description', 'targetType', 'targetValue', 'reward'],
};

export const generateCityGoal = async (stats: CityStats, grid: Grid): Promise<AIGoal | null> => {
  // Contagem de prédios
  const counts: Record<string, number> = {};
  grid.flat().forEach(tile => {
    counts[tile.buildingType] = (counts[tile.buildingType] || 0) + 1;
  });

  const context = `
    Estatísticas Gridline:
    Dia: ${stats.day}
    Clima: ${stats.weather}
    Cookies (Moeda): C$${stats.cookies}
    População: ${stats.population}
    Prédios Atuais: ${JSON.stringify(counts)}
    Dados dos Prédios: ${JSON.stringify(
      Object.values(BUILDINGS).filter(b => b.type !== BuildingType.None).map(b => ({type: b.type, cost: b.cost, pop: b.popGen, cookies: b.cookieGen}))
    )}
  `;

  const prompt = `Você é o Sistema Operacional da Cidade Inteligente "Gridline".
  A cidade funciona com uma economia baseada em "Cookies" (C$).
  Gere uma missão/meta para o jogador melhorar a infraestrutura, felicidade ou tecnologia.
  A resposta DEVE ser em Português (PT-BR).
  Seja encorajador e use termos como "Smart Grid", "Big Data", "Sustentabilidade", "Cookies".
  Retorne JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `${context}\n${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: goalSchema,
        temperature: 0.7,
      },
    });

    if (response.text) {
      const goalData = JSON.parse(response.text) as Omit<AIGoal, 'completed'>;
      return { ...goalData, completed: false };
    }
  } catch (error) {
    console.error("Erro ao gerar meta:", error);
  }
  return null;
};

// --- Geração de Notícias ---

const newsSchema = {
  type: Type.OBJECT,
  properties: {
    text: { type: Type.STRING, description: "Uma notificação curta tipo tweet de um cidadão ou sensor da Gridline, em Português." },
    type: { type: Type.STRING, enum: ['positive', 'negative', 'neutral'] },
  },
  required: ['text', 'type'],
};

export const generateNewsEvent = async (stats: CityStats, recentAction: string | null): Promise<NewsItem | null> => {
  const context = `Gridline City - Pop: ${stats.population}, Cookies: ${stats.cookies}, Dia: ${stats.day}, Clima: ${stats.weather}. ${recentAction ? `Ação Recente: ${recentAction}` : ''}`;
  const prompt = "Gere uma atualização curta, engraçada ou informativa do 'Feed' de um morador ou sensor da cidade. Referencie o clima, a economia de 'Cookies', ou tecnologia smart. EM PORTUGUÊS (PT-BR).";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `${context}\n${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: newsSchema,
        temperature: 1.1, 
      },
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      return {
        id: Date.now().toString() + Math.random(),
        text: data.text,
        type: data.type,
      };
    }
  } catch (error) {
    console.error("Erro ao gerar notícia:", error);
  }
  return null;
};