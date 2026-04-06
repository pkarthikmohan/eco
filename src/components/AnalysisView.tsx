import { motion } from "motion/react";
import { EcoBadge } from "./EcoBadge";
import { AlertTriangle, Leaf, Droplets, Package, ArrowRight, Share2, ExternalLink, CheckCircle2, Scale, Info } from "lucide-react";
import { EcoAnalysis, Product } from "../types";

interface AnalysisViewProps {
  product: Product;
  analysis: EcoAnalysis;
  onAddToCompare: () => void;
}

function ScoreRing({ score, label, icon: Icon, color }: { score: number; label: string; icon: any; color: string }) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-[2rem] shadow-lg border border-slate-100 flex-1 min-w-[140px]">
      <div className="relative w-24 h-24 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-100"
          />
          <motion.circle
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            cx="48"
            cy="48"
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            className={color}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={`w-5 h-5 mb-0.5 ${color.replace('stroke-', 'text-')}`} />
          <span className="text-xl font-black text-slate-900 leading-none">{score}</span>
        </div>
      </div>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

export function AnalysisView({ product, analysis, onAddToCompare }: AnalysisViewProps) {
  const handleShare = async () => {
    const text = `Check out the eco-impact of ${product.product_name} on EcoCheck! Grade: ${analysis.grade}, Score: ${analysis.ecoScore}/100. ${analysis.verdict}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EcoCheck Analysis',
          text: text,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Analysis copied to clipboard!');
    }
  };

  const gradeColors = {
    A: 'bg-eco-a/5 border-eco-a/20 text-eco-a',
    B: 'bg-eco-b/5 border-eco-b/20 text-eco-b',
    C: 'bg-eco-c/5 border-eco-c/20 text-eco-c',
    D: 'bg-eco-d/5 border-eco-d/20 text-eco-d',
    F: 'bg-eco-f/5 border-eco-f/20 text-eco-f',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl mx-auto pb-20"
    >
      {/* Hero Card */}
      <div className={`relative overflow-hidden rounded-[3rem] p-8 md:p-12 border shadow-2xl ${gradeColors[analysis.grade]}`}>
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-current opacity-5 rounded-full blur-3xl" />
        
        <div className="relative flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="shrink-0">
            <EcoBadge grade={analysis.grade} size="lg" />
            <div className="mt-4 text-center">
              <div className="text-4xl font-black">{analysis.ecoScore}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest opacity-60">Eco Score</div>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h2 className="text-4xl md:text-5xl font-display font-black text-slate-900 leading-tight">
                {product.product_name}
              </h2>
              <p className="text-slate-500 font-bold text-lg">{product.brands || 'Unknown Brand'}</p>
            </div>
            
            <p className="text-slate-700 text-lg leading-relaxed font-medium italic max-w-2xl">
              "{analysis.verdict}"
            </p>

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95"
              >
                <Share2 className="w-4 h-4" />
                Share Result
              </button>
              <button
                onClick={onAddToCompare}
                className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-sm hover:bg-slate-50 transition-all shadow-lg active:scale-95"
              >
                <Scale className="w-4 h-4" />
                Add to Compare
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Fun Fact Strip */}
      {analysis.funFact && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-center gap-4 shadow-sm"
        >
          <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
            <Info className="w-5 h-5" />
          </div>
          <p className="text-amber-900 text-sm font-medium">
            <span className="font-bold">Did you know?</span> {analysis.funFact}
          </p>
        </motion.div>
      )}

      {/* Metric Rings */}
      <div className="flex flex-wrap gap-4">
        <ScoreRing score={analysis.carbonScore} label="Carbon" icon={Leaf} color="stroke-eco-a" />
        <ScoreRing score={analysis.waterScore} label="Water" icon={Droplets} color="stroke-blue-500" />
        <ScoreRing score={analysis.packagingScore} label="Packaging" icon={Package} color="stroke-orange-500" />
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-6">
          <h3 className="text-2xl font-display font-bold flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-eco-a" />
            Impact Details
          </h3>
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Carbon Footprint</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{analysis.carbonExplanation}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Water Usage</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{analysis.waterExplanation}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h4 className="font-bold text-slate-900 text-sm mb-1">Packaging</h4>
              <p className="text-xs text-slate-500 leading-relaxed">{analysis.packagingExplanation}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 space-y-6">
            <h3 className="text-2xl font-display font-bold flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              Key Concerns
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {analysis.concerns.map((concern, i) => (
                <div key={i} className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  <p className="text-sm text-amber-900 font-medium">{concern}</p>
                </div>
              ))}
            </div>
          </div>

          {analysis.citations && analysis.citations.length > 0 && (
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-xl space-y-6">
              <h3 className="text-xl font-display font-bold">Data Sources</h3>
              <div className="space-y-3">
                {analysis.citations.map((cite, i) => (
                  <a 
                    key={i}
                    href={cite.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
                  >
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{cite.title}</span>
                    <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-white" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alternatives */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-3xl font-display font-black text-slate-900">Greener Alternatives</h3>
          <Leaf className="w-8 h-8 text-eco-a opacity-20" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analysis.alternatives.map((alt, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -8 }}
              className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-eco-a/10 flex items-center justify-center text-eco-a font-black text-xl">
                    {alt.ecoScore}
                  </div>
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Better Choice</div>
                </div>
                <h4 className="text-xl font-display font-bold text-slate-900 mb-2 group-hover:text-eco-a transition-colors">{alt.name}</h4>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  {alt.reason}
                </p>
              </div>
              {alt.url && (
                <a 
                  href={alt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 bg-slate-50 text-slate-900 rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:bg-eco-a hover:text-white transition-all shadow-sm"
                >
                  View Product <ArrowRight className="w-4 h-4" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
