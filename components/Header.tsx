import React from 'react';

const RocketIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.82m5.84-2.56a15.953 15.953 0 01-5.84 7.38m5.84-7.38l-7.38-5.84m7.38 5.84l5.84-7.38-5.84-2.56-2.56 5.84m-2.56-5.84l-7.38 5.84m7.38-5.84l-2.56-5.84-5.84 2.56 5.84 7.38z" />
    </svg>
);

export const Header: React.FC = () => {
    return (
        <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-20">
            <div className="container mx-auto px-4">
                <div className="h-16 flex items-center">
                    <div className="flex items-center gap-2">
                        <RocketIcon className="w-8 h-8 text-violet-600" />
                        <span className="text-2xl font-bold text-gray-800 tracking-tight">
                            MEGAPOST
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
};
