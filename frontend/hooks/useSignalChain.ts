import { useState, useCallback } from 'react';
import { ControlValue } from '@/lib/control-renderer';
import { AmpDefinition, PedalDefinition } from '@/hooks/useDefinitions';

export interface PedalInstance {
  id: string;
  definitionSlug: string;
  controlValues: ControlValue;
  bypassed: boolean;
}

export interface SignalChain {
  pedals: PedalInstance[];
  amp: {
    definitionSlug: string;
    controlValues: ControlValue;
    bypassed?: boolean;
  } | null;
  cabinet: {
    definitionSlug: string;
  } | null;
}

export interface UseSignalChainReturn {
  chain: SignalChain;
  addPedal: (pedalSlug: string, definition: PedalDefinition) => string;
  removePedal: (pedalId: string) => void;
  reorderPedals: (pedals: PedalInstance[]) => void;
  updatePedalControl: (pedalId: string, controlId: string, value: number | string | boolean) => void;
  togglePedalBypass: (pedalId: string) => void;
  setAmp: (ampSlug: string, definition: AmpDefinition) => void;
  updateAmpControl: (controlId: string, value: number | string | boolean) => void;
  toggleAmpBypass: () => void;
  setCabinet: (cabinetSlug: string) => void;
  clearChain: () => void;
}

export function useSignalChain(initialChain?: SignalChain): UseSignalChainReturn {
  const [chain, setChain] = useState<SignalChain>(
    initialChain || {
      pedals: [],
      amp: null,
      cabinet: null,
    }
  );

  const addPedal = useCallback(
    (pedalSlug: string, definition: PedalDefinition) => {
      const id = `pedal-${Date.now()}`;
      const newPedal: PedalInstance = {
        id,
        definitionSlug: pedalSlug,
        controlValues: definition.controls.reduce(
          (acc, control) => ({
            ...acc,
            [control.id]: control.default ?? 0,
          }),
          {}
        ),
        bypassed: false,
      };

      setChain((prev) => ({
        ...prev,
        pedals: [...prev.pedals, newPedal],
      }));

      return id;
    },
    []
  );

  const removePedal = useCallback((pedalId: string) => {
    setChain((prev) => ({
      ...prev,
      pedals: prev.pedals.filter((p) => p.id !== pedalId),
    }));
  }, []);

  const reorderPedals = useCallback((pedals: PedalInstance[]) => {
    setChain((prev) => ({
      ...prev,
      pedals,
    }));
  }, []);

  const updatePedalControl = useCallback(
    (pedalId: string, controlId: string, value: number | string | boolean) => {
      setChain((prev) => ({
        ...prev,
        pedals: prev.pedals.map((p) =>
          p.id === pedalId
            ? {
                ...p,
                controlValues: {
                  ...p.controlValues,
                  [controlId]: value,
                },
              }
            : p
        ),
      }));
    },
    []
  );

  const togglePedalBypass = useCallback((pedalId: string) => {
    setChain((prev) => ({
      ...prev,
      pedals: prev.pedals.map((p) =>
        p.id === pedalId ? { ...p, bypassed: !p.bypassed } : p
      ),
    }));
  }, []);

  const setAmp = useCallback((ampSlug: string, definition: AmpDefinition) => {
    const controlValues = definition.controls.reduce(
      (acc, control) => ({
        ...acc,
        [control.id]: control.default ?? 0,
      }),
      {}
    );

    setChain((prev) => ({
      ...prev,
      amp: {
        definitionSlug: ampSlug,
        controlValues,
      },
    }));
  }, []);

  const updateAmpControl = useCallback(
    (controlId: string, value: number | string | boolean) => {
      setChain((prev) => ({
        ...prev,
        amp: prev.amp
          ? {
              ...prev.amp,
              controlValues: {
                ...prev.amp.controlValues,
                [controlId]: value,
              },
            }
          : null,
      }));
    },
    []
  );

  const toggleAmpBypass = useCallback(() => {
    setChain((prev) => ({
      ...prev,
      amp: prev.amp
        ? {
            ...prev.amp,
            bypassed: !prev.amp.bypassed,
          }
        : null,
    }));
  }, []);

  const setCabinet = useCallback((cabinetSlug: string) => {
    setChain((prev) => ({
      ...prev,
      cabinet: {
        definitionSlug: cabinetSlug,
      },
    }));
  }, []);

  const clearChain = useCallback(() => {
    setChain({
      pedals: [],
      amp: null,
      cabinet: null,
    });
  }, []);

  return {
    chain,
    addPedal,
    removePedal,
    reorderPedals,
    updatePedalControl,
    togglePedalBypass,
    setAmp,
    updateAmpControl,
    toggleAmpBypass,
    setCabinet,
    clearChain,
  };
}
