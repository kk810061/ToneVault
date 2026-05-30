import type { AmpDefinition, CabinetDefinition, PedalDefinition } from '@/hooks/useDefinitions';
import type { SignalChain } from '@/hooks/useSignalChain';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  bio?: string;
}

interface BackendControl {
  name: string;
  type?: string;
  minValue?: number;
  maxValue?: number;
  defaultValue?: number;
  enumValues?: string[];
  unit?: string;
}

interface BackendPedalDefinition {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
  category?: { name?: string } | string;
  controls?: BackendControl[];
  ui?: { color?: string; icon?: string };
}

interface BackendAmpDefinition {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
  category: string;
  controls?: BackendControl[];
  toneCharacteristics?: string[];
}

interface BackendTone {
  _id?: string;
  id: string;
  title: string;
  artistInspiredBy?: string;
  genre?: string;
  amp?: string;
  ampDetails?: {
    ampDefinitionId?: string;
    name?: string;
    settings?: Record<string, number>;
  };
  cabinet?: string;
  cabinetDetails?: {
    type?: string;
    speakerCount?: string;
  };
  gain?: number;
  bass?: number;
  mids?: number;
  treble?: number;
  presence?: number;
  effects?: string[];
  signalChain?: Array<{
    position: number;
    pedal?: {
      pedalDefinitionId?: string;
      name?: string;
    };
    settings?: Record<string, number | string | boolean>;
  }>;
  creator?: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt?: string;
}

export interface Tone extends BackendTone {
  id: string;
  title: string;
  artistInspiredBy: string;
  genre: string;
  amp: string;
  cabinet: string;
  effects: string[];
  creator: {
    id: string;
    username: string;
    avatar?: string;
  };
  dspChain: SignalChain;
}

export const cabinetDefinitions: CabinetDefinition[] = [
  { id: 'mesa-4x12', name: 'Mesa 4x12', slug: 'mesa-4x12', type: 'Mesa', speakers: 4, size: '4x12' },
  { id: 'marshall-4x12', name: 'Marshall 4x12', slug: 'marshall-4x12', type: 'Marshall', speakers: 4, size: '4x12' },
  { id: 'fender-2x12', name: 'Fender 2x12', slug: 'fender-2x12', type: 'Fender', speakers: 2, size: '2x12' },
  { id: 'vox-2x12', name: 'Vox 2x12', slug: 'vox-2x12', type: 'Vox', speakers: 2, size: '2x12' },
  { id: 'combo-1x12', name: 'Combo 1x12', slug: 'combo-1x12', type: 'Combo', speakers: 1, size: '1x12' },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

async function apiCall<T>(
  endpoint: string,
  method: HttpMethod = 'GET',
  body?: unknown,
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, error.message || 'API request failed');
  }

  return response.json();
}

const mapControlType = (type?: string): 'knob' | 'toggle' | 'enum' | 'footswitch' => {
  if (type === 'selector') return 'enum';
  if (type === 'footswitch') return 'footswitch';
  if (type === 'toggle') return 'toggle';
  return 'knob';
};

const adaptControl = (control: BackendControl) => {
  const id = slugify(control.name);
  const type = mapControlType(control.type);
  const enumValues = control.enumValues || [];

  return {
    id,
    name: control.name,
    type,
    min: control.minValue ?? 0,
    max: control.maxValue ?? 100,
    default: control.defaultValue ?? 0,
    values:
      enumValues.length > 0
        ? enumValues.map((label, index) => ({ label, value: String(index) }))
        : undefined,
  };
};

const adaptPedalDefinition = (pedal: BackendPedalDefinition): PedalDefinition => ({
  id: pedal.id || pedal._id,
  name: pedal.name,
  slug: pedal.slug || slugify(pedal.name),
  category: typeof pedal.category === 'string' ? pedal.category : pedal.category?.name || 'Pedal',
  controls: (pedal.controls || []).map(adaptControl),
  ui: pedal.ui || {},
});

const adaptAmpDefinition = (amp: BackendAmpDefinition): AmpDefinition => ({
  id: amp.id || amp._id,
  name: amp.name,
  slug: amp.slug || slugify(amp.name),
  category: amp.category,
  controls: (amp.controls || []).map(adaptControl),
  toneCharacteristics: amp.toneCharacteristics || [],
});

const resolvePedalDefinition = (definitions: PedalDefinition[], name?: string) => {
  if (!name) return undefined;
  return definitions.find((definition) => definition.name === name || definition.slug === slugify(name));
};

const resolveAmpDefinition = (definitions: AmpDefinition[], name?: string) => {
  if (!name) return undefined;
  return definitions.find((definition) => definition.name === name || definition.slug === slugify(name));
};

const resolveCabinetDefinition = (cabinet?: BackendTone['cabinetDetails']) => {
  if (!cabinet) return undefined;
  const label = [cabinet.type, cabinet.speakerCount].filter(Boolean).join(' ');
  return cabinetDefinitions.find((definition) => definition.name === label || definition.slug === slugify(label));
};

export const adaptTone = (
  tone: BackendTone,
  definitions?: { pedals?: PedalDefinition[]; amps?: AmpDefinition[] }
): Tone => {
  const ampDefinition = resolveAmpDefinition(definitions?.amps || [], tone.ampDetails?.name || tone.amp);
  const cabinetDefinition = resolveCabinetDefinition(tone.cabinetDetails);

  return {
    ...tone,
    artistInspiredBy: tone.artistInspiredBy || '',
    genre: tone.genre || '',
    amp: tone.amp || tone.ampDetails?.name || '',
    cabinet: tone.cabinet || '',
    effects: tone.effects || [],
    creator: tone.creator || { id: '', username: 'Unknown' },
    dspChain: {
      pedals: (tone.signalChain || [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((item, index) => {
          const definition = resolvePedalDefinition(definitions?.pedals || [], item.pedal?.name);
          return {
            id: `pedal-${index}-${definition?.slug || slugify(item.pedal?.name || 'pedal')}`,
            definitionSlug: definition?.slug || slugify(item.pedal?.name || 'pedal'),
            controlValues: item.settings || {},
            bypassed: Boolean(item.settings?.bypassed),
          };
        }),
      amp: ampDefinition
        ? {
            definitionSlug: ampDefinition.slug,
            controlValues: tone.ampDetails?.settings || {},
          }
        : null,
      cabinet: cabinetDefinition ? { definitionSlug: cabinetDefinition.slug } : null,
    },
  };
};

const toBackendTonePayload = (data: unknown, definitions?: { pedals?: PedalDefinition[]; amps?: AmpDefinition[] }) => {
  const value = data as {
    title?: string;
    artistInspiredBy?: string;
    genre?: string;
    signalChain?: SignalChain;
  };

  if (!value.signalChain || Array.isArray(value.signalChain)) {
    return data;
  }

  const ampDefinition = definitions?.amps?.find((amp) => amp.slug === value.signalChain?.amp?.definitionSlug);
  const cabinetDefinition = cabinetDefinitions.find(
    (cabinet) => cabinet.slug === value.signalChain?.cabinet?.definitionSlug
  );

  return {
    title: value.title,
    artistInspiredBy: value.artistInspiredBy,
    genre: value.genre,
    signalChain: value.signalChain.pedals.map((pedal, position) => {
      const definition = definitions?.pedals?.find((item) => item.slug === pedal.definitionSlug);

      return {
        position,
        pedal: {
          name: definition?.name || pedal.definitionSlug,
        },
        settings: {
          ...pedal.controlValues,
          bypassed: pedal.bypassed,
        },
      };
    }),
    amp: value.signalChain.amp
      ? {
          name: ampDefinition?.name || value.signalChain.amp.definitionSlug,
          settings: value.signalChain.amp.controlValues,
        }
      : undefined,
    cabinet: cabinetDefinition
      ? {
          type: cabinetDefinition.type,
          speakerCount: cabinetDefinition.size,
        }
      : undefined,
  };
};

export const authApi = {
  register: async (email: string, password: string, username: string) => {
    const response = await apiCall<{ user?: User; token: string; id?: string; _id?: string; email: string; username: string }>(
      '/auth/register',
      'POST',
      { email, password, username }
    );
    const user = response.user || {
      id: response.id || response._id || '',
      email: response.email,
      username: response.username,
    };
    return { user, token: response.token };
  },
  login: async (email: string, password: string) => {
    const response = await apiCall<{ user?: User; token: string; id?: string; _id?: string; email: string; username: string }>(
      '/auth/login',
      'POST',
      { email, password }
    );
    const user = response.user || {
      id: response.id || response._id || '',
      email: response.email,
      username: response.username,
    };
    return { user, token: response.token };
  },
};

export const catalogApi = {
  getEffectCategories: async () => apiCall('/effect-categories', 'GET'),
  getPedalDefinitions: async () => (await apiCall<BackendPedalDefinition[]>('/pedals', 'GET')).map(adaptPedalDefinition),
  getAmpDefinitions: async () => (await apiCall<BackendAmpDefinition[]>('/amps', 'GET')).map(adaptAmpDefinition),
  getCabinetDefinitions: async () => cabinetDefinitions,
};

export const tonesApi = {
  getAll: async (params?: { genre?: string; artistInspiredBy?: string; amp?: string; creatorId?: string; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.genre) query.append('genre', params.genre);
    if (params?.artistInspiredBy) query.append('artistInspiredBy', params.artistInspiredBy);
    if (params?.amp) query.append('amp', params.amp);
    if (params?.creatorId) query.append('creatorId', params.creatorId);
    if (params?.limit) query.append('limit', String(params.limit));

    const endpoint = query.toString() ? `/tones?${query.toString()}` : '/tones';
    const tones = await apiCall<BackendTone[]>(endpoint, 'GET');
    return tones.map((tone) => adaptTone(tone));
  },
  getById: async (id: string, definitions?: { pedals?: PedalDefinition[]; amps?: AmpDefinition[] }) => {
    const tone = await apiCall<BackendTone>(`/tones/${id}`, 'GET');
    return adaptTone(tone, definitions);
  },
  create: async (
    data: unknown,
    token: string,
    definitions?: { pedals?: PedalDefinition[]; amps?: AmpDefinition[] }
  ) => {
    const tone = await apiCall<BackendTone>('/tones', 'POST', toBackendTonePayload(data, definitions), token);
    return adaptTone(tone, definitions);
  },
  update: async (
    id: string,
    data: unknown,
    token: string,
    definitions?: { pedals?: PedalDefinition[]; amps?: AmpDefinition[] }
  ) => {
    const tone = await apiCall<BackendTone>(`/tones/${id}`, 'PUT', toBackendTonePayload(data, definitions), token);
    return adaptTone(tone, definitions);
  },
  delete: async (id: string, token: string) => apiCall(`/tones/${id}`, 'DELETE', undefined, token),
};

export const pedalApi = {
  getAll: catalogApi.getPedalDefinitions,
};

export const ampApi = {
  getAll: catalogApi.getAmpDefinitions,
};

export const cabinetApi = {
  getAll: catalogApi.getCabinetDefinitions,
};
