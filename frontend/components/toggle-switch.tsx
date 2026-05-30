'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface ToggleSwitchProps {
  value: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  compact?: boolean;
  disabled?: boolean;
}

export function ToggleSwitch({
  value,
  onChange,
  label,
  compact = false,
  disabled = false,
}: ToggleSwitchProps) {
  const [isHovering, setIsHovering] = useState(false);
  const sizeClass = compact ? 'w-10 h-14' : 'w-12 h-16';

  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        className="flex flex-col items-center justify-center gap-2 cursor-pointer group"
        onClick={() => !disabled && onChange(!value)}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* LED Indicator */}
        <div className="relative w-3 h-3">
          <div className={`absolute inset-0 rounded-full transition-all duration-300 ${value ? 'bg-accent shadow-[0_0_8px_2px_rgba(255,107,0,0.8)]' : 'bg-neutral-800 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]'} border border-black/50`} />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent to-white/30" />
        </div>

        {/* Physical Stomp Switch */}
        <div className={`${sizeClass} relative`}>
          {/* Base plate */}
          <div className="absolute inset-x-2 -bottom-1 h-3 bg-neutral-900 rounded-full blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-b from-neutral-300 to-neutral-600 rounded-lg border border-neutral-700 shadow-[0_4px_8px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden">
            {/* Hex nut detail */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-6 h-2 bg-gradient-to-b from-neutral-200 to-neutral-500 rounded-sm shadow-[inset_0_1px_1px_white,0_1px_2px_rgba(0,0,0,0.5)]" />
            
            {/* The actual switch toggle */}
            <motion.div
              className={`w-4 bg-gradient-to-b from-neutral-100 to-neutral-400 rounded-full shadow-[inset_0_1px_2px_white,-2px_4px_4px_rgba(0,0,0,0.4)] border border-neutral-400`}
              animate={{ 
                y: value ? -6 : 6,
                height: value ? 24 : 20,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            />
            {/* Stomp shadow */}
            <motion.div 
              className="absolute bg-black/20 w-full rounded-full blur-[2px]"
              animate={{ 
                y: value ? 0 : 8,
                height: value ? 12 : 8,
                opacity: value ? 0.3 : 0.6
              }}
              style={{ bottom: 4 }}
            />
          </div>
        </div>
      </div>

      {label && (
        <label className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest text-center whitespace-nowrap drop-shadow-sm cursor-pointer" onClick={() => !disabled && onChange(!value)}>
          {label}
        </label>
      )}
    </div>
  );
}
