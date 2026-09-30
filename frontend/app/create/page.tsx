'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { useSignalChain } from '@/hooks/useSignalChain';
import { usePedalDefinitions, useAmpDefinitions, useCabinetDefinitions } from '@/hooks/useDefinitions';
import { SignalChainEditor } from '@/components/signal-chain-editor';
import { tonesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, PanelLeftClose, PanelLeftOpen, Maximize2, Minimize2 } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { RigThumbnail } from '@/components/rig-thumbnail';

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const thumbnailRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Escape key exits fullscreen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

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
      
      let thumbnailUrl = '';
      if (thumbnailRef.current) {
        try {
          thumbnailUrl = await toJpeg(thumbnailRef.current, { quality: 0.6, cacheBust: true });
        } catch (e) {
          console.error('Failed to generate thumbnail', e);
        }
      }

      const toneData = {
        title: toneInfo.title,
        artistInspiredBy: toneInfo.artistInspiredBy,
        genre: toneInfo.genre,
        signalChain: signalChain.chain,
        thumbnailUrl
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

  const signalChainEditorElement = (
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
      onSetAmp={(slug) => signalChain.setAmp(slug, amps.find((a) => a.slug === slug)!)}
      onUpdateAmpControl={signalChain.updateAmpControl}
      onToggleAmpBypass={signalChain.toggleAmpBypass}
      onSetCabinet={signalChain.setCabinet}
      toolbarRight={
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => signalChain.clearChain()}
            className="h-7 text-xs px-3 hover:text-foreground text-muted-foreground"
          >
            Reset
          </Button>
          <Button 
            size="sm" 
            onClick={handleCreateTone} 
            disabled={isCreating || isLoading}
            className="h-7 text-xs px-3 bg-accent hover:bg-accent/90 text-black font-semibold"
          >
            {isCreating ? 'Saving...' : 'Save Tone'}
          </Button>
          <div className="h-4 w-px bg-border/50 mx-1" />
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title={isFullscreen ? 'Exit focus mode (Esc)' : 'Enter focus mode'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      }
    />
  );

  return (
    <main className="h-screen bg-gradient-to-b from-background to-muted/20 overflow-hidden">
      {/* Main Content */}
      <div className="flex h-full relative">
        {/* Left Panel - Tone Info (Collapsible) */}
        <motion.div
          animate={{ width: sidebarCollapsed ? 0 : 320 }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          className="border-r border-border bg-card/40 backdrop-blur-sm overflow-hidden shrink-0 h-full relative z-20"
        >
          <div className="w-80 h-full overflow-y-auto p-6 pt-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => router.back()} 
                    className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                    title="Back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h2 className="text-lg font-bold uppercase tracking-wide text-foreground">
                    Create Tone
                  </h2>
                </div>
                <button 
                  onClick={() => setSidebarCollapsed(true)}
                  className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                  title="Hide sidebar"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
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
        </motion.div>

        {/* Center Panel - Signal Chain */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10">
          {sidebarCollapsed && (
            <button 
              onClick={() => setSidebarCollapsed(false)}
              className="absolute top-4 left-4 z-30 p-2 bg-card/80 backdrop-blur border border-border shadow-md rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Show sidebar"
            >
              <PanelLeftOpen className="w-4 h-4" />
            </button>
          )}

          {/* Workbench area */}
          <div className="flex-1 overflow-auto min-h-0">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center text-muted-foreground">
                  <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full mx-auto mb-4" />
                  <p className="text-sm">Loading definitions...</p>
                </div>
              </div>
            ) : (
              <div className="h-full">
                {signalChainEditorElement}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Fullscreen / Focus Mode Overlay ── */}
      <AnimatePresence>
        {isFullscreen && !isLoading && (
          <motion.div
            key="fs-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-background"
          >
            {signalChainEditorElement}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Hidden Rig Thumbnail for Capture */}
      <div className="absolute top-[-9999px] left-[-9999px] pointer-events-none opacity-0">
        <RigThumbnail 
          ref={thumbnailRef}
          chain={signalChain.chain}
          pedalDefinitions={pedals}
          ampDefinitions={amps}
          cabinetDefinitions={cabinets}
        />
      </div>
    </main>
  );
}
