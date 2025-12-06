import React, { useMemo } from 'react';
import { ProcessConfig } from '../types';
import { 
  BASE_DEV_TIME_SECONDS, 
  SECONDS_PER_REUSE, 
  SECONDS_PER_STOP_PUSH, 
  SECONDS_PER_STOP_PULL 
} from '../constants';

interface SetupFormProps {
  config: ProcessConfig;
  setConfig: React.Dispatch<React.SetStateAction<ProcessConfig>>;
  onStart: () => void;
}

export const SetupForm: React.FC<SetupFormProps> = ({ config, setConfig, onStart }) => {
  const handleReuseChange = (delta: number) => {
    setConfig(prev => ({ ...prev, previousUses: Math.max(0, prev.previousUses + delta) }));
  };

  const handlePushPullChange = (delta: number) => {
    setConfig(prev => ({ ...prev, pushPullStops: prev.pushPullStops + delta }));
  };

  // Calculate projected time for display
  const projectedTime = useMemo(() => {
    let time = BASE_DEV_TIME_SECONDS;
    time += (config.previousUses * SECONDS_PER_REUSE);
    
    if (config.pushPullStops > 0) {
      time += (config.pushPullStops * SECONDS_PER_STOP_PUSH);
    } else if (config.pushPullStops < 0) {
      time += (config.pushPullStops * SECONDS_PER_STOP_PULL);
    }
    
    return Math.max(0, time);
  }, [config]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 p-6 text-red-500 animate-in fade-in duration-500">
      <h1 className="text-3xl font-mono font-bold tracking-tighter uppercase border-b-2 border-red-900 pb-2 mb-4">
        Configuración
      </h1>

      <div className="w-full max-w-md bg-safe-dim p-6 rounded-lg border border-red-900/50 shadow-[0_0_30px_rgba(50,0,0,0.5)]">
        
        {/* Dynamic Preview */}
        <div className="mb-8 text-center bg-black/50 p-4 rounded border border-red-900/30">
          <span className="block text-xs uppercase tracking-widest text-red-700 mb-1">Tiempo Estimado de Revelado</span>
          <span className="text-5xl font-mono font-bold text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]">
            {formatTime(projectedTime)}
          </span>
          <span className="block text-xs text-red-800 mt-1">D-76 Stock @ 20°C</span>
        </div>

        {/* Reuse Counter */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-80 flex justify-between">
            <span>Usos Previos</span>
            <span className="text-red-700">+{config.previousUses * SECONDS_PER_REUSE}s</span>
          </label>
          <div className="flex items-center justify-between bg-black rounded p-1 border border-red-900">
            <button 
              onClick={() => handleReuseChange(-1)}
              className="w-12 h-12 flex items-center justify-center text-2xl font-bold bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded transition active:scale-95"
            >
              -
            </button>
            <span className="text-3xl font-mono">{config.previousUses}</span>
            <button 
              onClick={() => handleReuseChange(1)}
              className="w-12 h-12 flex items-center justify-center text-2xl font-bold bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded transition active:scale-95"
            >
              +
            </button>
          </div>
        </div>

        {/* Push/Pull Controls */}
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-widest mb-2 opacity-80 flex justify-between">
            <span>Push / Pull</span>
            <span className="text-red-700">
              {config.pushPullStops > 0 ? `+${config.pushPullStops * SECONDS_PER_STOP_PUSH}s` : config.pushPullStops < 0 ? `${config.pushPullStops * SECONDS_PER_STOP_PULL}s` : '0s'}
            </span>
          </label>
          <div className="flex items-center justify-between bg-black rounded p-1 border border-red-900">
            <button 
              onClick={() => handlePushPullChange(-1)}
              className="w-12 h-12 flex items-center justify-center text-2xl font-bold bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded transition active:scale-95"
            >
              -
            </button>
            <div className="text-center w-24">
              <span className="text-3xl font-mono block">
                {config.pushPullStops > 0 ? `+${config.pushPullStops}` : config.pushPullStops}
              </span>
            </div>
            <button 
              onClick={() => handlePushPullChange(1)}
              className="w-12 h-12 flex items-center justify-center text-2xl font-bold bg-red-900/20 hover:bg-red-900/40 text-red-500 rounded transition active:scale-95"
            >
              +
            </button>
          </div>
          <p className="text-center text-xs mt-2 text-red-800 uppercase tracking-wider">
            {config.pushPullStops === 0 ? 'Exposición Normal' : config.pushPullStops > 0 ? 'Forzado (Push)' : 'Subexpuesto (Pull)'}
          </p>
        </div>

        <button
          onClick={onStart}
          className="w-full py-4 text-xl font-bold uppercase tracking-widest bg-red-700 hover:bg-red-600 text-black rounded transition shadow-[0_0_20px_rgba(255,0,0,0.3)] active:translate-y-1"
        >
          COMENZAR PROCESO
        </button>
      </div>
    </div>
  );
};