import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Info, Camera } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { ProductList } from './components/ProductList';
import { AnalysisView } from './components/AnalysisView';
import { Skeleton } from './components/Skeleton';
import { StatsBanner } from './components/StatsBanner';
import { Scanner } from './components/Scanner';
import { searchProducts, analyzeProduct, analyzeImage } from './services/api';
import { Product, EcoAnalysis, AppStats } from './types';

export default function App() {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [analysis, setAnalysis] = useState<EcoAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<AppStats>(() => {
    const saved = localStorage.getItem('ecocheck_stats');
    return saved ? JSON.parse(saved) : { productsChecked: 0, co2Saved: 0 };
  });

  useEffect(() => {
    localStorage.setItem('ecocheck_stats', JSON.stringify(stats));
  }, [stats]);

  const handleSearch = async (query: string) => {
    setIsSearching(true);
    setError(null);
    setSearchResults([]);
    try {
      const results = await searchProducts(query);
      setSearchResults(results);
      if (results.length === 0) {
        setError("No products found. Try a different search term.");
      }
    } catch (err) {
      setError("Failed to fetch products. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectProduct = async (product: Product) => {
    setSearchResults([]);
    setSelectedProduct(product);
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeProduct(product);
      setAnalysis(result);
      updateStats(result.grade);
    } catch (err) {
      setError("AI analysis failed. Please try again.");
      setSelectedProduct(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScan = async (base64Image: string, mimeType: string) => {
    console.log("handleScan called with image data. MIME:", mimeType);
    setIsLoading(true);
    setError(null);
    setSelectedProduct(null);
    setAnalysis(null);
    setSearchResults([]); // Clear search results when scanning
    try {
      console.log("Calling analyzeImage...");
      const result = await analyzeImage(base64Image, mimeType);
      console.log("analyzeImage result received:", result);
      setAnalysis(result);
      setSelectedProduct({
        product_name: result.productName,
        brands: result.brand,
        code: 'scanned-' + Date.now()
      } as Product);
      updateStats(result.grade);
    } catch (err) {
      console.error("handleScan error:", err);
      setError("Failed to identify product from image. Try searching manually.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateStats = (grade: string) => {
    const co2Saved = ['C', 'D', 'F'].includes(grade) ? 0.5 : 0;
    setStats(prev => ({
      productsChecked: prev.productsChecked + 1,
      co2Saved: prev.co2Saved + co2Saved
    }));
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <header className="pt-12 pb-8 px-4 text-center space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-eco-a/10 text-eco-a rounded-full font-bold text-sm mb-4"
        >
          <Leaf className="w-4 h-4" />
          EcoCheck AI
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-display font-black text-slate-900 tracking-tight">
          Shop <span className="text-eco-a">Sustainably</span>.
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">
          Scan or search any product to see its environmental impact and find greener alternatives in seconds.
        </p>
      </header>

      {/* Main Content */}
      <main className="px-4 space-y-12">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-6">
            <SearchBar onSearch={handleSearch} isLoading={isSearching} />
            <div className="flex items-center gap-4 max-w-2xl mx-auto">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>
            <Scanner onScan={handleScan} isLoading={isLoading} />
          </div>
          
          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3 text-sm font-medium"
              >
                <Info className="w-5 h-5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <ProductList products={searchResults} onSelect={handleSelectProduct} />
        </div>

        {/* Stats Banner */}
        <div className="max-w-4xl mx-auto">
          <StatsBanner stats={stats} />
        </div>

        {/* Results Section */}
        <div className="relative">
          {isLoading ? (
            <Skeleton />
          ) : analysis && selectedProduct ? (
            <AnalysisView product={selectedProduct} analysis={analysis} />
          ) : !searchResults.length && !isSearching && (
            <div className="text-center py-20 opacity-20 select-none">
              <Leaf className="w-32 h-32 mx-auto mb-4" />
              <p className="text-2xl font-display font-bold">Start your eco-journey</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Info */}
      <footer className="max-w-4xl mx-auto mt-20 px-4 text-center">
        <div className="p-8 bg-slate-900 rounded-[2rem] text-white space-y-4">
          <h4 className="text-xl font-display font-bold">Why EcoCheck?</h4>
          <p className="text-slate-400 text-sm leading-relaxed max-w-2xl mx-auto">
            Our AI analyzes supply chains, packaging materials, and manufacturing processes using data from Open Food Facts and global sustainability benchmarks to give you the most accurate impact assessment possible.
          </p>
        </div>
      </footer>
    </div>
  );
}
