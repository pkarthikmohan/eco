export interface EcoAnalysis {
  ecoScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  carbonFootprint: string;
  carbonExplanation: string;
  waterUsage: string;
  waterExplanation: string;
  packagingScore: number;
  packagingExplanation: string;
  concerns: string[];
  alternatives: {
    name: string;
    reason: string;
    ecoScore: number;
    url?: string;
  }[];
  citations: {
    title: string;
    url: string;
  }[];
  verdict: string;
  isProduct?: boolean;
  rejectionReason?: string;
}

export interface Product {
  code: string;
  product_name: string;
  brands?: string;
  image_url?: string;
  categories?: string;
  ingredients_text?: string;
  nutriscore_grade?: string;
  ecoscore_grade?: string;
}

export interface AppStats {
  productsChecked: number;
  co2Saved: number;
}
