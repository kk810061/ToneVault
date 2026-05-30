'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { renderControl, ControlValue } from '@/lib/control-renderer';
import { PedalDefinition } from '@/hooks/useDefinitions';
import { Power } from 'lucide-react';

interface PedalProps {
  definition: PedalDefinition;
  controlValues: ControlValue;
  onControlChange: (controlId: string, value: number | string | boolean) => void;
  bypassed?: boolean;
  onBypassChange?: (bypassed: boolean) => void;
  isSelected?: boolean;
}

const categoryStyles: Record<string, string> = {
  overdrive: 'from-green-600 to-green-900 border-green-700 shadow-green-900/50',
  distortion: 'from-orange-500 to-orange-800 border-orange-600 shadow-orange-900/50',
  fuzz: 'from-red-600 to-red-950 border-red-700 shadow-red-900/50',
  modulation: 'from-purple-600 to-purple-900 border-purple-700 shadow-purple-900/50',
  delay: 'from-teal-600 to-teal-900 border-teal-700 shadow-teal-900/50',
  reverb: 'from-slate-600 to-slate-900 border-slate-700 shadow-slate-900/50',
  default: 'from-neutral-600 to-neutral-900 border-neutral-700 shadow-neutral-900/50',
};

export function Pedal({
  definition,
  controlValues,
  onControlChange,
  bypassed = false,
  onBypassChange,
  isSelected = false,
}: PedalProps) {
  const categoryLower = definition.category?.toLowerCase() ?? 'default';
  const styleClass = categoryStyles[categoryLower] || categoryStyles.default;
  const isWide = definition.controls.length > 4;

  return (
    <motion.div
      className={`relative ${isWide ? 'w-[560px]' : 'w-80'} min-h-[480px] flex flex-col items-center justify-between rounded-xl border-t-2 border-l-2 border-r-[4px] border-b-[6px] transition-all bg-gradient-to-b ${styleClass} p-6 shadow-2xl mx-auto`}
      style={{
        boxShadow: isSelected 
          ? '0 20px 40px rgba(0,0,0,0.8), inset 0 2px 5px rgba(255,255,255,0.2), 0 0 30px rgba(255, 107, 0, 0.4)' 
          : '0 20px 40px rgba(0,0,0,0.8), inset 0 2px 5px rgba(255,255,255,0.2)',
      }}
      layout
    >
      {/* Metallic Texture Overlay */}
      <div className="absolute inset-0 rounded-lg bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-20 mix-blend-overlay pointer-events-none" />
      
      {/* Top Jacks (Skeuomorphic) */}
      <div className="absolute -top-3 left-12 w-6 h-4 bg-zinc-800 rounded-t-sm border-t border-zinc-600 shadow-inner" />
      <div className="absolute -top-3 right-12 w-6 h-4 bg-zinc-800 rounded-t-sm border-t border-zinc-600 shadow-inner" />
      
      {/* Bypass Overlay Darkening */}
      <div className={`absolute inset-0 bg-black/40 rounded-lg transition-opacity duration-300 pointer-events-none ${bypassed ? 'opacity-100' : 'opacity-0 z-0'}`} />

      {/* Header and Branding */}
      <div className="w-full flex flex-col items-center text-center relative z-10 mb-8 mt-2">
        <h3 className="font-black text-2xl uppercase tracking-widest text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
          {definition.name}
        </h3>
        <div className="w-16 h-0.5 bg-white/20 my-2 rounded-full" />
        <p className="text-[10px] font-bold text-white/60 uppercase tracking-[0.3em]">
          {definition.category}
        </p>
      </div>

      {/* Controls Grid */}
      <div className="flex-1 w-full flex flex-col justify-center relative z-10 my-4">
        <div className={`grid ${isWide ? 'grid-cols-4 gap-x-8' : 'grid-cols-2 gap-x-4'} gap-y-10 justify-items-center w-full max-w-lg mx-auto`}>
          {definition.controls.map((control) => (
            <div key={control.id} className={`${control.type === 'enum' ? 'col-span-2 w-full px-4' : ''}`}>
              {renderControl(
                control,
                controlValues[control.id],
                onControlChange,
                false
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footswitch Section */}
      <div className="w-full flex flex-col items-center mt-12 mb-4 relative z-10">
        {onBypassChange && (
          <div className="flex flex-col items-center gap-4">
            {/* LED Status Light */}
            <div className="relative w-4 h-4">
              <div className={`absolute inset-0 rounded-full transition-all duration-300 border-2 border-black/80 ${
                bypassed 
                  ? 'bg-neutral-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]' 
                  : 'bg-red-500 shadow-[0_0_15px_3px_rgba(255,0,0,0.9),inset_0_1px_2px_rgba(255,255,255,0.5)]'
              }`} />
            </div>

            {/* Heavy Physical Footswitch */}
            <motion.button
              onClick={() => onBypassChange(!bypassed)}
              className="relative w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-b from-zinc-200 to-zinc-400 border border-zinc-500 shadow-[0_8px_10px_rgba(0,0,0,0.6),inset_0_2px_3px_rgba(255,255,255,0.8)] group outline-none"
              whileTap={{ scale: 0.95, y: 4, boxShadow: "0 2px 4px rgba(0,0,0,0.6), inset 0 2px 3px rgba(255,255,255,0.8)" }}
            >
              {/* Switch Nut / Rings */}
              <div className="absolute w-20 h-20 rounded-full border-4 border-zinc-800/20 -z-10 shadow-inner" />
              <div className="absolute w-24 h-24 rounded-full border-2 border-black/10 -z-20" />
              
              <Power className="w-6 h-6 text-zinc-600 group-hover:text-zinc-800 transition-colors" />
            </motion.button>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/50 mt-2">Bypass</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
