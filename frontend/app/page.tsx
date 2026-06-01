'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { tonesApi } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  ArrowRight,
  Zap,
  Share2,
  Layers,
  ChevronRight,
  Sliders,
  Users,
} from 'lucide-react';

interface FeaturedTone {
  id: string;
  title: string;
  artistInspiredBy: string;
  genre: string;
  amp: string;
  effects?: string[];
  creator: { username: string };
}

// ── Shared animation config ──
// once: false → animates IN when scrolled into view, OUT when scrolled past
const VIEWPORT = { once: false, amount: 0.2 };
const VIEWPORT_TIGHT = { once: false, amount: 0.1 };

const fadeUp = {
  hidden: { opacity: 0, y: 48, filter: 'blur(4px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

const fadeUpSlow = {
  hidden: { opacity: 0, y: 60, filter: 'blur(6px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 32, filter: 'blur(3px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

// ── Decorative signal chain ──
// Correct order: OD → DIST → DELAY → REVERB → GATE → AMP → CAB
function DecorativeChain() {
  const nodes = [
    { label: 'OD', color: '#16a34a' },
    { label: 'DIST', color: '#ea580c' },
    { label: 'DELAY', color: '#0d9488' },
    { label: 'REVERB', color: '#475569' },
    { label: 'GATE', color: '#4b5563' },
    { label: 'AMP', color: '#374151', wide: true },
    { label: 'CAB', color: '#1f2937', tall: true },
  ];

  return (
    <div className="flex items-center gap-1.5 select-none" aria-hidden>
      {nodes.map((node, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.07, duration: 0.4 }}
            className="flex flex-col items-center justify-between rounded border-b-2 border-r shadow-lg px-1 py-1"
            style={{
              background: node.color,
              borderColor: `${node.color}bb`,
              width: node.wide ? 52 : 36,
              height: node.tall ? 56 : 48,
            }}
          >
            <div className="w-full bg-black/20 rounded-sm h-2.5" />
            <span className="text-[8px] font-bold text-white/80 tracking-wider leading-none">
              {node.label}
            </span>
            <div className="w-2 h-2 rounded-full bg-red-400 shadow-[0_0_4px_rgba(255,80,80,0.9)]" />
          </motion.div>
          {i < nodes.length - 1 && (
            <ChevronRight className="w-3 h-3 text-white/10 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Genre tiles ──
const CATEGORIES = [
  { label: 'Metal', color: 'from-red-900/50 to-red-950/30', border: 'border-red-800/40', text: 'text-red-200' },
  { label: 'Blues', color: 'from-blue-900/50 to-blue-950/30', border: 'border-blue-800/40', text: 'text-blue-200' },
  { label: 'Rock', color: 'from-orange-900/50 to-orange-950/30', border: 'border-orange-800/40', text: 'text-orange-200' },
  { label: 'Clean', color: 'from-teal-900/50 to-teal-950/30', border: 'border-teal-800/40', text: 'text-teal-200' },
  { label: 'Jazz', color: 'from-purple-900/50 to-purple-950/30', border: 'border-purple-800/40', text: 'text-purple-200' },
  { label: 'Funk', color: 'from-yellow-900/50 to-yellow-950/30', border: 'border-yellow-800/40', text: 'text-yellow-200' },
  { label: 'Country', color: 'from-amber-900/50 to-amber-950/30', border: 'border-amber-800/40', text: 'text-amber-200' },
  { label: 'Folk', color: 'from-green-900/50 to-green-950/30', border: 'border-green-800/40', text: 'text-green-200' },
];

const HOW_IT_WORKS = [
  {
    icon: Layers,
    step: '01',
    title: 'Build Your Rig',
    description: 'Drag and drop pedals, amps, and cabinets into your signal chain. Configure every knob and switch with realistic hardware-style controls.',
  },
  {
    icon: Sliders,
    step: '02',
    title: 'Craft Your Preset',
    description: 'Fine-tune gain, EQ, modulation, and time-based effects. Design the exact tone you have in your head — pedal by pedal.',
  },
  {
    icon: Share2,
    step: '03',
    title: 'Share with the World',
    description: 'Publish your tone to the community. Let guitarists worldwide load your exact preset into their own rig.',
  },
];

// ── Section heading with accent underline ──
function SectionHeading({
  eyebrow,
  title,
  subtitle,
  accent,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  accent?: string;
}) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={VIEWPORT}
      className="text-center mb-20"
    >
      {eyebrow && (
        <p className="tv-label text-accent mb-4 tracking-widest">{eyebrow}</p>
      )}
      <h2 className="tv-display text-4xl md:text-6xl text-foreground mb-5 leading-tight">
        {title}
      </h2>
      {/* Orange accent underline */}
      <div className="flex justify-center mb-6">
        <div className="h-0.5 w-16 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full" />
      </div>
      {subtitle && (
        <p className="text-muted-foreground max-w-lg mx-auto text-base leading-relaxed">
          {subtitle}
        </p>
      )}
      {accent && (
        <p className="text-sm text-accent/70 font-medium mt-2">{accent}</p>
      )}
    </motion.div>
  );
}

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [featuredTones, setFeaturedTones] = useState<FeaturedTone[]>([]);

  useEffect(() => {
    tonesApi.getAll({ limit: 6 }).then((data) => setFeaturedTones(data.slice(0, 6))).catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-background overflow-hidden">

      {/* ─────────────────────────────────────────────
          HERO
      ───────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pt-8 pb-28 overflow-hidden">
        {/* Guitarist photo background */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url(/hero-guitarist.png)' }}
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/72" />
        {/* Orange radial glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full pointer-events-none tv-animate-glow"
          style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.18) 0%, transparent 65%)' }}
        />
        {/* Grid texture */}
        <div className="absolute inset-0 tv-grid-bg opacity-25" />
        {/* Bottom fade into sections below */}
        <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-background to-transparent pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="tv-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-foreground mb-7"
          >
            Build. Discover.{' '}
            <br className="hidden sm:block" />
            Share{' '}
            <span className="tv-gradient-text">Legendary</span>
            <br className="hidden sm:block" />
            Guitar Tones.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Create signal chains with iconic amps and pedals. Configure every parameter.
            Share your sound with a global community of guitarists.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.38 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <motion.div whileTap={{ scale: 0.97 }}>
              <Button
                size="lg"
                asChild
                className="bg-accent hover:bg-accent/90 text-black font-bold px-8 text-base shadow-[0_0_28px_rgba(255,107,0,0.3)] hover:shadow-[0_0_36px_rgba(255,107,0,0.45)] transition-shadow h-12"
              >
                <Link href="/browse">
                  Browse Tones
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </motion.div>
            {!isAuthenticated && (
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="border-white/20 hover:border-accent/40 hover:bg-accent/5 text-foreground font-semibold px-8 text-base h-12 transition-all"
                >
                  <Link href="/register">Start Building Free</Link>
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Signal chain preview */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.55 }}
            className="mt-20 flex flex-col items-center gap-3"
          >
            <p className="tv-label text-muted-foreground/40">Example Signal Chain</p>
            <div className="p-4 rounded-xl border border-white/5 bg-black/40 backdrop-blur-sm">
              <DecorativeChain />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          HOW IT WORKS
      ───────────────────────────────────────────── */}
      <section className="relative py-32 sm:py-40 border-t border-border/30 bg-[#080808]">
        {/* subtle ambient glow top */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[1px] pointer-events-none"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,107,0,0.25), transparent)' }}
        />
        <div className="tv-container px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How it works"
            title={<>How <span className="tv-gradient-text">ToneVault</span> Works</>}
            subtitle="From your first knob turn to a shared preset — here's the journey."
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT_TIGHT}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="relative rounded-xl border border-border/50 bg-card/60 p-8 group hover:border-accent/25 transition-colors overflow-hidden"
              >
                {/* card top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
                <div className="flex items-center justify-between mb-7">
                  <div className="w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center group-hover:bg-accent/15 transition-colors">
                    <step.icon className="w-5 h-5 text-accent" />
                  </div>
                  <span
                    className="text-5xl font-black leading-none select-none"
                    style={{
                      color: 'rgba(255,107,0,0.30)',
                      textShadow: '0 0 20px rgba(255,107,0,0.15)',
                    }}
                  >
                    {step.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-3 tracking-tight">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          FEATURED TONES
      ───────────────────────────────────────────── */}
      {featuredTones.length > 0 && (
        <section className="relative py-32 sm:py-40 bg-background">
          <div className="tv-container px-4 sm:px-6 lg:px-8">
            <SectionHeading
              eyebrow="Community picks"
              title="Featured Tones"
              subtitle="Presets crafted by the community. Load one. Get inspired."
              accent="View all tones →"
            />

            {/* Override the accent → link since SectionHeading uses plain text */}
            <div className="text-center -mt-14 mb-14">
              <Link
                href="/browse"
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:text-accent/70 transition-colors group font-medium"
              >
                View all tones
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="show"
              viewport={VIEWPORT_TIGHT}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {featuredTones.map((tone) => (
                <motion.div
                  key={tone.id}
                  variants={staggerItem}
                  whileHover={{ y: -5, boxShadow: '0 20px 50px -10px rgba(255,107,0,0.18)' }}
                  onClick={() => router.push(`/tones/${tone.id}`)}
                  className="tv-card-accent p-6 cursor-pointer group rounded-xl"
                >
                  {/* Genre + amp */}
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-accent/10 text-accent border border-accent/20 uppercase tracking-wide">
                      {tone.genre}
                    </span>
                    {tone.amp && (
                      <span className="text-xs text-muted-foreground truncate">{tone.amp}</span>
                    )}
                  </div>
                  {/* Title */}
                  <h3 className="text-base font-bold text-foreground group-hover:text-accent transition-colors line-clamp-2 mb-1.5 tracking-tight">
                    {tone.title}
                  </h3>
                  {/* Artist */}
                  {tone.artistInspiredBy && (
                    <p className="text-xs text-muted-foreground mb-4">
                      Inspired by{' '}
                      <span className="text-accent font-semibold">{tone.artistInspiredBy}</span>
                    </p>
                  )}
                  {/* Signal chain text */}
                  {tone.effects && tone.effects.length > 0 && (
                    <p className="text-[11px] text-muted-foreground/50 font-mono mb-4 truncate">
                      {tone.effects.slice(0, 4).join(' → ')}
                      {tone.effects.length > 4 && ` +${tone.effects.length - 4}`}
                    </p>
                  )}
                  {/* Creator */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">
                      by <span className="text-foreground/70 font-medium">{tone.creator.username}</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-accent group-hover:translate-x-0.5 transition-all" />
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center mt-10 sm:hidden">
              <Button variant="outline" asChild className="border-surface-border">
                <Link href="/browse">View All Tones <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────
          EXPLORE GENRES
      ───────────────────────────────────────────── */}
      <section className="relative py-32 sm:py-40 border-t border-border/30 bg-[#080808]">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[1px] pointer-events-none"
          style={{ background: 'linear-gradient(to right, transparent, rgba(255,107,0,0.2), transparent)' }}
        />
        <div className="tv-container px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Explore"
            title={<>Every genre. <span className="tv-gradient-text">Every rig.</span></>}
            subtitle="From searing metal leads to glassy clean jazz tones — find or build the sound you've been chasing."
          />

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT_TIGHT}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {CATEGORIES.map((cat) => (
              <motion.div
                key={cat.label}
                variants={staggerItem}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <Link
                  href={`/browse?genre=${cat.label}`}
                  className={`flex items-center justify-center h-16 rounded-xl border bg-gradient-to-br ${cat.color} ${cat.border} cursor-pointer transition-all hover:brightness-110`}
                >
                  <span className={`text-sm font-bold ${cat.text} tracking-wide`}>{cat.label}</span>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────
          COMMUNITY CTA
      ───────────────────────────────────────────── */}
      <section className="py-32 sm:py-40 bg-background">
        <div className="tv-container px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUpSlow}
            initial="hidden"
            whileInView="show"
            viewport={VIEWPORT}
            className="relative rounded-2xl border border-accent/20 overflow-hidden"
          >
            {/* Background layers */}
            <div className="absolute inset-0 tv-grid-bg opacity-40" />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 50% 110%, rgba(255,107,0,0.12) 0%, transparent 65%)' }}
            />
            {/* Top glow line */}
            <div
              className="absolute top-0 left-1/4 right-1/4 h-px"
              style={{ background: 'linear-gradient(to right, transparent, rgba(255,107,0,0.4), transparent)' }}
            />

            <div className="relative z-10 py-20 px-8 md:py-24 md:px-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent/12 border border-accent/25 flex items-center justify-center mx-auto mb-8">
                <Users className="w-7 h-7 text-accent" />
              </div>
              <h2 className="tv-display text-3xl md:text-5xl text-foreground mb-5">
                {isAuthenticated ? 'Ready to create your next tone?' : 'Join the community.'}
              </h2>
              {/* accent underline */}
              <div className="flex justify-center mb-6">
                <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-accent to-transparent rounded-full" />
              </div>
              <p className="text-muted-foreground text-lg max-w-md mx-auto mb-10 leading-relaxed">
                {isAuthenticated
                  ? 'Open the editor and start building your signal chain.'
                  : 'Sign up free and start building your first rig in minutes.'}
              </p>
              <motion.div whileTap={{ scale: 0.97 }} className="inline-block">
                <Button
                  size="lg"
                  asChild
                  className="bg-accent hover:bg-accent/90 text-black font-bold px-12 text-base h-12 shadow-[0_0_28px_rgba(255,107,0,0.3)] hover:shadow-[0_0_44px_rgba(255,107,0,0.5)] transition-shadow"
                >
                  <Link href={isAuthenticated ? '/create' : '/register'}>
                    {isAuthenticated ? 'Open Editor' : 'Get Started Free'}
                    <Zap className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

    </main>
  );
}
