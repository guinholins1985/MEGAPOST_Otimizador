import { GoogleGenAI, Type } from "@google/genai";
import type { FullOptimizationResult, AdInput } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                resolve((reader.result as string).split(',')[1]);
            } else {
                reject(new Error("Failed to read file."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

// Helper to robustly parse JSON from AI response, handling markdown wrappers.
const parseJsonResponse = (responseText: string): FullOptimizationResult => {
    // First, try to find a JSON block wrapped in markdown ```json ... ```
    const markdownMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        try {
            return JSON.parse(markdownMatch[1]);
        } catch (e) {
            console.warn("Could not parse JSON from markdown block, falling back.", e);
        }
    }

    // If no markdown, or if parsing failed, find the main JSON object inside the text
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch && jsonMatch[0]) {
        try {
            return JSON.parse(jsonMatch[0]);
        } catch (e) {
            console.error("Failed to parse extracted JSON from response:", jsonMatch[0], e);
        }
    }
    
    // If all else fails, throw an error.
    console.error("Response is not valid JSON and no JSON block could be extracted.", responseText);
    throw new Error("A IA não retornou um JSON válido. Tente novamente.");
}


export const optimizeAd = async (input: AdInput, tone: string): Promise<FullOptimizationResult> => {
  const model = "gemini-2.5-flash";

  try {
    if (input.type === 'url') {
        const contents = `
        Sua tarefa é atuar como um especialista em marketing digital. Analise a página do produto na URL fornecida e use um tom de voz "${tone}".

        URL: "${input.value}"

        Siga estas instruções:
        1.  Acesse e analise o conteúdo da URL para entender o produto.
        2.  Extraia o título e a descrição originais. Se não houver descrição, crie um resumo.
        3.  Crie um "optimizedTitle" que seja vendedor e otimizado para SEO.
        4.  Crie uma "optimizedDescription" que seja persuasiva, destacando benefícios.
        5.  Forneça 3 "suggestions" (sugestões) práticas para melhorar o anúncio (fotos, preço, etc.).
        6.  Liste de 5 a 7 "keywords" (palavras-chave) de SEO.
        7.  Retorne SUA RESPOSTA CONTENDO APENAS E SOMENTE o objeto JSON com a estrutura: { "title": "...", "description": "...", "optimizedTitle": "...", "optimizedDescription": "...", "suggestions": [...], "keywords": [...] }.
            Sua resposta DEVE começar com '{' e terminar com '}'. Não inclua nenhum texto ou formatação de markdown.`;

        const config = { tools: [{googleSearch: {}}] };
        const response = await ai.models.generateContent({
            model,
            contents,
            config,
        });

        return parseJsonResponse(response.text);

    } else { // type: 'image'
        const imagePart = await fileToGenerativePart(input.value);
        const textPart = { text: `Você é um especialista em marketing que cria conteúdo para anúncios. Analise a imagem do produto.

        Aplique um tom de voz "${tone}" e gere o seguinte conteúdo, retornando-o estritamente no formato JSON definido:
        - title & description: Crie um título e descrição curtos e objetivos.
        - optimizedTitle & optimizedDescription: Crie versões otimizadas para SEO e persuasivas.
        - suggestions: Forneça 3 sugestões práticas para melhorar o anúncio.
        - keywords: Liste de 5 a 7 palavras-chave de SEO.`};
        const contents = { parts: [imagePart, textPart] };
        const config = {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING, description: "Um título original e descritivo baseado na imagem." },
                    description: { type: Type.STRING, description: "Uma descrição original e objetiva baseada na imagem." },
                    optimizedTitle: { type: Type.STRING, description: "O novo título otimizado com o tom de voz aplicado." },
                    optimizedDescription: { type: Type.STRING, description: "A nova descrição persuasiva e bem formatada com o tom de voz aplicado." },
                    suggestions: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "Três sugestões práticas para melhorar o anúncio."
                    },
                    keywords: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: "De 5 a 7 palavras-chave (SEO) cruciais para o produto."
                    },
                },
                required: ['title', 'description', 'optimizedTitle', 'optimizedDescription', 'suggestions', 'keywords'],
            },
        };

        const response = await ai.models.generateContent({ model, contents, config });
        return JSON.parse(response.text);
    }
  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    if (input.type === 'url') {
        throw new Error("Falha ao comunicar com o serviço de IA. Verifique se a URL é válida e se o anúncio é público. Se o erro persistir, a página pode estar bloqueando a análise.");
    } else {
        throw new Error("Falha ao comunicar com o serviço de IA. Tente novamente com uma imagem diferente ou verifique sua conexão.");
    }
  }
};
