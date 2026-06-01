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
import { ArrowLeft, Edit2, Trash2, ChevronRight } from 'lucide-react';

const PatchCable = ({ flex = false }: { flex?: boolean }) => (
  <div className={`${flex ? 'flex-1 min-w-[3rem]' : 'w-16'} h-12 flex items-center shrink-0 z-0 opacity-100 pointer-events-none drop-shadow-2xl self-center`}>
    <div className="w-4 h-8 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-500 rounded-l-[4px] border border-black/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]"></div>
    <div className="flex-1 h-5 bg-zinc-900 border-y border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_4px_8px_rgba(0,0,0,0.8)]"></div>
    <div className="w-4 h-8 bg-gradient-to-b from-zinc-300 via-zinc-400 to-zinc-500 rounded-r-[4px] border border-black/80 shadow-[inset_0_1px_2px_rgba(255,255,255,0.4)]"></div>
  </div>
);

const CornerTopRight = () => (
  <div className="relative w-12 shrink-0 self-stretch flex items-end">
    <div className="absolute top-1/2 left-0 w-full h-5 bg-zinc-900 border-y border-black -translate-y-1/2" />
    <div className="w-5 h-1/2 bg-zinc-900 border-x border-black absolute right-0 bottom-0" />
    <div className="absolute top-1/2 right-0 w-5 h-5 bg-zinc-700 border border-black -translate-y-1/2 rounded-[4px]" />
  </div>
);

const CornerBottomRight = () => (
  <div className="relative w-12 shrink-0 self-stretch flex items-start">
    <div className="w-5 h-1/2 bg-zinc-900 border-x border-black absolute right-0 top-0" />
    <div className="absolute top-1/2 left-0 w-full h-5 bg-zinc-900 border-y border-black -translate-y-1/2" />
    <div className="absolute top-1/2 right-0 w-5 h-5 bg-zinc-700 border border-black -translate-y-1/2 rounded-[4px]" />
  </div>
);

const GapCableRight = () => (
  <div className="w-full h-16 flex justify-end">
    <div className="w-12 relative h-full shrink-0">
       <div className="absolute top-0 right-0 w-5 h-full bg-zinc-900 border-x border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]" />
    </div>
  </div>
);

const CornerTopLeft = () => (
  <div className="relative w-12 shrink-0 self-stretch flex items-end">
    <div className="absolute top-1/2 left-0 w-full h-5 bg-zinc-900 border-y border-black -translate-y-1/2" />
    <div className="w-5 h-1/2 bg-zinc-900 border-x border-black absolute left-0 bottom-0" />
    <div className="absolute top-1/2 left-0 w-5 h-5 bg-zinc-700 border border-black -translate-y-1/2 rounded-[4px]" />
  </div>
);

const CornerBottomLeft = () => (
  <div className="relative w-12 shrink-0 self-stretch flex items-start">
    <div className="w-5 h-1/2 bg-zinc-900 border-x border-black absolute left-0 top-0" />
    <div className="absolute top-1/2 left-0 w-full h-5 bg-zinc-900 border-y border-black -translate-y-1/2" />
    <div className="absolute top-1/2 left-0 w-5 h-5 bg-zinc-700 border border-black -translate-y-1/2 rounded-[4px]" />
  </div>
);

const GapCableLeft = () => (
  <div className="w-full h-16 flex justify-start">
    <div className="w-12 relative h-full shrink-0">
       <div className="absolute top-0 left-0 w-5 h-full bg-zinc-900 border-x border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]" />
    </div>
  </div>
);

const AmpPlugRight = () => (
  <div className="w-[1400px] h-0 relative shrink-0 z-0">
    <div className="absolute top-0 right-0 w-12 flex justify-end" style={{ height: '140px' }}>
      <div className="w-5 h-full bg-zinc-900 border-x border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]" />
    </div>
    <div className="absolute top-[130px] right-[24px] w-5 h-5 bg-zinc-700 border border-black rounded-[4px]" />
    <div className="absolute top-[130px] right-[24px] w-[176px] h-5 bg-zinc-900 border-y border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]" />
  </div>
);

const AmpPlugLeft = () => (
  <div className="w-[1400px] h-0 relative shrink-0 z-0">
    <div className="absolute top-0 left-0 w-12 flex justify-start" style={{ height: '140px' }}>
      <div className="w-5 h-full bg-zinc-900 border-x border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]" />
    </div>
    <div className="absolute top-[130px] left-[24px] w-5 h-5 bg-zinc-700 border border-black rounded-[4px]" />
    <div className="absolute top-[130px] left-[24px] w-[176px] h-5 bg-zinc-900 border-y border-black shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)]" />
  </div>
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

  const ITEMS_PER_ROW = 3;
  const nodes: { type: string, id: string, payload: any }[] = [];
  
  tone.dspChain.pedals.forEach((pedal) => {
    const definition = pedals.find((item) => item.slug === pedal.definitionSlug);
    if (definition) {
      nodes.push({ type: 'pedal', id: pedal.id, payload: { pedal, definition } });
    }
  });

  if (ampDefinition || cabinetDefinition) {
    // We will render these separately at the bottom
  }

  const rows: typeof nodes[] = [];
  let currentRow: typeof nodes = [];
  nodes.forEach((node) => {
    if (node.type === 'amp-cab') {
      if (currentRow.length > 0) { rows.push(currentRow); currentRow = []; }
      rows.push([node]);
    } else {
      currentRow.push(node);
      if (currentRow.length === ITEMS_PER_ROW) { rows.push(currentRow); currentRow = []; }
    }
  });
  if (currentRow.length > 0) rows.push(currentRow);

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
            className="w-full bg-neutral-950 border border-neutral-800 rounded-xl flex items-start p-8 overflow-x-auto relative min-h-[450px] shadow-2xl"
          >
            {/* Subtle grid background */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none rounded-xl"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent pointer-events-none z-0 rounded-xl" />

            {/* The Boustophedon interactive hardware rig */}
            <div 
              className="flex flex-col items-center justify-center w-full mx-auto py-12 origin-top relative"
              style={{ zoom: 0.7 }}
            >
              {/* Backdrop overlay for zoom - must be inside scaled container to share stacking context */}
              {zoomedItemId && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute -inset-20 z-40 bg-black/70 backdrop-blur-md cursor-pointer rounded-xl"
                  onClick={() => setZoomedItemId(null)}
                />
              )}
              {rows.length === 0 ? (
                <p className="text-muted-foreground font-semibold uppercase tracking-widest text-sm text-center w-full">No hardware in this rig</p>
              ) : (
                <div className="flex flex-col w-[1400px] mx-auto">
                  {rows.map((row, rowIndex) => {
                    const isEven = rowIndex % 2 === 0;
                    const hasNextRow = rowIndex < rows.length - 1;
                    const isFirstRow = rowIndex === 0;

                    return (
                      <React.Fragment key={`row-${rowIndex}`}>
                        <div className={`flex w-full items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}>
                          
                          {!isFirstRow && (
                            isEven ? (
                              <>
                                <CornerBottomLeft />
                                <PatchCable />
                              </>
                            ) : (
                              <>
                                <CornerBottomRight />
                                <PatchCable />
                              </>
                            )
                          )}

                          {row.map((node, nodeIndex) => {
                            const isLastNodeInRow = nodeIndex === row.length - 1;
                            return (
                              <React.Fragment key={node.id}>
                                <div className={`flex flex-col justify-center shrink-0 my-4 relative ${zoomedItemId === node.id ? 'z-50' : 'z-10'}`}>
                                  {node.type === 'pedal' && (
                                    <motion.div
                                      className="cursor-pointer relative origin-top"
                                      onClick={() => setZoomedItemId(zoomedItemId === node.id ? null : node.id)}
                                      animate={{ 
                                        scale: zoomedItemId === node.id ? 1.4 : 1,
                                        zIndex: zoomedItemId === node.id ? 50 : 1,
                                        y: zoomedItemId === node.id ? -10 : 0
                                      }}
                                    >
                                      <Pedal
                                        definition={node.payload.definition}
                                        controlValues={node.payload.pedal.controlValues}
                                        onControlChange={() => undefined}
                                        bypassed={node.payload.pedal.bypassed}
                                      />
                                    </motion.div>
                                  )}
                                </div>

                                {!isLastNodeInRow && <PatchCable flex />}
                              </React.Fragment>
                            );
                          })}

                          {isEven ? (
                            <>
                              <PatchCable flex={!hasNextRow} />
                              <CornerTopRight />
                            </>
                          ) : (
                            <>
                              <PatchCable flex={!hasNextRow} />
                              <CornerTopLeft />
                            </>
                          )}
                        </div>

                        {isEven ? <GapCableRight /> : <GapCableLeft />}
                      </React.Fragment>
                    );
                  })}
                  
                  {/* Render Amp and Cabinet separated at the bottom */}
                  {(ampDefinition || cabinetDefinition) && (
                    <div className="w-[1400px] flex flex-col items-center gap-8 relative mt-0">
                      
                      {/* Traversal cable if there are pedals */}
                      {nodes.length > 0 && (
                        (rows.length - 1) % 2 === 0 ? <AmpPlugRight /> : <AmpPlugLeft />
                      )}
                      
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
