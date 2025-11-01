
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Pilot, Flight } from '../types';
import { getPilotById, getFlightsByPilot, updatePilotDetails, toggleFlightLike, toggleFollowPilot, toggleFollowTakeoff } from '../services/flightService';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import FlightCard from '../components/FlightCard';
import { formatDuration } from '../utils';
import { Hash, TrendingUp, Sun, Clock, BarChart, Award, Target, Triangle, Camera, Edit, Save, X, MoveRight, GitBranch, UserPlus, UserCheck, Users } from 'lucide-react';

const StatRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) => (
    <div className="flex items-center justify-between py-3 border-b border-gray-700/50 last:border-b-0">
        <div className="flex items-center space-x-3 text-gray-300">
            {icon}
            <span className="text-sm">{label}</span>
        </div>
        <span className="font-bold text-lg text-white">{value}</span>
    </div>
);

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { currentUser, updateCurrentUser } = useAuth();
  const navigate = useNavigate();
  
  const [pilot, setPilot] = useState<Pilot | null>(null);
  const [flights, setFlights] = useState<Flight[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = currentUser?.id === id;
  const isFollowing = currentUser?.followingPilots.includes(id!) ?? false;

  useEffect(() => {
    if (!id) return;
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const pilotData = await getPilotById(id);
        const flightsData = await getFlightsByPilot(id);
        setPilot(pilotData);
        if (pilotData) {
            setNewName(pilotData.name);
        }
        setFlights(flightsData);
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [id]);

  const handleNameSave = async () => {
    if (!pilot || newName.trim() === '' || newName === pilot.name) {
        setIsEditingName(false);
        return;
    }
    try {
        const updatedPilot = await updatePilotDetails(pilot.id, { name: newName });
        if (updatedPilot) {
            setPilot(updatedPilot);
            updateCurrentUser({ name: updatedPilot.name });
        }
    } catch (error) {
        console.error("Failed to update pilot name", error);
    } finally {
        setIsEditingName(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0] && pilot) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onloadend = async () => {
            const newAvatarUrl = reader.result as string;
            try {
                const updatedPilot = await updatePilotDetails(pilot.id, { avatarUrl: newAvatarUrl });
                 if (updatedPilot) {
                    setPilot(updatedPilot);
                    updateCurrentUser({ avatarUrl: updatedPilot.avatarUrl });
                 }
            } catch (error) {
                console.error("Failed to update avatar", error);
            }
        };
        reader.readAsDataURL(file);
    }
  };

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
  
  const handleFollowToggle = async () => {
    if (!currentUser || !pilot || isOwnProfile) return;
    try {
        const result = await toggleFollowPilot(currentUser.id, pilot.id);
        if (result) {
            updateCurrentUser({ followingPilots: result.currentUser.followingPilots });
            setPilot(result.targetPilot);
        }
    } catch (error) {
        console.error("Failed to toggle follow", error);
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

  const stats = useMemo(() => {
    if (!flights || flights.length === 0) {
      return {
        totalFlights: 0,
        totalDistance: 0,
        totalHours: 0,
        avgDistance: 0,
        avgDuration: 0,
        flightsOver100: 0,
        flightsOver150: 0,
        flightsOver200: 0,
        flightsOver300: 0,
        faiTriangles: 0,
        bestScore: 0,
        longestDuration: 0,
        longestStraight: 0,
        bestFreeDistance: 0,
        bestFaiTriangle: 0,
      };
    }

    const totalDistance = flights.reduce((sum, f) => sum + f.distance, 0);
    const totalDurationMinutes = flights.reduce((sum, f) => sum + f.duration, 0);

    const faiFlights = flights.filter(f => f.faiTriangle);
    
    // Calculate personal bests
    const bestFaiTriangle = faiFlights.length > 0
      ? Math.max(...faiFlights.map(f => f.faiTriangle!.score))
      : 0;
    const bestScore = Math.max(...flights.map(f => f.olcScore));
    const longestDuration = Math.max(...flights.map(f => f.duration));
    const longestStraight = Math.max(...flights.map(f => f.straightDistance));
    const bestFreeDistance = Math.max(...flights.map(f => f.freeDistance));

    return {
      totalFlights: flights.length,
      totalDistance: totalDistance,
      totalHours: totalDurationMinutes / 60,
      avgDistance: flights.length > 0 ? totalDistance / flights.length : 0,
      avgDuration: flights.length > 0 ? totalDurationMinutes / flights.length : 0,
      flightsOver100: flights.filter(f => f.distance >= 100).length,
      flightsOver150: flights.filter(f => f.distance >= 150).length,
      flightsOver200: flights.filter(f => f.distance >= 200).length,
      flightsOver300: flights.filter(f => f.distance >= 300).length,
      faiTriangles: faiFlights.length,
      bestScore,
      longestDuration,
      longestStraight,
      bestFreeDistance,
      bestFaiTriangle,
    };
  }, [flights]);

  if (isLoading) {
    return <LoadingSpinner text="Carregando perfil do piloto..." />;
  }

  if (!pilot) {
    return <div className="text-center text-red-500">Piloto não encontrado.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col sm:flex-row items-center sm:items-stretch gap-6">
        <div className="relative group flex-shrink-0">
          <img src={pilot.avatarUrl} alt={pilot.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-cyan-400 object-cover" />
          {isOwnProfile && (
            <>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                aria-label="Alterar foto do perfil"
              >
                <Camera className="text-white" size={32} />
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarChange}
              />
            </>
          )}
        </div>
        <div className="flex-grow text-center sm:text-left flex flex-col">
          <div className="flex-grow">
            {isOwnProfile && isEditingName ? (
              <div className="flex items-center space-x-2">
                <input 
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                  className="bg-gray-700 text-white text-3xl font-bold rounded-md px-2 py-1 w-full focus:ring-2 focus:ring-cyan-500 outline-none"
                  autoFocus
                />
                <button onClick={handleNameSave} className="p-2 text-green-400 hover:text-green-300 transition-colors" aria-label="Salvar nome">
                  <Save size={24} />
                </button>
                <button onClick={() => setIsEditingName(false)} className="p-2 text-red-400 hover:text-red-300 transition-colors" aria-label="Cancelar edição do nome">
                  <X size={24} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center sm:justify-start space-x-3">
                <h1 className="text-3xl font-bold text-white">{pilot.name}</h1>
                {isOwnProfile && (
                  <button onClick={() => setIsEditingName(true)} className="p-2 text-gray-400 hover:text-cyan-400 transition-colors" aria-label="Editar nome">
                    <Edit size={20} />
                  </button>
                )}
              </div>
            )}
            <p className="text-gray-400 mt-1">Voando desde 2018 | Membro de Asas do Cerrado</p>
          </div>
          <div className="flex items-center justify-center sm:justify-start space-x-6 mt-4">
              <div className="text-center">
                  <p className="text-xl font-bold text-white">{pilot.followers.length}</p>
                  <p className="text-sm text-gray-400">Seguidores</p>
              </div>
               <div className="text-center">
                  <p className="text-xl font-bold text-white">{pilot.followingPilots.length}</p>
                  <p className="text-sm text-gray-400">Seguindo</p>
              </div>
          </div>
        </div>
        {currentUser && !isOwnProfile && (
            <div className="sm:ml-auto flex-shrink-0">
                <button 
                  onClick={handleFollowToggle}
                  className={`flex items-center justify-center space-x-2 w-32 px-4 py-2 font-semibold rounded-lg transition-colors ${isFollowing ? 'bg-gray-600 hover:bg-gray-500 text-white' : 'bg-cyan-500 hover:bg-cyan-400 text-white'}`}
                >
                  {isFollowing ? <UserCheck size={20} /> : <UserPlus size={20} />}
                  <span>{isFollowing ? 'Seguindo' : 'Seguir'}</span>
                </button>
            </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
           <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4 border-b-2 border-cyan-500 pb-2">Estatísticas Gerais</h3>
              <StatRow icon={<Hash size={20} className="text-cyan-400" />} label="Voos Registrados" value={stats.totalFlights} />
              <StatRow icon={<TrendingUp size={20} className="text-cyan-400" />} label="Distância Total" value={`${stats.totalDistance.toFixed(1)} km`} />
              <StatRow icon={<Clock size={20} className="text-cyan-400" />} label="Tempo de Voo Total" value={`${stats.totalHours.toFixed(1)} h`} />
              <StatRow icon={<Sun size={20} className="text-cyan-400" />} label="Distância Média" value={`${stats.avgDistance.toFixed(1)} km`} />
              <StatRow icon={<BarChart size={20} className="text-cyan-400" />} label="Duração Média" value={formatDuration(stats.avgDuration)} />
           </div>

           <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4 border-b-2 border-cyan-500 pb-2">Recordes Pessoais</h3>
               <StatRow icon={<Award size={20} className="text-yellow-400" />} label="Melhor Voo (Pontos)" value={`${stats.bestScore.toFixed(1)} pts`} />
               <StatRow icon={<Clock size={20} className="text-yellow-400" />} label="Voo Mais Longo" value={formatDuration(stats.longestDuration)} />
               <StatRow icon={<MoveRight size={20} className="text-yellow-400" />} label="Maior Distância Reta" value={`${stats.longestStraight.toFixed(1)} km`} />
               <StatRow icon={<GitBranch size={20} className="text-yellow-400" />} label="Melhor Distância Livre" value={`${stats.bestFreeDistance.toFixed(1)} km`} />
               <StatRow icon={<Triangle size={20} className="text-yellow-400" />} label="Melhor Triângulo FAI" value={`${stats.bestFaiTriangle.toFixed(1)} km`} />
           </div>

           <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4 border-b-2 border-cyan-500 pb-2">Conquistas</h3>
              <StatRow icon={<Target size={20} className="text-green-400" />} label="Voos +100km" value={stats.flightsOver100} />
              <StatRow icon={<Target size={20} className="text-green-400" />} label="Voos +150km" value={stats.flightsOver150} />
              <StatRow icon={<Target size={20} className="text-green-400" />} label="Voos +200km" value={stats.flightsOver200} />
              <StatRow icon={<Target size={20} className="text-green-400" />} label="Voos +300km" value={stats.flightsOver300} />
              <StatRow icon={<Triangle size={20} className="text-green-400" />} label="Triângulos FAI" value={stats.faiTriangles} />
           </div>
        </div>

        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold text-white border-l-4 border-cyan-400 pl-4 mb-6">Histórico de Voos</h2>
          {flights && flights.length > 0 ? (
            <div className="space-y-6">
              {flights.map(flight => <FlightCard key={flight.id} flight={flight} onLikeToggle={handleLikeToggle} onFollowTakeoff={handleFollowTakeoff} />)}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-800 rounded-lg">
              <p className="text-gray-500">Nenhum voo registrado ainda.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
