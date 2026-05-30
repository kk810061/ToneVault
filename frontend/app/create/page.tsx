'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useSignalChain } from '@/hooks/useSignalChain';
import { usePedalDefinitions, useAmpDefinitions, useCabinetDefinitions } from '@/hooks/useDefinitions';
import { SignalChainEditor } from '@/components/signal-chain-editor';
import { tonesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft } from 'lucide-react';

const GENRES = ['Metal', 'Rock', 'Blues', 'Jazz', 'Clean', 'Folk', 'Country', 'Funk'];

export default function CreateTonePage() {
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  
  const { pedals, isLoading: pedalsLoading } = usePedalDefinitions();
  const { amps, isLoading: ampsLoading } = useAmpDefinitions();
  const { cabinets, isLoading: cabinetsLoading } = useCabinetDefinitions();
  
  const signalChain = useSignalChain();
  
  const [toneInfo, setToneInfo] = useState({
    title: '',
    artistInspiredBy: '',
    genre: '',
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

  const handleCreateTone = async () => {
    if (!toneInfo.title || !toneInfo.genre) {
      setError('Please fill in tone name and genre');
      return;
    }

    if (!signalChain.chain.amp) {
      setError('Please select an amplifier');
      return;
    }

    try {
      setIsCreating(true);
      setError('');
      
      const toneData = {
        title: toneInfo.title,
        artistInspiredBy: toneInfo.artistInspiredBy,
        genre: toneInfo.genre,
        signalChain: signalChain.chain,
      };

      const result = await tonesApi.create(toneData, token!, { pedals, amps });
      router.push(`/tones/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create tone');
      console.error('[v0] Error creating tone:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const isLoading = pedalsLoading || ampsLoading || cabinetsLoading;

  return (
    <main className="h-screen bg-gradient-to-b from-background to-muted/20 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wide text-foreground">
                Create Tone
              </h1>
              <p className="text-xs text-muted-foreground mt-1">Build your perfect guitar tone</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => signalChain.clearChain()}
              className="text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
            <Button
              onClick={handleCreateTone}
              disabled={isCreating || isLoading}
              className="bg-accent hover:bg-accent/90 text-black font-semibold"
            >
              {isCreating ? 'Saving...' : 'Save Tone'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content - Three Panel Layout */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Tone Info */}
        <div className="w-80 border-r border-border bg-card/40 backdrop-blur-sm overflow-y-auto p-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wide text-foreground mb-4">
                Tone Details
              </h2>
            </div>

            {/* Tone Name */}
            <div className="space-y-2">
              <Label className="text-xs uppercase font-semibold text-muted-foreground">
                Tone Name
              </Label>
              <Input
                placeholder="e.g., Heavy Metal Lead"
                value={toneInfo.title}
                onChange={(e) => setToneInfo({ ...toneInfo, title: e.target.value })}
                className="bg-background border-border focus:border-accent"
              />
            </div>

            {/* Artist Inspired By */}
            <div className="space-y-2">
              <Label className="text-xs uppercase font-semibold text-muted-foreground">
                Artist Inspired By
              </Label>
              <Input
                placeholder="e.g., Eddie Van Halen"
                value={toneInfo.artistInspiredBy}
                onChange={(e) => setToneInfo({ ...toneInfo, artistInspiredBy: e.target.value })}
                className="bg-background border-border focus:border-accent"
              />
            </div>

            {/* Genre */}
            <div className="space-y-2">
              <Label className="text-xs uppercase font-semibold text-muted-foreground">
                Genre
              </Label>
              <Select value={toneInfo.genre} onValueChange={(value) => setToneInfo({ ...toneInfo, genre: value })}>
                <SelectTrigger className="bg-background border-border focus:border-accent">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {GENRES.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-3 rounded bg-destructive/20 border border-destructive/50 text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Info Box */}
            <div className="p-4 rounded border border-accent/20 bg-accent/5 text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Signal Chain Status:</p>
              <p>Pedals: {signalChain.chain.pedals.length}</p>
              <p>Amp: {signalChain.chain.amp ? '✓ Selected' : '⚠ Select amp'}</p>
              <p>Cabinet: {signalChain.chain.cabinet ? '✓ Selected' : 'Optional'}</p>
            </div>
          </motion.div>
        </div>

        {/* Center Panel - Signal Chain */}
        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-sm">Loading definitions...</p>
              </div>
            </div>
          ) : (
            <div className="p-6">
              <SignalChainEditor
                chain={signalChain.chain}
                pedalDefinitions={pedals}
                ampDefinitions={amps}
                cabinetDefinitions={cabinets}
                onAddPedal={(slug) => {
                  const def = pedals.find((p) => p.slug === slug);
                  if (def) return signalChain.addPedal(slug, def);
                }}
                onRemovePedal={signalChain.removePedal}
                onReorderPedals={signalChain.reorderPedals}
                onUpdatePedalControl={signalChain.updatePedalControl}
                onTogglePedalBypass={signalChain.togglePedalBypass}
                onSetAmp={(slug) => {
                  const def = amps.find((a) => a.slug === slug);
                  if (def) signalChain.setAmp(slug, def);
                }}
                onUpdateAmpControl={signalChain.updateAmpControl}
                onSetCabinet={signalChain.setCabinet}
              />
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
