'use client';

import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface RotaryKnobProps {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  label?: string;
  compact?: boolean;
  disabled?: boolean;
  lightTheme?: boolean;
}

export function RotaryKnob({
  value,
  min,
  max,
  onChange,
  label,
  compact = false,
  disabled = false,
  lightTheme = false,
}: RotaryKnobProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Calculate rotation angle (0-360 degrees)
  const percentage = (value - min) / (max - min);
  // Using 270 degree arc from -135 to +135
  const rotation = percentage * 270 - 135;

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;

      let angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
      angle = (angle + 90 + 360) % 360;

      // Map to knob range (-135 to 135 degrees)
      let knobAngle = angle > 180 ? angle - 360 : angle;
      
      if (knobAngle < -135) knobAngle = -135;
      if (knobAngle > 135) knobAngle = 135;

      // Convert back to value
      const newPercentage = (knobAngle + 135) / 270;
      const newValue = Math.round(min + newPercentage * (max - min));
      onChange(Math.max(min, Math.min(max, newValue)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, min, max, onChange]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (disabled) return;
      e.preventDefault(); // This will now correctly prevent page scroll
      const delta = e.deltaY > 0 ? -1 : 1;
      const step = (max - min) > 100 ? Math.round((max - min) / 100) : 1;
      const newValue = value + delta * step;
      onChange(Math.max(min, Math.min(max, newValue)));
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [value, min, max, disabled, onChange]);

  const sizeClass = compact ? 'w-12 h-12' : 'w-16 h-16';
  const radius = compact ? 20 : 28;
  const circumference = 2 * Math.PI * radius;
  // 270 degrees is 75% of the circle
  const arcLength = circumference * 0.75;
  const strokeDashoffset = arcLength - (percentage * arcLength);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={containerRef}
        className={`${sizeClass} relative select-none flex items-center justify-center group`}
        onMouseDown={(e) => {
          if (!disabled && e.button === 0) setIsDragging(true);
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Outer Bevel / Housing */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br from-neutral-800 to-neutral-950 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_8px_rgba(0,0,0,0.5)] flex items-center justify-center border border-black ${disabled ? 'opacity-50 grayscale' : ''}`}>
          
          {/* Tick marks ring */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md" viewBox="0 0 100 100" style={{ transform: 'rotate(135deg)' }}>
            {/* Background Track */}
            <circle
              cx="50"
              cy="50"
              r={compact ? "42" : "40"}
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="4"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeLinecap="round"
            />
            {/* Active Glow Track */}
            <circle
              cx="50"
              cy="50"
              r={compact ? "42" : "40"}
              fill="none"
              stroke={isHovering && !disabled ? "rgba(255, 107, 0, 0.8)" : "rgba(255, 107, 0, 0.5)"}
              strokeWidth="4"
              strokeDasharray={`${arcLength} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-100"
              style={{ filter: isHovering && !disabled ? 'drop-shadow(0 0 4px rgba(255,107,0,0.8))' : 'none' }}
            />
          </svg>

          {/* Actual Knob Body */}
          <motion.div
            className={`w-[80%] h-[80%] rounded-full relative shadow-[0_4px_10px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)] flex items-center justify-center cursor-grab active:cursor-grabbing ${isDragging ? 'bg-gradient-to-b from-neutral-700 to-neutral-900' : 'bg-gradient-to-b from-neutral-600 to-neutral-800'}`}
            animate={{ scale: isHovering && !disabled ? 1.02 : 1 }}
            transition={{ duration: 0.15 }}
          >
            {/* Inner brushed metal texture (simulated with radial gradient) */}
            <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.1)_0%,_rgba(0,0,0,0.3)_100%)] mix-blend-overlay"></div>
            
            {/* Center dot/cap */}
            <div className="w-1/3 h-1/3 rounded-full bg-gradient-to-br from-neutral-900 to-black shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"></div>

            {/* Rotatable Indicator Wrapper (Centered) */}
            <motion.div
              className="absolute inset-0 flex justify-center pointer-events-none"
              style={{ rotate: rotation }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              {/* The indicator line */}
              <div className={`w-[2px] ${compact ? 'h-2.5 mt-1' : 'h-3.5 mt-1.5'} bg-accent rounded-full shadow-[0_0_5px_rgba(255,107,0,0.8)]`} />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Label and Value */}
      <div className="flex flex-col items-center">
        {label && (
          <label className={`text-[10px] uppercase font-bold tracking-widest whitespace-nowrap mb-0.5 ${lightTheme ? 'text-black/60' : 'text-neutral-400 drop-shadow-sm'}`}>
            {label}
          </label>
        )}
        <div className={`font-mono text-xs font-semibold transition-colors ${lightTheme ? (isHovering ? 'text-orange-600' : 'text-black/70 drop-shadow-none') : (isHovering ? 'text-accent' : 'text-neutral-300 drop-shadow-md')}`}>
          {value}
        </div>
      </div>
    </div>
  );
}
