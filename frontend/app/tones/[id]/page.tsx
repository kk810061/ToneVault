'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
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
  <div className="w-16 h-5 bg-zinc-900 border-y border-black relative shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] shrink-0 z-0" />
);

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
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let targetScroll = container.scrollLeft;
    let isAnimating = false;

    const updateScroll = () => {
      if (!container) return;
      
      const diff = targetScroll - container.scrollLeft;
      
      // Stop animating if we're close enough to the target
      if (Math.abs(diff) < 1) {
        container.scrollLeft = targetScroll;
        isAnimating = false;
        return;
      }
      
      // Lerp: move 15% of the remaining distance per frame
      container.scrollLeft += diff * 0.15;
      requestAnimationFrame(updateScroll);
    };

    const handleWheel = (e: WheelEvent) => {
      // Only hijack if the user is scrolling vertically (e.g. mouse wheel)
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const isScrollingDown = e.deltaY > 0;
        const isScrollingUp = e.deltaY < 0;
        
        // Calculate max scrollable width
        const maxScrollLeft = container.scrollWidth - container.clientWidth;

        // If the user manually used the scrollbar, resync the target
        if (Math.abs(container.scrollLeft - targetScroll) > 100) {
          targetScroll = container.scrollLeft;
        }

        // If at the left edge and scrolling up (left), release to native scroll
        if (isScrollingUp && targetScroll <= 0) {
          return; 
        }

        // If at the right edge and scrolling down (right), release to native scroll
        if (isScrollingDown && Math.ceil(targetScroll) >= maxScrollLeft - 2) {
          return; 
        }

        // Otherwise, intercept and apply smooth scroll logic
        e.preventDefault();
        
        // Update target scroll position, multiplying by 1.2 for slightly snappier distance
        targetScroll = Math.max(0, Math.min(maxScrollLeft, targetScroll + e.deltaY * 1.2));
        
        // Kick off the animation loop if it's not already running
        if (!isAnimating) {
          isAnimating = true;
          requestAnimationFrame(updateScroll);
        }
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [tone, pedals, tone?.dspChain.pedals.length]);

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

  const isOwner = user?.id === tone.creator?.id;
  const ampDefinition = amps.find((amp) => amp.slug === tone.dspChain.amp?.definitionSlug);
  const cabinetDefinition = cabinets.find((cabinet) => cabinet.slug === tone.dspChain.cabinet?.definitionSlug);

  const nodes: { type: string, id: string, payload: any }[] = [];
  
  tone.dspChain.pedals.forEach((pedal) => {
    const definition = pedals.find((item) => item.slug === pedal.definitionSlug);
    if (definition) {
      nodes.push({ type: 'pedal', id: pedal.id, payload: { pedal, definition } });
    }
  });

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-card/50">
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

      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[95%] mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl py-8 relative min-h-[450px] shadow-2xl"
          >
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none rounded-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent pointer-events-none z-0 rounded-xl" />

            {zoomedItemId && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="fixed inset-0 z-40 bg-black/70 backdrop-blur-md cursor-pointer"
                onClick={() => setZoomedItemId(null)}
              />
            )}

            <div 
              className="flex flex-col items-center justify-start w-full py-8 origin-top relative"
              style={{ zoom: 0.7 }}
            >
              {nodes.length === 0 && !ampDefinition && !cabinetDefinition ? (
                <p className="text-muted-foreground font-semibold uppercase tracking-widest text-sm text-center w-full">No hardware in this rig</p>
              ) : (
                <div className="flex flex-col items-center w-full mx-auto">
                  {/* Horizontal Pedals Row */}
                  {nodes.length > 0 && (
                    <div 
                      ref={scrollContainerRef}
                      className="w-full overflow-x-auto custom-scrollbar"
                      style={{ paddingTop: '160px', paddingBottom: '120px' }}
                    >
                      <div className="flex flex-row items-center justify-start w-max mx-auto px-16">
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
                                  scale: zoomedItemId === node.id ? 1.4 : 1,
                                  zIndex: zoomedItemId === node.id ? 50 : 10,
                                  y: zoomedItemId === node.id ? -20 : 0
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
                              <HorizontalCable />
                            )}
                          </React.Fragment>
                        );
                      })}
                      </div>
                    </div>
                  )}

                  {/* Render Amp and Cabinet separated at the bottom */}
                  {(ampDefinition || cabinetDefinition) && (
                    <div className="w-[1400px] flex flex-col items-center gap-8 relative mt-8">
                      {ampDefinition && tone.dspChain.amp ? (
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
                          
                          {cabinetDefinition && tone.dspChain.cabinet && (
                            <motion.div 
                              className="relative origin-top w-full flex justify-center z-10"
                              animate={{ scale: 1.1 }}
                            >
                              <Cabinet definition={cabinetDefinition} />
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        cabinetDefinition && tone.dspChain.cabinet && (
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
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
