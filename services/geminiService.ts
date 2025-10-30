import { GoogleGenAI } from "@google/genai";
import type { Flight } from '../types';

if (!process.env.API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will be disabled.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateFlightSummary = async (flight: Flight): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Recursos de IA desativados. Por favor, defina a variável de ambiente API_KEY.";
  }

  const prompt = `
    Analise o seguinte voo de parapente e gere um resumo técnico curto em terceira pessoa, como se você fosse um comentarista de voo.
    Concentre-se nas principais métricas de desempenho e conquistas do voo. Não use a primeira pessoa ("eu", "meu", etc.).
    - Piloto: ${flight.pilot.name}
    - Data: ${new Date(flight.date).toLocaleDateString('pt-BR')}
    - Local da Decolagem: ${flight.takeoff}
    - Vela: ${flight.glider}
    - Distância Total (Pontuação OLC): ${flight.distance.toFixed(1)} km
    - Duração: ${flight.duration} minutos
    - Altitude Máxima: ${flight.maxAltitude} metros
    - Ganho de Altitude: ${flight.altitudeGain} m
    - Velocidade Máxima: ${flight.maxSpeed} km/h

    Comece com uma declaração concisa sobre o voo, por exemplo: "${flight.pilot.name} completou um voo de cross-country impressionante...".
    Mencione as principais estatísticas como distância, altitude e duração em um tom analítico.
    Mantenha o texto conciso, com cerca de 3-4 frases.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao gerar o resumo do voo:", error);
    return "Não foi possível gerar o resumo da IA. Por favor, tente novamente mais tarde.";
  }
};