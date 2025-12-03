import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please ensure process.env.API_KEY is available.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Edits an image based on a text prompt using Gemini.
 * @param base64Image The base64 encoded image string (without data:image/xxx;base64, prefix if possible, though SDK handles both usually, we will strip it for safety)
 * @param mimeType The mime type of the image (e.g., 'image/jpeg')
 * @param prompt The text instruction for editing
 */
export const editImageWithGemini = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string> => {
  try {
    const ai = getClient();
    
    // Ensure clean base64 string
    const cleanBase64 = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image', // Best for general editing tasks
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      }
    });

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No response candidates returned from Gemini.");
    }

    const content = response.candidates[0].content;
    
    // Find the image part in the response
    let generatedImageBase64: string | undefined;

    if (content.parts) {
      for (const part of content.parts) {
        if (part.inlineData && part.inlineData.data) {
          generatedImageBase64 = part.inlineData.data;
          break; // Found the image
        }
      }
    }

    if (!generatedImageBase64) {
      // Sometimes the model refuses and returns text explanation.
      const textPart = content.parts?.find(p => p.text)?.text;
      if (textPart) {
        throw new Error(`Model refused or replied with text: ${textPart}`);
      }
      throw new Error("Model did not return an image.");
    }

    return `data:image/png;base64,${generatedImageBase64}`;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to edit image");
  }
};
