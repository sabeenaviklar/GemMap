"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Loader2 } from "lucide-react";

export const DynamicMap = dynamic(() => import("./InteractiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-200 dark:border-slate-800 animate-pulse">
      <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      <span className="text-xs font-medium">Loading interactive city map...</span>
    </div>
  ),
});

export default DynamicMap;
