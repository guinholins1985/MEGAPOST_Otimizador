import { GoogleGenAI, Type } from "@google/genai";
import type { FullOptimizationResult, AdInput } from '../types';

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            if (reader.result) {
                resolve((reader.result as string).split(',')[1]);
            } else {
                reject(new Error("Falha ao ler o arquivo."));
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

const parseJsonResponse = (responseText: string): any => {
    let jsonString: string | null = null;
    
    const markdownMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
    if (markdownMatch && markdownMatch[1]) {
        jsonString = markdownMatch[1];
    } else {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch && jsonMatch[0]) {
            jsonString = jsonMatch[0];
        }
    }

    if (jsonString) {
        try {
            return JSON.parse(jsonString);
        } catch (e) {
            console.error("Falha ao analisar a string JSON extraída:", jsonString, e);
            throw new Error("A IA retornou uma resposta em formato inválido. O JSON extraído não pôde ser analisado.");
        }
    }
    
    console.error("A resposta não contém um bloco JSON válido.", responseText);
    throw new Error("A IA não retornou um JSON válido. Tente novamente.");
}

export const optimizeAd = async (input: AdInput, tone: string): Promise<FullOptimizationResult> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const model = "gemini-2.5-flash";

    try {
        if (input.type === 'url') {
            const contents = `
            Sua tarefa é atuar como um especialista em marketing digital. Analise a página do produto na URL fornecida e use um tom de voz "${tone}".

            URL: "${input.value}"

            Siga estas instruções estritamente:
            1.  Acesse e analise o conteúdo da URL para entender o produto.
            2.  Extraia o título e a descrição originais. Se não houver descrição, crie um resumo conciso.
            3.  Crie um "optimizedTitle" que seja vendedor e otimizado para SEO.
            4.  Crie uma "optimizedDescription" que seja persuasiva, destacando benefícios.
            5.  Forneça 3 "suggestions" (sugestões) práticas e acionáveis para melhorar o anúncio.
            6.  Liste de 5 a 7 "keywords" (palavras-chave) de SEO relevantes.
            7.  Sua resposta DEVE SER APENAS o objeto JSON. Não adicione nenhum texto antes ou depois, nem formatação de markdown.
                - Se a análise for bem-sucedida, use esta estrutura: { "title": "...", "description": "...", "optimizedTitle": "...", "optimizedDescription": "...", "suggestions": [...], "keywords": [...] }
                - Se a URL for inacessível ou inválida, use esta estrutura: { "error": "A URL fornecida é inválida ou não foi possível acessá-la." }
            `;

            const config = { tools: [{googleSearch: {}}] };
            const response = await ai.models.generateContent({ model, contents, config });

            if (!response || !response.text) {
                throw new Error("A IA não retornou uma resposta de texto. A URL pode ser inválida ou inacessível.");
            }

            const result = parseJsonResponse(response.text);
            
            if (result.error) {
                throw new Error(result.error);
            }

            const requiredKeys: (keyof FullOptimizationResult)[] = ['title', 'description', 'optimizedTitle', 'optimizedDescription', 'suggestions', 'keywords'];
            for (const key of requiredKeys) {
                if (!(key in result)) {
                    console.error("Chave ausente na resposta:", key, result);
                    throw new Error(`A resposta da IA está incompleta. Faltando o campo '${key}'.`);
                }
            }
            
            return result as FullOptimizationResult;

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
            
            if (!response || !response.text) {
                throw new Error("A IA não retornou uma resposta de texto para a imagem.");
            }

            try {
                const result = JSON.parse(response.text);
                const requiredKeys: (keyof FullOptimizationResult)[] = ['title', 'description', 'optimizedTitle', 'optimizedDescription', 'suggestions', 'keywords'];
                for (const key of requiredKeys) {
                    if (!(key in result)) {
                        console.error("Chave ausente na resposta da imagem apesar do esquema:", key, result);
                        throw new Error(`A resposta da IA para a imagem está incompleta. Faltando o campo '${key}'.`);
                    }
                }
                return result as FullOptimizationResult;
            } catch (e) {
                console.error("Erro ao analisar JSON da análise de imagem apesar do esquema:", response.text, e);
                throw new Error("A IA retornou uma resposta em formato inesperado para a imagem.");
            }
        }
    } catch (error) {
        console.error("Erro em optimizeAd:", error);
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido na comunicação com a IA.";

        if (errorMessage.startsWith("A IA") || errorMessage.startsWith("A URL")) {
            throw new Error(errorMessage);
        }
        
        if (input.type === 'url') {
            throw new Error(`Falha ao analisar a URL. A página pode estar bloqueando a análise ou a URL é inválida. Detalhe: ${errorMessage}`);
        } else {
            throw new Error(`Falha ao analisar a imagem. Tente novamente. Detalhe: ${errorMessage}`);
        }
    }
};