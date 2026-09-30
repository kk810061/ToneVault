'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ToneCardGrid } from '@/components/tone-card';
import { LoadingSkeleton, EmptyState } from '@/components/loading';
import { Input } from '@/components/ui/input';
import { tonesApi } from '@/lib/api';
import { Search, X, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface Tone {
  id: string;
  title: string;
  artistInspiredBy: string;
  genre: string;
  amp: string;
  cabinet: string;
  creator: { id: string; username: string; avatar?: string };
  effects?: string[];
}

const GENRES = ['Metal', 'Rock', 'Blues', 'Jazz', 'Clean', 'Folk', 'Country', 'Funk'];
const AMPS = [
  'Marshall Plexi',
  'Marshall JCM800',
  'Fender Twin Reverb',
  'Vox AC30',
  'Peavey 5150',
  'Mesa Dual Rectifier',
];

// ── Genre colour mapping ──
const GENRE_COLORS: Record<string, string> = {
  Metal: 'border-red-700/40 text-red-300 data-[active=true]:bg-red-900/30 data-[active=true]:border-red-600/60',
  Rock: 'border-orange-700/40 text-orange-300 data-[active=true]:bg-orange-900/30 data-[active=true]:border-orange-600/60',
  Blues: 'border-blue-700/40 text-blue-300 data-[active=true]:bg-blue-900/30 data-[active=true]:border-blue-600/60',
  Jazz: 'border-purple-700/40 text-purple-300 data-[active=true]:bg-purple-900/30 data-[active=true]:border-purple-600/60',
  Clean: 'border-teal-700/40 text-teal-300 data-[active=true]:bg-teal-900/30 data-[active=true]:border-teal-600/60',
  Folk: 'border-green-700/40 text-green-300 data-[active=true]:bg-green-900/30 data-[active=true]:border-green-600/60',
  Country: 'border-amber-700/40 text-amber-300 data-[active=true]:bg-amber-900/30 data-[active=true]:border-amber-600/60',
  Funk: 'border-yellow-700/40 text-yellow-300 data-[active=true]:bg-yellow-900/30 data-[active=true]:border-yellow-600/60',
};

function FilterChip({
  label,
  active,
  colorClass,
  onToggle,
}: {
  label: string;
  active: boolean;
  colorClass?: string;
  onToggle: () => void;
}) {
  return (
    <motion.button
      onClick={onToggle}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      data-active={active}
      className={`
        px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 cursor-pointer
        ${active
          ? 'bg-accent/15 border-accent/50 text-accent'
          : `bg-transparent border-border text-muted-foreground hover:border-surface-border hover:text-foreground ${colorClass ?? ''}`
        }
      `}
    >
      {label}
    </motion.button>
  );
}

function ActiveFilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85 }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/25"
    >
      {label}
      <button onClick={onRemove} className="hover:text-accent/70 transition-colors">
        <X className="w-3 h-3" />
      </button>
    </motion.span>
  );
}

function BrowsePageInner() {
  const searchParams = useSearchParams();
  const initialGenre = searchParams.get('genre') ?? '';

  const [tones, setTones] = useState<Tone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedAmp, setSelectedAmp] = useState('');
  const [filteredTones, setFilteredTones] = useState<Tone[]>([]);
  const [showAmpFilter, setShowAmpFilter] = useState(false);

  const fetchTones = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await tonesApi.getAll({
        genre: selectedGenre || undefined,
        amp: selectedAmp || undefined,
      });
      setTones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tones');
    } finally {
      setIsLoading(false);
    }
  }, [selectedGenre, selectedAmp]);

  useEffect(() => { fetchTones(); }, [fetchTones]);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    setFilteredTones(
      tones.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.artistInspiredBy.toLowerCase().includes(q) ||
          t.creator.username.toLowerCase().includes(q)
      )
    );
  }, [tones, searchQuery]);

  const clearAll = () => {
    setSelectedGenre('');
    setSelectedAmp('');
    setSearchQuery('');
  };

  const hasFilters = !!(selectedGenre || selectedAmp || searchQuery);

  // Status bar text
  const statusText = (() => {
    const parts: string[] = [`${filteredTones.length} tone${filteredTones.length !== 1 ? 's' : ''}`];
    if (selectedGenre) parts.push(selectedGenre);
    if (selectedAmp) parts.push(selectedAmp);
    return parts.join(' · ');
  })();

  return (
    <main className="min-h-screen bg-background">

      {/* ─── Discovery Header ─── */}
      <section className="relative border-b border-border/40 bg-black overflow-hidden">
        <div className="absolute inset-0 tv-grid-bg opacity-40" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 120%, rgba(255,107,0,0.08) 0%, transparent 60%)' }}
        />
        <div className="relative z-10 tv-container px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <p className="tv-label mb-2 text-accent">Tone Library</p>
            <h1 className="tv-page-title text-4xl sm:text-5xl mb-2">Discover Tones</h1>
            <p className="text-muted-foreground mb-8 text-sm sm:text-base">
              Browse signal chains crafted by the community. Find your sound.
            </p>

            {/* Search */}
            <div className="relative max-w-2xl">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                id="browse-search"
                placeholder="Search by title, artist, or creator…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-11 bg-white/[0.04] border-surface-border text-foreground placeholder:text-muted-foreground/60 focus:border-accent/50 focus:ring-accent/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Filter Bar ─── */}
      <section className="border-b border-border/40 bg-card/30 sticky top-16 z-40 backdrop-blur-xl">
        <div className="tv-container px-4 sm:px-6 lg:px-8 py-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col gap-3"
          >
            {/* Genre chips */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="tv-label text-muted-foreground/60 flex-shrink-0 flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                Genre
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {GENRES.map((g) => (
                  <FilterChip
                    key={g}
                    label={g}
                    active={selectedGenre === g}
                    colorClass={GENRE_COLORS[g]}
                    onToggle={() => setSelectedGenre(selectedGenre === g ? '' : g)}
                  />
                ))}
              </div>

              {/* Amp toggle */}
              <button
                onClick={() => setShowAmpFilter((v) => !v)}
                className="ml-auto flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Amp
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${showAmpFilter ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {/* Amp chips (collapsible) */}
            <AnimatePresence>
              {showAmpFilter && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 flex-wrap overflow-hidden"
                >
                  <span className="tv-label text-muted-foreground/60 flex-shrink-0">Amplifier</span>
                  {AMPS.map((a) => (
                    <FilterChip
                      key={a}
                      label={a}
                      active={selectedAmp === a}
                      onToggle={() => setSelectedAmp(selectedAmp === a ? '' : a)}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* ─── Results ─── */}
      <section className="py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
        <div className="tv-container px-4 sm:px-6 lg:px-8">
          {/* Status bar */}
          <div className="flex items-center justify-between mb-6 min-h-[28px]">
            <div className="flex items-center gap-2 flex-wrap">
              {!isLoading && (
                <span className="text-sm text-muted-foreground">
                  {statusText}
                </span>
              )}
              <AnimatePresence>
                {selectedGenre && (
                  <ActiveFilterBadge
                    label={selectedGenre}
                    onRemove={() => setSelectedGenre('')}
                  />
                )}
                {selectedAmp && (
                  <ActiveFilterBadge
                    label={selectedAmp}
                    onRemove={() => setSelectedAmp('')}
                  />
                )}
              </AnimatePresence>
            </div>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="text-xs text-accent hover:text-accent/70 transition-colors font-medium flex-shrink-0"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Grid */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <LoadingSkeleton count={9} />
              </motion.div>
            ) : error ? (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <EmptyState variant="error" description={error} />
              </motion.div>
            ) : filteredTones.length === 0 ? (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <EmptyState
                  variant={hasFilters ? 'search' : 'default'}
                  cta={hasFilters ? undefined : { label: 'Create a Tone', href: '/create' }}
                />
              </motion.div>
            ) : (
              <motion.div
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <ToneCardGrid tones={filteredTones} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
}

// useSearchParams requires Suspense in Next.js App Router
export default function BrowsePage() {
  return (
    <Suspense fallback={null}>
      <BrowsePageInner />
    </Suspense>
  );
}
