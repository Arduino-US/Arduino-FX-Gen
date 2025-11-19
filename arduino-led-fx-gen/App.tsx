
import React, { useState, useCallback } from 'react';
import { 
  Cpu, 
  Play, 
  Pause, 
  RefreshCw, 
  Settings, 
  Terminal, 
  Info,
  Plus,
  Trash2,
  CircleDot
} from 'lucide-react';
import { generateArduinoScript } from './services/geminiService';
import { SimulationBoard } from './components/SimulationBoard';
import { CodeBlock } from './components/CodeBlock';
import { 
  ArduinoGenResponse, 
  DEFAULT_PINS, 
  PinConfig, 
  AVAILABLE_COLORS,
  ComponentType
} from './types';

const App: React.FC = () => {
  const [pins, setPins] = useState<PinConfig[]>(DEFAULT_PINS);
  const [prompt, setPrompt] = useState('Cycle through cool LED patterns when the button is pressed.');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ArduinoGenResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setIsPlaying(false);
    try {
      const result = await generateArduinoScript(pins, prompt);
      setData(result);
      setIsPlaying(true);
    } catch (error) {
      console.error(error);
      alert("Failed to generate script. Please check your API key and try again.");
    } finally {
      setLoading(false);
    }
  }, [pins, prompt]);

  // Generate on first load automatically to show something cool
  React.useEffect(() => {
    handleGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addComponent = (type: ComponentType) => {
    const newPinNum = Math.max(...pins.map(p => p.pin), 1) + 1;
    if (pins.length < 8) {
        setPins([...pins, { 
            pin: newPinNum, 
            type,
            color: type === 'LED' ? 'bg-yellow-500' : 'bg-slate-700' 
        }]);
    }
  };

  const removePin = (index: number) => {
    if (pins.length > 1) {
        const newPins = [...pins];
        newPins.splice(index, 1);
        setPins(newPins);
    }
  };

  const updatePin = (index: number, field: keyof PinConfig, value: any) => {
      const newPins = [...pins];
      newPins[index] = { ...newPins[index], [field]: value };
      setPins(newPins);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-200 selection:bg-cyan-900 selection:text-cyan-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <Cpu className="text-cyan-400" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-slate-100">Arduino FX Gen</h1>
            <p className="text-xs text-slate-500 font-mono">AI-POWERED EMBEDDED CODE</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
             <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-500 hover:text-slate-300 text-sm hidden sm:block">Documentation</a>
             <button 
               onClick={() => setShowConfig(!showConfig)}
               className={`p-2 rounded-lg transition-all ${showConfig ? 'bg-cyan-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
             >
                <Settings size={20} />
             </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        
        {/* Left Panel: Controls & Visualization */}
        <div className="flex-1 flex flex-col border-r border-slate-800 lg:max-w-[500px] bg-slate-900/30">
            
            {/* Configuration Section (Collapsible) */}
            {showConfig && (
                <div className="p-6 border-b border-slate-800 animate-in slide-in-from-top-4 duration-300 bg-slate-900 max-h-[50vh] overflow-y-auto">
                    <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                        <Settings size={14} /> Hardware Setup
                    </h3>
                    
                    <div className="space-y-3 mb-6">
                        {pins.map((p, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <div className="font-mono text-slate-500 text-xs w-6">#{idx+1}</div>
                                
                                {/* Type Badge */}
                                <div className={`px-2 py-1 rounded text-[10px] font-bold uppercase w-16 text-center ${p.type === 'BUTTON' ? 'bg-slate-700 text-slate-300' : 'bg-blue-900/50 text-blue-300'}`}>
                                    {p.type}
                                </div>

                                <input 
                                    type="number" 
                                    value={p.pin} 
                                    onChange={(e) => updatePin(idx, 'pin', parseInt(e.target.value))}
                                    className="w-14 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm font-mono focus:border-cyan-500 outline-none"
                                    placeholder="Pin"
                                />
                                
                                {p.type === 'LED' ? (
                                    <select 
                                        value={p.color}
                                        onChange={(e) => updatePin(idx, 'color', e.target.value)}
                                        className="flex-1 bg-slate-800 border border-slate-700 rounded px-2 py-1 text-sm focus:border-cyan-500 outline-none"
                                    >
                                        {AVAILABLE_COLORS.map(c => (
                                            <option key={c.name} value={c.class}>{c.name}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <div className="flex-1 text-xs text-slate-500 italic px-2">Input Pullup</div>
                                )}

                                <button 
                                    onClick={() => removePin(idx)}
                                    className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-950/50 rounded"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        
                        {pins.length < 8 && (
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => addComponent('LED')}
                                    className="flex-1 py-2 border border-dashed border-slate-700 rounded text-slate-500 text-xs hover:border-cyan-500/50 hover:text-cyan-400 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Plus size={14} /> Add LED
                                </button>
                                <button 
                                    onClick={() => addComponent('BUTTON')}
                                    className="flex-1 py-2 border border-dashed border-slate-700 rounded text-slate-500 text-xs hover:border-white/30 hover:text-slate-300 flex items-center justify-center gap-2 transition-colors"
                                >
                                    <CircleDot size={14} /> Add Button
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Prompt Input */}
            <div className="p-6 pb-2">
                <label className="text-xs font-bold text-cyan-500 uppercase tracking-wider mb-2 block">Effect Prompt</label>
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm text-slate-200 focus:border-cyan-500 outline-none focus:ring-1 focus:ring-cyan-500/50 resize-none h-24"
                    placeholder="Describe the pattern (e.g. 'Knight Rider scanner effect', 'Morse code SOS')..."
                />
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="mt-4 w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold rounded-lg shadow-lg shadow-cyan-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <RefreshCw className="animate-spin" size={18} /> Generating...
                        </>
                    ) : (
                        <>
                            <Terminal size={18} /> Generate Code & Sim
                        </>
                    )}
                </button>
            </div>

            {/* Simulation View */}
            <div className="flex-1 p-6 flex flex-col items-center justify-center bg-slate-900/50 min-h-[300px]">
                {data ? (
                     <div className="w-full max-w-xs relative">
                         <div className="absolute -top-10 w-full flex justify-center gap-2">
                             <button 
                                onClick={() => setIsPlaying(!isPlaying)}
                                className="p-2 rounded-full bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 transition-colors"
                             >
                                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                             </button>
                         </div>
                         <SimulationBoard 
                            pins={pins}
                            sequence={data.simulationSequence}
                            isPlaying={isPlaying}
                         />
                     </div>
                ) : (
                    <div className="text-center text-slate-600">
                        <Cpu size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Configure pins and describe an effect to begin.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Right Panel: Code & Explanation */}
        <div className="flex-1 overflow-y-auto bg-slate-950 p-6 lg:p-10">
            {data ? (
                <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
                    
                    {/* Header Info */}
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{data.patternName || "Custom Pattern"}</h2>
                        <div className="flex items-start gap-3 text-slate-400 text-sm bg-slate-900 p-4 rounded-lg border border-slate-800">
                            <Info className="shrink-0 mt-0.5 text-cyan-500" size={16} />
                            <p>{data.explanation}</p>
                        </div>
                    </div>

                    {/* Code Display */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 mb-4 uppercase tracking-wider flex items-center gap-2">
                            <Terminal size={14} /> Generated Arduino C++
                        </h3>
                        <CodeBlock code={data.cppCode} />
                    </div>

                    {/* Instructions */}
                    <div className="border-t border-slate-800 pt-6">
                        <h4 className="text-sm font-semibold text-slate-300 mb-2">How to use:</h4>
                        <ol className="list-decimal list-inside text-sm text-slate-500 space-y-1">
                            <li>Copy the code above.</li>
                            <li>Open the Arduino IDE.</li>
                            <li>Paste the code into a new sketch.</li>
                            <li>Connect your hardware as shown in the Config panel.</li>
                            <li>Upload to your board.</li>
                        </ol>
                    </div>

                </div>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-700">
                    {loading ? (
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin"></div>
                            <p className="text-slate-500 animate-pulse">Designing circuit logic...</p>
                        </div>
                    ) : (
                        <>
                            <Terminal size={64} className="mb-4 opacity-20" />
                            <p className="max-w-sm text-center">Ready to generate. The AI will produce C++ code and a visual simulation for your custom LED pattern.</p>
                        </>
                    )}
                </div>
            )}
        </div>

      </main>
    </div>
  );
};

export default App;
