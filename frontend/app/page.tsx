'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { tonesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { ArrowRight, Music, Zap, Share2, Sparkles } from 'lucide-react';

interface FeaturedTone {
  id: string;
  title: string;
  artistInspiredBy: string;
  genre: string;
  creator: {
    username: string;
  };
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [featuredTones, setFeaturedTones] = useState<FeaturedTone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedTones = async () => {
      try {
        const data = await tonesApi.getAll({ limit: 3 });
        setFeaturedTones(data.slice(0, 3));
      } catch (error) {
        console.error('[v0] Failed to fetch featured tones:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedTones();
  }, []);

  return (
    <main className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center"
              >
                <Music className="w-7 h-7 text-black" />
              </motion.div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6">
              Premium{' '}
              <span className="bg-gradient-to-r from-accent to-orange-400 bg-clip-text text-transparent">
                Guitar Tones
              </span>
              {' '}for Everyone
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Discover, create, and share professional guitar tones. Build your collection and connect with the global guitar community.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="lg"
                asChild
                className="bg-accent hover:bg-accent/90 text-black font-semibold px-8"
              >
                <Link href="/browse">
                  Browse Tones
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>

              {!isAuthenticated && (
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-border hover:bg-card"
                >
                  <Link href="/register">Get Started</Link>
                </Button>
              )}
            </div>
          </motion.div>

          {/* Featured Stats */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20"
          >
            {[
              { icon: Sparkles, label: 'Professional Quality', description: 'Studio-grade tones' },
              { icon: Zap, label: 'Lightning Fast', description: 'Instant downloads' },
              { icon: Share2, label: 'Share & Collaborate', description: 'Connect with guitarists' },
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ y: -4 }}
                className="bg-card border border-border rounded-lg p-6 text-center"
              >
                <item.icon className="w-8 h-8 text-accent mx-auto mb-3" />
                <h3 className="font-semibold text-foreground mb-1">{item.label}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Tones Preview */}
      {featuredTones.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50 border-y border-border">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Featured Tones
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Explore our latest additions to the community
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredTones.map((tone, index) => (
                <motion.div
                  key={tone.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                  className="bg-background border border-border rounded-lg p-6 hover:border-accent/50 transition-all group cursor-pointer"
                  onClick={() => router.push(`/tones/${tone.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2 mb-2">
                        {tone.title}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        By {tone.creator.username}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <span className="px-2.5 py-1 rounded text-xs font-medium bg-accent/10 text-accent border border-accent/20">
                      {tone.genre}
                    </span>
                    <span className="px-2.5 py-1 rounded text-xs font-medium bg-muted text-muted-foreground border border-border">
                      {tone.artistInspiredBy}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" variant="outline" asChild>
                <Link href="/browse">
                  View All Tones
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center bg-card border border-accent/30 rounded-lg p-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Create?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            {isAuthenticated
              ? 'Start creating your own professional tones and share them with the community.'
              : 'Join thousands of guitarists and create your first tone today.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="bg-accent hover:bg-accent/90 text-black font-semibold">
              <Link href={isAuthenticated ? '/create' : '/register'}>
                Create Tone
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
