
export type ComponentType = 'LED' | 'BUTTON';

export interface PinState {
  pin: number;
  state: number; // 0 for LOW, 1 for HIGH (or PWM value 0-255)
}

export interface SimulationStep {
  states: PinState[];
  durationMs: number;
}

export interface ArduinoGenResponse {
  cppCode: string;
  explanation: string;
  simulationSequence: SimulationStep[];
  patternName: string;
}

export interface PinConfig {
  pin: number;
  type: ComponentType;
  color: string; // Used for LED color, ignored for Button
}

export const DEFAULT_PINS: PinConfig[] = [
  { pin: 13, type: 'LED', color: 'bg-red-500' },
  { pin: 12, type: 'LED', color: 'bg-green-500' },
  { pin: 8, type: 'LED', color: 'bg-blue-500' },
  { pin: 2, type: 'BUTTON', color: 'bg-slate-700' },
];

export const AVAILABLE_COLORS = [
  { name: 'Red', class: 'bg-red-500', shadow: 'shadow-red-500/50' },
  { name: 'Green', class: 'bg-green-500', shadow: 'shadow-green-500/50' },
  { name: 'Blue', class: 'bg-blue-500', shadow: 'shadow-blue-500/50' },
  { name: 'Yellow', class: 'bg-yellow-500', shadow: 'shadow-yellow-500/50' },
  { name: 'Purple', class: 'bg-purple-500', shadow: 'shadow-purple-500/50' },
  { name: 'Cyan', class: 'bg-cyan-500', shadow: 'shadow-cyan-500/50' },
  { name: 'White', class: 'bg-white', shadow: 'shadow-white/50' },
];
