'use client';

import { motion } from 'framer-motion';

const effectColors: Record<string, string> = {
  reverb: 'bg-blue-900/30 text-blue-200 border-blue-700/30',
  delay: 'bg-purple-900/30 text-purple-200 border-purple-700/30',
  chorus: 'bg-cyan-900/30 text-cyan-200 border-cyan-700/30',
  distortion: 'bg-red-900/30 text-red-200 border-red-700/30',
  overdrive: 'bg-orange-900/30 text-orange-200 border-orange-700/30',
  compression: 'bg-green-900/30 text-green-200 border-green-700/30',
  equalizer: 'bg-yellow-900/30 text-yellow-200 border-yellow-700/30',
  noise_gate: 'bg-slate-900/30 text-slate-200 border-slate-700/30',
  flanger: 'bg-pink-900/30 text-pink-200 border-pink-700/30',
  phaser: 'bg-indigo-900/30 text-indigo-200 border-indigo-700/30',
};

export function EffectBadge({ effect }: { effect: string }) {
  const colorClass = effectColors[effect.toLowerCase()] || 'bg-accent/20 text-accent border-accent/30';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`px-2.5 py-1 rounded text-xs font-medium border ${colorClass}`}
    >
      {effect}
    </motion.div>
  );
}

export function EffectBadgeGroup({ effects }: { effects: string[] }) {
  if (!effects || effects.length === 0) {
    return <span className="text-xs text-muted-foreground">No effects</span>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {effects.map((effect, index) => (
        <motion.div
          key={effect}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
        >
          <EffectBadge effect={effect} />
        </motion.div>
      ))}
    </div>
  );
}
