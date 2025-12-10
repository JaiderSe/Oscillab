import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { AnalysisData } from "../types";

const apiKey = process.env.API_KEY || '';
// Initialize the client only if the key is available to avoid immediate errors,
// though actual calls will fail gracefully if missing.
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const generateInsight = async (
  prompt: string,
  metrics: AnalysisData | null
): Promise<string> => {
  if (!ai) {
    return "Error: API Key is missing. Please configure process.env.API_KEY.";
  }

  try {
    const context = metrics
      ? `
      Contexto actual del análisis TDR:
      Longitud: ${metrics.length_meters.toFixed(2)} m
      Error: ${metrics.error_percent.toFixed(2)} %
      Factor de Velocidad: ${metrics.velocity_factor.toFixed(3)}
      VSWR: ${metrics.vswr.toFixed(3)}
      Coeficiente de Reflexión: ${metrics.reflection_coefficient.toFixed(3)}
      Beta: ${metrics.beta.toFixed(3)} rad/m
      Alpha: ${metrics.alpha.toFixed(3)} dB/m
      Z0: ${metrics.Z0.toFixed(1)} Ω
      Tipo de Carga: ${metrics.load_type}
      Valor de Carga: ${metrics.load_value.toFixed(2)}

      Eres un asistente experto en ingeniería eléctrica y análisis de señales TDR. Responde de manera concisa y técnica pero accesible.
      `
      : "Eres un asistente experto en ingeniería eléctrica. No hay datos cargados actualmente.";

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        { role: 'user', parts: [{ text: `${context}\n\nPregunta del usuario: ${prompt}` }] }
      ],
      config: {
        maxOutputTokens: 500,
        temperature: 0.7,
      }
    });

    return response.text || "No se pudo generar una respuesta.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Lo siento, hubo un error al conectar con el asistente.";
  }
};