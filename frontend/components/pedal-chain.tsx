'use client';

import { motion } from 'framer-motion';

interface Pedal {
  name: string;
  color?: string;
}

export function PedalChain({ effects }: { effects: string[] }) {
  if (!effects || effects.length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground text-sm py-4">
        <span>No effects in chain</span>
      </div>
    );
  }

  const pedals = effects.map((effect) => ({
    name: effect,
    color: getEffectColor(effect),
  }));

  return (
    <div className="flex items-center gap-3 py-4 overflow-x-auto pb-2">
      <div className="text-xs font-semibold text-muted-foreground px-2">CHAIN:</div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3"
      >
        {pedals.map((pedal, index) => (
          <motion.div
            key={pedal.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3"
          >
            <div
              className={`w-12 h-20 rounded border-2 flex items-center justify-center text-xs font-mono text-center px-1 flex-shrink-0 hover:shadow-lg hover:shadow-accent/20 transition-shadow ${pedal.color}`}
            >
              <span className="text-xs leading-tight">{pedal.name.slice(0, 6)}</span>
            </div>

            {index < pedals.length - 1 && (
              <motion.svg
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.05 }}
                className="w-6 h-1 text-muted flex-shrink-0"
                viewBox="0 0 24 4"
              >
                <line
                  x1="0"
                  y1="2"
                  x2="24"
                  y2="2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                />
              </motion.svg>
            )}
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

function getEffectColor(effect: string): string {
  const colors: Record<string, string> = {
    reverb: 'bg-blue-900/40 border-blue-600 text-blue-100',
    delay: 'bg-purple-900/40 border-purple-600 text-purple-100',
    chorus: 'bg-cyan-900/40 border-cyan-600 text-cyan-100',
    distortion: 'bg-red-900/40 border-red-600 text-red-100',
    overdrive: 'bg-orange-900/40 border-orange-600 text-orange-100',
    compression: 'bg-green-900/40 border-green-600 text-green-100',
    equalizer: 'bg-yellow-900/40 border-yellow-600 text-yellow-100',
    noise_gate: 'bg-slate-900/40 border-slate-600 text-slate-100',
    flanger: 'bg-pink-900/40 border-pink-600 text-pink-100',
    phaser: 'bg-indigo-900/40 border-indigo-600 text-indigo-100',
  };

  return colors[effect.toLowerCase()] || 'bg-accent/20 border-accent text-accent';
}
