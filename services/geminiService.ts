import { GoogleGenAI } from "@google/genai";
import { DEFAULT_SYSTEM_INSTRUCTION } from '../constants';

const API_KEY = process.env.API_KEY || '';

let aiClient: GoogleGenAI | null = null;

const getClient = () => {
  if (!aiClient && API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: API_KEY });
  }
  return aiClient;
};

export const sendMessageToGemini = async (
  message: string,
  history: { role: 'user' | 'model'; text: string }[]
): Promise<string> => {
  const client = getClient();
  if (!client) {
    return "Error: API Key no configurada.";
  }

  try {
    const chat = client.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
      },
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }]
      }))
    });

    const result = await chat.sendMessage({ message });
    return result.text || "No se recibió respuesta.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Lo siento, hubo un error al consultar al asistente.";
  }
};