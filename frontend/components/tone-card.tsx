'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { EffectBadgeGroup } from './effect-badge';

interface ToneCardProps {
  id: string;
  title: string;
  artistInspiredBy: string;
  genre: string;
  amp: string;
  creator: {
    id: string;
    username: string;
    avatar?: string;
  };
  effects?: string[];
  index?: number;
}

export function ToneCard({
  id,
  title,
  artistInspiredBy,
  genre,
  amp,
  creator,
  effects = [],
  index = 0,
}: ToneCardProps) {
  return (
    <Link href={`/tones/${id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(255, 107, 0, 0.15)' }}
        className="bg-card border border-border rounded-lg p-5 hover:border-accent/50 transition-all cursor-pointer group h-full flex flex-col justify-between"
      >
        {/* Header */}
        <div className="space-y-3 mb-4">
          <div>
            <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors line-clamp-2">
              {title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Inspired by <span className="text-accent font-medium">{artistInspiredBy}</span>
            </p>
          </div>

          {/* Genre and Amp */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent border border-accent/20">
              {genre}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
              {amp}
            </span>
          </div>
        </div>

        {/* Effects */}
        {effects && effects.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">Effects</p>
            <div className="flex flex-wrap gap-1.5">
              {effects.slice(0, 3).map((effect) => (
                <span
                  key={effect}
                  className="px-2 py-1 rounded text-xs font-medium bg-muted/50 text-muted-foreground border border-border/50"
                >
                  {effect}
                </span>
              ))}
              {effects.length > 3 && (
                <span className="px-2 py-1 rounded text-xs font-medium text-muted-foreground">
                  +{effects.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Creator */}
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          {creator.avatar && (
            <img
              src={creator.avatar}
              alt={creator.username}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-xs text-muted-foreground">By {creator.username}</span>
        </div>
      </motion.div>
    </Link>
  );
}

export function ToneCardGrid({ tones, isLoading }: { tones: ToneCardProps[]; isLoading?: boolean }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tones.map((tone, index) => (
        <ToneCard key={tone.id} {...tone} index={index} />
      ))}
    </div>
  );
}
