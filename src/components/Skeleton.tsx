import { motion } from "motion/react";

export function Skeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      <div className="bg-white rounded-3xl p-8 h-48 flex gap-8">
        <div className="w-24 h-24 bg-slate-200 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-4 py-2">
          <div className="h-8 bg-slate-200 rounded-lg w-1/2" />
          <div className="h-4 bg-slate-200 rounded-lg w-1/4" />
          <div className="h-16 bg-slate-100 rounded-xl w-full" />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 h-64 space-y-6">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="space-y-4">
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-full" />
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 h-64 space-y-6">
          <div className="h-6 bg-slate-200 rounded w-1/3" />
          <div className="space-y-4">
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
