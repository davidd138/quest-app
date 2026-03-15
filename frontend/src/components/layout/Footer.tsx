'use client';

import Link from 'next/link';
import { Logo } from './Logo';
import { Twitter, Github, Instagram, Linkedin } from 'lucide-react';

const links = [
  { label: 'Privacidad', href: '/privacy' },
  { label: 'Términos', href: '/terms' },
  { label: 'Contacto', href: 'mailto:hola@questmaster.es' },
  { label: 'AEPD', href: 'https://www.aepd.es', external: true },
];

const socials = [
  { icon: Twitter, href: 'https://twitter.com/questmaster', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com/questmaster', label: 'Instagram' },
  { icon: Github, href: 'https://github.com/questmaster', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/company/questmaster', label: 'LinkedIn' },
];

export function Footer() {
  return (
    <footer className="glass border-t border-slate-700/50 mt-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <Logo size="sm" linkTo="/dashboard" />
            <p className="text-xs text-slate-500">
              Made with <span className="text-rose-400">&#9829;</span> in Spain
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {links.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>

          {/* Social icons */}
          <div className="flex items-center gap-3">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all duration-200"
              >
                <social.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-slate-700/30 text-center">
          <p className="text-xs text-slate-600">
            &copy; 2024 QuestMaster S.L. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
