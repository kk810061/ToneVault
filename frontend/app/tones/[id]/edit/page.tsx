'use client';

import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { tonesApi, Tone } from '@/lib/api';
import { AmpDefinition, CabinetDefinition, PedalDefinition, useAmpDefinitions, useCabinetDefinitions, usePedalDefinitions } from '@/hooks/useDefinitions';
import { SignalChain, useSignalChain } from '@/hooks/useSignalChain';
import { SignalChainEditor } from '@/components/signal-chain-editor';
import { LoadingSpinner } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, PanelLeftClose, PanelLeftOpen, Maximize2, Minimize2 } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import { RigThumbnail } from '@/components/rig-thumbnail';

const GENRES = ['Metal', 'Rock', 'Blues', 'Jazz', 'Clean', 'Folk', 'Country', 'Funk'];

function ToneEditForm({
  tone,
  initialChain,
  token,
  pedals,
  amps,
  cabinets,
}: {
  tone: Tone;
  initialChain: SignalChain;
  token: string;
  pedals: PedalDefinition[];
  amps: AmpDefinition[];
  cabinets: CabinetDefinition[];
}) {
  const router = useRouter();
  const signalChain = useSignalChain(initialChain);
  const [toneInfo, setToneInfo] = useState({
    title: tone.title,
    artistInspiredBy: tone.artistInspiredBy || '',
    genre: tone.genre || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const thumbnailRef = useRef<HTMLDivElement>(null);

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

  const handleSave = async () => {
    if (!toneInfo.title || !toneInfo.genre) {
      setError('Please fill in tone name and genre');
      return;
    }

    if (!signalChain.chain.amp) {
      setError('Please select an amplifier');
      return;
    }

    try {
      setIsSaving(true);
      setError('');
      
      let thumbnailUrl = '';
      if (thumbnailRef.current) {
        try {
          thumbnailUrl = await toJpeg(thumbnailRef.current, { quality: 0.6, cacheBust: true });
        } catch (e) {
          console.error('Failed to generate thumbnail', e);
        }
      }

      const result = await tonesApi.update(
        tone.id,
        {
          ...toneInfo,
          signalChain: signalChain.chain,
          thumbnailUrl
        },
        token,
        { pedals, amps }
      );
      router.push(`/tones/${result.id}`);
    } catch (err) {
      console.error('[v0] Failed to update tone:', err);
      setError(err instanceof Error ? err.message : 'Failed to update tone');
    } finally {
      setIsSaving(false);
    }
  };

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
    />
  );

  return (
    <main className="h-screen bg-gradient-to-b from-background to-muted/20 overflow-hidden">
      <div className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="max-w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wide text-foreground">Edit Tone</h1>
              <p className="text-xs text-muted-foreground mt-1">Update your saved guitar tone</p>
            </div>
          </div>

          <Button onClick={handleSave} disabled={isSaving} className="bg-accent hover:bg-accent/90 text-black font-semibold">
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Tone Info (Collapsible) */}
        <motion.div
          animate={{ width: sidebarCollapsed ? 0 : 320 }}
          transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          className="border-r border-border bg-card/40 backdrop-blur-sm overflow-hidden shrink-0"
        >
          <div className="w-80 h-full overflow-y-auto p-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase font-semibold text-muted-foreground">Tone Name</Label>
                <Input value={toneInfo.title} onChange={(e) => setToneInfo({ ...toneInfo, title: e.target.value })} className="bg-background border-border focus:border-accent" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-semibold text-muted-foreground">Artist Inspired By</Label>
                <Input value={toneInfo.artistInspiredBy} onChange={(e) => setToneInfo({ ...toneInfo, artistInspiredBy: e.target.value })} className="bg-background border-border focus:border-accent" />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-semibold text-muted-foreground">Genre</Label>
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

              {error && <div className="p-3 rounded bg-destructive/20 border border-destructive/50 text-destructive text-sm">{error}</div>}
            </motion.div>
          </div>
        </motion.div>

        {/* Center Panel - Signal Chain */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
          {/* Toolbar strip */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border/50 bg-card/20 shrink-0">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title={sidebarCollapsed ? 'Show sidebar' : 'Hide sidebar'}
            >
              {sidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
            </button>
            <div className="h-4 w-px bg-border/50" />
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              title={isFullscreen ? 'Exit focus mode (Esc)' : 'Enter focus mode'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 ml-2">Workbench</span>
          </div>

          {/* Workbench area */}
          <div className="flex-1 overflow-auto min-h-0">
            <div className="p-4">
              {signalChainEditorElement}
            </div>
          </div>
        </div>
      </div>

      {/* ── Fullscreen / Focus Mode Overlay ── */}
      <AnimatePresence>
        {isFullscreen && (
          <>
            <motion.div
              key="fs-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md"
              onClick={() => setIsFullscreen(false)}
            />
            <motion.div
              key="fs-workbench"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed inset-4 z-[101] rounded-xl border border-border/50 bg-background/95 overflow-auto shadow-2xl"
            >
              <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-3 border-b border-border/50 bg-card/80 backdrop-blur-xl">
                <span className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">⚡ Signal Routing — Focus Mode</span>
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  Exit <kbd className="ml-1 px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">Esc</kbd>
                </button>
              </div>
              <div className="p-6">
                {signalChainEditorElement}
              </div>
            </motion.div>
          </>
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

export default function EditTonePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token, user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { pedals, isLoading: pedalsLoading } = usePedalDefinitions();
  const { amps, isLoading: ampsLoading } = useAmpDefinitions();
  const { cabinets, isLoading: cabinetsLoading } = useCabinetDefinitions();
  const [tone, setTone] = useState<Tone | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authLoading || pedalsLoading || ampsLoading || cabinetsLoading || !isAuthenticated) return;

    const fetchTone = async () => {
      try {
        const data = await tonesApi.getById(id, { pedals, amps });
        if (user?.id && data.creator?.id !== user.id) {
          router.push(`/tones/${id}`);
          return;
        }
        setTone(data);
      } catch (err) {
        console.error('[v0] Failed to load tone for editing:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tone');
      }
    };

    fetchTone();
  }, [id, authLoading, pedalsLoading, ampsLoading, cabinetsLoading, isAuthenticated, pedals, amps, user?.id, router]);

  if (authLoading || pedalsLoading || ampsLoading || cabinetsLoading || !tone) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        {error ? <p className="text-destructive">{error}</p> : <LoadingSpinner />}
      </main>
    );
  }

  return <ToneEditForm tone={tone} initialChain={tone.dspChain} token={token!} pedals={pedals} amps={amps} cabinets={cabinets} />;
}
