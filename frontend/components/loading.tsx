'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Guitar, Heart, Search, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ── Card-shaped skeleton matching ToneCard layout ──
function ToneCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden animate-pulse">
      {/* Preview strip */}
      <div className="h-[72px] bg-muted/50 border-b border-border/60" />
      {/* Content */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <div className="h-4 w-14 bg-muted rounded" />
          <div className="h-4 w-24 bg-muted/60 rounded" />
        </div>
        <div className="h-4 w-3/4 bg-muted rounded" />
        <div className="h-3 w-1/2 bg-muted/60 rounded" />
        <div className="h-3 w-2/3 bg-muted/40 rounded" />
        <div className="pt-2 border-t border-border/50 flex gap-2 items-center">
          <div className="w-4 h-4 rounded-full bg-muted" />
          <div className="h-3 w-20 bg-muted/60 rounded" />
        </div>
      </div>
    </div>
  );
}

export function LoadingSkeleton({ count = 6 }: { count?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ToneCardSkeleton key={i} />
      ))}
    </motion.div>
  );
}

export function LoadingSpinner({ label }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 className="w-7 h-7 text-accent" />
      </motion.div>
      {label && <p className="tv-meta">{label}</p>}
    </div>
  );
}

// ── Contextual empty-state variants ──
type EmptyVariant = 'search' | 'created' | 'favorites' | 'error' | 'default';

interface EmptyStateProps {
  title?: string;
  description?: string;
  variant?: EmptyVariant;
  cta?: { label: string; href: string };
}

const VARIANT_DEFAULTS: Record<EmptyVariant, {
  icon: React.ElementType;
  title: string;
  description: string;
  cta?: { label: string; href: string };
}> = {
  search: {
    icon: Search,
    title: 'No tones match your search.',
    description: 'Try adjusting your filters or search for a different genre, amp, or artist.',
  },
  created: {
    icon: Guitar,
    title: "No tones in your collection yet.",
    description: 'Start building your first rig. Configure amps, pedals, and effects — then share it with the world.',
    cta: { label: 'Create Your First Tone', href: '/create' },
  },
  favorites: {
    icon: Heart,
    title: 'No saved tones yet.',
    description: "Browse the community's tones and save the ones you love.",
    cta: { label: 'Browse Tones', href: '/browse' },
  },
  error: {
    icon: AlertTriangle,
    title: 'Something went wrong.',
    description: 'We had trouble loading this content. Check your connection or try again.',
  },
  default: {
    icon: Guitar,
    title: 'Nothing here yet.',
    description: 'Check back later or start building something new.',
    cta: { label: 'Browse Tones', href: '/browse' },
  },
};

export function EmptyState({
  title,
  description,
  variant = 'default',
  cta,
}: EmptyStateProps) {
  const defaults = VARIANT_DEFAULTS[variant];
  const Icon = defaults.icon;
  const resolvedTitle = title ?? defaults.title;
  const resolvedDescription = description ?? defaults.description;
  const resolvedCta = cta ?? defaults.cta;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center mb-5">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{resolvedTitle}</h3>
      {resolvedDescription && (
        <p className="text-sm text-muted-foreground max-w-sm mb-6 leading-relaxed">
          {resolvedDescription}
        </p>
      )}
      {resolvedCta && (
        <motion.div whileTap={{ scale: 0.97 }}>
          <Button
            size="sm"
            asChild
            className="bg-accent hover:bg-accent/90 text-black font-semibold shadow-[0_0_16px_rgba(255,107,0,0.2)]"
          >
            <Link href={resolvedCta.href}>{resolvedCta.label}</Link>
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
