'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { EffectBadgeGroup } from './effect-badge';

interface ToneCardProps {
  id: string;
  title: string;
  artistInspiredBy: string;
  genre: string;
  amp: string;
  creator: {
    id: string;
    username: string;
    avatar?: string;
  };
  thumbnailUrl?: string;
  effects?: string[];
  index?: number;
}

export function ToneCard({
  id,
  title,
  artistInspiredBy,
  genre,
  amp,
  creator,
  thumbnailUrl,
  effects = [],
  index = 0,
}: ToneCardProps) {
  return (
    <Link href={`/tones/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(255, 107, 0, 0.15)' }}
        className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent/50 transition-all cursor-pointer group h-full flex flex-col"
      >
        {/* Dynamic Vector Thumbnail Header */}
        <div className="w-full h-32 bg-black border-b border-border relative flex items-center justify-center overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent z-0 pointer-events-none" />
          
          <div className="flex items-center justify-center gap-1.5 z-10 w-full px-4" style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
            {effects && effects.slice(0, 5).map((effect, idx) => {
              // Determine category color based on effect name
              const name = effect.toLowerCase();
              let style = 'bg-neutral-600 border-neutral-800';
              if (name.includes('overdrive') || name.includes('screamer') || name.includes('centaur') || name.includes('sd-1') || name.includes('ts9')) style = 'bg-green-600 border-green-800';
              else if (name.includes('distortion') || name.includes('ds-1') || name.includes('rat')) style = 'bg-orange-500 border-orange-700';
              else if (name.includes('fuzz') || name.includes('muff')) style = 'bg-red-600 border-red-800';
              else if (name.includes('chorus') || name.includes('flanger') || name.includes('phaser') || name.includes('ce-2') || name.includes('mod')) style = 'bg-purple-600 border-purple-800';
              else if (name.includes('delay') || name.includes('copy') || name.includes('dd-3') || name.includes('echo')) style = 'bg-teal-600 border-teal-800';
              else if (name.includes('reverb') || name.includes('rv-6') || name.includes('hall')) style = 'bg-slate-600 border-slate-800';

              return (
                <div key={idx} className={`w-10 h-16 rounded border-b-2 border-r shadow-lg flex flex-col items-center justify-between py-1 px-0.5 ${style}`}>
                   <div className="w-full bg-black/20 rounded-[1px] h-3"></div>
                   <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_4px_rgba(255,0,0,0.8)] mt-auto mb-1"></div>
                </div>
              );
            })}

            {(!effects || effects.length === 0) && !amp && (
              <span className="text-muted-foreground/30 font-bold uppercase tracking-widest text-xs">Empty Rig</span>
            )}

            {amp && (
              <div className="w-20 h-12 bg-zinc-900 rounded border-b-2 border-r border-zinc-950 shadow-lg ml-1 flex items-center justify-center">
                 <div className="w-[90%] h-[70%] border border-white/5 bg-zinc-800/50 rounded-[1px]"></div>
              </div>
            )}
            
            {amp && (
              <div className="w-16 h-16 bg-black rounded border-2 border-zinc-900 shadow-lg ml-1 flex items-center justify-center overflow-hidden relative">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-60 mix-blend-screen"></div>
                 <div className="w-6 h-6 rounded-full border border-white/10 bg-black/50 z-10"></div>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          {/* Header */}
          <div className="space-y-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Inspired by <span className="text-accent font-medium">{artistInspiredBy}</span>
            </p>
          </div>

          {/* Genre and Amp */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
              {genre}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
              {amp}
            </span>
          </div>
        </div>

        {/* Effects */}
        {effects && effects.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Effects</p>
            <div className="flex flex-wrap gap-1.5">
              {effects.slice(0, 3).map((effect) => (
                <span
                  key={effect}
                  className="px-2 py-1 rounded text-xs font-medium bg-muted/50 text-muted-foreground border border-border/50"
                >
                  {effect}
                </span>
              ))}
              {effects.length > 3 && (
                <span className="px-2 py-1 rounded text-xs font-medium text-muted-foreground">
                  +{effects.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Creator */}
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          {creator.avatar && (
            <img
              src={creator.avatar}
              alt={creator.username}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-xs text-muted-foreground">By {creator.username}</span>
        </div>
        </div>
      </motion.div>
    </Link>
  );
}

export function ToneCardGrid({ tones, isLoading }: { tones: ToneCardProps[]; isLoading?: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tones.map((tone, index) => (
        <ToneCard key={tone.id} {...tone} index={index} />
      ))}
    </div>
  );
}
