'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight, User } from 'lucide-react';

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

// ── Effect colour by category keyword ──
function getPedalStyle(name: string) {
  const n = name.toLowerCase();
  if (n.includes('gate') || n.includes('noise')) return { bg: '#374151', border: '#1f2937' };
  if (n.includes('overdrive') || n.includes('screamer') || n.includes('sd-1') || n.includes('ts9') || n.includes('centaur')) return { bg: '#15803d', border: '#14532d' };
  if (n.includes('distortion') || n.includes('ds-1') || n.includes('rat') || n.includes('fuzz') || n.includes('muff')) return { bg: '#c2410c', border: '#7c2d12' };
  if (n.includes('chorus') || n.includes('flanger') || n.includes('phaser') || n.includes('mod') || n.includes('vibe')) return { bg: '#7c3aed', border: '#4c1d95' };
  if (n.includes('delay') || n.includes('echo') || n.includes('dd-3') || n.includes('copy')) return { bg: '#0f766e', border: '#134e4a' };
  if (n.includes('reverb') || n.includes('hall') || n.includes('rv-6') || n.includes('room')) return { bg: '#475569', border: '#1e293b' };
  if (n.includes('comp') || n.includes('sustain')) return { bg: '#047857', border: '#064e3b' };
  if (n.includes('eq') || n.includes('equaliz')) return { bg: '#b45309', border: '#78350f' };
  if (n.includes('wah') || n.includes('crybaby')) return { bg: '#be185d', border: '#831843' };
  return { bg: '#374151', border: '#1f2937' };
}

function MiniPedal({ name }: { name: string }) {
  const style = getPedalStyle(name);
  return (
    <div
      className="flex flex-col items-center justify-between rounded border-b-2 border-r shadow-md px-0.5 py-1 flex-shrink-0"
      style={{ background: style.bg, borderColor: style.border, width: 28, height: 40 }}
    >
      <div className="w-full bg-black/25 rounded-[1px] h-2" />
      <div className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_3px_rgba(255,80,80,0.9)]" />
    </div>
  );
}

function MiniAmp() {
  return (
    <div
      className="flex flex-col items-center justify-center rounded border-b-2 border-r shadow-md px-1"
      style={{ background: '#27272a', borderColor: '#18181b', width: 44, height: 28 }}
    >
      <div className="w-full h-2.5 border border-white/5 bg-zinc-800/50 rounded-[1px]" />
    </div>
  );
}

function SignalChainPreview({ effects, amp }: { effects: string[]; amp: string }) {
  const items = effects.slice(0, 5);
  const showAmp = !!amp;

  if (items.length === 0 && !showAmp) {
    return (
      <div className="flex items-center justify-center h-full">
        <span className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest">Empty Rig</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-1 h-full px-2">
      {items.map((effect, i) => (
        <div key={i} className="flex items-center gap-1">
          <MiniPedal name={effect} />
          {(i < items.length - 1 || showAmp) && (
            <ChevronRight className="w-2.5 h-2.5 text-white/10 flex-shrink-0" />
          )}
        </div>
      ))}
      {showAmp && <MiniAmp />}
    </div>
  );
}

export function ToneCard({
  id,
  title,
  artistInspiredBy,
  genre,
  amp,
  creator,
  effects = [],
  index = 0,
}: ToneCardProps) {
  // Text chain: "Gate → OD → Amp → Delay"
  const chainText = [
    ...effects.slice(0, 3),
    amp ? amp.split(' ')[0] : null,
  ]
    .filter(Boolean)
    .join(' → ');

  return (
    <Link href={`/tones/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        whileHover={{
          y: -5,
          boxShadow: '0 20px 48px -8px rgba(255,107,0,0.18)',
        }}
        className="
          relative bg-card border border-border rounded-lg overflow-hidden
          hover:border-accent/35 transition-colors cursor-pointer group
          h-full flex flex-col
        "
      >
        {/* Accent left-border on hover */}
        <motion.div
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-accent rounded-full"
          initial={{ scaleY: 0, opacity: 0 }}
          whileHover={{ scaleY: 1, opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{ transformOrigin: 'bottom' }}
        />

        {/* Signal chain preview strip */}
        <div className="w-full h-[72px] bg-black border-b border-border/60 relative flex items-center overflow-hidden">
          <div className="absolute inset-0 tv-grid-bg" />
          <div className="absolute inset-0 bg-gradient-to-t from-card/60 via-transparent to-transparent pointer-events-none z-0" />
          <div className="relative z-10 w-full">
            <SignalChainPreview effects={effects} amp={amp} />
          </div>
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          {/* Genre chip */}
          <div className="flex items-center gap-2 mb-2.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-accent/10 text-accent border border-accent/20 uppercase tracking-wide">
              {genre}
            </span>
            {amp && (
              <span className="text-[11px] text-muted-foreground truncate max-w-[120px]">{amp}</span>
            )}
          </div>

          {/* Title */}
          <h3 className="tv-card-title group-hover:text-accent transition-colors line-clamp-2 mb-1">
            {title}
          </h3>

          {/* Artist */}
          {artistInspiredBy && (
            <p className="tv-meta mb-3">
              Inspired by{' '}
              <span className="text-accent/90 font-medium">{artistInspiredBy}</span>
            </p>
          )}

          {/* Chain text */}
          {chainText && (
            <p className="text-[10px] font-mono text-muted-foreground/50 mb-3 truncate">
              {chainText}
            </p>
          )}

          {/* Creator */}
          <div className="flex items-center gap-1.5 pt-2.5 border-t border-border/50 mt-auto">
            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              {creator.avatar ? (
                <img src={creator.avatar} alt={creator.username} className="w-4 h-4 rounded-full object-cover" />
              ) : (
                <User className="w-2.5 h-2.5 text-muted-foreground" />
              )}
            </div>
            <span className="tv-meta">{creator.username}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

export function ToneCardGrid({ tones }: { tones: ToneCardProps[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tones.map((tone, index) => (
        <ToneCard key={tone.id} {...tone} index={index} />
      ))}
    </div>
  );
}
