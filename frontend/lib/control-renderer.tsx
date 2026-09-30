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
  lightTheme?: boolean;
}

export function renderControl(
  control: ControlDefinition,
  value: number | string | boolean | undefined,
  onChange: (controlId: string, value: number | string | boolean) => void,
  compact: boolean = false,
  lightTheme: boolean = false,
  readOnly: boolean = false
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
            lightTheme={lightTheme}
            readOnly={readOnly}
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
            lightTheme={lightTheme}
          />
        </div>
      );

    case 'enum':
      return (
        <div key={control.id} className="flex flex-col items-center gap-2">
          <label className={`text-[10px] uppercase font-bold tracking-widest text-center ${lightTheme ? 'text-black/60' : 'text-muted-foreground'}`}>
            {control.name}
          </label>
          <div className="flex bg-neutral-900 border border-black rounded shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] p-1 max-w-[220px] overflow-x-auto custom-scrollbar">
            {control.values?.map((opt) => {
              const isSelected = String(currentValue) === String(opt.value);
              return (
                <button
                  key={opt.value}
                  onClick={() => onChange(control.id, opt.value)}
                  className={`flex-1 px-4 py-1.5 text-[9px] uppercase font-bold whitespace-nowrap transition-all rounded-sm ${
                    isSelected
                      ? 'bg-gradient-to-b from-neutral-600 to-neutral-700 text-white shadow-[0_2px_4px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.2)] border border-neutral-500'
                      : 'text-neutral-500 hover:text-neutral-300 bg-transparent border border-transparent'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
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
  lightTheme = false,
}: ControlRendererProps) {
  return <>{renderControl(control, value, onChange, compact, lightTheme)}</>;
}
