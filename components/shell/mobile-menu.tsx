'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';

interface MobileMenuProps {
  role: 'consultant' | 'client';
  displayName: string;
  email: string;
  initial: string;
  onSignOut: () => void;
}

export function MobileMenu({
  role,
  displayName,
  email,
  initial,
  onSignOut,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const adminLinks = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/organizations', label: 'Clients', icon: '👥' },
    { href: '/admin/audit', label: 'Audit IA', icon: '✨' },
    { href: '/admin/roadmap', label: 'Roadmap', icon: '🗺️' },
    { href: '/admin/documents', label: 'Documents', icon: '📄' },
    { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
    { href: '/admin/settings', label: 'Paramètres', icon: '⚙️' },
  ];

  const clientLinks = [
    { href: '/dashboard', label: 'Tableau de bord', icon: '📊' },
    { href: '/dashboard/roadmap', label: 'Roadmap', icon: '🗺️' },
    { href: '/dashboard/documents', label: 'Documents', icon: '📄' },
  ];

  const links = role === 'consultant' ? adminLinks : clientLinks;

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 hover:bg-surface rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Panel */}
      <nav
        className={`fixed left-0 top-0 z-50 h-screen w-64 bg-ink-soft border-r border-line transform transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close Button */}
        <div className="flex items-center justify-between p-4 border-b border-line">
          <h2 className="text-sm font-semibold text-white">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-surface rounded transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-line">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-deep text-sm font-bold text-ink">
              {initial}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-semibold text-white">
                {displayName}
              </div>
              <div className="truncate text-[10px] text-muted">{email}</div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="overflow-y-auto p-3">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:bg-surface hover:text-white transition-colors"
            >
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Sign Out */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-line bg-ink-soft p-3">
          <form action={onSignOut}>
            <button
              type="submit"
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-surface transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <span>🚪</span>
              <span>Déconnexion</span>
            </button>
          </form>
        </div>
      </nav>
    </>
  );
}
