import React, { useState } from 'react';
import { Loader } from './Loader';
import { CopyButton } from './CopyButton';
import type { AdContent, OptimizedAdResult } from '../types';

interface OptimizationResultProps {
  originalAd: AdContent | null;
  optimizedAd: OptimizedAdResult | null;
  isLoading: boolean;
  error: string | null;
  onReset: () => void;
}

const LightBulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 010 1.06l-1.591 1.59a.75.75 0 11-1.06-1.061l1.591-1.59a.75.75 0 011.06 0zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.803 17.803a.75.75 0 01-1.06 0l-1.59-1.591a.75.75 0 111.06-1.06l1.59 1.591a.75.75 0 010 1.06zM12 21.75a.75.75 0 01-.75-.75v-2.25a.75.75 0 011.5 0V21a.75.75 0 01-.75-.75zM5.197 17.803a.75.75 0 010-1.06l1.59-1.591a.75.75 0 111.061 1.06l-1.59 1.591a.75.75 0 01-1.061 0zM3 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H3.75A.75.75 0 013 12zM6.106 6.106a.75.75 0 011.06 0l1.591 1.59a.75.75 0 111.06-1.061L7.167 5.045a.75.75 0 010-1.06z" />
    </svg>
);

const TagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M5.25 2.25a.75.75 0 00-.75.75v.54l8.22 8.22a.75.75 0 001.06 0l4.25-4.25a.75.75 0 000-1.06l-4.25-4.25a.75.75 0 00-1.06 0L8.27 5.79 5.25 2.73V2.25zm.56 12.56a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75zM15 18a.75.75 0 01.75-.75h4.5a.75.75 0 010 1.5h-4.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
    <path d="M6.75 7.5a.75.75 0 01.75-.75h8.25a.75.75 0 010 1.5H7.5a.75.75 0 01-.75-.75zM12 12.75a.75.75 0 01.75-.75h6a.75.75 0 010 1.5h-6a.75.75 0 01-.75-.75zM3 21a.75.75 0 01.75-.75h16.5a.75.75 0 010 1.5H3.75a.75.75 0 01-.75-.75z" />
  </svg>
);

type Tab = 'comparison' | 'suggestions' | 'keywords';

export const OptimizationResult: React.FC<OptimizationResultProps> = ({ originalAd, optimizedAd, isLoading, error, onReset }) => {
  const [activeTab, setActiveTab] = useState<Tab>('comparison');

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white border border-gray-200 rounded-xl p-8 min-h-[400px]">
        <Loader />
        <p className="mt-4 text-lg font-medium text-violet-600 animate-pulse">Analisando e otimizando com IA...</p>
        <p className="text-gray-500 mt-1">Isso pode levar alguns segundos.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button
            onClick={onReset}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
            Tentar Novamente
        </button>
      </div>
    );
  }

  if (!optimizedAd || !originalAd) {
    return null;
  }
  
  const renderTabContent = () => {
    switch (activeTab) {
      case 'suggestions':
        return (
          <div className="p-6 animate-fade-in">
            <ul className="space-y-4 list-disc list-inside text-gray-600">
              {optimizedAd.suggestions.map((suggestion, index) => (
                <li key={index} className="pl-2">{suggestion}</li>
              ))}
            </ul>
          </div>
        );
      case 'keywords':
          return (
            <div className="p-6 animate-fade-in">
              <div className="flex flex-wrap gap-3">
                {optimizedAd.keywords.map((keyword, index) => (
                  <span key={index} className="bg-violet-100 text-violet-800 text-sm font-medium px-3 py-1 rounded-full">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          );
      case 'comparison':
      default:
        return (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
            <div>
              <h4 className="font-semibold text-gray-500 mb-2 border-b border-gray-200 pb-2">Seu Conteúdo Original</h4>
              <div className="space-y-3 mt-3">
                <p className="font-bold text-gray-800">{originalAd.title}</p>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{originalAd.description}</p>
              </div>
            </div>
            <div className="bg-violet-50/50 p-4 rounded-lg border border-violet-200">
              <h4 className="font-semibold text-violet-700 mb-2 border-b border-violet-200/80 pb-2">Conteúdo Otimizado por IA</h4>
              <div className="space-y-3 mt-3">
                <div>
                  <div className="flex justify-between items-start">
                      <p className="font-bold text-gray-900 flex-1 pr-2">{optimizedAd.optimizedTitle}</p>
                      <CopyButton textToCopy={optimizedAd.optimizedTitle} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-start">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap flex-1 pr-2">{optimizedAd.optimizedDescription}</p>
                    <CopyButton textToCopy={optimizedAd.optimizedDescription} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-2">
        <h3 className="text-xl md:text-2xl font-bold text-gray-900">Resultado da Otimização</h3>
        <button
            onClick={onReset}
            className="bg-white hover:bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors text-sm border border-gray-300"
        >
            Gerar Outro
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-lg animate-fade-in">
        <div className="border-b border-gray-200">
            <nav className="flex -mb-px px-4">
                <button onClick={() => setActiveTab('comparison')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'comparison' ? 'border-violet-500 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M15.023 1.256a.75.75 0 01.023.998l-5.25 6.5a.75.75 0 01-1.018.06l-2.25-1.75a.75.75 0 11.94-1.168l1.732 1.348 4.768-5.96a.75.75 0 01.998-.023zM5.023 10.256a.75.75 0 01.023.998l-5.25 6.5a.75.75 0 01-1.018.06l-2.25-1.75a.75.75 0 11.94-1.168l1.732 1.348 4.768-5.96a.75.75 0 01.998-.023z" clipRule="evenodd" /></svg>
                    Comparativo
                </button>
                <button onClick={() => setActiveTab('suggestions')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'suggestions' ? 'border-violet-500 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    <LightBulbIcon className="w-5 h-5"/>
                    Sugestões
                </button>
                 <button onClick={() => setActiveTab('keywords')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'keywords' ? 'border-violet-500 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    <TagIcon className="w-5 h-5"/>
                    Palavras-chave
                </button>
            </nav>
        </div>
        {renderTabContent()}
      </div>
    </div>
  );
};
