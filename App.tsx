import React, { useState, useCallback } from 'react';
import { AdInputForm } from './components/AdInputForm';
import { OptimizationResult } from './components/OptimizationResult';
import { Header } from './components/Header';
import { Welcome } from './components/Welcome';
import { optimizeAd } from './services/geminiService';
import type { AdContent, OptimizedAdResult, AdInput } from './types';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 border-t border-gray-200">
      <div className="container mx-auto px-4 py-6 text-center text-gray-500">
        <p className="text-sm">&copy; {new Date().getFullYear()} MEGAPOST. Todos os direitos reservados.</p>
        <p className="text-xs mt-1">Potencializado por IA para otimizar seus anúncios.</p>
      </div>
    </footer>
  );
};

const App: React.FC = () => {
  const [originalAd, setOriginalAd] = useState<AdContent | null>(null);
  const [optimizedAd, setOptimizedAd] = useState<OptimizedAdResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = useCallback(async (input: AdInput, tone: string) => {
    setIsLoading(true);
    setError(null);
    setOptimizedAd(null);
    setOriginalAd(null);

    try {
      const result = await optimizeAd(input, tone);
      setOriginalAd({
        title: result.title,
        description: result.description,
      });
      setOptimizedAd({
        optimizedTitle: result.optimizedTitle,
        optimizedDescription: result.optimizedDescription,
        suggestions: result.suggestions,
        keywords: result.keywords,
      });
    } catch (e: unknown) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Ocorreu um erro desconhecido.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
      setOriginalAd(null);
      setOptimizedAd(null);
      setError(null);
      setIsLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 md:py-16 flex-grow">
        <div className="max-w-7xl mx-auto">
            {isLoading || error || optimizedAd ? (
            <div className="max-w-4xl mx-auto">
                <OptimizationResult
                    originalAd={originalAd}
                    optimizedAd={optimizedAd}
                    isLoading={isLoading}
                    error={error}
                    onReset={handleReset}
                />
            </div>
            ) : (
            <div>
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                        Crie Conteúdo de{' '}
                        <span className="text-violet-600">Marketing em Segundos</span>
                    </h1>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                    Faça upload de uma imagem ou cole um link de produto. Nossa IA analisará e gerará textos de alta conversão para todas as suas necessidades.
                    </p>
                </div>

                <div className="mt-12 grid md:grid-cols-2 items-start gap-12 max-w-5xl mx-auto">
                    <AdInputForm onOptimize={handleOptimize} isLoading={isLoading} />
                    <div className="hidden md:flex h-full">
                        <Welcome />
                    </div>
                </div>
            </div>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
