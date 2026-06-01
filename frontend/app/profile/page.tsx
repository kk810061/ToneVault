'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { tonesApi } from '@/lib/api';
import { ToneCardGrid } from '@/components/tone-card';
import { LoadingSpinner, EmptyState } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusSquare, Guitar, Heart, Calendar } from 'lucide-react';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  createdAt: string;
}

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

function ProfileAvatar({ username, avatar, size = 'lg' }: { username: string; avatar?: string; size?: 'lg' | 'sm' }) {
  const initials = username
    .split(/[\s_-]/)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const dim = size === 'lg' ? 'w-20 h-20 text-2xl' : 'w-10 h-10 text-sm';

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={username}
        className={`${dim} rounded-full object-cover border-2 border-accent/40 shadow-[0_0_20px_rgba(255,107,0,0.2)]`}
      />
    );
  }

  return (
    <div
      className={`${dim} rounded-full bg-accent/10 border-2 border-accent/40 flex items-center justify-center font-bold text-accent shadow-[0_0_20px_rgba(255,107,0,0.15)]`}
    >
      {initials}
    </div>
  );
}

function StatBadge({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center sm:items-start gap-0.5">
      <span className="text-xl font-bold text-foreground">{value}</span>
      <span className="tv-label text-muted-foreground">{label}</span>
    </div>
  );
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [createdTones, setCreatedTones] = useState<Tone[]>([]);
  const [favoriteTones] = useState<Tone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!user?.id) return;
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await tonesApi.getAll({ creatorId: user.id });
        setCreatedTones(data);
        setProfile({
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: new Date().toISOString(),
        });
      } catch {
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user?.id]);

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner label="Loading your profile…" />
      </main>
    );
  }

  if (!profile || error) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <EmptyState variant="error" description="Unable to load your profile. Please try again." />
      </main>
    );
  }

  const joinYear = new Date(profile.createdAt).getFullYear();

  return (
    <main className="min-h-screen bg-background">

      {/* ─── Profile Header ─── */}
      <section className="relative border-b border-border/40 overflow-hidden bg-black">
        {/* Grid texture */}
        <div className="absolute inset-0 tv-grid-bg opacity-30" />
        {/* Accent glow behind avatar */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1/2 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 0% 50%, rgba(255,107,0,0.08) 0%, transparent 65%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent pointer-events-none" />

        <div className="relative z-10 tv-container px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8">
              {/* Avatar */}
              <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.45, delay: 0.1 }}>
                <ProfileAvatar username={profile.username} avatar={profile.avatar} size="lg" />
              </motion.div>

              {/* Info */}
              <div className="flex-1 text-center sm:text-left">
                <p className="tv-label text-muted-foreground mb-1">Guitarist</p>
                <h1 className="tv-display text-3xl sm:text-4xl text-foreground mb-2">{profile.username}</h1>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mb-4 max-w-md">{profile.bio}</p>
                )}

                {/* Stats row */}
                <div className="flex items-center justify-center sm:justify-start gap-8 mt-4">
                  <StatBadge value={createdTones.length} label="Tones Created" />
                  <div className="w-px h-8 bg-border/60" />
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-sm">Member since {joinYear}</span>
                  </div>
                </div>
              </div>

              {/* Create CTA */}
              <motion.div whileTap={{ scale: 0.97 }} className="flex-shrink-0">
                <Button
                  asChild
                  className="bg-accent hover:bg-accent/90 text-black font-bold shadow-[0_0_20px_rgba(255,107,0,0.25)] hover:shadow-[0_0_28px_rgba(255,107,0,0.35)] transition-shadow"
                >
                  <Link href="/create" className="flex items-center gap-2">
                    <PlusSquare className="w-4 h-4" />
                    New Tone
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Content ─── */}
      <section className="tv-section pt-10">
        <div className="tv-container px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.15 }}
          >
            <Tabs defaultValue="created">
              {/* Tab bar */}
              <TabsList className="h-auto p-1 bg-card border border-border/60 rounded-xl mb-8 gap-1">
                <TabsTrigger
                  value="created"
                  className="
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:shadow-none
                    text-muted-foreground hover:text-foreground
                  "
                >
                  <Guitar className="w-3.5 h-3.5" />
                  My Tones
                  <span className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-semibold">
                    {createdTones.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger
                  value="favorites"
                  className="
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    data-[state=active]:bg-accent/10 data-[state=active]:text-accent data-[state=active]:shadow-none
                    text-muted-foreground hover:text-foreground
                  "
                >
                  <Heart className="w-3.5 h-3.5" />
                  Saved
                  <span className="text-xs bg-muted text-muted-foreground rounded px-1.5 py-0.5 font-semibold">
                    {favoriteTones.length}
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="created" className="mt-0">
                {createdTones.length === 0 ? (
                  <EmptyState variant="created" />
                ) : (
                  <div className="space-y-6">
                    <p className="text-sm text-muted-foreground">
                      You&apos;ve created{' '}
                      <span className="font-semibold text-foreground">{createdTones.length}</span>{' '}
                      tone{createdTones.length !== 1 ? 's' : ''}
                    </p>
                    <ToneCardGrid tones={createdTones} />
                  </div>
                )}
              </TabsContent>

              <TabsContent value="favorites" className="mt-0">
                {favoriteTones.length === 0 ? (
                  <EmptyState variant="favorites" />
                ) : (
                  <ToneCardGrid tones={favoriteTones} />
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
