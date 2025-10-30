
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Flight } from '../types';
import { getFlights, toggleFlightLike } from '../services/flightService';
import LoadingSpinner from '../components/LoadingSpinner';
import FlightCard from '../components/FlightCard';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Calendar, Search, X, Rocket, Filter } from 'lucide-react';

const Statistics: React.FC = () => {
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // Filter states
  const [takeoffFilter, setTakeoffFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOption, setSortOption] = useState('date');
  const [gliderTypeFilter, setGliderTypeFilter] = useState('all');

  useEffect(() => {
    const fetchAllFlights = async () => {
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
    fetchAllFlights();
  }, []);

  const uniqueYears = useMemo(() => {
    if (!allFlights) return [];
    const years = new Set(allFlights.map(f => new Date(f.date).getFullYear()));
    return Array.from(years).sort((a: number, b: number) => b - a);
  }, [allFlights]);

  const applyFilters = () => {
    let flightsToFilter = [...allFlights];

    // Filter by takeoff location (case-insensitive)
    if (takeoffFilter) {
      flightsToFilter = flightsToFilter.filter(flight =>
        flight.takeoff.toLowerCase().includes(takeoffFilter.toLowerCase())
      );
    }

    // Filter by year
    if (yearFilter !== 'all') {
      flightsToFilter = flightsToFilter.filter(flight =>
        new Date(flight.date).getFullYear() === parseInt(yearFilter, 10)
      );
    }

    // Filter by glider type
    if (gliderTypeFilter !== 'all') {
        flightsToFilter = flightsToFilter.filter(f => f.gliderType === gliderTypeFilter);
    }

    // Filter by date range
    if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        flightsToFilter = flightsToFilter.filter(flight => new Date(flight.date) >= start);
    }
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        flightsToFilter = flightsToFilter.filter(flight => new Date(flight.date) <= end);
    }

    // Apply sorting
    switch (sortOption) {
        case 'distance':
            flightsToFilter.sort((a, b) => b.distance - a.distance);
            break;
        case 'duration':
            flightsToFilter.sort((a, b) => b.duration - a.duration);
            break;
        case 'score':
            flightsToFilter.sort((a, b) => b.olcScore - a.olcScore);
            break;
        case 'date':
        default:
            flightsToFilter.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            break;
    }

    setFilteredFlights(flightsToFilter);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    applyFilters();
    setHasSearched(true);
  };
  
  const handleLikeToggle = async (flightId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      const updatedFlight = await toggleFlightLike(flightId, currentUser.id);
      if (updatedFlight) {
        const updateList = (list: Flight[]) => list.map(f => f.id === flightId ? updatedFlight : f);
        setAllFlights(updateList);
        if(hasSearched) {
          setFilteredFlights(updateList);
        }
      }
    } catch (error) {
      console.error("Failed to toggle like", error);
    }
  };


  const resetFilters = () => {
    setTakeoffFilter('');
    setYearFilter('all');
    setStartDate('');
    setEndDate('');
    setSortOption('date');
    setGliderTypeFilter('all');
    setFilteredFlights([]);
    setHasSearched(false);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Estatísticas de Voo</h1>
        <p className="text-lg text-gray-400">Filtre e explore o histórico completo de voos.</p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          {/* Takeoff Filter */}
          <div className="w-full md:col-span-2">
            <label htmlFor="takeoff" className="block text-sm font-medium text-gray-300 mb-1">Local de Decolagem</label>
            <div className="relative">
                <MapPin className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    id="takeoff"
                    value={takeoffFilter}
                    onChange={(e) => setTakeoffFilter(e.target.value)}
                    className="block w-full rounded-md border-0 bg-gray-700 py-2 pl-10 pr-3 text-white ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                    placeholder="Ex: Annecy"
                />
            </div>
          </div>

          {/* Year Filter */}
          <div className="w-full">
            <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-1">Ano</label>
             <div className="relative">
                <Calendar className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-gray-400" />
                <select
                    id="year"
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                    className="block w-full appearance-none rounded-md border-0 bg-gray-700 py-2 pl-10 pr-8 text-white ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                >
                    <option value="all">Todos os Anos</option>
                    {uniqueYears.map(year => <option key={year} value={year}>{year}</option>)}
                </select>
             </div>
          </div>
          
          {/* Glider Type Filter */}
          <div className="w-full">
            <label htmlFor="gliderType" className="block text-sm font-medium text-gray-300 mb-1">Tipo</label>
            <div className="relative">
                <Rocket className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-gray-400" />
                <select
                    id="gliderType"
                    value={gliderTypeFilter}
                    onChange={(e) => setGliderTypeFilter(e.target.value)}
                    className="block w-full appearance-none rounded-md border-0 bg-gray-700 py-2 pl-10 pr-8 text-white ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                >
                    <option value="all">Ambos</option>
                    <option value="paraglider">Parapente</option>
                    <option value="hangglider">Asa Delta</option>
                </select>
            </div>
          </div>
          
           {/* Sort By Filter */}
           <div className="w-full md:col-span-2">
            <label htmlFor="sort" className="block text-sm font-medium text-gray-300 mb-1">Ordenar por</label>
            <div className="relative">
                <Filter className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-gray-400" />
                <select
                    id="sort"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="block w-full appearance-none rounded-md border-0 bg-gray-700 py-2 pl-10 pr-8 text-white ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                >
                    <option value="date">Mais Recentes</option>
                    <option value="distance">Maior Distância</option>
                    <option value="duration">Maior Duração</option>
                    <option value="score">Maior Pontuação OLC</option>
                </select>
            </div>
          </div>

          {/* Date Range Filter */}
          <div className="w-full">
                 <label htmlFor="start-date" className="block text-sm font-medium text-gray-300 mb-1">De</label>
                 <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full rounded-md border-0 bg-gray-700 py-2 px-3 text-white ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                 />
            </div>
             <div className="w-full">
                 <label htmlFor="end-date" className="block text-sm font-medium text-gray-300 mb-1">Até</label>
                 <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full rounded-md border-0 bg-gray-700 py-2 px-3 text-white ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                 />
            </div>
         

          <div className="md:col-span-4 flex flex-col sm:flex-row gap-4">
              <button type="submit" className="w-full sm:w-auto flex-grow bg-cyan-500 hover:bg-cyan-400 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                  <Search size={20} />
                  <span>Buscar</span>
              </button>
              <button type="button" onClick={resetFilters} className="w-full sm:w-auto bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                  <X size={20} />
                  <span>Limpar Filtros</span>
              </button>
          </div>
        </form>
      </div>

      <div>
        {isLoading ? (
          <div className="h-96">
            <LoadingSpinner text="Carregando dados de voos..." />
          </div>
        ) : !hasSearched ? (
           <div className="text-center p-8 bg-gray-800 rounded-lg">
            <p className="text-gray-400">Utilize os filtros acima e clique em "Buscar" para ver os resultados.</p>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-semibold text-white mb-4">{filteredFlights.length} voo(s) encontrado(s)</h2>
            {filteredFlights.length > 0 ? (
              <div className="space-y-6">
                {filteredFlights.map(flight => (
                  <FlightCard key={flight.id} flight={flight} onLikeToggle={handleLikeToggle} />
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-gray-800 rounded-lg">
                <p className="text-gray-500">Nenhum voo encontrado com os filtros aplicados.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Statistics;
