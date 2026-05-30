'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LogOut, User, Music } from 'lucide-react';

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <motion.div
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.5 }}
            className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center"
          >
            <Music className="w-5 h-5 text-black" />
          </motion.div>
          <span className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">
            ToneVault
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <nav className="hidden sm:flex items-center gap-6">
            <Link
              href="/browse"
              className="text-sm text-muted-foreground hover:text-accent transition-colors"
            >
              Browse
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/create"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Create
                </Link>
                <Link
                  href="/profile"
                  className="text-sm text-muted-foreground hover:text-accent transition-colors"
                >
                  Profile
                </Link>
              </>
            )}
          </nav>

          {/* Auth Buttons */}
          {!isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  {user?.username || 'Menu'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                <DropdownMenuItem className="cursor-pointer" asChild>
                  <Link href="/profile" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </motion.header>
  );
}
