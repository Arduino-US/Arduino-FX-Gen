
import { GoogleGenAI, Type } from "@google/genai";
import { ArduinoGenResponse, PinConfig } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateArduinoScript = async (
  pins: PinConfig[],
  description: string
): Promise<ArduinoGenResponse> => {
  const ledPins = pins.filter(p => p.type === 'LED').map((p) => p.pin).join(", ");
  const buttonPins = pins.filter(p => p.type === 'BUTTON').map((p) => p.pin).join(", ");
  
  const prompt = `
    You are an expert embedded systems engineer.
    Task: Create an Arduino C++ script for an Arduino Uno R3.
    
    Hardware Configuration:
    - LEDs (Output) on digital pins: ${ledPins || "None"}.
    - Push Buttons (Input) on digital pins: ${buttonPins || "None"}.
    
    Goal: Create a sketch that implements: "${description}"
    
    Requirements:
    1. Generate valid, commented Arduino C++ code using standard logic (digitalWrite, digitalRead). 
    2. Use proper input modes (e.g. INPUT_PULLUP for buttons is recommended to avoid external resistors).
    3. Create a "simulation sequence" that represents this pattern visually frame-by-frame.
    4. The simulation sequence should loop seamlessly.
    5. If buttons are present, simulate a scenario where the button is pressed to demonstrate the functionality (e.g. show the state changing).
    6. For the simulation data: Use state 1 to represent LED ON or Button PRESSED. Use state 0 for LED OFF or Button RELEASED.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          patternName: { type: Type.STRING },
          cppCode: { type: Type.STRING },
          explanation: { type: Type.STRING },
          simulationSequence: {
            type: Type.ARRAY,
            description: "A list of frames to animate the component states.",
            items: {
              type: Type.OBJECT,
              properties: {
                durationMs: { type: Type.INTEGER, description: "Duration of this frame in milliseconds" },
                states: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      pin: { type: Type.INTEGER },
                      state: { type: Type.INTEGER, description: "0 for OFF/RELEASED, 1 for ON/PRESSED" }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("No response from Gemini");
  }

  return JSON.parse(response.text) as ArduinoGenResponse;
};
