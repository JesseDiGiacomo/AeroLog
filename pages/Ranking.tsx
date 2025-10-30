import React, { useState, useEffect, useMemo } from 'react';
import type { Flight, Pilot } from '../types';
import { getFlights } from '../services/flightService';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import { Award, TrendingUp, User, Users, Sun } from 'lucide-react';

type RankingType = 'all' | 'daily' | 'annual';

interface AnnualRankingItem {
    pilot: Pilot;
    totalScore: number;
    flightCount: number;
}

const Ranking: React.FC = () => {
  const [flights, setFlights] = useState<Flight[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rankingType, setRankingType] = useState<RankingType>('all');

  useEffect(() => {
    const fetchAllFlights = async () => {
      setIsLoading(true);
      try {
        const data = await getFlights();
        setFlights(data);
      } catch (error) {
        console.error("Failed to fetch flights", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllFlights();
  }, []);

  const { allTimeRanking, dailyRanking, annualRanking } = useMemo(() => {
    if (!flights) return { allTimeRanking: [], dailyRanking: [], annualRanking: [] };

    // All-Time Ranking
    const allTime = [...flights].sort((a, b) => b.distance - a.distance);

    // Daily Ranking
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const daily = flights
      .filter(flight => {
        const flightDate = new Date(flight.date);
        return flightDate >= today && flightDate < tomorrow;
      })
      .sort((a, b) => b.distance - a.distance);

    // Annual Ranking
    const currentYear = new Date().getFullYear();
    const pilotScores: { [key: string]: { pilot: Pilot; scores: number[] } } = {};

    flights.forEach(flight => {
      if (new Date(flight.date).getFullYear() === currentYear) {
        if (!pilotScores[flight.pilot.id]) {
          pilotScores[flight.pilot.id] = { pilot: flight.pilot, scores: [] };
        }
        pilotScores[flight.pilot.id].scores.push(flight.distance);
      }
    });

    const annual = Object.values(pilotScores).map(({ pilot, scores }) => {
      const topScores = scores.sort((a, b) => b - a).slice(0, 5);
      const totalScore = topScores.reduce((sum, score) => sum + score, 0);
      return { pilot, totalScore, flightCount: topScores.length };
    }).sort((a, b) => b.totalScore - a.totalScore);

    return { allTimeRanking: allTime, dailyRanking: daily, annualRanking: annual };
  }, [flights]);

  const getRankColor = (index: number) => {
    if (index === 0) return 'text-yellow-400';
    if (index === 1) return 'text-gray-300';
    if (index === 2) return 'text-yellow-600';
    return 'text-gray-400';
  };
  
  const descriptions: Record<RankingType, string> = {
    all: 'Os melhores voos individuais de todos os tempos, classificados por distância.',
    daily: 'Os melhores voos de hoje. Veja quem está voando alto agora!',
    annual: `Os melhores pilotos do ano, com base na soma de seus 5 melhores voos.`
  };

  const renderFlightList = (list: Flight[]) => {
    if (list.length === 0) {
        return <p className="p-8 text-center text-gray-500">Nenhum voo encontrado para este período.</p>
    }
    return (
      <div className="divide-y divide-gray-700">
        {list.map((flight, index) => (
          <div key={flight.id} className="p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center space-x-4">
              <span className={`text-2xl font-bold w-8 text-center ${getRankColor(index)}`}>{index + 1}</span>
              <Link to={`/profile/${flight.pilot.id}`}>
                <img src={flight.pilot.avatarUrl} alt={flight.pilot.name} className="w-12 h-12 rounded-full border-2 border-gray-600"/>
              </Link>
              <div>
                <Link to={`/profile/${flight.pilot.id}`} className="font-semibold text-white hover:text-cyan-400 transition-colors">{flight.pilot.name}</Link>
                <Link to={`/flight/${flight.id}`} className="block text-sm text-gray-400 hover:underline">
                  {flight.takeoff} em {new Date(flight.date).toLocaleDateString('pt-BR')}
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-lg font-bold text-cyan-400">
              <span>{flight.distance.toFixed(1)} km</span>
              <TrendingUp size={20} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const renderAnnualList = (list: AnnualRankingItem[]) => {
     if (list.length === 0) {
        return <p className="p-8 text-center text-gray-500">Nenhum voo encontrado para este ano ainda.</p>
    }
    return (
        <div className="divide-y divide-gray-700">
            {list.map((item, index) => (
              <div key={item.pilot.id} className="p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center space-x-4">
                  <span className={`text-2xl font-bold w-8 text-center ${getRankColor(index)}`}>{index + 1}</span>
                  <Link to={`/profile/${item.pilot.id}`}>
                    <img src={item.pilot.avatarUrl} alt={item.pilot.name} className="w-12 h-12 rounded-full border-2 border-gray-600"/>
                  </Link>
                  <div>
                    <Link to={`/profile/${item.pilot.id}`} className="font-semibold text-white hover:text-cyan-400 transition-colors">{item.pilot.name}</Link>
                    <p className="text-sm text-gray-400">de {item.flightCount} melhores voos</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-lg font-bold text-cyan-400">
                  <span>{item.totalScore.toFixed(1)} pts</span>
                  <Award size={20} />
                </div>
              </div>
            ))}
      </div>
    );
  }

  const TabButton = ({ type, label, icon }: { type: RankingType, label: string, icon: React.ReactNode }) => {
    const isActive = rankingType === type;
    return (
        <button
            onClick={() => setRankingType(type)}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2 ${isActive ? 'bg-cyan-500 text-white shadow' : 'text-gray-300 hover:bg-gray-700'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold text-white mb-4 text-center">Rankings</h1>
      
      <div className="flex justify-center mb-6 bg-gray-900/50 p-1 rounded-lg border border-gray-700 max-w-sm mx-auto">
        <TabButton type="all" label="Geral" icon={<Users size={16}/>} />
        <TabButton type="daily" label="Diário" icon={<Sun size={16}/>} />
        <TabButton type="annual" label="Anual" icon={<Award size={16}/>} />
      </div>

      <p className="text-lg text-gray-400 mb-8 text-center">{descriptions[rankingType]}</p>
      
      <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
        {isLoading ? (
          <LoadingSpinner text="Calculando classificações..." />
        ) : (
          <>
            {rankingType === 'annual' && renderAnnualList(annualRanking)}
            {rankingType === 'all' && renderFlightList(allTimeRanking)}
            {rankingType === 'daily' && renderFlightList(dailyRanking)}
          </>
        )}
      </div>
    </div>
  );
};

export default Ranking;