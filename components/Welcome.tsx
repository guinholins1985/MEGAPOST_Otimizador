
import React from 'react';

const RocketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a15.953 15.953 0 01-5.84 7.38m5.84-7.38l-7.38-5.84m7.38 5.84l5.84-7.38-5.84-2.56-2.56 5.84m-2.56-5.84l-7.38 5.84m7.38-5.84l-2.56-5.84-5.84 2.56 5.84 7.38z" />
    </svg>
);


export const Welcome: React.FC = () => {
  return (
    <div className="flex flex-col items-start justify-center h-full text-left bg-violet-50 border border-violet-200 rounded-xl p-8">
      <div className="bg-white p-3 rounded-full shadow-md mb-4 border border-violet-100">
        <RocketIcon className="w-8 h-8 text-violet-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">Pronto para Vender Mais?</h2>
      <p className="text-gray-600">
        Use o formulário ao lado para começar. Envie a imagem de um produto ou o link de um anúncio existente e deixe nossa IA criar uma versão otimizada que converte.
      </p>
    </div>
  );
};
