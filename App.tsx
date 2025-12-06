import React, { useState, useMemo } from 'react';
import { SetupForm } from './components/SetupForm';
import { TimerDisplay } from './components/TimerDisplay';
import { Assistant } from './components/Assistant';
import { ProcessConfig, Step, ProcessStepType } from './types';
import { 
  BASE_DEV_TIME_SECONDS, 
  FIXER_TIME_SECONDS, 
  SECONDS_PER_REUSE, 
  SECONDS_PER_STOP_PUSH, 
  SECONDS_PER_STOP_PULL,
  STOP_BATH_SECONDS,
  WASH_SECONDS,
  RINSE_SECONDS
} from './constants';

const App: React.FC = () => {
  const [config, setConfig] = useState<ProcessConfig>({
    previousUses: 0,
    pushPullStops: 0,
    isStock: true
  });
  
  const [mode, setMode] = useState<'SETUP' | 'TIMER'>('SETUP');

  // Logic to build the sequence of steps based on the user's config
  const steps: Step[] = useMemo(() => {
    // 1. Calculate Developer Time
    let devTime = BASE_DEV_TIME_SECONDS;
    
    // Adjust for reuse
    devTime += (config.previousUses * SECONDS_PER_REUSE);

    // Adjust for Push/Pull
    if (config.pushPullStops > 0) {
      devTime += (config.pushPullStops * SECONDS_PER_STOP_PUSH);
    } else if (config.pushPullStops < 0) {
      // Math.abs because stops are negative
      devTime += (config.pushPullStops * SECONDS_PER_STOP_PULL); // Note: SECONDS_PER_STOP_PULL is positive 30, but config is negative, so this adds negative time. 
      // Wait, constants definition:
      // PULL: Subtract ~30s. So if stops is -1, we want -30.
      // -1 * 30 = -30. Correct.
    }

    // Ensure strictly positive time (sanity check)
    devTime = Math.max(60, devTime);

    const agitationStandard = "Agitar primeros 30 seg, luego 5-10 seg cada minuto (4 inversiones suaves).";

    return [
      {
        id: 'step-1',
        type: ProcessStepType.DEVELOPER,
        durationSeconds: devTime,
        description: `D-76 Stock a 20°C. Ajustado por ${config.previousUses} usos y ${config.pushPullStops} pasos.`,
        agitationGuide: agitationStandard
      },
      {
        id: 'step-2',
        type: ProcessStepType.STOP_BATH,
        durationSeconds: STOP_BATH_SECONDS,
        description: "Baño de Paro o Agua corriente.",
        agitationGuide: "Agitación constante suave."
      },
      {
        id: 'step-3',
        type: ProcessStepType.FIXER,
        durationSeconds: FIXER_TIME_SECONDS,
        description: "Fijador.",
        agitationGuide: agitationStandard
      },
      {
        id: 'step-4',
        type: ProcessStepType.WASH,
        durationSeconds: WASH_SECONDS,
        description: "Lavado final con agua corriente.",
        agitationGuide: "Cambiar agua frecuentemente o flujo continuo."
      },
      {
        id: 'step-5',
        type: ProcessStepType.RINSE,
        durationSeconds: RINSE_SECONDS,
        description: "Photo Flo / Humectante.",
        agitationGuide: "Muy suave, sin generar espuma. Reposo."
      }
    ];
  }, [config]);

  return (
    <div className="min-h-screen bg-black text-red-600 font-mono selection:bg-red-900 selection:text-white overflow-hidden relative">
      {/* Ambient Red Light Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black pointer-events-none z-0"></div>
      
      {/* Scanlines Effect for Retro Feel */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjMDAwIiAvPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSIxIiBmaWxsPSJyZ2JhKDI1NSwgMCwgMCwgMC4wNSkiIC8+Cjwvc3ZnPg==')] pointer-events-none z-0 opacity-50"></div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="mb-8 flex justify-between items-center border-b border-red-900 pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tighter text-red-500 uppercase">
              D-76 <span className="text-red-800">Companion</span>
            </h1>
            <p className="text-xs text-red-800 tracking-widest uppercase">Manual de Revelado B&N</p>
          </div>
          {mode === 'TIMER' && (
            <button 
              onClick={() => setMode('SETUP')}
              className="text-xs border border-red-900 px-3 py-1 rounded hover:bg-red-900/30 transition uppercase"
            >
              Cancelar
            </button>
          )}
        </header>

        <main>
          {mode === 'SETUP' ? (
            <SetupForm 
              config={config} 
              setConfig={setConfig} 
              onStart={() => setMode('TIMER')} 
            />
          ) : (
            <TimerDisplay 
              steps={steps} 
              onReset={() => setMode('SETUP')} 
            />
          )}
        </main>

        <footer className="mt-12 text-center text-xs text-red-900 uppercase tracking-widest">
          <p>Mantener temperatura a 20°C</p>
        </footer>
      </div>

      <Assistant />
    </div>
  );
};

export default App;