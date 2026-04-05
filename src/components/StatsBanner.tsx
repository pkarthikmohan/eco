import { ShieldCheck, TrendingDown } from "lucide-react";
import { AppStats } from "../types";

interface StatsBannerProps {
  stats: AppStats;
}

export function StatsBanner({ stats }: StatsBannerProps) {
  return (
    <div className="flex flex-wrap justify-center gap-4 md:gap-8 py-6 px-4 bg-white/50 backdrop-blur-sm rounded-3xl border border-white/20 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-eco-a/10 flex items-center justify-center text-eco-a">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-display font-bold text-slate-900">{stats.productsChecked}</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Products Checked</p>
        </div>
      </div>
      
      <div className="w-px h-10 bg-slate-200 hidden md:block" />
      
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
          <TrendingDown className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-display font-bold text-slate-900">{stats.co2Saved.toFixed(1)}kg</p>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">CO₂ Saved Est.</p>
        </div>
      </div>
    </div>
  );
}
