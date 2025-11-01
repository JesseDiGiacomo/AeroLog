
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Flight } from '../types';
import { getFlights, toggleFlightLike, toggleFollowTakeoff } from '../services/flightService';
import { generateFlightStatisticsSummary } from '../services/geminiService';
import LoadingSpinner from '../components/LoadingSpinner';
import FlightCard from '../components/FlightCard';
import { useAuth } from '../contexts/AuthContext';
import { MapPin, Calendar, Search, X, Rocket, Filter, User, Sparkles, BarChart3, Loader } from 'lucide-react';


// --- Chart Components ---

const Tooltip: React.FC<{ content: string; position: { x: number; y: number } | null }> = ({ content, position }) => {
  if (!position) return null;
  return (
    <div
      className="absolute bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none transition-transform transform-gpu"
      style={{ left: position.x + 10, top: position.y + 10 }}
    >
      {content}
    </div>
  );
};

const FlightsByTakeoffChart: React.FC<{ data: { name: string; count: number }[] }> = ({ data }) => {
  const [tooltip, setTooltip] = useState<{ content: string; position: { x: number, y: number } } | null>(null);
  if (!data || data.length === 0) return null;
  
  const maxValue = Math.max(...data.map(d => d.count));
  const chartHeight = data.length * 40 + 20;
  const labelWidthPercent = 30;
  const barHeight = 25;

  return (
    <div className="relative">
      <h3 className="text-lg font-semibold text-white mb-2">Top 5 Decolagens</h3>
      <svg width="100%" height={chartHeight} aria-label="Gráfico de voos por local de decolagem">
        <g>
          {data.map((item, index) => {
            const y = index * 40 + 10;
            const barWidth = maxValue > 0 ? (item.count / maxValue) * (100 - labelWidthPercent) : 0;
            return (
              <g
                key={item.name}
                className="cursor-pointer group"
                onMouseMove={(e) => setTooltip({ content: `${item.name}: ${item.count} voo(s)`, position: { x: e.clientX, y: e.clientY } })}
                onMouseLeave={() => setTooltip(null)}
              >
                <text x="0" y={y + barHeight / 2} dy=".35em" className="text-sm fill-current text-gray-300" aria-label={`Local: ${item.name}`}>
                  {item.name.length > 15 ? `${item.name.substring(0, 15)}...` : item.name}
                </text>
                <rect
                  x={`${labelWidthPercent}%`}
                  y={y}
                  width={`${barWidth}%`}
                  height={barHeight}
                  className="fill-current text-cyan-400 group-hover:text-cyan-300 transition-colors"
                  rx="3"
                  aria-label={`Quantidade: ${item.count} voos`}
                />
                <text x={`${labelWidthPercent}%`} transform="translate(5, 0)" y={y + barHeight / 2} dy=".35em" className="text-xs font-bold fill-current text-white">
                  {item.count}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
      {tooltip && <Tooltip content={tooltip.content} position={tooltip.position} />}
    </div>
  );
};

const DistanceDistributionChart: React.FC<{ data: { range: string; count: number }[] }> = ({ data }) => {
    const [tooltip, setTooltip] = useState<{ content: string; position: { x: number, y: number } } | null>(null);
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.count));
    const chartHeight = 200;
    const chartWidth = 100; // as percentage
    const barPadding = 15;
    const barWidth = (chartWidth / data.length) - barPadding;

    return (
        <div className="relative">
            <h3 className="text-lg font-semibold text-white mb-2">Distribuição de Distâncias</h3>
            <svg width="100%" height={chartHeight + 40} aria-label="Gráfico de distribuição de distâncias de voo">
                {data.map((item, index) => {
                    const barHeight = item.count > 0 ? (item.count / maxValue) * chartHeight : 0;
                    const x = (index * (barWidth + barPadding)) + (barPadding/2);
                    const y = chartHeight - barHeight;

                    return (
                        <g 
                            key={item.range} 
                            className="cursor-pointer group"
                            onMouseMove={(e) => setTooltip({ content: `${item.range}: ${item.count} voo(s)`, position: { x: e.clientX, y: e.clientY } })}
                            onMouseLeave={() => setTooltip(null)}
                        >
                            <rect
                                x={`${x}%`}
                                y={y}
                                width={`${barWidth}%`}
                                height={barHeight}
                                className="fill-current text-cyan-500 group-hover:text-cyan-300 transition-colors"
                                rx="2"
                                aria-label={`Faixa de distância: ${item.range}, Quantidade: ${item.count} voos`}
                            />
                            <text x={`${x + barWidth / 2}%`} y={chartHeight + 20} textAnchor="middle" className="text-xs fill-current text-gray-400">
                                {item.range}
                            </text>
                            {item.count > 0 && (
                                <text x={`${x + barWidth / 2}%`} y={y - 5} textAnchor="middle" className="text-xs font-bold fill-current text-white">
                                    {item.count}
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>
            {tooltip && <Tooltip content={tooltip.content} position={tooltip.position} />}
        </div>
    );
};


const Statistics: React.FC = () => {
  const [allFlights, setAllFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { currentUser, updateCurrentUser } = useAuth();
  const navigate = useNavigate();

  // Filter states
  const [takeoffFilter, setTakeoffFilter] = useState('');
  const [pilotNameFilter, setPilotNameFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOption, setSortOption] = useState('date');
  const [gliderTypeFilter, setGliderTypeFilter] = useState('all');

  // Autocomplete states
  const [takeoffSuggestions, setTakeoffSuggestions] = useState<string[]>([]);
  const [showTakeoffSuggestions, setShowTakeoffSuggestions] = useState(false);
  const [pilotSuggestions, setPilotSuggestions] = useState<string[]>([]);
  const [showPilotSuggestions, setShowPilotSuggestions] = useState(false);
  
  // Analysis states
  const [aiSummary, setAiSummary] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [chartData, setChartData] = useState<{ takeoffs: any[], distances: any[] } | null>(null);


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

  const applyFilters = useCallback(() => {
    let flightsToFilter = [...allFlights];

    if (takeoffFilter) {
      flightsToFilter = flightsToFilter.filter(flight =>
        flight.takeoff.toLowerCase().includes(takeoffFilter.toLowerCase())
      );
    }
    if (pilotNameFilter) {
      flightsToFilter = flightsToFilter.filter(flight =>
        flight.pilot.name.toLowerCase().includes(pilotNameFilter.toLowerCase())
      );
    }
    if (yearFilter !== 'all') {
      flightsToFilter = flightsToFilter.filter(flight =>
        new Date(flight.date).getFullYear() === parseInt(yearFilter, 10)
      );
    }
    if (gliderTypeFilter !== 'all') {
        flightsToFilter = flightsToFilter.filter(f => f.gliderType === gliderTypeFilter);
    }
    if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        // FIX: The error indicates an issue with an arithmetic operation on Date objects.
        // Using getTime() ensures we are comparing numbers, which is safer and resolves the type error.
        flightsToFilter = flightsToFilter.filter(flight => new Date(flight.date).getTime() >= start.getTime());
    }
    if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        // FIX: Applying the same fix for consistency to avoid potential errors.
        flightsToFilter = flightsToFilter.filter(flight => new Date(flight.date).getTime() <= end.getTime());
    }

    switch (sortOption) {
        case 'distance': flightsToFilter.sort((a, b) => b.distance - a.distance); break;
        case 'duration': flightsToFilter.sort((a, b) => b.duration - a.duration); break;
        case 'score': flightsToFilter.sort((a, b) => b.olcScore - a.olcScore); break;
        // FIX: Use getTime() to perform arithmetic operations on dates for sorting.
        case 'date': default: flightsToFilter.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); break;
    }

    setFilteredFlights(flightsToFilter);
    setShowTakeoffSuggestions(false);
    setShowPilotSuggestions(false);
  }, [allFlights, takeoffFilter, pilotNameFilter, yearFilter, gliderTypeFilter, startDate, endDate, sortOption]);

  useEffect(() => {
    const areFiltersActive = takeoffFilter || pilotNameFilter || yearFilter !== 'all' || gliderTypeFilter !== 'all' || startDate || endDate;

    if (areFiltersActive) {
      applyFilters();
      setHasSearched(true);
    } else {
      setFilteredFlights([]);
      setHasSearched(false);
    }
  }, [takeoffFilter, pilotNameFilter, yearFilter, gliderTypeFilter, startDate, endDate, sortOption, allFlights, applyFilters]);

  useEffect(() => {
    if (hasSearched && filteredFlights.length > 0) {
        const generateAnalysis = async () => {
            setIsGeneratingSummary(true);
            setChartData(null);

            try {
                const summary = await generateFlightStatisticsSummary(filteredFlights);
                setAiSummary(summary);
            } catch (error) {
                console.error("Failed to generate AI summary", error);
                setAiSummary("Não foi possível gerar la análise da IA para esta seleção de voos.");
            } finally {
                setIsGeneratingSummary(false);
            }

            // Prepare chart data
            const takeoffCounts = filteredFlights.reduce((acc, flight) => {
                acc[flight.takeoff] = (acc[flight.takeoff] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);

            const takeoffData = Object.entries(takeoffCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);

            const buckets = [
                { range: '0-50km', min: 0, max: 50, count: 0 },
                { range: '50-100km', min: 50, max: 100, count: 0 },
                { range: '100-150km', min: 100, max: 150, count: 0 },
                { range: '150-200km', min: 150, max: 200, count: 0 },
                { range: '200+km', min: 200, max: Infinity, count: 0 },
            ];
            filteredFlights.forEach(flight => {
                const bucket = buckets.find(b => flight.distance >= b.min && flight.distance < b.max);
                if (bucket) bucket.count++;
            });
            const filteredBuckets = buckets.filter(b => b.count > 0);

            setChartData({ takeoffs: takeoffData, distances: filteredBuckets });
        };

        generateAnalysis();
    } else {
        setAiSummary('');
        setChartData(null);
    }
}, [filteredFlights, hasSearched]);
  
  const uniqueTakeoffs = useMemo(() => {
    if (!allFlights) return [];
    const takeoffs = new Set(allFlights.map(f => f.takeoff));
    return Array.from(takeoffs).sort();
  }, [allFlights]);
  
  const uniquePilots = useMemo(() => {
    if (!allFlights) return [];
    const pilots = new Map<string, string>();
    allFlights.forEach(f => pilots.set(f.pilot.id, f.pilot.name));
    return Array.from(pilots.values()).sort();
  }, [allFlights]);

  const uniqueYears = useMemo(() => {
    if (!allFlights) return [];
    const years = new Set(allFlights.map(f => new Date(f.date).getFullYear()));
    return Array.from(years).sort((a: number, b: number) => b - a);
  }, [allFlights]);

  const handleTakeoffChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTakeoffFilter(value);
    if (value) {
        const filtered = uniqueTakeoffs.filter(t => t.toLowerCase().includes(value.toLowerCase()));
        setTakeoffSuggestions(filtered);
        setShowTakeoffSuggestions(true);
    } else {
        setShowTakeoffSuggestions(false);
    }
  };
  
  const selectTakeoff = (takeoff: string) => {
    setTakeoffFilter(takeoff);
    setShowTakeoffSuggestions(false);
  };
  
  const handlePilotNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPilotNameFilter(value);
    if (value) {
        const filtered = uniquePilots.filter(p => p.toLowerCase().includes(value.toLowerCase()));
        setPilotSuggestions(filtered);
        setShowPilotSuggestions(true);
    } else {
        setShowPilotSuggestions(false);
    }
  };
  
  const selectPilot = (pilot: string) => {
    setPilotNameFilter(pilot);
    setShowPilotSuggestions(false);
  };

  const handleLikeToggle = async (flightId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    try {
      const updatedFlight = await toggleFlightLike(flightId, currentUser.id);
      if (updatedFlight) {
        const mapFn = (f: Flight) => f.id === flightId ? updatedFlight : f;
        setAllFlights(prev => prev.map(mapFn));
        if (hasSearched) {
          setFilteredFlights(prev => prev.map(mapFn));
        }
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


  const resetFilters = () => {
    setTakeoffFilter('');
    setPilotNameFilter('');
    setYearFilter('all');
    setStartDate('');
    setEndDate('');
    setSortOption('date');
    setGliderTypeFilter('all');
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Estatísticas de Voo</h1>
        <p className="text-lg text-gray-400">Filtre e explore o histórico completo de voos.</p>
      </div>

      <div className="bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          {/* Takeoff Filter */}
          <div className="w-full md:col-span-3 relative">
            <label htmlFor="takeoff" className="block text-sm font-medium text-gray-300 mb-1">Local de Decolagem</label>
            <div className="relative">
                <MapPin className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    id="takeoff"
                    value={takeoffFilter}
                    onChange={handleTakeoffChange}
                    onFocus={handleTakeoffChange}
                    onBlur={() => setTimeout(() => setShowTakeoffSuggestions(false), 200)}
                    className="block w-full rounded-md border-0 bg-gray-700 py-2 pl-10 pr-3 text-white ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                    placeholder="Ex: Annecy"
                    autoComplete="off"
                />
            </div>
            {showTakeoffSuggestions && takeoffSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-gray-600 border border-gray-500 rounded-md mt-1 max-h-48 overflow-y-auto">
                    {takeoffSuggestions.map(suggestion => (
                        <li 
                            key={suggestion} 
                            className="px-4 py-2 text-white hover:bg-cyan-500 cursor-pointer"
                            onMouseDown={() => selectTakeoff(suggestion)}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
          </div>

          {/* Pilot Name Filter */}
          <div className="w-full md:col-span-3 relative">
            <label htmlFor="pilot" className="block text-sm font-medium text-gray-300 mb-1">Piloto</label>
            <div className="relative">
                <User className="pointer-events-none absolute top-1/2 -translate-y-1/2 left-3 h-5 w-5 text-gray-400" />
                <input
                    type="text"
                    id="pilot"
                    value={pilotNameFilter}
                    onChange={handlePilotNameChange}
                    onFocus={handlePilotNameChange}
                    onBlur={() => setTimeout(() => setShowPilotSuggestions(false), 200)}
                    className="block w-full rounded-md border-0 bg-gray-700 py-2 pl-10 pr-3 text-white ring-1 ring-inset ring-gray-600 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                    placeholder="Ex: Alex Maverick"
                    autoComplete="off"
                />
            </div>
            {showPilotSuggestions && pilotSuggestions.length > 0 && (
                 <ul className="absolute z-10 w-full bg-gray-600 border border-gray-500 rounded-md mt-1 max-h-48 overflow-y-auto">
                    {pilotSuggestions.map(suggestion => (
                        <li 
                            key={suggestion} 
                            className="px-4 py-2 text-white hover:bg-cyan-500 cursor-pointer"
                            onMouseDown={() => selectPilot(suggestion)}
                        >
                            {suggestion}
                        </li>
                    ))}
                </ul>
            )}
          </div>


          {/* Year Filter */}
          <div className="w-full md:col-span-2">
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
          <div className="w-full md:col-span-2">
            <label htmlFor="gliderType" className="block text-sm font-medium text-gray-300 mb-1">Modalidade</label>
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
          <div className="w-full md:col-span-3">
                 <label htmlFor="start-date" className="block text-sm font-medium text-gray-300 mb-1">De</label>
                 <input
                    type="date"
                    id="start-date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="block w-full rounded-md border-0 bg-gray-700 py-2 px-3 text-white ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                 />
            </div>
             <div className="w-full md:col-span-3">
                 <label htmlFor="end-date" className="block text-sm font-medium text-gray-300 mb-1">Até</label>
                 <input
                    type="date"
                    id="end-date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="block w-full rounded-md border-0 bg-gray-700 py-2 px-3 text-white ring-1 ring-inset ring-gray-600 focus:ring-2 focus:ring-inset focus:ring-cyan-500"
                 />
            </div>
         

          <div className="md:col-span-6">
              <button type="button" onClick={resetFilters} className="w-full sm:w-auto bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors">
                  <X size={20} />
                  <span>Limpar Filtros</span>
              </button>
          </div>
        </div>
      </div>
      
      {/* --- Results Section --- */}
      <div>
        {isLoading ? (
          <div className="h-96">
            <LoadingSpinner text="Carregando dados de voos..." />
          </div>
        ) : !hasSearched ? (
           <div className="text-center p-8 bg-gray-800 rounded-lg">
            <p className="text-gray-400">Utilize os filtros acima para explorar os voos.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredFlights.length > 0 && (
              <div className="bg-gray-800 rounded-lg shadow-lg p-6 space-y-6">
                <h2 className="text-2xl font-bold text-white border-l-4 border-cyan-400 pl-4">Análise da Pesquisa</h2>
                
                {/* AI Summary */}
                <div className="bg-gray-900/50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center space-x-2">
                      <Sparkles className="text-cyan-400" />
                      <span>Resumo por IA</span>
                    </h3>
                     {isGeneratingSummary ? (
                        <div className="flex items-center space-x-2 text-gray-400">
                          <Loader className="animate-spin" size={20}/>
                          <span>Analisando voos...</span>
                        </div>
                      ) : (
                        <p className="text-gray-300">{aiSummary}</p>
                      )}
                </div>

                {/* Charts */}
                {chartData && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                     <div className="bg-gray-900/50 p-4 rounded-lg">
                       <FlightsByTakeoffChart data={chartData.takeoffs} />
                     </div>
                     <div className="bg-gray-900/50 p-4 rounded-lg">
                        <DistanceDistributionChart data={chartData.distances} />
                     </div>
                  </div>
                )}
              </div>
            )}
            
            <div>
              <h2 className="text-xl font-semibold text-white mb-4">{filteredFlights.length} voo(s) encontrado(s)</h2>
              {filteredFlights.length > 0 ? (
                <div className="space-y-6">
                  {filteredFlights.map(flight => (
                    <FlightCard key={flight.id} flight={flight} onLikeToggle={handleLikeToggle} onFollowTakeoff={handleFollowTakeoff} />
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 bg-gray-800 rounded-lg">
                  <p className="text-gray-500">Nenhum voo encontrado com os filtros aplicados.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Statistics;
