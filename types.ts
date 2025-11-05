export interface AdContent {
  title: string;
  description: string;
}

export interface OptimizedAdResult {
  optimizedTitle: string;
  optimizedDescription: string;
  suggestions: string[];
  keywords: string[];
}

export interface FullOptimizationResult {
  title: string;
  description: string;
  optimizedTitle: string;
  optimizedDescription: string;
  suggestions: string[];
  keywords: string[];
}

export type AdInput = {
    type: 'url';
    value: string;
} | {
    type: 'image';
    value: File;
};
