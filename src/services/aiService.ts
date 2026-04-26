import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function chatWithAI(messages: { role: string; content: string }[], context: string) {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `You are CodeMobile AI, an expert software engineer integrated into a mobile IDE. 
  Your goal is to help users write, debug, and understand code on their mobile devices.
  Current file context:
  \`\`\`
  ${context}
  \`\`\`
  Be concise, as the user is likely on a smaller screen. Provide direct code fixes and clear explanations.`;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })),
      config: {
        systemInstruction,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("AI Error:", error);
    return "Error communicating with AI. Please check your connection.";
  }
}
