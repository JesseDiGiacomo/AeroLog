
import React from 'react';
import { Play, Pause } from 'lucide-react';
import type { DetailedTrackPoint } from '../types';
import { formatDuration } from '../utils';

interface TimelineControlProps {
  trackData: DetailedTrackPoint[];
  syncedPoint: DetailedTrackPoint | null;
  onSyncPoint: (point: DetailedTrackPoint) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

const TimelineControl: React.FC<TimelineControlProps> = ({
  trackData,
  syncedPoint,
  onSyncPoint,
  isPlaying,
  onTogglePlay
}) => {
  if (trackData.length === 0) {
    return null;
  }

  const flightDurationMinutes = (trackData[trackData.length - 1].timestamp - trackData[0].timestamp) / (1000 * 60);

  const currentIndex = syncedPoint
    ? trackData.findIndex(p => p.timestamp === syncedPoint.timestamp)
    : 0;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newIndex = parseInt(e.target.value, 10);
    onSyncPoint(trackData[newIndex]);
  };
  
  const currentTimeLabel = syncedPoint ? syncedPoint.timeLabel : trackData[0].timeLabel;

  return (
    <div className="bg-gray-800 rounded-b-lg shadow-lg p-4 flex items-center space-x-4 border-t-2 border-gray-700/50">
      <button
        onClick={onTogglePlay}
        className="bg-cyan-500 hover:bg-cyan-400 text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 transition-colors"
        aria-label={isPlaying ? 'Pausar animação' : 'Iniciar animação'}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
      </button>
      <div className="flex items-center space-x-2 text-sm text-gray-300 font-mono">
        <span>{currentTimeLabel}</span>
      </div>
      <input
        type="range"
        min="0"
        max={trackData.length > 0 ? trackData.length - 1 : 0}
        value={currentIndex > -1 ? currentIndex : 0}
        onChange={handleSliderChange}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer range-thumb"
        aria-label="Linha do tempo do voo"
      />
      <div className="flex items-center space-x-2 text-sm text-gray-300 font-mono">
        <span>{formatDuration(flightDurationMinutes)}</span>
      </div>
       <style>{`
        .range-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          background: #06b6d4; /* cyan-500 */
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid white;
        }
        .range-thumb::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: #06b6d4;
          cursor: pointer;
          border-radius: 50%;
           border: 2px solid white;
        }
      `}</style>
    </div>
  );
};

export default TimelineControl;
