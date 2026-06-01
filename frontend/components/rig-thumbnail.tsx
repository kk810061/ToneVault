'use client';

import React from 'react';
import { SignalChain } from '@/hooks/useSignalChain';
import { PedalDefinition, AmpDefinition, CabinetDefinition } from '@/hooks/useDefinitions';
import { ChevronRight, Speaker } from 'lucide-react';

interface RigThumbnailProps {
  chain: SignalChain;
  pedalDefinitions: PedalDefinition[];
  ampDefinitions: AmpDefinition[];
  cabinetDefinitions: CabinetDefinition[];
}

const categoryStyles: Record<string, string> = {
  overdrive: 'bg-green-600 border-green-800',
  distortion: 'bg-orange-500 border-orange-700',
  fuzz: 'bg-red-600 border-red-800',
  modulation: 'bg-purple-600 border-purple-800',
  delay: 'bg-teal-600 border-teal-800',
  reverb: 'bg-slate-600 border-slate-800',
  default: 'bg-neutral-600 border-neutral-800',
};

export const RigThumbnail = React.forwardRef<HTMLDivElement, RigThumbnailProps>(
  ({ chain, pedalDefinitions, ampDefinitions, cabinetDefinitions }, ref) => {
    return (
      <div 
        ref={ref}
        className="w-[1200px] h-[500px] bg-neutral-950 border border-neutral-800 flex items-center justify-center p-8 overflow-hidden relative"
      >
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent z-0" />
        
        <div className="flex items-center justify-center gap-6 z-10 w-full px-12">
          {chain.pedals.length === 0 && !chain.amp && !chain.cabinet && (
            <p className="text-neutral-600 font-bold uppercase tracking-widest text-2xl">Empty Rig</p>
          )}

          {chain.pedals.map((pedal) => {
            const def = pedalDefinitions.find(d => d.slug === pedal.definitionSlug);
            if (!def) return null;
            const style = categoryStyles[def.category?.toLowerCase() || 'default'] || categoryStyles.default;
            
            return (
              <React.Fragment key={pedal.id}>
                <div className={`w-32 h-48 rounded-lg border-b-[6px] border-r-[3px] shadow-2xl flex flex-col items-center justify-center p-3 text-center ${style}`}>
                  <div className="w-full flex-1 border-2 border-white/10 rounded flex items-center justify-center p-2 bg-gradient-to-b from-white/10 to-transparent">
                    <span className="text-white font-black uppercase text-sm leading-tight drop-shadow-md">
                      {def.name}
                    </span>
                  </div>
                  <div className="w-4 h-4 rounded-full bg-red-500/80 mt-4 border border-black/50 shadow-[0_0_10px_rgba(255,0,0,0.5)]"></div>
                </div>
                <ChevronRight className="w-10 h-10 text-neutral-800 shrink-0" />
              </React.Fragment>
            );
          })}

          {chain.amp && (
            <React.Fragment>
              <div className="w-56 h-32 bg-zinc-900 border-b-[6px] border-zinc-950 rounded shadow-2xl flex flex-col items-center justify-center p-4">
                 <div className="w-full h-full border border-white/5 rounded flex items-center justify-center bg-gradient-to-b from-zinc-800/50 to-transparent">
                    <span className="text-white/80 font-bold uppercase text-lg text-center leading-tight">
                      {ampDefinitions.find(d => d.slug === chain.amp!.definitionSlug)?.name || 'AMP'}
                    </span>
                 </div>
              </div>
              {chain.cabinet && (
                <ChevronRight className="w-10 h-10 text-neutral-800 shrink-0" />
              )}
            </React.Fragment>
          )}

          {chain.cabinet && (
            <div className="w-48 h-48 bg-black border-4 border-zinc-900 rounded shadow-2xl flex flex-col items-center justify-center p-2 relative">
               <div className="w-full h-full border-2 border-zinc-800 rounded bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] flex items-center justify-center opacity-80 mix-blend-screen">
                  <Speaker className="w-16 h-16 text-white/20" />
               </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);
RigThumbnail.displayName = 'RigThumbnail';
