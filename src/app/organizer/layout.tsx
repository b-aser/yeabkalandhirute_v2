'use client'
import { useAuth } from '@/hooks/useAuth'
import { ExternalLink, LogOut } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

/**
 * Admin layout — wraps every route under /admin.
 * Handles client-side auth guard as a second layer of defence
 * (the middleware is the primary gate).
 */
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Client-side guard: if auth resolves and user has no access, send to /auth.
    if (!loading && !user) {
      router.replace('/auth?next=/admin');
    }
  }, [loading, user, router]);

  // Show nothing while auth is resolving to avoid flash.
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border border-gold rounded-full animate-spin border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-blush px-6 md:px-10 py-5 flex items-center justify-between bg-white/40 backdrop-blur sticky top-0 z-40">
        <div>
          <p className="text-[10px] tracking-[0.45em] uppercase text-warm-soft">Wedding Organizer</p>
          <h1 className="font-display text-2xl text-warm-dark">Dashboard</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="nav-link inline-flex items-center gap-1">
            View site <ExternalLink className="w-3 h-3" />
          </Link>
          <button onClick={signOut} className="nav-link inline-flex items-center gap-1">
            <LogOut className="w-3 h-3" /> Sign out
          </button>
        </div>
      </header>

      {children}
    </div>
  );
};

export default AdminLayout;