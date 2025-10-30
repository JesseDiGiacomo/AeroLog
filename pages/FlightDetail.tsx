import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Flight, Comment } from '../types';
import { getFlightById, toggleFlightLike } from '../services/flightService';
import { generateFlightSummary } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import MapDisplay from '../components/MapDisplay';
import { useAuth } from '../contexts/AuthContext';
import { LikeButton } from '../components/FlightCard';
import { formatDuration } from '../utils';
import { 
  Sparkles, MessageSquare, Award, MapPin, ArrowRight, List, Clock, Hourglass, ChevronsUp,
  ChevronsDown, Wind, Gauge, Mountain, MountainSnow, TrendingUp, Medal, Triangle,
  GitBranch, MoveRight, Loader, Flag
} from 'lucide-react';

const StatItem = ({ icon, label, value, iconClassName = "text-cyan-400" }: { icon: React.ReactNode, label: string, value: string | number, iconClassName?: string }) => (
    <div className="bg-gray-800/50 rounded-lg p-4 flex items-center space-x-3">
      <div className={iconClassName}>{icon}</div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
    </div>
);


const FlightDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [flight, setFlight] = useState<Flight | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (!id) return;
    const fetchFlight = async () => {
      setIsLoading(true);
      try {
        const data = await getFlightById(id);
        setFlight(data);
        if (data) {
          setComments(data.comments);
        }
      } catch (error) {
        console.error("Failed to fetch flight details", error);
        setFlight(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFlight();
  }, [id]);

  useEffect(() => {
    const autoGenerateSummary = async () => {
      if (flight) {
        setIsGeneratingSummary(true);
        try {
          const summary = await generateFlightSummary(flight);
          setAiSummary(summary);
        } catch (error) {
          setAiSummary('Falha ao gerar o resumo.');
        } finally {
          setIsGeneratingSummary(false);
        }
      }
    };
    autoGenerateSummary();
  }, [flight]);
  
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim() && currentUser) {
      const comment: Comment = {
        id: `c${Date.now()}`,
        author: currentUser,
        text: newComment.trim(),
        timestamp: new Date().toISOString(),
      };
      setComments(prevComments => [comment, ...prevComments]);
      setNewComment('');
    }
  };
  
  const handleLikeToggle = async (flightId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (!flight) return;
    try {
      const updatedFlight = await toggleFlightLike(flightId, currentUser.id);
      if (updatedFlight) {
        setFlight(updatedFlight);
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };

  if (isLoading) {
    return <LoadingSpinner text="Carregando detalhes do voo..." />;
  }

  if (!flight) {
    return <div className="text-center text-red-500">Voo não encontrado.</div>;
  }

  return (
    <div className="space-y-8">
      <header className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4 w-full sm:w-auto">
                <Link to={`/profile/${flight.pilot.id}`} className="group flex-shrink-0">
                    <img src={flight.pilot.avatarUrl} alt={flight.pilot.name} className="w-16 h-16 rounded-full border-4 border-gray-600 group-hover:border-cyan-400 transition-colors" />
                </Link>
                <div className="flex-grow">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl sm:text-2xl font-bold text-white">
                            <Link to={`/profile/${flight.pilot.id}`} className="hover:text-cyan-400 transition-colors">{flight.pilot.name}</Link>
                        </h1>
                        <div className="sm:hidden">
                            <LikeButton flight={flight} onLikeToggle={() => handleLikeToggle(flight.id)} />
                        </div>
                    </div>
                    <p className="text-gray-400 text-sm">{new Date(flight.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    <p className="text-gray-300">{flight.glider}</p>
                </div>
            </div>
            <div className="hidden sm:block flex-shrink-0">
                <LikeButton flight={flight} onLikeToggle={() => handleLikeToggle(flight.id)} />
            </div>
        </div>
        <div className="flex items-center space-x-3 text-lg text-gray-300 pt-4 border-t border-gray-700/50">
            <MapPin size={20} className="text-cyan-400"/>
            <span className="font-semibold">{flight.takeoff}</span>
            <ArrowRight size={20} className="text-gray-500" />
            <span className="font-semibold">{flight.landing}</span>
        </div>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-96 md:h-[500px] bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <MapDisplay track={flight.track} faiTriangleTurnpoints={flight.faiTriangle?.turnpoints} />
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Sparkles className="text-cyan-400" />
              <span>Resumo por IA</span>
            </h2>
            {isGeneratingSummary ? (
              <div className="flex items-center space-x-2 text-gray-400">
                <Loader className="animate-spin" size={20}/>
                <span>Gerando análise do voo...</span>
              </div>
            ) : (
              <p className="text-gray-300 whitespace-pre-wrap">{aiSummary}</p>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <List className="text-cyan-400"/>
              <span>Estatísticas do Voo</span>
            </h3>
            <div className="space-y-2">
              <StatItem icon={<TrendingUp size={20} />} label="Distância (OLC)" value={`${flight.distance.toFixed(1)} km`} />
              <StatItem icon={<Hourglass size={20} />} label="Duração" value={formatDuration(flight.duration)} />
              <StatItem icon={<Mountain size={20} />} label="Altitude Máxima" value={`${flight.maxAltitude} m`} />
              <StatItem icon={<MountainSnow size={20} />} label="Ganho de Altitude" value={`${flight.altitudeGain} m`} />
              <StatItem icon={<Gauge size={20} />} label="Velocidade Média" value={`${flight.avgSpeed.toFixed(1)} km/h`} />
              <StatItem icon={<Wind size={20} />} label="Velocidade Máxima" value={`${flight.maxSpeed.toFixed(1)} km/h`} />
              <StatItem icon={<ChevronsUp size={20} />} label="Subida Máxima" value={`${flight.maxClimbRate.toFixed(1)} m/s`} iconClassName="text-green-400"/>
              <StatItem icon={<ChevronsDown size={20} />} label="Descida Máxima" value={`${flight.maxSinkRate.toFixed(1)} m/s`} iconClassName="text-red-400"/>
              <StatItem icon={<Clock size={20} />} label="Horário Decolagem" value={new Date(flight.takeoffTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} />
              <StatItem icon={<Flag size={20} />} label="Horário Pouso" value={new Date(flight.landingTime).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})} />
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <Award className="text-cyan-400"/>
              <span>Pontuação e Distâncias</span>
            </h3>
            <div className="space-y-2">
              <StatItem icon={<Medal size={20} />} label="Pontuação OLC" value={`${flight.olcScore.toFixed(1)} pts`} />
              <StatItem icon={<MoveRight size={20} />} label="Distância Reta" value={`${flight.straightDistance.toFixed(1)} km`} />
              <StatItem icon={<GitBranch size={20} />} label="Distância Livre" value={`${flight.freeDistance.toFixed(1)} km`} />
              {flight.faiTriangle && (
                <StatItem icon={<Triangle size={20} />} label="Triângulo FAI" value={`${flight.faiTriangle.score.toFixed(1)} km`} />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <MessageSquare className="text-cyan-400" />
          <span>Comentários ({comments.length})</span>
        </h2>
        {currentUser && (
          <form onSubmit={handleCommentSubmit} className="mb-6 flex items-start space-x-3">
            <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-10 h-10 rounded-full"/>
            <div className="flex-grow">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Deixe seu comentário..."
                className="block w-full rounded-md border-0 bg-gray-700 p-2 text-white ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-500 sm:text-sm"
                rows={2}
              />
              <button type="submit" className="mt-2 px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-lg text-sm transition-colors disabled:bg-gray-600" disabled={!newComment.trim()}>
                Publicar
              </button>
            </div>
          </form>
        )}
        <div className="space-y-4">
          {comments.map(comment => (
            <div key={comment.id} className="flex items-start space-x-3">
              <img src={comment.author.avatarUrl} alt={comment.author.name} className="w-10 h-10 rounded-full"/>
              <div className="bg-gray-700/50 rounded-lg p-3 flex-grow">
                <div className="flex items-center space-x-2">
                  <Link to={`/profile/${comment.author.id}`} className="font-semibold text-white hover:underline">{comment.author.name}</Link>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.timestamp).toLocaleString('pt-BR')}
                  </span>
                </div>
                <p className="text-gray-300 mt-1">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="text-center mt-4">
        <button className="text-gray-500 hover:text-red-400 transition-colors flex items-center justify-center mx-auto space-x-2 text-sm">
          <Flag size={14} />
          <span>Denunciar este voo</span>
        </button>
      </div>

    </div>
  );
};

export default FlightDetail;
