import React, { useState, useMemo, useRef, useCallback } from 'react';
import type { DetailedTrackPoint } from '../types';
import { AreaChart, LineChart, TrendingUp, TrendingDown } from 'lucide-react';

const SVG_WIDTH = 800;
const SVG_HEIGHT = 400;
const PADDING = { top: 20, right: 60, bottom: 60, left: 60 };
const CHART_WIDTH = SVG_WIDTH - PADDING.left - PADDING.right;
const CHART_HEIGHT = SVG_HEIGHT - PADDING.top - PADDING.bottom;

const COLORS = {
  altitude: '#06b6d4',      // cyan-500
  altitudeFill: '#0891b2',  // cyan-600
  speed: '#facc15',         // yellow-400
  climbRate: '#4ade80',      // green-400
  sinkRate: '#f87171',       // red-400
  terrain: '#4b5563',      // gray-600
  grid: '#374151',         // gray-700
  text: '#d1d5db',          // gray-300
  textMuted: '#9ca3af',    // gray-400
};

interface FlightChartProps {
  trackData: DetailedTrackPoint[];
  onPointClick: (point: DetailedTrackPoint | null) => void;
}

const HtmlTooltip: React.FC<{
  point: DetailedTrackPoint;
  position: { x: number; y: number };
  containerWidth: number;
  visibleSeries: { altitude: boolean; speed: boolean; climbRate: boolean };
}> = ({ point, position, containerWidth, visibleSeries }) => {
  const showOnLeft = position.x > containerWidth / 2;
  const style: React.CSSProperties = {
    position: 'absolute',
    top: position.y,
    transform: 'translateY(-100%)', // Position above the cursor
    transition: 'transform 0.1s ease-out, left 0.1s ease-out, right 0.1s ease-out',
    pointerEvents: 'none',
    zIndex: 10,
  };
  if (showOnLeft) {
    style.right = containerWidth - position.x + 15;
  } else {
    style.left = position.x + 15;
  }

  const climbColor = point.climbRate >= 0 ? COLORS.climbRate : COLORS.sinkRate;
  const climbIcon = point.climbRate >= 0 ? <TrendingUp size={12} className="mr-1"/> : <TrendingDown size={12} className="mr-1"/>;
  
  const items = [
      { label: "Altitude", value: `${point.altitude.toFixed(0)} m`, color: COLORS.altitude, visible: visibleSeries.altitude, icon: null },
      { label: "AGL", value: `${point.agl.toFixed(0)} m`, color: COLORS.altitude, visible: visibleSeries.altitude, icon: null },
      { label: "Velocidade", value: `${point.speed.toFixed(1)} km/h`, color: COLORS.speed, visible: visibleSeries.speed, icon: null },
      { label: "Subida", value: `${point.climbRate.toFixed(1)} m/s`, color: climbColor, visible: visibleSeries.climbRate, icon: climbIcon },
  ];

  return (
    <div style={style} className="bg-gray-900/80 backdrop-blur-sm border border-gray-600 rounded-lg p-2 text-white text-xs space-y-1 w-36">
      <p className="font-bold border-b border-gray-700 pb-1 mb-1">{point.timeLabel}</p>
      {items.filter(i => i.visible).map(item => (
        <div key={item.label} className="flex justify-between items-center">
          <span style={{ color: item.color }} className="flex items-center">{item.icon}{item.label}:</span>
          <span className="font-mono font-semibold">{item.value}</span>
        </div>
      ))}
    </div>
  );
};

const findClosestPointIndex = (data: DetailedTrackPoint[], targetTime: number): number => {
    if (data.length === 0) return -1;
    let low = 0;
    let high = data.length - 1;
    
    if (targetTime <= data[0].timestamp) return 0;
    if (targetTime >= data[high].timestamp) return high;

    while (low <= high) {
        const mid = Math.floor(low + (high - low) / 2);
        const midTime = data[mid].timestamp;

        if (midTime < targetTime) {
            low = mid + 1;
        } else if (midTime > targetTime) {
            high = mid - 1;
        } else {
            return mid; // Exact match
        }
    }
    return (data[low].timestamp - targetTime) < (targetTime - data[high].timestamp) ? low : high;
};


const FlightChart: React.FC<FlightChartProps> = ({ trackData, onPointClick }) => {
  const [visibleSeries, setVisibleSeries] = useState({
    altitude: true,
    speed: true,
    climbRate: true,
  });
  const [hoveredData, setHoveredData] = useState<{ point: DetailedTrackPoint; x: number } | null>(null);
  const [tooltipData, setTooltipData] = useState<{ point: DetailedTrackPoint; position: { x: number; y: number } } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const domains = useMemo(() => {
    if (trackData.length === 0) {
      return { time: [0, 0], altitude: [0, 0], speed: [0, 0], climbRate: [0, 0] };
    }
    const altitudes = trackData.map(p => p.altitude);
    const speeds = trackData.map(p => p.speed);
    const climbRates = trackData.map(p => p.climbRate);
    const terrainAltitudes = trackData.map(p => p.terrainAltitude);

    const minAlt = Math.min(...altitudes, ...terrainAltitudes);
    const maxAlt = Math.max(...altitudes);
    
    const maxAbsClimb = Math.max(Math.abs(Math.min(...climbRates)), Math.max(...climbRates)) || 1;

    return {
      time: [trackData[0].timestamp, trackData[trackData.length - 1].timestamp] as [number, number],
      altitude: [minAlt - (maxAlt - minAlt) * 0.1, maxAlt + (maxAlt - minAlt) * 0.1] as [number, number],
      speed: [0, Math.max(...speeds) * 1.1] as [number, number],
      climbRate: [-maxAbsClimb * 1.1, maxAbsClimb * 1.1] as [number, number],
    };
  }, [trackData]);

  const scales = useMemo(() => {
    const xScale = (time: number) => PADDING.left + ((time - domains.time[0]) / (domains.time[1] - domains.time[0])) * CHART_WIDTH;
    const altitudeYScale = (alt: number) => PADDING.top + CHART_HEIGHT - ((alt - domains.altitude[0]) / (domains.altitude[1] - domains.altitude[0])) * CHART_HEIGHT;
    const speedYScale = (speed: number) => PADDING.top + CHART_HEIGHT - ((speed - domains.speed[0]) / (domains.speed[1] - domains.speed[0])) * CHART_HEIGHT;
    const climbYScale = (climb: number) => PADDING.top + CHART_HEIGHT - ((climb - domains.climbRate[0]) / (domains.climbRate[1] - domains.climbRate[0])) * CHART_HEIGHT;
    return { xScale, altitudeYScale, speedYScale, climbYScale };
  }, [domains]);

  const paths = useMemo(() => {
    if (trackData.length < 2) return { altitude: '', speed: '', terrain: '', altitudeArea: '', climbRate: '' };
    const toPath = (yScale: (val: number) => number, key: keyof DetailedTrackPoint) =>
      trackData.map((p, i) => `${i === 0 ? 'M' : 'L'}${scales.xScale(p.timestamp)},${yScale(p[key] as number)}`).join(' ');

    const terrainPath =
      toPath(scales.altitudeYScale, 'terrainAltitude') +
      ` L${scales.xScale(domains.time[1])},${PADDING.top + CHART_HEIGHT}` +
      ` L${scales.xScale(domains.time[0])},${PADDING.top + CHART_HEIGHT} Z`;

    const altitudePath = toPath(scales.altitudeYScale, 'altitude');
    const altitudeAreaPath = altitudePath +
      ` L${scales.xScale(domains.time[1])},${PADDING.top + CHART_HEIGHT}` +
      ` L${scales.xScale(domains.time[0])},${PADDING.top + CHART_HEIGHT} Z`;

    return {
      altitude: altitudePath,
      altitudeArea: altitudeAreaPath,
      speed: toPath(scales.speedYScale, 'speed'),
      climbRate: toPath(scales.climbYScale, 'climbRate'),
      terrain: terrainPath,
    };
  }, [trackData, scales, domains]);
  
  const getPointFromEvent = useCallback((event: React.MouseEvent<SVGRectElement>): DetailedTrackPoint | null => {
    if (!svgRef.current || trackData.length === 0) return null;
    
    const svgPoint = svgRef.current.createSVGPoint();
    svgPoint.x = event.clientX;
    svgPoint.y = event.clientY;
    
    const CTM = svgRef.current.getScreenCTM()?.inverse();
    if (!CTM) return null;

    const { x: mouseX } = svgPoint.matrixTransform(CTM);
    const timeAtMouse = domains.time[0] + ((mouseX - PADDING.left) / CHART_WIDTH) * (domains.time[1] - domains.time[0]);
    const closestIndex = findClosestPointIndex(trackData, timeAtMouse);
    if (closestIndex === -1) return null;
    return trackData[closestIndex];
  }, [svgRef, trackData, domains.time]);

  const handleMouseMove = useCallback((event: React.MouseEvent<SVGRectElement>) => {
    const closestPoint = getPointFromEvent(event);
    if (!closestPoint || !containerRef.current) return;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const mouseXInContainer = event.clientX - containerRect.left;
    const mouseYInContainer = event.clientY - containerRect.top;

    setHoveredData({ point: closestPoint, x: scales.xScale(closestPoint.timestamp) });
    setTooltipData({ point: closestPoint, position: { x: mouseXInContainer, y: mouseYInContainer } });
  }, [getPointFromEvent, containerRef, scales]);
  
  const handleMouseLeave = useCallback(() => {
    setHoveredData(null);
    setTooltipData(null);
  }, []);

  const handleClick = useCallback((event: React.MouseEvent<SVGRectElement>) => {
    const closestPoint = getPointFromEvent(event);
    onPointClick(closestPoint);
  }, [getPointFromEvent, onPointClick]);

  const AxisX = () => {
    const tickCount = 5;
    const ticks = Array.from({ length: tickCount }).map((_, i) => {
        const timestamp = domains.time[0] + (i / (tickCount - 1)) * (domains.time[1] - domains.time[0]);
        const date = new Date(timestamp);
        const label = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return { value: timestamp, label };
    });

    return (
        <g className="axis x-axis">
            <line x1={PADDING.left} y1={PADDING.top + CHART_HEIGHT} x2={PADDING.left + CHART_WIDTH} y2={PADDING.top + CHART_HEIGHT} stroke={COLORS.grid} />
            {ticks.map(tick => (
                <g key={tick.value} transform={`translate(${scales.xScale(tick.value)}, 0)`}>
                    <text y={PADDING.top + CHART_HEIGHT + 20} textAnchor="middle" fill={COLORS.textMuted} fontSize="10">{tick.label}</text>
                </g>
            ))}
             <text x={PADDING.left + CHART_WIDTH / 2} y={PADDING.top + CHART_HEIGHT + 45} textAnchor="middle" fill={COLORS.text} fontSize="12" fontWeight="bold">Hora do Dia</text>
        </g>
    );
  };
  
  const AxisY = ({ domain, scale, color, label, isLeft }: {domain: [number, number], scale: (val: number) => number, color: string, label: string, isLeft: boolean}) => {
    const tickCount = 5;
    const ticks = Array.from({ length: tickCount }).map((_, i) => {
        const value = domain[0] + (i / (tickCount - 1)) * (domain[1] - domain[0]);
        return { value, label: Math.round(value) };
    });
    
    return (
        <g className="axis y-axis">
            <line x1={isLeft ? PADDING.left : PADDING.left+CHART_WIDTH} y1={PADDING.top} x2={isLeft ? PADDING.left : PADDING.left+CHART_WIDTH} y2={PADDING.top + CHART_HEIGHT} stroke={COLORS.grid} />
            {ticks.map(tick => (
                <g key={tick.value} transform={`translate(0, ${scale(tick.value)})`}>
                    <text x={isLeft ? PADDING.left - 8 : PADDING.left + CHART_WIDTH + 8} dy=".32em" textAnchor={isLeft ? "end" : "start"} fill={COLORS.textMuted} fontSize="10">{tick.label}</text>
                </g>
            ))}
            <text
                transform={`translate(${isLeft ? 20 : SVG_WIDTH - 20}, ${PADDING.top + CHART_HEIGHT / 2}) rotate(-90)`}
                textAnchor="middle"
                fill={color}
                fontSize="12"
                fontWeight="bold"
            >{label}</text>
        </g>
    );
  };

  const Legend = () => {
    const items = [
      { key: 'altitude', label: 'Altitude', color: COLORS.altitude, icon: <AreaChart size={16}/> },
      { key: 'speed', label: 'Velocidade', color: COLORS.speed, icon: <LineChart size={16}/> },
      { key: 'climbRate', label: 'Subida', color: COLORS.climbRate, icon: <TrendingUp size={16}/> },
    ];
    return (
        <div className="flex justify-center items-center space-x-4 mt-2">
            {items.map(item => (
                <button
                    key={item.key}
                    onClick={() => setVisibleSeries(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm transition-opacity ${visibleSeries[item.key as keyof typeof visibleSeries] ? 'opacity-100' : 'opacity-40 hover:opacity-80'}`}
                >
                    <div className="w-4 h-4 flex items-center justify-center" style={{ color: item.color }}>{item.icon}</div>
                    <span style={{ color: item.color }}>{item.label}</span>
                </button>
            ))}
        </div>
    )
  };

  const HoverIndicator = () => {
    if (!hoveredData) return null;
    const { point, x } = hoveredData;

    return (
        <g transform={`translate(${x}, 0)`} pointerEvents="none">
            <line y1={PADDING.top} y2={PADDING.top + CHART_HEIGHT} stroke={COLORS.textMuted} strokeDasharray="4 4" />
            {visibleSeries.altitude && <circle cy={scales.altitudeYScale(point.altitude)} r="4" fill={COLORS.altitude} stroke="#111827" strokeWidth="2" />}
            {visibleSeries.speed && <circle cy={scales.speedYScale(point.speed)} r="4" fill={COLORS.speed} stroke="#111827" strokeWidth="2" />}
            {visibleSeries.climbRate && <circle cy={scales.climbYScale(point.climbRate)} r="4" fill={point.climbRate >= 0 ? COLORS.climbRate : COLORS.sinkRate} stroke="#111827" strokeWidth="2" />}
        </g>
    );
  };

  if (trackData.length < 2) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        Dados insuficientes para exibir o gráfico.
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
        <svg ref={svgRef} viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`} width="100%" height="auto" className="cursor-crosshair bg-gray-800 rounded-t-lg">
            <defs>
                <clipPath id="chart-area">
                    <rect x={PADDING.left} y={PADDING.top} width={CHART_WIDTH} height={CHART_HEIGHT} />
                </clipPath>
                 <clipPath id="sink-area">
                    <rect 
                        x={PADDING.left} 
                        y={scales.climbYScale(0)} 
                        width={CHART_WIDTH} 
                        height={Math.max(0, PADDING.top + CHART_HEIGHT - scales.climbYScale(0))}
                    />
                </clipPath>
                 <linearGradient id="altitude-gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={COLORS.altitudeFill} stopOpacity={0.4}/>
                    <stop offset="100%" stopColor={COLORS.altitudeFill} stopOpacity={0.05}/>
                </linearGradient>
            </defs>
            <AxisX />
            <AxisY domain={domains.altitude} scale={scales.altitudeYScale} color={COLORS.altitude} label="Altitude (m)" isLeft={true} />
            <AxisY domain={domains.speed} scale={scales.speedYScale} color={COLORS.speed} label="Velocidade (km/h)" isLeft={false} />
            
            <g clipPath="url(#chart-area)">
                <path d={paths.terrain} fill={COLORS.terrain} opacity="0.3" />
                
                {visibleSeries.climbRate && (
                    <g className="climb-rate-line">
                        <line 
                            x1={PADDING.left} y1={scales.climbYScale(0)} 
                            x2={PADDING.left + CHART_WIDTH} y2={scales.climbYScale(0)} 
                            stroke={COLORS.grid} strokeWidth="1" strokeDasharray="2 2"
                        />
                        <path d={paths.climbRate} fill="none" stroke={COLORS.climbRate} strokeWidth="1.5" strokeDasharray="5 5" />
                        <path d={paths.climbRate} fill="none" stroke={COLORS.sinkRate} strokeWidth="1.5" strokeDasharray="5 5" clipPath="url(#sink-area)" />
                    </g>
                )}
                
                {visibleSeries.altitude && (
                    <>
                        <path d={paths.altitudeArea} fill="url(#altitude-gradient)" />
                        <path d={paths.altitude} fill="none" stroke={COLORS.altitude} strokeWidth="2" />
                    </>
                )}

                {visibleSeries.speed && <path d={paths.speed} fill="none" stroke={COLORS.speed} strokeWidth="2" />}
            </g>
            <rect
                x={PADDING.left}
                y={PADDING.top}
                width={CHART_WIDTH}
                height={CHART_HEIGHT}
                fill="transparent"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onClick={handleClick}
            />
            <HoverIndicator />
        </svg>
        <div className="bg-gray-800 rounded-b-lg pb-2">
            <Legend />
        </div>
        {tooltipData && containerRef.current && (
          <HtmlTooltip 
            point={tooltipData.point} 
            position={tooltipData.position}
            containerWidth={containerRef.current.offsetWidth}
            visibleSeries={visibleSeries}
          />
        )}
    </div>
  );
};

export default FlightChart;