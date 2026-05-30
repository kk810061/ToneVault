import React from 'react';
import { RotaryKnob } from '@/components/rotary-knob';
import { ToggleSwitch } from '@/components/toggle-switch';

export interface ControlDefinition {
  id: string;
  name: string;
  type: 'knob' | 'toggle' | 'enum' | 'footswitch';
  min?: number;
  max?: number;
  default?: number;
  values?: Array<{ label: string; value: string | number }>;
  value?: number | string | boolean;
}

export interface ControlValue {
  [controlId: string]: number | string | boolean;
}

interface ControlRendererProps {
  control: ControlDefinition;
  value: number | string | boolean | undefined;
  onChange: (controlId: string, value: number | string | boolean) => void;
  compact?: boolean;
}

export function renderControl(
  control: ControlDefinition,
  value: number | string | boolean | undefined,
  onChange: (controlId: string, value: number | string | boolean) => void,
  compact: boolean = false
): React.ReactNode {
  const currentValue = value !== undefined ? value : control.default ?? 0;

  switch (control.type) {
    case 'knob':
      return (
        <div key={control.id} className="flex flex-col items-center gap-2">
          <RotaryKnob
            value={typeof currentValue === 'number' ? currentValue : 0}
            min={control.min ?? 0}
            max={control.max ?? 100}
            onChange={(val) => onChange(control.id, val)}
            label={control.name}
            compact={compact}
          />
        </div>
      );

    case 'toggle':
    case 'footswitch':
      return (
        <div key={control.id} className="flex flex-col items-center gap-2">
          <ToggleSwitch
            value={typeof currentValue === 'boolean' ? currentValue : false}
            onChange={(val) => onChange(control.id, val)}
            label={control.name}
            compact={compact}
          />
        </div>
      );

    case 'enum':
      return (
        <div key={control.id} className="flex flex-col gap-1">
          <label className="text-xs uppercase font-semibold text-muted-foreground">
            {control.name}
          </label>
          <select
            value={String(currentValue)}
            onChange={(e) => onChange(control.id, e.target.value)}
            className="w-full px-2 py-1.5 bg-card border border-border rounded text-sm text-foreground hover:border-accent/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30 transition-colors"
          >
            {control.values?.map((opt) => (
              <option key={opt.value} value={String(opt.value)}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    default:
      return null;
  }
}

export function ControlRenderer({
  control,
  value,
  onChange,
  compact = false,
}: ControlRendererProps) {
  return <>{renderControl(control, value, onChange, compact)}</>;
}
