'use client';

import { motion } from 'framer-motion';

interface AmpSettings {
  amp: string;
  cabinet: string;
  gain: number;
  bass: number;
  mids: number;
  treble: number;
  presence: number;
}

export function AmpDisplay({ settings }: { settings: AmpSettings }) {
  const knobs = [
    { label: 'Gain', value: settings.gain, max: 100 },
    { label: 'Bass', value: settings.bass, max: 100 },
    { label: 'Mids', value: settings.mids, max: 100 },
    { label: 'Treble', value: settings.treble, max: 100 },
    { label: 'Presence', value: settings.presence, max: 100 },
  ];

  return (
    <div className="space-y-6">
      {/* Amp Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">AMPLIFIER</p>
            <p className="text-lg font-mono text-accent">{settings.amp}</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">CABINET</p>
            <p className="text-lg font-mono text-accent">{settings.cabinet}</p>
          </div>
        </div>
      </motion.div>

      {/* Knobs Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card border border-border rounded-lg p-6"
      >
        <p className="text-xs font-semibold text-muted-foreground mb-6">AMP SETTINGS</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {knobs.map((knob, index) => (
            <motion.div
              key={knob.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center gap-3"
            >
              <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-accent/30 bg-muted/50 flex items-center justify-center">
                <motion.div
                  initial={{ rotate: 0 }}
                  animate={{ rotate: (knob.value / knob.max) * 270 - 135 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="absolute w-1 h-6 md:h-8 bg-accent rounded-full origin-bottom" />
                </motion.div>

                <div className="text-xs md:text-sm font-bold text-foreground z-10">
                  {knob.value}
                </div>
              </div>

              <div className="text-xs font-semibold text-muted-foreground text-center">
                {knob.label}
              </div>

              <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(knob.value / knob.max) * 100}%` }}
                  transition={{ type: 'spring', stiffness: 100 }}
                  className="h-full bg-accent rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
