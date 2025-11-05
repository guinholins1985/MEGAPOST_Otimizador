
import React from 'react';

const RocketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a15.953 15.953 0 01-5.84 7.38m5.84-7.38l-7.38-5.84m7.38 5.84l5.84-7.38-5.84-2.56-2.56 5.84m-2.56-5.84l-7.38 5.84m7.38-5.84l-2.56-5.84-5.84 2.56 5.84 7.38z" />
    </svg>
);


export const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center bg-gray-800/50 border border-dashed border-gray-700 rounded-xl p-8">
      <RocketIcon className="w-16 h-16 text-cyan-400 mb-4" />
      <h2 className="text-2xl font-bold text-white mb-2">Pronto para Vender Mais?</h2>
      <p className="max-w-md text-gray-400">
        Cole a URL do seu anúncio ao lado e deixe nossa Inteligência Artificial criar uma versão irresistível que converte visitantes em compradores.
      </p>
    </div>
  );
};
