"use client";

import dynamic from "next/dynamic";
import React from "react";
import { Loader2 } from "lucide-react";

export const DynamicLocationPicker = dynamic(
  () => import("./LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-64 bg-slate-100 dark:bg-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-400 gap-2 border border-slate-200 dark:border-slate-700 animate-pulse">
        <Loader2 className="w-6 h-6 animate-spin text-brand-500" />
        <span className="text-xs">Loading map picker...</span>
      </div>
    ),
  }
);

export default DynamicLocationPicker;
