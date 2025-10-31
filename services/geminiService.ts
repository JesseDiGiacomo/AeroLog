import { GoogleGenAI } from "@google/genai";
import type { Flight } from '../types';
import { formatDuration } from '../utils';

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

export const generateFlightStatisticsSummary = async (flights: Flight[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Recursos de IA desativados.";
  }
  if (flights.length === 0) {
    return "Nenhum voo para analisar.";
  }

  const sortedByDate = [...flights].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstFlightDate = new Date(sortedByDate[0].date).toLocaleDateString('pt-BR');
  const lastFlightDate = new Date(sortedByDate[sortedByDate.length - 1].date).toLocaleDateString('pt-BR');

  const totalDistance = flights.reduce((sum, f) => sum + f.distance, 0);
  const avgDistance = totalDistance / flights.length;
  const totalDuration = flights.reduce((sum, f) => sum + f.duration, 0);
  const avgDuration = totalDuration / flights.length;
  
  const bestFlight = flights.reduce((best, current) => current.distance > best.distance ? current : best, flights[0]);

  const takeoffCounts = flights.reduce((acc, flight) => {
    acc[flight.takeoff] = (acc[flight.takeoff] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const popularTakeoff = Object.entries(takeoffCounts).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];

  const pilotCounts = flights.reduce((acc, flight) => {
    acc[flight.pilot.name] = (acc[flight.pilot.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const topPilot = Object.entries(pilotCounts).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0];
  
  const prompt = `
    Você é um analista de dados de voo livre especializado em parapente e asa delta.
    Analise o seguinte conjunto de dados de voos e forneça um resumo conciso e perspicaz em 3-4 frases.
    Destaque tendências, feitos notáveis e padrões interessantes. Seja técnico, mas acessível.

    **Dados da Análise:**
    - Número total de voos: ${flights.length}
    - Período dos voos: de ${firstFlightDate} a ${lastFlightDate}
    - Distância total voada (soma): ${totalDistance.toFixed(0)} km
    - Distância média por voo: ${avgDistance.toFixed(1)} km
    - Voo mais longo: ${bestFlight.distance.toFixed(1)} km por ${bestFlight.pilot.name} em ${bestFlight.takeoff}
    - Duração média de voo: ${formatDuration(avgDuration)}
    - Local de decolagem mais popular: ${popularTakeoff[0]} (${popularTakeoff[1]} voos)
    - Piloto com mais voos na seleção: ${topPilot[0]} (${topPilot[1]} voos)

    **Exemplo de Saída:**
    "A análise revela uma forte atividade em [Local de Decolagem], que se destaca como o ponto de partida para X% dos voos. O desempenho geral é impressionante, com uma distância média de Y km, e um destaque especial para o voo de Z km de [Piloto], demonstrando o potencial da região. Observa-se uma tendência de voos mais longos no período de [mês/estação]."

    Analise os dados fornecidos e gere um resumo semelhante. Não inclua o título "Resumo da Análise".
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Erro ao gerar o resumo das estatísticas:", error);
    return "Não foi possível gerar a análise da IA para esta seleção de voos.";
  }
};
