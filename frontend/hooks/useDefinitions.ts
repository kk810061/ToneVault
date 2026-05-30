import { useEffect, useState } from 'react';
import { pedalApi, ampApi, cabinetApi, ApiError } from '@/lib/api';

export interface PedalControl {
  id: string;
  name: string;
  type: 'knob' | 'toggle' | 'enum' | 'footswitch';
  min?: number;
  max?: number;
  default?: number;
  values?: Array<{ label: string; value: string | number }>;
}

export interface PedalDefinition {
  id: string;
  name: string;
  slug: string;
  category: string;
  controls: PedalControl[];
  ui: {
    color?: string;
    icon?: string;
  };
  enumValues?: Record<string, Array<{ label: string; value: string }>>;
}

export interface AmpControl {
  id: string;
  name: string;
  type: 'knob' | 'toggle' | 'enum' | 'footswitch';
  min?: number;
  max?: number;
  default?: number;
  values?: Array<{ label: string; value: string | number }>;
}

export interface AmpDefinition {
  id: string;
  name: string;
  slug: string;
  category: string;
  controls: AmpControl[];
  toneCharacteristics?: string[];
  enumValues?: Record<string, Array<{ label: string; value: string }>>;
}

export interface CabinetDefinition {
  id: string;
  name: string;
  slug: string;
  type: string;
  speakers: number;
  size: '1x12' | '2x12' | '4x12' | 'other';
}

export function usePedalDefinitions() {
  const [pedals, setPedals] = useState<PedalDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPedals = async () => {
      try {
        setIsLoading(true);
        const data = await pedalApi.getAll();
        setPedals(data);
        setError(null);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(`Failed to fetch pedals: ${err.message}`);
        } else {
          setError('Failed to fetch pedals');
        }
        console.error('[v0] Error fetching pedals:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPedals();
  }, []);

  return { pedals, isLoading, error };
}

export function useAmpDefinitions() {
  const [amps, setAmps] = useState<AmpDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAmps = async () => {
      try {
        setIsLoading(true);
        const data = await ampApi.getAll();
        setAmps(data);
        setError(null);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(`Failed to fetch amps: ${err.message}`);
        } else {
          setError('Failed to fetch amps');
        }
        console.error('[v0] Error fetching amps:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAmps();
  }, []);

  return { amps, isLoading, error };
}

export function useCabinetDefinitions() {
  const [cabinets, setCabinets] = useState<CabinetDefinition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCabinets = async () => {
      try {
        setIsLoading(true);
        const data = await cabinetApi.getAll();
        setCabinets(data);
        setError(null);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(`Failed to fetch cabinets: ${err.message}`);
        } else {
          setError('Failed to fetch cabinets');
        }
        console.error('[v0] Error fetching cabinets:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCabinets();
  }, []);

  return { cabinets, isLoading, error };
}
