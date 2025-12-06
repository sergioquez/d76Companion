import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Step, ProcessStepType } from '../types';

interface TimerDisplayProps {
  steps: Step[];
  onReset: () => void;
}

// Global audio context ref to persist across re-renders
let audioCtx: AudioContext | null = null;

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ steps, onReset }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(steps[0].durationSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isAgitating, setIsAgitating] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // To track audio unlock state
  const audioUnlocked = useRef(false);

  const currentStep = steps[currentStepIndex];
  const totalSteps = steps.length;
  const progress = ((currentStep.durationSeconds - timeLeft) / currentStep.durationSeconds) * 100;

  // Upcoming steps
  const nextSteps = steps.slice(currentStepIndex + 1);

  // Initialize audio context on first user interaction
  const unlockAudio = () => {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        audioCtx = new AudioContext();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    audioUnlocked.current = true;
  };

  const playBeep = (type: 'tick' | 'end' = 'end') => {
    if (isMuted || !audioCtx) return;
    
    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (type === 'end') {
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.5);
      } else {
        // Subtle tick for agitation start
        osc.frequency.setValueAtTime(600, audioCtx.currentTime);
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
      }
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  const handleNextStep = useCallback(() => {
    unlockAudio(); // Ensure audio is unlocked on interaction
    if (currentStepIndex < totalSteps - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setTimeLeft(steps[nextIndex].durationSeconds);
      setIsRunning(false); // Pause between steps for chemical pouring
    } else {
      setIsRunning(false);
    }
  }, [currentStepIndex, totalSteps, steps]);

  const toggleTimer = () => {
    unlockAudio();
    setIsRunning(!isRunning);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      playBeep('end');
      setIsRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft]);

  // Agitation Logic Check
  useEffect(() => {
    if (!isRunning || (currentStep.type !== ProcessStepType.DEVELOPER && currentStep.type !== ProcessStepType.FIXER)) {
      setIsAgitating(false);
      return;
    }

    const elapsed = currentStep.durationSeconds - timeLeft;
    
    // Initial agitation: first 30 seconds
    if (elapsed < 30) {
      setIsAgitating(true);
      return;
    }

    // Every minute thereafter for 10 seconds
    // Agitate at start of minute: 1:00-1:10, 2:00-2:10...
    const remainder = elapsed % 60;
    // We want to beep once when agitation starts
    if (remainder === 0 && elapsed > 0 && elapsed < currentStep.durationSeconds) {
       playBeep('tick');
    }

    if (remainder >= 0 && remainder < 10 && elapsed > 30) {
      setIsAgitating(true);
    } else {
      setIsAgitating(false);
    }

  }, [timeLeft, currentStep.durationSeconds, currentStep.type, isRunning]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isFinished = currentStepIndex === totalSteps - 1 && timeLeft === 0;

  if (isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in zoom-in duration-500">
        <div className="p-8 border-4 border-red-500 rounded-full bg-red-900/20 shadow-[0_0_50px_rgba(255,0,0,0.5)]">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-5xl font-mono text-red-500 tracking-tighter">PROCESO COMPLETO</h2>
        <p className="text-red-400 font-mono text-lg">El negativo está listo para secar.</p>
        <button 
          onClick={onReset}
          className="px-8 py-4 bg-red-800 text-black font-bold uppercase tracking-widest rounded hover:bg-red-700 transition shadow-lg"
        >
          Nuevo Carrete
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center w-full max-w-2xl mx-auto p-4 relative">
      
      {/* Sound Toggle */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className={`absolute top-0 right-4 p-2 rounded-full border transition-all ${
          isMuted ? 'border-red-900 text-red-900' : 'border-red-500 text-red-500 bg-red-900/10'
        }`}
        aria-label={isMuted ? "Activar sonido" : "Silenciar"}
      >
        {isMuted ? (
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
        ) : (
           <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
        )}
      </button>

      {/* Step Progress Bar */}
      <div className="w-full flex justify-between items-end mb-2 text-red-800 mt-8">
        <span className="text-4xl font-bold font-mono text-red-600">{currentStepIndex + 1}<span className="text-xl text-red-900">/{totalSteps}</span></span>
        <span className="text-sm font-bold uppercase tracking-widest">{currentStep.type}</span>
      </div>
      <div className="w-full h-2 bg-red-900/30 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-red-600 transition-all duration-500 ease-out" 
          style={{ width: `${((currentStepIndex) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Main Timer Circle */}
      {/* Fixed: Replaced CSS border with SVG circles to prevent alignment glitches */}
      <div className="relative mb-8 group">
        <div className={`w-72 h-72 rounded-full flex items-center justify-center relative bg-black transition-all duration-300 
          ${isAgitating 
            ? 'bg-red-900/20 shadow-[0_0_80px_rgba(255,0,0,0.6)] animate-pulse' 
            : 'shadow-[0_0_20px_rgba(50,0,0,0.5)]'
          }`}>
           
           <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 288 288">
             {/* Track Circle */}
             <circle
               cx="144" cy="144" r="136"
               fill="none" stroke="#1a0000" strokeWidth="8"
             />
             <circle
               cx="144" cy="144" r="136"
               fill="none" stroke="#330000" strokeWidth="8"
             />
             
             {/* Progress Circle */}
             <circle
               cx="144" cy="144" r="136"
               fill="none" stroke="currentColor" strokeWidth="8"
               className="text-red-600 transition-all duration-1000 ease-linear"
               strokeDasharray={854} // 2 * PI * 136 approx
               strokeDashoffset={854 - (854 * progress) / 100}
               strokeLinecap="round"
             />
           </svg>
           
           <div className="text-center z-10">
              <div className="text-7xl font-mono font-bold text-red-500 tracking-tighter tabular-nums drop-shadow-md">
                {formatTime(timeLeft)}
              </div>
              <div className={`text-xl mt-2 font-bold uppercase tracking-widest transition-all duration-300 
                ${isAgitating 
                  ? 'opacity-100 text-white animate-bounce bg-red-600 px-4 py-1 rounded' 
                  : 'opacity-50 text-red-800'
                }`}>
                {isAgitating ? '¡AGITAR!' : 'REPOSO'}
              </div>
           </div>
        </div>
      </div>

      {/* Instruction Card */}
      <div className="w-full max-w-md space-y-6">
        <div className={`border p-6 rounded text-center transition-colors duration-500
          ${isAgitating ? 'bg-red-900/30 border-red-500' : 'bg-red-900/10 border-red-900/50'}
        `}>
          <h3 className="text-red-400 font-bold uppercase text-lg mb-2 tracking-wide">{currentStep.type}</h3>
          <p className="text-red-200 text-md leading-relaxed">{currentStep.description}</p>
          <div className="mt-4 pt-4 border-t border-red-900/50">
             <span className="text-xs uppercase text-red-600 font-bold tracking-widest">Guía de Agitación</span>
             <p className="text-red-500/80 text-sm mt-1 italic">{currentStep.agitationGuide}</p>
          </div>
        </div>

        {timeLeft === 0 ? (
          <button
            onClick={handleNextStep}
            className="w-full py-5 bg-white text-black font-bold text-xl uppercase rounded shadow-[0_0_30px_rgba(255,255,255,0.4)] animate-pulse hover:bg-gray-200 transition"
          >
            Siguiente Paso &rarr;
          </button>
        ) : (
          <button
            onClick={toggleTimer}
            className={`w-full py-5 font-bold text-xl uppercase rounded shadow-lg transition-all active:scale-95 ${
              isRunning 
                ? 'bg-transparent text-red-500 border-2 border-red-800 hover:bg-red-900/20' 
                : 'bg-red-700 text-black hover:bg-red-600 hover:shadow-[0_0_20px_rgba(255,0,0,0.4)]'
            }`}
          >
            {isRunning ? 'Pausar Cronómetro' : timeLeft === currentStep.durationSeconds ? 'Iniciar Paso' : 'Continuar'}
          </button>
        )}
      </div>

      {/* Upcoming Steps List */}
      {nextSteps.length > 0 && (
        <div className="w-full max-w-md mt-10 border-t border-red-900/30 pt-6">
          <h4 className="text-xs text-red-800 uppercase tracking-widest font-bold mb-4">Próximos Pasos</h4>
          <div className="space-y-3">
            {nextSteps.map((step, idx) => (
              <div key={step.id} className="flex justify-between items-center text-sm p-3 bg-red-900/5 rounded border border-red-900/20 opacity-70">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 flex items-center justify-center rounded-full border border-red-800 text-red-800 text-xs font-mono">
                    {currentStepIndex + idx + 2}
                  </span>
                  <span className="text-red-400 font-medium">{step.type}</span>
                </div>
                <span className="font-mono text-red-600">{formatTime(step.durationSeconds)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};