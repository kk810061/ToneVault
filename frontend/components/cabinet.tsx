'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CabinetDefinition } from '@/hooks/useDefinitions';

interface CabinetProps {
  definition: CabinetDefinition;
  isSelected?: boolean;
}

export function Cabinet({ definition, isSelected = false }: CabinetProps) {
  const speakerCount = definition.speakers || 1;
  const size = definition.size || '1x12';

  // Calculate grid layout based on speaker count
  const gridClass = {
    1: 'grid-cols-1 grid-rows-1',
    2: 'grid-cols-2 grid-rows-1',
    4: 'grid-cols-2 grid-rows-2',
  }[speakerCount] || 'grid-cols-2 grid-rows-2';

  return (
    <motion.div
      className={`w-full max-w-[1000px] rounded-md border-2 transition-all mx-auto overflow-hidden shadow-2xl relative ${
        isSelected ? 'border-accent shadow-[0_30px_50px_rgba(0,0,0,0.8),0_0_40px_rgba(255,107,0,0.3)]' : 'border-neutral-900 shadow-[0_30px_50px_rgba(0,0,0,0.8)]'
      }`}
      style={{
        backgroundColor: '#111',
        backgroundImage: "url('https://www.transparenttextures.com/patterns/dark-leather.png')",
        minHeight: '480px',
        width: '100%',
        maxWidth: '1000px'
      }}
      layout
    >
      {/* Tolex Texture and Cabinet Body */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />
      
      {/* Chrome corners */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-zinc-500 rounded-tl-md shadow-lg" />
      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-zinc-500 rounded-tr-md shadow-lg" />
      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-zinc-500 rounded-bl-md shadow-lg" />
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-zinc-500 rounded-br-md shadow-lg" />

      {/* Main Grill Area (Baffle) with Gold Piping */}
      <div className="absolute inset-4 rounded-sm border-[4px] border-zinc-900 bg-neutral-900 overflow-hidden shadow-[inset_0_20px_40px_rgba(0,0,0,1)] ring-[3px] ring-amber-600/40">
        
        {/* Speakers Layer (Behind Grill) */}
        <div className={`absolute inset-0 p-8 grid ${gridClass} gap-8 items-center justify-items-center opacity-90 mix-blend-screen`}>
          {Array.from({ length: speakerCount }).map((_, i) => (
            <motion.div
              key={i}
              className="w-full aspect-square max-w-[200px] rounded-full flex items-center justify-center relative bg-gradient-to-br from-zinc-700 to-black shadow-[inset_0_10px_30px_rgba(0,0,0,1),0_0_20px_rgba(0,0,0,0.8)]"
              animate={{
                scale: isSelected ? [1, 1.01, 1] : 1,
              }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              {/* Speaker Ribs */}
              <div className="absolute inset-2 rounded-full border-2 border-zinc-500/30 bg-gradient-to-b from-transparent to-black/50" />
              
              {/* Speaker Cone (Brighter silver) */}
              <div className="w-3/4 h-3/4 rounded-full border border-zinc-500/50 bg-gradient-to-t from-zinc-600 to-zinc-900 flex items-center justify-center shadow-[inset_0_5px_15px_rgba(0,0,0,1)]">
                {/* Speaker Dust Cap */}
                <div className="w-1/3 h-1/3 rounded-full border border-zinc-400/50 bg-gradient-to-br from-zinc-500 to-zinc-800 shadow-[0_5px_10px_rgba(0,0,0,0.8)]" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Woven Grill Cloth Overlay (Vintage Tan/Grey) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-90"
          style={{
            backgroundImage: "url('https://www.transparenttextures.com/patterns/woven-light.png')",
            backgroundColor: 'rgba(110, 100, 90, 0.7)',
            backgroundSize: '12px 12px',
            mixBlendMode: 'multiply'
          }}
        />

        {/* Brand Logo Plate */}
        <div className="absolute bottom-6 right-8 px-4 py-1.5 bg-gradient-to-b from-zinc-200 to-zinc-400 rounded border border-zinc-500 shadow-[0_4px_10px_rgba(0,0,0,0.8)]">
          <span className="font-serif italic font-bold text-lg text-zinc-900 drop-shadow-md">
            ToneVault
          </span>
        </div>
      </div>

      {/* Cabinet Info Header */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 px-4 py-1 bg-black/80 rounded border border-zinc-800 backdrop-blur text-center z-10 shadow-md">
        <h3 className="font-bold text-sm uppercase tracking-widest text-zinc-300">
          {definition.name}
        </h3>
        <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
          {size} • {speakerCount}x12 • {definition.type}
        </p>
      </div>

    </motion.div>
  );
}
