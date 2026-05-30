'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ToneCardGrid } from '@/components/tone-card';
import { LoadingSkeleton, EmptyState } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { tonesApi } from '@/lib/api';
import { Search, X } from 'lucide-react';

interface Tone {
  id: string;
  title: string;
  artistInspiredBy: string;
  genre: string;
  amp: string;
  cabinet: string;
  creator: {
    id: string;
    username: string;
    avatar?: string;
  };
  effects?: string[];
}

const GENRES = ['Metal', 'Rock', 'Blues', 'Jazz', 'Clean', 'Folk', 'Country', 'Funk'];
const AMPS = ['Marshall Plexi', 'Marshall JCM800', 'Fender Twin Reverb', 'Vox AC30', 'Peavey 5150', 'Mesa Dual Rectifier'];
const ALL_FILTERS_VALUE = 'all';

export default function BrowsePage() {
  const [tones, setTones] = useState<Tone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedAmp, setSelectedAmp] = useState<string>('');
  const [filteredTones, setFilteredTones] = useState<Tone[]>([]);
  const [error, setError] = useState('');

  // Fetch tones on mount and when filters change
  useEffect(() => {
    const fetchTones = async () => {
      setIsLoading(true);
      try {
        setError('');
        const data = await tonesApi.getAll({
          genre: selectedGenre || undefined,
          amp: selectedAmp || undefined,
        });
        setTones(data);
      } catch (error) {
        console.error('[v0] Failed to fetch tones:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch tones');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTones();
  }, [selectedGenre, selectedAmp]);

  // Filter tones based on search query
  useEffect(() => {
    const filtered = tones.filter((tone) =>
      tone.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tone.artistInspiredBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tone.creator.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTones(filtered);
  }, [tones, searchQuery]);

  const activeFilters = [selectedGenre, selectedAmp].filter(Boolean).length;

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-border bg-card/50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">Browse Tones</h1>
              <p className="text-muted-foreground">Discover premium guitar tones from the community</p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by title, artist, or creator..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filters Sidebar */}
            <motion.aside
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <div className="bg-card border border-border rounded-lg p-6 sticky top-20 space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Filters</h3>

                  {activeFilters > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedGenre('');
                        setSelectedAmp('');
                      }}
                      className="text-xs text-accent hover:text-accent/80 mb-4"
                    >
                      Clear all ({activeFilters})
                    </Button>
                  )}
                </div>

                {/* Genre Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Genre</label>
                  <Select value={selectedGenre || ALL_FILTERS_VALUE} onValueChange={(value) => setSelectedGenre(value === ALL_FILTERS_VALUE ? '' : value)}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="All genres" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value={ALL_FILTERS_VALUE}>All Genres</SelectItem>
                      {GENRES.map((genre) => (
                        <SelectItem key={genre} value={genre}>
                          {genre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Amp Filter */}
                <div className="space-y-3">
                  <label className="text-sm font-medium text-foreground">Amplifier</label>
                  <Select value={selectedAmp || ALL_FILTERS_VALUE} onValueChange={(value) => setSelectedAmp(value === ALL_FILTERS_VALUE ? '' : value)}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="All amps" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value={ALL_FILTERS_VALUE}>All Amps</SelectItem>
                      {AMPS.map((amp) => (
                        <SelectItem key={amp} value={amp}>
                          {amp}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </motion.aside>

            {/* Results */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-3"
            >
              {isLoading ? (
                <LoadingSkeleton />
              ) : error ? (
                <EmptyState title="Could not load tones" description={error} />
              ) : filteredTones.length === 0 ? (
                <EmptyState
                  title="No tones found"
                  description={
                    searchQuery || selectedGenre || selectedAmp
                      ? 'Try adjusting your search or filters'
                      : 'No tones available yet'
                  }
                />
              ) : (
                <div className="space-y-6">
                  <div className="text-sm text-muted-foreground">
                    Showing <span className="font-semibold text-foreground">{filteredTones.length}</span> tone
                    {filteredTones.length !== 1 ? 's' : ''}
                  </div>
                  <ToneCardGrid tones={filteredTones} />
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
