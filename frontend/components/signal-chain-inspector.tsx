'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { renderControl, ControlValue } from '@/lib/control-renderer';
import { PedalDefinition, AmpDefinition, CabinetDefinition } from '@/hooks/useDefinitions';
import { X } from 'lucide-react';

interface SignalChainInspectorProps {
  selectedType: 'pedal' | 'amp' | 'cabinet' | null;
  selectedDefinition: PedalDefinition | AmpDefinition | CabinetDefinition | null;
  selectedPedalId?: string;
  controlValues?: ControlValue;
  onControlChange?: (controlId: string, value: number | string | boolean) => void;
  onBypassChange?: (bypassed: boolean) => void;
  onRemove?: () => void;
  bypassed?: boolean;
}

export function SignalChainInspector({
  selectedType,
  selectedDefinition,
  selectedPedalId,
  controlValues = {},
  onControlChange,
  onBypassChange,
  onRemove,
  bypassed = false,
}: SignalChainInspectorProps) {
  if (!selectedDefinition || !selectedType) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-center h-full text-muted-foreground"
      >
        <p className="text-center text-sm">Select a pedal or amp to edit</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      key={selectedPedalId || selectedDefinition.slug}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full overflow-y-auto flex flex-col"
    >
      {/* Header */}
      <div className="sticky top-0 bg-card/50 backdrop-blur border-b border-border p-4 flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg uppercase tracking-wide text-foreground">
            {selectedDefinition.name || selectedDefinition.slug}
          </h3>
          <p className="text-xs text-muted-foreground capitalize mt-1">
            {selectedType}
          </p>
        </div>

        {selectedType === 'pedal' && onRemove && (
          <motion.button
            onClick={onRemove}
            className="p-2 hover:bg-destructive/20 rounded text-destructive transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Remove pedal"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-4 space-y-6">
        {/* Bypass Toggle for Pedals */}
        {selectedType === 'pedal' && onBypassChange && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pb-4 border-b border-border/50"
          >
            <button
              onClick={() => onBypassChange(!bypassed)}
              className={`w-full px-4 py-2 rounded border-2 font-semibold uppercase tracking-wide transition-all ${
                bypassed
                  ? 'border-muted bg-muted/10 text-muted-foreground'
                  : 'border-accent bg-accent/10 text-accent hover:bg-accent/20'
              }`}
            >
              {bypassed ? 'Bypass: ON' : 'Bypass: OFF'}
            </button>
          </motion.div>
        )}

        {/* Controls */}
        {selectedType !== 'cabinet' && 'controls' in selectedDefinition && (
          <div className="space-y-4">
            <p className="text-xs uppercase font-semibold text-muted-foreground">Controls</p>
            <div className="space-y-4">
              {selectedDefinition.controls.map((control) => (
                <motion.div
                  key={control.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {onControlChange &&
                    renderControl(
                      control,
                      controlValues[control.id],
                      onControlChange,
                      false
                    )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Cabinet Info */}
        {selectedType === 'cabinet' && 'size' in selectedDefinition && (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs uppercase font-semibold text-muted-foreground mb-1">Size</p>
              <p className="text-foreground">{selectedDefinition.size}</p>
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-muted-foreground mb-1">Speakers</p>
              <p className="text-foreground">{selectedDefinition.speakers}</p>
            </div>
            <div>
              <p className="text-xs uppercase font-semibold text-muted-foreground mb-1">Type</p>
              <p className="text-foreground capitalize">{selectedDefinition.type}</p>
            </div>
          </div>
        )}

        {/* Tone Characteristics for Amps */}
        {selectedType === 'amp' && 'toneCharacteristics' in selectedDefinition && selectedDefinition.toneCharacteristics && (
          <div>
            <p className="text-xs uppercase font-semibold text-muted-foreground mb-2">Tone Characteristics</p>
            <div className="flex flex-wrap gap-2">
              {selectedDefinition.toneCharacteristics.map((char) => (
                <span
                  key={char}
                  className="text-xs px-3 py-1 bg-accent/10 text-accent rounded border border-accent/20"
                >
                  {char}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
