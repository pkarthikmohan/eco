import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Leaf, Info, Camera, History, Scale, X, Search } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { ProductList } from './components/ProductList';
import { AnalysisView } from './components/AnalysisView';
import { ComparisonView } from './components/ComparisonView';
import { Skeleton } from './components/Skeleton';
import { StatsBanner } from './components/StatsBanner';
import { Scanner } from './components/Scanner';
import { searchProducts, analyzeProduct, analyzeImage } from './services/api';
import { Product, EcoAnalysis, AppStats, HistoryItem } from './types';

const SEARCH_CHIPS = ["Coca Cola", "Lays", "Maggi", "Oatly", "Patagonia"];

interface ComparisonItem {
  product: Product;
  analysis: EcoAnalysis;
}

export default function App() {
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [analysis, setAnalysis] = useState<EcoAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);
  const [showComparison, setShowComparison] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    const saved = localStorage.getItem('ecocheck_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [stats, setStats] = useState<AppStats>(() => {
    const saved = localStorage.getItem('ecocheck_stats');
    return saved ? JSON.parse(saved) : { productsChecked: 0, co2Saved: 0 };
  });

  useEffect(() => {
    localStorage.setItem('ecocheck_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('ecocheck_history', JSON.stringify(history));
  }, [history]);

  const addToHistory = (product: Product, analysis: EcoAnalysis) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      product,
      analysis,
      timestamp: Date.now()
    };
    setHistory(prev => [newItem, ...prev].slice(0, 20));
  };

  const handleAddToComparison = (product: Product, analysis: EcoAnalysis) => {
    if (comparisonItems.some(item => item.product.code === product.code)) {
      setError("Product already in comparison.");
      return;
    }
    if (comparisonItems.length >= 3) {
      setError("You can compare up to 3 products at a time.");
      return;
    }
    setComparisonItems(prev => [...prev, { product, analysis }]);
    setShowComparison(true);
  };

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
      console.error("handleSearch error details:", err);
      const message = err instanceof Error ? err.message : String(err);
      setError(`Search failed: ${message}`);
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
      addToHistory(product, result);
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
      
      if (result.isProduct === false) {
        setError(result.rejectionReason || "Please upload an image of a consumer product (not humans or animals).");
        setIsLoading(false);
        return;
      }

      setAnalysis(result);
      const productData = {
        product_name: result.productName,
        brands: result.brand,
        code: 'scanned-' + Date.now()
      } as Product;
      setSelectedProduct(productData);
      updateStats(result.grade);
      addToHistory(productData, result);
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
      <header className="pt-12 pb-8 px-4 text-center space-y-4 relative">
        <div className="absolute top-4 right-4 flex gap-2">
          {comparisonItems.length > 0 && (
            <button
              onClick={() => setShowComparison(true)}
              className="p-3 bg-eco-a text-white shadow-lg shadow-eco-a/20 rounded-full hover:bg-eco-a/90 transition-all flex items-center gap-2 px-4"
              title="Comparison"
            >
              <Scale className="w-5 h-5" />
              <span className="text-xs font-bold">{comparisonItems.length}</span>
            </button>
          )}
          <button
            onClick={() => setShowHistory(true)}
            className="p-3 bg-white shadow-sm border border-slate-100 rounded-full text-slate-600 hover:bg-slate-50 transition-colors"
            title="History"
          >
            <History className="w-5 h-5" />
          </button>
        </div>
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
            <AnalysisView 
              product={selectedProduct} 
              analysis={analysis} 
              onAddToCompare={() => handleAddToComparison(selectedProduct, analysis)}
            />
          ) : !searchResults.length && !isSearching && (
            <div className="text-center py-20 space-y-8">
              <div className="opacity-20 select-none">
                <Leaf className="w-32 h-32 mx-auto mb-4" />
                <p className="text-2xl font-display font-bold">Start your eco-journey</p>
              </div>
              
              <div className="max-w-md mx-auto space-y-4">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Try searching for</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {SEARCH_CHIPS.map(chip => (
                    <button
                      key={chip}
                      onClick={() => handleSearch(chip)}
                      className="px-4 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600 hover:border-eco-a hover:text-eco-a transition-all shadow-sm"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Comparison View */}
      <AnimatePresence>
        {showComparison && (
          <ComparisonView
            items={comparisonItems}
            onClose={() => setShowComparison(false)}
          />
        )}
      </AnimatePresence>

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistory(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-display font-bold flex items-center gap-2">
                  <History className="w-5 h-5 text-eco-a" />
                  Your History
                </h3>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>No history yet. Start scanning!</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedProduct(item.product);
                        setAnalysis(item.analysis);
                        setShowHistory(false);
                      }}
                      className="w-full p-4 bg-slate-50 rounded-2xl flex items-center justify-between hover:bg-slate-100 transition-all group text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-eco-${item.analysis.grade.toLowerCase()}/20 bg-eco-${item.analysis.grade.toLowerCase()}`}>
                          {item.analysis.grade}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 group-hover:text-eco-a transition-colors line-clamp-1">
                            {item.product.product_name}
                          </h4>
                          <p className="text-xs text-slate-500 font-medium">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-slate-900">{item.analysis.ecoScore}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Score</div>
                      </div>
                    </button>
                  ))
                )}
              </div>
              
              {history.length > 0 && (
                <div className="p-6 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setHistory([]);
                      localStorage.removeItem('ecocheck_history');
                    }}
                    className="w-full py-3 text-red-500 text-sm font-bold hover:bg-red-50 rounded-xl transition-colors"
                  >
                    Clear History
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
