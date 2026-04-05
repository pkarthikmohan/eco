export interface EcoAnalysis {
  ecoScore: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  carbonFootprint: string;
  waterUsage: string;
  packagingScore: number;
  concerns: string[];
  alternatives: {
    name: string;
    reason: string;
    ecoScore: number;
  }[];
  verdict: string;
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
