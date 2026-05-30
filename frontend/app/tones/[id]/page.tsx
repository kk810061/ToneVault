'use client';

import { use, useEffect, useState } from 'react';
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

export default function ToneDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [tone, setTone] = useState<Tone | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
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

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border rounded-lg p-6 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground">SIGNAL CHAIN</p>
              {tone.dspChain.pedals.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pedals in this tone.</p>
              ) : (
                tone.dspChain.pedals.map((pedal) => {
                  const definition = pedals.find((item) => item.slug === pedal.definitionSlug);
                  if (!definition) return null;
                  return (
                    <Pedal
                      key={pedal.id}
                      definition={definition}
                      controlValues={pedal.controlValues}
                      onControlChange={() => undefined}
                      bypassed={pedal.bypassed}
                    />
                  );
                })
              )}
            </div>

            {ampDefinition && tone.dspChain.amp && (
              <AmpHead
                definition={ampDefinition}
                controlValues={tone.dspChain.amp.controlValues}
                onControlChange={() => undefined}
              />
            )}
          </motion.div>

          <motion.aside initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {cabinetDefinition && <Cabinet definition={cabinetDefinition} />}
              <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground">TONE INFO</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Genre</span>
                    <span className="font-medium text-accent text-right">{tone.genre}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Amplifier</span>
                    <span className="font-medium text-accent text-right">{tone.amp}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">Cabinet</span>
                    <span className="font-medium text-accent text-right">{tone.cabinet || 'Not set'}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        </div>
      </section>
    </main>
  );
}
