
import React from 'react';
import { Link } from 'react-router-dom';
import type { Flight } from '../types';
import { MapPin, ArrowRight, TrendingUp, Clock, Mountain, Bookmark } from 'lucide-react';
import MapDisplay from './MapDisplay';
import { useAuth } from '../contexts/AuthContext';
import { formatDuration } from '../utils';

// --- Reusable LikeButton Component ---
export const LikeButton: React.FC<{
  flight: Flight;
  onLikeToggle: (flightId: string) => void;
}> = ({ flight, onLikeToggle }) => {
  const { currentUser } = useAuth();
  const isLiked = currentUser ? flight.likedBy.includes(currentUser.id) : false;
  const canLike = !!currentUser;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (canLike) {
      onLikeToggle(flight.id);
    }
  };

  const buttonClasses = `flex items-center space-x-1.5 rounded-full px-3 py-1 transition-all duration-200 group ${
    canLike ? 'hover:bg-cyan-500/20' : 'cursor-default'
  } ${isLiked ? 'text-cyan-400' : 'text-gray-400'}`;
  
  const title = canLike 
    ? (isLiked ? 'Remover aplauso' : 'Aplaudir este voo')
    : 'Faça login para aplaudir';
  
  const emojiClasses = `text-lg transition-transform duration-200 ease-in-out group-hover:scale-110 ${isLiked ? 'scale-125 -rotate-12' : 'scale-100 rotate-0'}`;

  return (
    <button onClick={handleClick} disabled={!canLike} className={buttonClasses} aria-label={title} title={title}>
      <span className={emojiClasses} role="img" aria-label="Aplauso">👏</span>
      <span className="font-semibold text-sm pt-0.5">{flight.likes}</span>
    </button>
  );
};


// --- Icons ---

const ParagliderIcon: React.FC<{ className?: string, title?: string }> = ({ className, title = "Parapente" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role="img"
    aria-labelledby="paragliderIconTitle"
  >
    <title id="paragliderIconTitle">{title}</title>
    <path d="M21.5 10.5c0-5.24-4.26-9.5-9.5-9.5s-9.5 4.26-9.5 9.5" />
    <path d="M5.5 10.5c.63 3.48 3.1 6.5 6.5 6.5s5.87-3.02 6.5-6.5" />
    <path d="m8.5 17 3.5 3.5 3.5-3.5" />
    <path d="M12 17v-2.5" />
  </svg>
);

const HanggliderIcon: React.FC<{ className?: string, title?: string }> = ({ className, title = "Asa Delta" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role="img"
    aria-labelledby="hanggliderIconTitle"
  >
    <title id="hanggliderIconTitle">{title}</title>
    <path d="M2.21 9.53 12 2l9.79 7.53a1 1 0 0 1-.2 1.76L12 15.25 2.41 11.3a1 1 0 0 1-.2-1.77Z" />
    <path d="m12 15.25 1 6.25" />
    <path d="m11.5 21.5 1 0" />
  </svg>
);


const GliderTypeIcon: React.FC<{type: 'paraglider' | 'hangglider'}> = ({ type }) => {
    const commonClasses = "w-4 h-4 text-gray-400";
    if (type === 'paraglider') {
        return <ParagliderIcon className={commonClasses} title="Voo de Parapente" />;
    }
    if (type === 'hangglider') {
        return <HanggliderIcon className={commonClasses} title="Voo de Asa Delta" />;
    }
    return null;
}


// --- Flight Card ---

interface FlightCardProps {
  flight: Flight;
  onLikeToggle: (flightId: string) => void;
  onFollowTakeoff: (takeoffName: string) => void;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, onLikeToggle, onFollowTakeoff }) => {
  const { currentUser } = useAuth();
  const isTakeoffFollowed = currentUser?.followingTakeoffs.includes(flight.takeoff) ?? false;
  
  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if(currentUser) {
      onFollowTakeoff(flight.takeoff);
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-cyan-500/30 hover:ring-2 hover:ring-cyan-500/50">
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div className="md:col-span-1 h-48 md:h-full">
           <MapDisplay track={flight.track} interactive={false} />
        </div>
        <div className="md:col-span-2 p-4 md:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <Link to={`/profile/${flight.pilot.id}`} className="flex items-center space-x-3 group">
                <img src={flight.pilot.avatarUrl} alt={flight.pilot.name} className="w-12 h-12 rounded-full border-2 border-gray-600 group-hover:border-cyan-400 transition-colors" />
                <div>
                  <p className="font-bold text-lg text-white group-hover:text-cyan-400 transition-colors">{flight.pilot.name}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <span>{new Date(flight.date).toLocaleDateString('pt-BR')}</span>
                    <GliderTypeIcon type={flight.gliderType} />
                  </div>
                </div>
              </Link>
              <Link to={`/flight/${flight.id}`} className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold flex items-center space-x-1 flex-shrink-0">
                  <span>Detalhes</span>
                  <ArrowRight size={16} />
              </Link>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400 mb-4 group">
              <MapPin size={16}/>
              <span>{flight.takeoff}</span>
              {currentUser && (
                <button 
                  onClick={handleFollowClick} 
                  title={isTakeoffFollowed ? `Deixar de seguir ${flight.takeoff}` : `Seguir ${flight.takeoff}`}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                  <Bookmark size={16} className={`transition-colors ${isTakeoffFollowed ? 'text-cyan-400 fill-current' : 'text-gray-500 hover:text-cyan-400'}`} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-end justify-between">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <TrendingUp className="text-cyan-400" size={20} />
                <div>
                  <p className="text-gray-400">Distância</p>
                  <p className="font-bold text-white">{flight.distance.toFixed(1)} km</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="text-cyan-400" size={20} />
                <div>
                  <p className="text-gray-400">Duração</p>
                  <p className="font-bold text-white">{formatDuration(flight.duration)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Mountain className="text-cyan-400" size={20} />
                <div>
                  <p className="text-gray-400">Altitude Máx.</p>
                  <p className="font-bold text-white">{flight.maxAltitude} m</p>
                </div>
              </div>
            </div>
             <div className="flex-shrink-0">
                <LikeButton flight={flight} onLikeToggle={onLikeToggle} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlightCard;