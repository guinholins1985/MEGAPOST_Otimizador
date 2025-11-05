import { GoogleGenAI } from "@google/genai";
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

export const optimizeAd = async (input: AdInput, tone: string): Promise<FullOptimizationResult> => {
  const model = "gemini-2.5-flash";

  let contents: any;
  let config: any = {};

  if (input.type === 'url') {
    contents = `
    Sua tarefa é atuar como um especialista em marketing digital e otimização de anúncios para marketplaces. Você recebeu a URL de um anúncio e um tom de voz específico.

    URL do Anúncio: "${input.value}"
    Tom de Voz a ser aplicado: "${tone}"

    Siga estritamente as seguintes instruções:
    1. Acesse e analise o conteúdo da página no URL fornecido para entender o produto.
    2. Extraia o título e a descrição originais do anúncio. Se não houver descrição, resuma os pontos principais do produto em 2-3 frases.
    3. Reescreva o título para ser mais vendedor e otimizado para buscas (SEO), aplicando o tom de voz solicitado.
    4. Reescreva a descrição para ser mais persuasiva, aplicando o tom de voz solicitado. Destaque benefícios, use parágrafos curtos e/ou bullet points.
    5. Forneça 3 sugestões práticas e acionáveis para melhorar o anúncio (fotos, preço, confiança).
    6. Identifique e extraia de 5 a 7 palavras-chave (SEO) cruciais para este produto, que potenciais compradores usariam para encontrá-lo.
    7. Retorne SUA RESPOSTA CONTENDO APENAS E SOMENTE o objeto JSON com a seguinte estrutura. NÃO inclua nenhum texto, explicação ou formatação de markdown como \`\`\`json. Sua resposta deve começar com '{' e terminar com '}'.

    Estrutura JSON esperada:
    {
      "title": "O título original do anúncio.",
      "description": "A descrição original do anúncio.",
      "optimizedTitle": "O novo título otimizado com o tom de voz aplicado.",
      "optimizedDescription": "A nova descrição persuasiva e bem formatada com o tom de voz aplicado.",
      "suggestions": [
        "Uma sugestão de melhoria.",
        "Outra sugestão de melhoria.",
        "Mais uma sugestão de melhoria."
      ],
      "keywords": [
        "primeira palavra-chave",
        "segunda palavra-chave",
        "terceira palavra-chave",
        "etc..."
      ]
    }
  `;
    config = { tools: [{googleSearch: {}}] };
  } else {
    const imagePart = await fileToGenerativePart(input.value);
    const textPart = { text: `
Sua tarefa é atuar como um especialista em marketing digital e otimização de anúncios para marketplaces. Você recebeu a imagem de um produto e um tom de voz específico.

Imagem do Produto: [Imagem fornecida]
Tom de Voz a ser aplicado: "${tone}"

Siga estritamente as seguintes instruções:
1. Analise a imagem para identificar o produto e suas principais características.
2. Crie um título e uma descrição curtos e diretos com base no que você vê na imagem. Use-os como "originais".
3. Reescreva o título para ser mais vendedor e otimizado para buscas (SEO), aplicando o tom de voz solicitado.
4. Reescreva a descrição para ser mais persuasiva, aplicando o tom de voz solicitado. Destaque benefícios, use parágrafos curtos e/ou bullet points.
5. Forneça 3 sugestões práticas e acionáveis para melhorar o anúncio (fotos, preço, confiança).
6. Identifique e extraia de 5 a 7 palavras-chave (SEO) cruciais para este produto, que potenciais compradores usariam para encontrá-lo.
7. Retorne SUA RESPOSTA CONTENDO APENAS E SOMENTE o objeto JSON com a seguinte estrutura. NÃO inclua nenhum texto, explicação ou formatação de markdown como \`\`\`json. Sua resposta deve começar com '{' e terminar com '}'.

Estrutura JSON esperada:
{
  "title": "Um título original e descritivo baseado na imagem.",
  "description": "Uma descrição original e objetiva baseada na imagem.",
  "optimizedTitle": "O novo título otimizado com o tom de voz aplicado.",
  "optimizedDescription": "A nova descrição persuasiva e bem formatada com o tom de voz aplicado.",
  "suggestions": [
    "Uma sugestão de melhoria.",
    "Outra sugestão de melhoria.",
    "Mais uma sugestão de melhoria."
  ],
  "keywords": [
    "primeira palavra-chave",
    "segunda palavra-chave",
    "terceira palavra-chave",
    "etc..."
  ]
}
`};
    contents = { parts: [imagePart, textPart] };
  }
  
  try {
    const response = await ai.models.generateContent({
      model,
      contents,
      config,
    });

    const text = response.text;
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("Resposta da IA não contém um objeto JSON:", text);
      throw new Error("A IA não retornou um JSON válido. Tente novamente.");
    }
    
    const jsonText = jsonMatch[0];
    const result: FullOptimizationResult = JSON.parse(jsonText);
    return result;

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    if (input.type === 'url') {
        throw new Error("Falha ao comunicar com o serviço de IA. Verifique se a URL é válida e se o anúncio é público. Se o erro persistir, a página pode estar bloqueando a análise.");
    } else {
        throw new Error("Falha ao comunicar com o serviço de IA. Tente novamente com uma imagem diferente ou verifique sua conexão.");
    }
  }
};
