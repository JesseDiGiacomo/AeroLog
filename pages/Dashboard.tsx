
import React, { useState, useEffect } from 'react';
import type { Flight } from '../types';
import { getFlights, toggleFlightLike } from '../services/flightService';
import FlightCard from '../components/FlightCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [flights, setFlights] = useState<Flight[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlights = async () => {
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

    fetchFlights();
  }, []);

  const handleLikeToggle = async (flightId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      const updatedFlight = await toggleFlightLike(flightId, currentUser.id);
      if (updatedFlight && flights) {
        setFlights(flights.map(f => (f.id === flightId ? updatedFlight : f)));
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Bem-vindo ao AeroLog</h1>
        <p className="text-lg text-gray-400">Descubra e compartilhe os voos mais recentes de pilotos de todo o mundo.</p>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-white border-l-4 border-cyan-400 pl-4 mb-6">Voos Recentes</h2>
        
        {!isAuthenticated && !isLoading && flights && (
           <div className="bg-gray-800 border border-cyan-500/30 rounded-lg p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div>
              <h3 className="font-bold text-white text-lg">Acesse todos os recursos!</h3>
              <p className="text-gray-300">Faça login para ver detalhes de voos, rankings e perfis de pilotos.</p>
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
        ) : flights ? (
          <div className="space-y-6">
            {flights.map(flight => (
              <FlightCard key={flight.id} flight={flight} onLikeToggle={handleLikeToggle} />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 bg-gray-800 rounded-lg">
            <p className="text-gray-500">Não foi possível carregar os voos.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
