
import React, { useEffect, useState, useRef } from 'react';
import { PinConfig, SimulationStep, AVAILABLE_COLORS } from '../types';
import { Cpu, Zap, CircleDot } from 'lucide-react';

interface SimulationBoardProps {
  pins: PinConfig[];
  sequence: SimulationStep[];
  isPlaying: boolean;
}

export const SimulationBoard: React.FC<SimulationBoardProps> = ({ pins, sequence, isPlaying }) => {
  const [activeStates, setActiveStates] = useState<Record<number, number>>({});
  const stepIndexRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isPlaying || sequence.length === 0) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const runStep = () => {
      const currentStep = sequence[stepIndexRef.current];
      
      // Update states
      const newStates: Record<number, number> = {};
      currentStep.states.forEach(s => {
        newStates[s.pin] = s.state;
      });
      
      setActiveStates(prev => ({...prev, ...newStates}));

      // Schedule next
      timeoutRef.current = setTimeout(() => {
        stepIndexRef.current = (stepIndexRef.current + 1) % sequence.length;
        runStep();
      }, currentStep.durationMs);
    };

    runStep();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isPlaying, sequence]);

  // Reset when sequence changes
  useEffect(() => {
    stepIndexRef.current = 0;
    setActiveStates({});
  }, [sequence]);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-[3/4] bg-slate-800 rounded-xl border-2 border-slate-700 shadow-2xl p-6 flex flex-col items-center justify-center">
        {/* Board Label */}
        <div className="absolute top-4 left-4 flex items-center gap-2 text-slate-400">
            <Cpu size={20} />
            <span className="font-mono font-bold tracking-widest text-xs uppercase">Arduino Uno R3 Sim</span>
        </div>

        {/* Status LED */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
           <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : 'bg-red-500'}`}></div>
           <span className="text-[10px] uppercase text-slate-500 font-mono">{isPlaying ? 'RUNNING' : 'HALTED'}</span>
        </div>

        {/* Main Breadboard Area */}
        <div className="flex flex-col gap-6 items-center justify-center w-full h-full overflow-y-auto py-8">
            {pins.map((pinConfig) => {
                const isActive = activeStates[pinConfig.pin] === 1;
                
                if (pinConfig.type === 'BUTTON') {
                  return (
                    <div key={pinConfig.pin} className="flex items-center w-full gap-4 group">
                        {/* Pin Label */}
                        <div className="w-16 text-right font-mono text-slate-400 text-sm">
                            DIGITAL <span className="text-slate-100 font-bold">~{pinConfig.pin}</span>
                        </div>

                        {/* Wire Line */}
                        <div className={`flex-1 h-1 transition-colors duration-300 ${isActive ? 'bg-cyan-500' : 'bg-slate-700'}`}></div>

                        {/* Button Representation */}
                        <div className="relative">
                             {/* Interaction Hint */}
                            <div className={`absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-mono text-cyan-400 transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                                PRESS
                            </div>
                            
                            {/* Button Body */}
                            <div className="w-8 h-8 bg-slate-700 rounded flex items-center justify-center border border-slate-600 shadow-md relative z-10">
                                {/* Actuator */}
                                <div className={`w-5 h-5 rounded-full border-2 border-slate-600 flex items-center justify-center transition-all duration-100 ${isActive ? 'bg-slate-900 scale-90 shadow-inner' : 'bg-slate-800 scale-100 shadow-md'}`}>
                                     <CircleDot size={10} className={isActive ? 'text-cyan-500' : 'text-slate-500'} />
                                </div>
                            </div>
                        </div>

                        {/* Ground Connection Hint */}
                        <div className={`w-8 h-1 bg-slate-800 ml-2 rounded-full`}></div>
                         <div className="text-[10px] text-slate-600 font-mono">GND</div>
                    </div>
                  );
                }

                // LED RENDER
                const colorDef = AVAILABLE_COLORS.find(c => c.class === pinConfig.color) || AVAILABLE_COLORS[0];
                
                return (
                    <div key={pinConfig.pin} className="flex items-center w-full gap-4 group">
                        {/* Pin Label */}
                        <div className="w-16 text-right font-mono text-slate-400 text-sm">
                            DIGITAL <span className="text-slate-100 font-bold">~{pinConfig.pin}</span>
                        </div>

                        {/* Wire Line */}
                        <div className={`flex-1 h-1 transition-colors duration-300 ${isActive ? 'bg-slate-500' : 'bg-slate-700'}`}></div>

                        {/* LED Representation */}
                        <div className="relative">
                            {/* Glow Effect */}
                            <div className={`absolute inset-0 rounded-full blur-md transition-opacity duration-100 ${isActive ? 'opacity-100 ' + colorDef.shadow.replace('shadow-', 'bg-') : 'opacity-0'}`}></div>
                            
                            {/* LED Bulb */}
                            <div className={`relative z-10 w-8 h-8 rounded-full border-2 transition-all duration-100 flex items-center justify-center shadow-inner
                                ${isActive 
                                    ? `${pinConfig.color} border-white scale-110 shadow-[0_0_15px_rgba(255,255,255,0.5)]` 
                                    : 'bg-slate-900 border-slate-600 grayscale opacity-50'
                                }`
                            }>
                                {isActive && <Zap size={12} className="text-white opacity-80 fill-white" />}
                            </div>
                        </div>

                        {/* Ground Connection Hint */}
                        <div className={`w-8 h-1 bg-slate-800 ml-2 rounded-full`}></div>
                         <div className="text-[10px] text-slate-600 font-mono">GND</div>
                    </div>
                );
            })}
        </div>

        <div className="absolute bottom-4 text-slate-600 text-[10px] font-mono text-center w-full">
            POWERED BY GEMINI 2.5 FLASH
        </div>
    </div>
  );
};
