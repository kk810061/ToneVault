'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LogOut,
  User,
  Music2,
  Compass,
  PlusSquare,
  ChevronDown,
} from 'lucide-react';

const NAV_LINKS = [
  { href: '/browse', label: 'Browse', icon: Compass },
  { href: '/create', label: 'Create', icon: PlusSquare, authRequired: true },
];

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <Link href={href} className="relative flex items-center gap-1.5 group px-1 py-1">
      <Icon
        className={`w-3.5 h-3.5 transition-colors duration-150 ${
          active ? 'text-accent' : 'text-muted-foreground group-hover:text-foreground'
        }`}
      />
      <span
        className={`text-sm font-medium transition-colors duration-150 ${
          active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
        }`}
      >
        {label}
      </span>
      {/* Active indicator line */}
      <motion.span
        className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-accent rounded-full"
        initial={false}
        animate={{ scaleX: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ transformOrigin: 'left' }}
      />
      {/* Hover indicator line */}
      {!active && (
        <motion.span
          className="absolute -bottom-[17px] left-0 right-0 h-[2px] bg-surface-border rounded-full"
          initial={{ scaleX: 0, opacity: 0 }}
          whileHover={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.18 }}
          style={{ transformOrigin: 'left' }}
        />
      )}
    </Link>
  );
}

function UserAvatar({ username }: { username: string }) {
  const initials = username
    .split(/[\s_-]/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center">
      <span className="text-xs font-bold text-accent tracking-tight">{initials}</span>
    </div>
  );
}

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const visibleLinks = NAV_LINKS.filter(
    (link) => !link.authRequired || isAuthenticated
  );

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="sticky top-0 z-[100] border-b border-border/60 bg-black/85 backdrop-blur-xl"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 8 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center shadow-[0_0_12px_rgba(255,107,0,0.35)]"
          >
            <Music2 className="w-4.5 h-4.5 text-black" strokeWidth={2.5} />
          </motion.div>
          <span className="text-base font-bold tracking-tight text-foreground group-hover:text-accent transition-colors duration-150">
            ToneVault
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden sm:flex items-center gap-6 border-b border-transparent">
          {visibleLinks.map((link) => (
            <NavLink
              key={link.href}
              href={link.href}
              label={link.label}
              icon={link.icon}
              active={pathname === link.href || pathname.startsWith(link.href + '/')}
            />
          ))}
        </nav>

        {/* Auth area */}
        <div className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-muted-foreground hover:text-foreground hover:bg-transparent text-sm font-medium"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <motion.div whileTap={{ scale: 0.97 }}>
                <Button
                  size="sm"
                  asChild
                  className="bg-accent hover:bg-accent/90 text-black font-semibold text-sm px-4 shadow-[0_0_16px_rgba(255,107,0,0.25)] hover:shadow-[0_0_20px_rgba(255,107,0,0.35)] transition-shadow"
                >
                  <Link href="/register">Sign Up</Link>
                </Button>
              </motion.div>
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5 transition-colors duration-150 outline-none">
                  <UserAvatar username={user?.username || 'U'} />
                  <span className="hidden sm:block text-sm font-medium text-foreground max-w-[100px] truncate">
                    {user?.username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 bg-card/95 backdrop-blur-xl border-surface-border shadow-xl shadow-black/40"
              >
                {/* User info header */}
                <div className="px-3 py-2.5 border-b border-border/60">
                  <p className="text-sm font-semibold text-foreground truncate">{user?.username}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{user?.email}</p>
                </div>

                <div className="py-1">
                  <DropdownMenuItem className="cursor-pointer gap-2.5 text-sm" asChild>
                    <Link href="/profile" className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>My Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer gap-2.5 text-sm" asChild>
                    <Link href="/create" className="flex items-center gap-2.5">
                      <PlusSquare className="w-4 h-4 text-muted-foreground" />
                      <span>New Tone</span>
                    </Link>
                  </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="bg-border/60" />

                <div className="py-1">
                  <DropdownMenuItem
                    className="cursor-pointer gap-2.5 text-sm text-destructive focus:text-destructive focus:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </motion.header>
  );
}
