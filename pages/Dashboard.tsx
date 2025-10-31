
import React, { useState, useEffect, useMemo } from 'react';
import type { Flight } from '../types';
import { getFlights, toggleFlightLike, toggleFollowTakeoff } from '../services/flightService';
import FlightCard from '../components/FlightCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// FIX: Imported Bookmark icon to be used in the UI.
import { LogIn, Users, Rss, Bookmark } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [allFlights, setAllFlights] = useState<Flight[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedType, setFeedType] = useState<'recent' | 'following'>('recent');
  const { isAuthenticated, currentUser, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlights = async () => {
      setIsLoading(true);
      try {
        const data = await getFlights();
        setAllFlights(data);
      } catch (error) {
        console.error("Failed to fetch flights", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFlights();
  }, []);

  const displayedFlights = useMemo(() => {
    if (!allFlights) return [];
    if (feedType === 'following' && currentUser) {
      return allFlights.filter(flight => 
        currentUser.followingPilots.includes(flight.pilot.id) ||
        currentUser.followingTakeoffs.includes(flight.takeoff)
      );
    }
    return allFlights;
  }, [allFlights, feedType, currentUser]);

  const handleLikeToggle = async (flightId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      const updatedFlight = await toggleFlightLike(flightId, currentUser.id);
      if (updatedFlight && allFlights) {
        setAllFlights(allFlights.map(f => (f.id === flightId ? updatedFlight : f)));
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };
  
  const handleFollowTakeoff = async (takeoffName: string) => {
    if (!currentUser) return;
    try {
      const updatedPilot = await toggleFollowTakeoff(currentUser.id, takeoffName);
      if (updatedPilot) {
        updateCurrentUser({ followingTakeoffs: updatedPilot.followingTakeoffs });
      }
    } catch (error) {
      console.error("Failed to follow takeoff", error);
    }
  };

  const TabButton = ({ type, label, icon }: { type: 'recent' | 'following', label: string, icon: React.ReactNode }) => {
    const isActive = feedType === type;
    return (
        <button
            onClick={() => setFeedType(type)}
            disabled={type === 'following' && !isAuthenticated}
            className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center justify-center space-x-2 disabled:cursor-not-allowed disabled:text-gray-500 ${isActive ? 'bg-cyan-500 text-white shadow' : 'text-gray-300 hover:bg-gray-700'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Bem-vindo ao AeroLog</h1>
        <p className="text-lg text-gray-400">Descubra e compartilhe os voos mais recentes de pilotos de todo o mundo.</p>
      </div>
      
      <div className="flex justify-center mb-6 bg-gray-900/50 p-1 rounded-lg border border-gray-700 max-w-xs mx-auto">
        <TabButton type="recent" label="Recentes" icon={<Users size={16}/>} />
        <TabButton type="following" label="Seguindo" icon={<Rss size={16}/>} />
      </div>

      <div>
        {!isAuthenticated && !isLoading && (
           <div className="bg-gray-800 border border-cyan-500/30 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h3 className="font-bold text-white text-lg">Acesse todos os recursos!</h3>
              <p className="text-gray-300">Faça login para seguir pilotos, salvar locais e ver seu feed personalizado.</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-5 rounded-lg flex items-center space-x-2 transition-transform transform hover:scale-105 flex-shrink-0"
            >
              <LogIn size={20} />
              <span>Fazer Login</span>
            </button>
          </div>
        )}
        
        {isLoading ? (
          <div className="h-96">
            <LoadingSpinner text="Buscando os voos mais recentes..." />
          </div>
        ) : displayedFlights && displayedFlights.length > 0 ? (
          <div className="space-y-6">
            {displayedFlights.map(flight => (
              <FlightCard key={flight.id} flight={flight} onLikeToggle={handleLikeToggle} onFollowTakeoff={handleFollowTakeoff} />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-800 rounded-lg">
            {feedType === 'following' && isAuthenticated ? (
              <>
                <p className="text-gray-400 text-lg mb-2">Seu feed está vazio.</p>
                <p className="text-gray-500">Siga pilotos nos perfis deles ou clique no ícone de marcador <Bookmark size={14} className="inline-block text-gray-500" /> ao lado dos locais de decolagem para começar.</p>
              </>
            ) : (
              <p className="text-gray-500">Não foi possível carregar os voos.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;