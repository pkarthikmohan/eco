import { motion } from "motion/react";
import { X, Scale, Leaf, Droplets, Package, ArrowRight } from "lucide-react";
import { EcoAnalysis, Product } from "../types";
import { EcoBadge } from "./EcoBadge";

interface ComparisonItem {
  product: Product;
  analysis: EcoAnalysis;
}

interface ComparisonViewProps {
  items: ComparisonItem[];
  onClose: () => void;
}

export function ComparisonView({ items, onClose }: ComparisonViewProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-5xl bg-slate-50 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 bg-white border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-2xl font-display font-black flex items-center gap-3">
            <Scale className="w-8 h-8 text-eco-a" />
            Product Comparison
          </h3>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-x-auto p-8">
          <div className="flex gap-8 min-w-max md:min-w-0">
            {items.map((item, idx) => (
              <div key={idx} className="w-80 md:flex-1 space-y-8">
                {/* Product Header */}
                <div className="bg-white p-6 rounded-[2.5rem] shadow-lg border border-slate-100 text-center space-y-4">
                  <div className="flex justify-center">
                    <EcoBadge grade={item.analysis.grade} size="lg" />
                  </div>
                  <div>
                    <h4 className="text-xl font-display font-bold text-slate-900 line-clamp-2">{item.product.product_name}</h4>
                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">{item.product.brands}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-50">
                    <div className="text-4xl font-black text-slate-900">{item.analysis.ecoScore}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Eco Score</div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="space-y-4">
                  <MetricCard
                    label="Carbon"
                    score={item.analysis.carbonScore}
                    icon={Leaf}
                    color="text-eco-a"
                    bgColor="bg-eco-a/5"
                  />
                  <MetricCard
                    label="Water"
                    score={item.analysis.waterScore}
                    icon={Droplets}
                    color="text-blue-500"
                    bgColor="bg-blue-500/5"
                  />
                  <MetricCard
                    label="Packaging"
                    score={item.analysis.packagingScore}
                    icon={Package}
                    color="text-orange-500"
                    bgColor="bg-orange-500/5"
                  />
                </div>

                {/* Verdict */}
                <div className="p-6 bg-white rounded-[2rem] shadow-md border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
                  "{item.analysis.verdict}"
                </div>

                {/* Concerns */}
                <div className="space-y-3">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Key Concerns</h5>
                  {item.analysis.concerns.slice(0, 3).map((concern, i) => (
                    <div key={i} className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl text-xs text-amber-900 font-medium flex gap-2">
                      <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                      {concern}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function MetricCard({ label, score, icon: Icon, color, bgColor }: any) {
  return (
    <div className={`p-4 rounded-2xl border border-slate-100 flex items-center justify-between bg-white shadow-sm`}>
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgColor} ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-sm font-bold text-slate-600">{label}</span>
      </div>
      <span className={`text-lg font-black ${color}`}>{score}</span>
    </div>
  );
}
