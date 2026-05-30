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
import { ArrowLeft, Mail } from 'lucide-react';

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
  creator: {
    id: string;
    username: string;
    avatar?: string;
  };
  effects?: string[];
}

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [createdTones, setCreatedTones] = useState<Tone[]>([]);
  const [favoriteTones, setFavoriteTones] = useState<Tone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!user?.id) return;

    const fetchProfile = async () => {
      try {
        setIsLoading(true);

        const data = await tonesApi.getAll({ creatorId: user.id });
        setCreatedTones(data);
        setFavoriteTones([]);

        // Set profile from user context
        setProfile({
          id: user.id,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          bio: user.bio,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('[v0] Failed to fetch profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  if (authLoading || isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </main>
    );
  }

  if (!profile || error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/browse">
            <Button variant="ghost" className="mb-8 text-accent hover:text-accent/80">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold text-foreground mb-2">Profile not found</h1>
            <p className="text-muted-foreground">Unable to load your profile.</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <section className="border-b border-border bg-card/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link href="/browse" className="inline-flex items-center gap-2 text-accent hover:text-accent/80 mb-6 group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Browse
            </Link>

            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {profile.avatar && (
                <motion.img
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  src={profile.avatar}
                  alt={profile.username}
                  className="w-20 h-20 rounded-full border-2 border-accent/30"
                />
              )}

              <div className="flex-1">
                <h1 className="text-4xl font-bold text-foreground mb-2">{profile.username}</h1>

                {profile.bio && (
                  <p className="text-muted-foreground mb-4">{profile.bio}</p>
                )}

                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                  </div>
                  <div className="text-muted-foreground">
                    Member since {new Date(profile.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <Button asChild>
                <Link href="/create" className="bg-accent hover:bg-accent/90 text-black font-semibold">
                  Create Tone
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Tabs defaultValue="created" className="space-y-6">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="created" className="data-[state=active]:bg-accent/10">
                  Created Tones
                  <span className="ml-2 text-xs font-semibold bg-muted text-muted-foreground rounded px-2 py-0.5">
                    {createdTones.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="favorites" className="data-[state=active]:bg-accent/10">
                  Favorite Tones
                  <span className="ml-2 text-xs font-semibold bg-muted text-muted-foreground rounded px-2 py-0.5">
                    {favoriteTones.length}
                  </span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="created" className="space-y-6">
                {createdTones.length === 0 ? (
                  <EmptyState
                    title="No tones created yet"
                    description="Start creating your first guitar tone"
                  />
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground">
                      You&apos;ve created <span className="font-semibold text-foreground">{createdTones.length}</span> tone
                      {createdTones.length !== 1 ? 's' : ''}
                    </div>
                    <ToneCardGrid tones={createdTones} />
                  </>
                )}
              </TabsContent>

              <TabsContent value="favorites" className="space-y-6">
                {favoriteTones.length === 0 ? (
                  <EmptyState
                    title="No favorite tones yet"
                    description="Browse and like tones to add them to your favorites"
                  />
                ) : (
                  <>
                    <div className="text-sm text-muted-foreground">
                      You have <span className="font-semibold text-foreground">{favoriteTones.length}</span> favorite tone
                      {favoriteTones.length !== 1 ? 's' : ''}
                    </div>
                    <ToneCardGrid tones={favoriteTones} />
                  </>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
