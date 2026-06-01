'use client';

import React, { use, useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { tonesApi, Tone } from '@/lib/api';
import { useAmpDefinitions, useCabinetDefinitions, usePedalDefinitions } from '@/hooks/useDefinitions';
import { AmpHead } from '@/components/amp-head';
import { Cabinet } from '@/components/cabinet';
import { Pedal } from '@/components/pedal';
import { LoadingSpinner } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';

const HorizontalCable = () => (
  <div className="w-16 h-5 bg-zinc-900 border-y border-black relative shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] shrink-0 z-0 flex items-center justify-between">
    <div className="w-4 h-8 bg-gradient-to-b from-neutral-400 via-neutral-100 to-neutral-500 rounded-sm border border-neutral-600 shadow-[2px_0_5px_rgba(0,0,0,0.5)] -ml-2 z-10" />
    <div className="w-4 h-8 bg-gradient-to-b from-neutral-400 via-neutral-100 to-neutral-500 rounded-sm border border-neutral-600 shadow-[-2px_0_5px_rgba(0,0,0,0.5)] -mr-2 z-10" />
  </div>
);

function StickyPedalSection({ nodes, zoomedItemId, setZoomedItemId }: { nodes: any[], zoomedItemId: string | null, setZoomedItemId: (id: string | null) => void }) {
  const targetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scrollRange, setScrollRange] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (contentRef.current) {
        // Multiply by 0.7 to account for the zoom level scaling down the physical pixels
        const scaledWidth = contentRef.current.scrollWidth * 0.7;
        
        // Max scroll is the total scaled width minus the viewport width, plus a little padding so the last item isn't flush
        const maxScroll = Math.max(0, scaledWidth - window.innerWidth + 300);
        setScrollRange(maxScroll);
      }
    };
    
    // Slight delay to ensure DOM is fully rendered
    setTimeout(measure, 100);
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [nodes.length]);

  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start start", "end end"]
  });

  // Calculate the total height of the sticky section.
  // We add 800px to give a generous 400px "dead-zone" pause at the start and end.
  const scrollHeight = scrollRange + 800;
  
  // Calculate what percentage of the progress the 400px buffers represent
  const startBuffer = scrollHeight > 0 ? 400 / scrollHeight : 0;
  const endBuffer = scrollHeight > 0 ? 1 - (400 / scrollHeight) : 1;

  // Transform raw scroll progress to x translation (strictly linear mapping)
  // [0, startBuffer] -> stays at 0 (Pause)
  // [startBuffer, endBuffer] -> animates to -scrollRange (Slide)
  // [endBuffer, 1] -> stays at -scrollRange (Pause)
  const x = useTransform(
    scrollYProgress, 
    [0, startBuffer, endBuffer, 1], 
    [0, 0, -scrollRange, -scrollRange]
  );

  if (nodes.length === 0) {
    return (
      <section className="py-24 w-full bg-neutral-950 border-y border-neutral-800 flex justify-center items-center h-[50vh]">
        <p className="text-muted-foreground font-semibold uppercase tracking-widest text-sm text-center">No hardware in this rig</p>
      </section>
    );
  }

  return (
    <section 
      ref={targetRef} 
      className="relative" 
      style={{ height: `calc(100vh + ${scrollHeight}px)` }}
    >
      {/* Sticky Container */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden bg-neutral-950 border-b border-neutral-800">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent pointer-events-none z-0" />

        {zoomedItemId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md cursor-pointer"
            onClick={() => setZoomedItemId(null)}
          />
        )}

        <motion.div 
          style={{ x }} 
          className="flex flex-row items-center justify-start relative origin-left py-8 pl-[10vw] z-50 pointer-events-none"
        >
          <div ref={contentRef} style={{ zoom: 0.7 }} className="flex flex-row items-center w-max pointer-events-auto">
            {nodes.map((node, index) => {
              const definition = node.payload.definition;
              if (!definition) return null;
              
              return (
                <React.Fragment key={node.id}>
                  <div className={`flex flex-col justify-center shrink-0 relative ${zoomedItemId === node.id ? 'z-50' : 'z-10'}`}>
                    <motion.div
                      className={`cursor-pointer relative origin-center rounded-xl w-fit shrink-0
                        ${zoomedItemId === node.id ? 'z-50' : 'z-10'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setZoomedItemId(zoomedItemId === node.id ? null : node.id);
                      }}
                      animate={{ 
                        scale: zoomedItemId === node.id ? 1.25 : 1,
                        zIndex: zoomedItemId === node.id ? 50 : 10,
                        y: zoomedItemId === node.id ? -10 : 0,
                        opacity: zoomedItemId && zoomedItemId !== node.id ? 0.3 : 1,
                        filter: zoomedItemId && zoomedItemId !== node.id ? 'blur(4px)' : 'blur(0px)'
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <Pedal
                        definition={definition}
                        controlValues={node.payload.pedal.controlValues}
                        onControlChange={() => undefined}
                        bypassed={node.payload.pedal.bypassed}
                      />
                    </motion.div>
                  </div>
                  
                  {/* Patch Cable */}
                  {index < nodes.length - 1 && (
                    <motion.div
                      animate={{ 
                        opacity: zoomedItemId ? 0.3 : 1,
                        filter: zoomedItemId ? 'blur(4px)' : 'blur(0px)'
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    >
                      <HorizontalCable />
                    </motion.div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function ToneDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tone, setTone] = useState<Tone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [zoomedItemId, setZoomedItemId] = useState<string | null>(null);
  const { user, token } = useAuth();
  const router = useRouter();
  const { pedals } = usePedalDefinitions();
  const { amps } = useAmpDefinitions();
  const { cabinets } = useCabinetDefinitions();

  useEffect(() => {
    const fetchTone = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await tonesApi.getById(id, { pedals, amps });
        setTone(data);
      } catch (err) {
        console.error('[v0] Failed to fetch tone:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tone');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTone();
  }, [id, pedals, amps]);

  const handleDelete = async () => {
    if (!token) {
      router.push('/login');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this tone?')) return;

    setIsDeleting(true);
    try {
      await tonesApi.delete(id, token);
      router.push('/browse');
    } catch (err) {
      console.error('[v0] Failed to delete tone:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete tone');
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = user?.id === tone?.creator?.id;
  const ampDefinition = amps.find((amp) => amp.slug === tone?.dspChain.amp?.definitionSlug);
  const cabinetDefinition = cabinets.find((cabinet) => cabinet.slug === tone?.dspChain.cabinet?.definitionSlug);

  const nodes: { type: string, id: string, payload: any }[] = [];
  
  if (tone) {
    tone.dspChain.pedals.forEach((pedal) => {
      const definition = pedals.find((item) => item.slug === pedal.definitionSlug);
      if (definition) {
        nodes.push({ type: 'pedal', id: pedal.id, payload: { pedal, definition } });
      }
    });
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  if (!tone || error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/browse">
            <Button variant="ghost" className="mb-8 text-accent hover:text-accent/80">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Browse
            </Button>
          </Link>
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-foreground mb-2">{error || 'Tone not found'}</h1>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-card/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Link href="/browse" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-4 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Browse
              </Link>
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{tone.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                <span>Inspired by <span className="text-accent font-semibold">{tone.artistInspiredBy || 'Original'}</span></span>
                <span className="text-border">•</span>
                <span>{tone.genre}</span>
                <span className="text-border">•</span>
                <span>By {tone.creator?.username}</span>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm mt-2">
                <span><span className="font-semibold text-foreground">Amp:</span> {tone.amp}</span>
                <span className="text-border">•</span>
                <span><span className="font-semibold text-foreground">Cabinet:</span> {tone.cabinet || 'Not set'}</span>
              </div>
            </div>

            {isOwner && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/tones/${tone.id}/edit`}>
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleDelete} disabled={isDeleting} className="text-destructive hover:text-destructive/80 hover:bg-destructive/10">
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      <StickyPedalSection nodes={nodes} zoomedItemId={zoomedItemId} setZoomedItemId={setZoomedItemId} />

      {/* Render Amp and Cabinet separated at the bottom, in normal document flow */}
      {(ampDefinition || cabinetDefinition) && (
        <section className="py-32 w-full flex justify-center bg-background relative z-10 min-h-screen">
          <div className="w-[1400px] flex flex-col items-center gap-8 relative origin-top" style={{ zoom: 0.7 }}>
            {ampDefinition && tone?.dspChain.amp ? (
              <div className="flex flex-col items-center gap-24 shrink-0 w-[1400px] relative">
                <motion.div
                  className={`cursor-pointer relative origin-top w-full flex justify-center ${zoomedItemId === 'amp' ? 'z-50' : 'z-20'}`}
                  onClick={() => setZoomedItemId(zoomedItemId === 'amp' ? null : 'amp')}
                  animate={{ 
                    scale: zoomedItemId === 'amp' ? 1.4 : 1.1,
                    zIndex: zoomedItemId === 'amp' ? 50 : 20,
                    y: zoomedItemId === 'amp' ? -20 : 0
                  }}
                >
                  <AmpHead
                    definition={ampDefinition}
                    controlValues={tone.dspChain.amp.controlValues}
                    onControlChange={() => undefined}
                    bypassed={tone.dspChain.amp.bypassed}
                  />
                </motion.div>
                
                {cabinetDefinition && tone?.dspChain.cabinet && (
                  <motion.div 
                    className="relative origin-top w-full flex justify-center z-10"
                    animate={{ scale: 1.1 }}
                  >
                    <Cabinet definition={cabinetDefinition} />
                  </motion.div>
                )}
              </div>
            ) : (
              cabinetDefinition && tone?.dspChain.cabinet && (
                <motion.div 
                  className="shrink-0 flex items-center relative z-10"
                  animate={{ scale: 1.1 }}
                >
                  <div className="relative origin-top w-[1400px] shrink-0 flex justify-center">
                    <Cabinet definition={cabinetDefinition} />
                  </div>
                </motion.div>
              )
            )}
          </div>
        </section>
      )}
    </main>
  );
}
