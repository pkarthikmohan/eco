import { motion } from "motion/react";
import { EcoBadge } from "./EcoBadge";
import { ScoreBar } from "./ScoreBar";
import { AlertTriangle, Leaf, Droplets, Package, ArrowRight } from "lucide-react";
import { EcoAnalysis, Product } from "../types";

interface AnalysisViewProps {
  product: Product;
  analysis: EcoAnalysis;
}

export function AnalysisView({ product, analysis }: AnalysisViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-4xl mx-auto"
    >
      {/* Header Section */}
      <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row gap-8 items-center">
        <div className="relative">
          <EcoBadge grade={analysis.grade} size="lg" />
          <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md border border-slate-100">
            <span className="text-sm font-bold text-slate-600">{analysis.ecoScore}/100</span>
          </div>
        </div>
        
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">
            {product.product_name}
          </h2>
          <p className="text-slate-500 mb-4 font-medium">{product.brands || 'Unknown Brand'}</p>
          <div className="p-4 bg-eco-a/5 border border-eco-a/10 rounded-2xl">
            <p className="text-slate-700 leading-relaxed italic">
              "{analysis.verdict}"
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 space-y-6">
          <h3 className="text-xl font-display font-bold flex items-center gap-2">
            <Leaf className="w-5 h-5 text-eco-a" />
            Impact Breakdown
          </h3>
          <div className="space-y-6">
            <div>
              <ScoreBar label="Carbon Footprint" score={Math.max(20, analysis.ecoScore - 10)} color="bg-eco-a" />
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                <span className="font-bold text-slate-700">{analysis.carbonFootprint}:</span> {analysis.carbonExplanation}
              </p>
            </div>
            <div>
              <ScoreBar label="Water Usage" score={Math.max(30, analysis.ecoScore - 5)} color="bg-blue-500" />
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                <span className="font-bold text-slate-700">{analysis.waterUsage}:</span> {analysis.waterExplanation}
              </p>
            </div>
            <div>
              <ScoreBar label="Packaging" score={analysis.packagingScore} color="bg-orange-500" />
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                <span className="font-bold text-slate-700">Score {analysis.packagingScore}/100:</span> {analysis.packagingExplanation}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 space-y-4">
            <h3 className="text-xl font-display font-bold flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Key Concerns
            </h3>
            <ul className="space-y-3">
              {analysis.concerns.map((concern, i) => (
                <li key={i} className="flex items-start gap-3 text-slate-600 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                  {concern}
                </li>
              ))}
            </ul>
          </div>

          {analysis.citations && analysis.citations.length > 0 && (
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100 space-y-4">
              <h3 className="text-lg font-display font-bold text-slate-900">Sources & Citations</h3>
              <ul className="space-y-2">
                {analysis.citations.map((cite, i) => (
                  <li key={i} className="text-xs">
                    <a 
                      href={cite.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-eco-a hover:underline flex items-center gap-1"
                    >
                      {cite.title} <ArrowRight className="w-2 h-2" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Alternatives */}
      <div className="space-y-4">
        <h3 className="text-2xl font-display font-bold text-slate-900">Greener Alternatives</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analysis.alternatives.map((alt, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white p-5 rounded-2xl shadow-md border border-slate-100 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-bold text-slate-900 line-clamp-1">{alt.name}</h4>
                  <span className="text-xs font-bold px-2 py-1 bg-eco-a/10 text-eco-a rounded-full">
                    {alt.ecoScore}
                  </span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {alt.reason}
                </p>
              </div>
              {alt.url && (
                <a 
                  href={alt.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-eco-a text-xs font-bold flex items-center gap-1 hover:gap-2 transition-all"
                >
                  View Product <ArrowRight className="w-3 h-3" />
                </a>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
