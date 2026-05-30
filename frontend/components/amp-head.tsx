'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { renderControl, ControlValue } from '@/lib/control-renderer';
import { AmpDefinition } from '@/hooks/useDefinitions';

interface AmpHeadProps {
  definition: AmpDefinition;
  controlValues: ControlValue;
  onControlChange: (controlId: string, value: number | string | boolean) => void;
  isSelected?: boolean;
}

export function AmpHead({
  definition,
  controlValues,
  onControlChange,
  isSelected = false,
}: AmpHeadProps) {
  // Group controls by type for better layout
  const knobs = definition.controls.filter((c) => c.type === 'knob');
  const other = definition.controls.filter((c) => c.type !== 'knob');
  
  // Determine if it's a "modern" or "vintage" style based on category
  const isModern = definition.category?.toLowerCase() === 'high gain';

  return (
    <motion.div
      className={`relative w-full rounded-md border-t border-l border-r-2 border-b-4 transition-all mx-auto overflow-hidden shadow-2xl ${
        isSelected ? 'border-accent shadow-[0_30px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(255,107,0,0.3)]' : 'border-neutral-900 shadow-[0_30px_50px_rgba(0,0,0,0.8)]'
      }`}
      style={{
        backgroundColor: '#111',
        backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-leather.png')",
        minHeight: '280px'
      }}
      layout
    >
      {/* Tolex Texture and Amp Body Padding */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
      
      {/* Chrome corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-zinc-400 rounded-tl-md shadow-lg" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-zinc-400 rounded-tr-md shadow-lg" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-zinc-400 rounded-bl-md shadow-lg" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-zinc-400 rounded-br-md shadow-lg" />

      {/* Main Faceplate */}
      <div className="relative mt-8 mb-4 mx-6 rounded border-2 border-black shadow-[inset_0_5px_15px_rgba(0,0,0,0.8)] overflow-hidden">
        
        {/* Faceplate Metallic Background */}
        <div className={`absolute inset-0 ${
          isModern 
            ? 'bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-900' 
            : 'bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-800'
        }`} />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-40 mix-blend-overlay" />

        <div className="relative p-6 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
          
          {/* Input Jack & Branding */}
          <div className="flex flex-col items-center gap-4 shrink-0">
            <h2 className={`font-black text-2xl uppercase tracking-widest ${isModern ? 'text-zinc-300' : 'text-amber-100'} drop-shadow-md`}>
              {definition.name}
            </h2>
            <div className="w-10 h-10 rounded-full border-4 border-black bg-zinc-800 flex items-center justify-center shadow-inner relative">
               <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)]">
                  <div className="w-3 h-3 rounded-full bg-zinc-900" />
               </div>
               <span className="absolute -bottom-5 text-[8px] font-bold uppercase tracking-widest text-black">Input</span>
            </div>
          </div>

          {/* Controls Section */}
          <div className="flex-1 flex justify-center gap-x-8 gap-y-4 flex-wrap">
            {knobs.map((control) => (
              <div key={control.id} className="flex flex-col items-center">
                {renderControl(
                  control,
                  controlValues[control.id],
                  onControlChange,
                  false
                )}
              </div>
            ))}
          </div>

          {/* Switches and Power Jewel */}
          <div className="flex items-center gap-6 shrink-0 border-l border-black/20 pl-6 shadow-[-1px_0_1px_rgba(255,255,255,0.1)]">
            {other.map((control) => (
              <div key={control.id}>
                {renderControl(
                  control,
                  controlValues[control.id],
                  onControlChange,
                  true
                )}
              </div>
            ))}
            
            <div className="flex flex-col items-center gap-2">
              <div className="relative w-12 h-12">
                {/* Silver Bezel */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-300 to-zinc-600 shadow-[0_4px_6px_rgba(0,0,0,0.6)] border border-black/50 p-1">
                  {/* Glowing Jewel Light */}
                  <div className={`w-full h-full rounded-full shadow-[inset_0_2px_6px_rgba(255,255,255,0.8),0_0_20px_rgba(220,38,38,1)] ${
                    isModern ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,1)]' : 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,1)]'
                  } relative overflow-hidden`} >
                    {/* Jewel facets effect */}
                    <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
                    <div className="absolute top-1 left-2 w-4 h-4 bg-white/50 rounded-full blur-[2px]" />
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-black drop-shadow-[0_1px_0_rgba(255,255,255,0.2)]">Power</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
