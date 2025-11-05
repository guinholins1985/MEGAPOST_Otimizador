import React, { useState, useCallback, useMemo } from 'react';
import type { AdInput } from '../types';

interface AdInputFormProps {
  onOptimize: (input: AdInput, tone: string) => void;
  isLoading: boolean;
}

const WandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
        <path fillRule="evenodd" d="M11.828 2.25c-.916 0-1.699.663-1.85 1.567l-.091.549a.798.798 0 01-.517.639 7.498 7.498 0 00-4.023 3.527.75.75 0 00.35 1.05A8.23 8.23 0 018.25 12a8.23 8.23 0 01-2.42 5.421.75.75 0 00-.35 1.05 7.498 7.498 0 004.023 3.527.798.798 0 01.517.639l.091.549c.152.904.934 1.567 1.85 1.567h.344c.916 0 1.699-.663 1.85-1.567l.091-.549a.798.798 0 01.517-.639 7.498 7.498 0 004.023-3.527.75.75 0 00-.35-1.05A8.23 8.23 0 0115.75 12a8.23 8.23 0 012.42-5.421.75.75 0 00.35-1.05 7.498 7.498 0 00-4.023-3.527.798.798 0 01-.517-.639l-.091-.549A1.875 1.875 0 0012.172 2.25h-.344zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
    </svg>
);

const LinkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

const PhotoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
  </svg>
);


export const AdInputForm: React.FC<AdInputFormProps> = ({ onOptimize, isLoading }) => {
  const [inputType, setInputType] = useState<'url' | 'image'>('image');
  const [url, setUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [tone, setTone] = useState('Persuasivo');
  
  const imagePreview = useMemo(() => {
    if (imageFile) {
      return URL.createObjectURL(imageFile);
    }
    return null;
  }, [imageFile]);

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    if (inputType === 'url' && url.trim()) {
      onOptimize({ type: 'url', value: url }, tone);
    } else if (inputType === 'image' && imageFile) {
      onOptimize({ type: 'image', value: imageFile }, tone);
    }
  };

  const isUrlValid = (urlString: string) => {
    try {
      new URL(urlString);
      return urlString.startsWith('http://') || urlString.startsWith('https://');
    } catch (e) {
      return false;
    }
  }

  const isButtonDisabled = isLoading || (inputType === 'url' && !isUrlValid(url)) || (inputType === 'image' && !imageFile);

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-6 text-left">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
            <div className="flex border-b border-gray-200">
                <button type="button" onClick={() => setInputType('image')} className={`flex items-center gap-2 py-3 px-5 text-sm font-medium -mb-px border-b-2 ${inputType === 'image' ? 'border-violet-500 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    <PhotoIcon className="w-5 h-5"/> Upload de Imagem
                </button>
                <button type="button" onClick={() => setInputType('url')} className={`flex items-center gap-2 py-3 px-5 text-sm font-medium -mb-px border-b-2 ${inputType === 'url' ? 'border-violet-500 text-violet-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                    <LinkIcon className="w-5 h-5"/> Link de Produto
                </button>
            </div>
            <div className="pt-6">
                {inputType === 'url' ? (
                     <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700 sr-only">URL do Anúncio</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <LinkIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </div>
                            <input
                            id="url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://www.seumarketplace.com.br/produto/..."
                            className="w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm pl-10 pr-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
                            required
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700 sr-only">Upload da Imagem</label>
                         <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10 bg-gray-50/50 hover:border-violet-300 transition">
                            <div className="text-center">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Preview" className="mx-auto h-24 w-auto rounded-md" />
                            ) : (
                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                            )}
                            <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer rounded-md font-semibold text-violet-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-violet-600 focus-within:ring-offset-2 hover:text-violet-500"
                                >
                                <span>{imageFile ? 'Trocar imagem' : 'Carregue um arquivo'}</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={(e) => handleFileChange(e.target.files)} />
                                </label>
                                <p className="pl-1">ou arraste e solte</p>
                            </div>
                            <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF até 10MB</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>

        <div>
           <label htmlFor="tone" className="block text-sm font-medium text-gray-700 mb-1">
            Tom de Voz
          </label>
          <select 
            id="tone"
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-md shadow-sm px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-violet-500 transition"
          >
            <option>Persuasivo</option>
            <option>Profissional</option>
            <option>Amigável</option>
            <option>Urgente</option>
            <option>Informativo</option>
          </select>
        </div>


        <button
          type="submit"
          disabled={isButtonDisabled}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
        >
          <WandIcon className="w-5 h-5" />
          {isLoading ? 'Gerando conteúdo...' : 'Gerar Conteúdo'}
        </button>
      </form>
    </div>
  );
};
