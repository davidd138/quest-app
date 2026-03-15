'use client';

import { useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Download, Share2, X, Award, Star } from 'lucide-react';

interface CompletionCertificateProps {
  questTitle: string;
  userName: string;
  score: number;
  maxScore: number;
  completedAt: string;
  onClose?: () => void;
}

function getScoreTier(score: number, maxScore: number): 'gold' | 'silver' | 'bronze' {
  const pct = (score / maxScore) * 100;
  if (pct >= 95) return 'gold';
  if (pct >= 75) return 'silver';
  return 'bronze';
}

const tierConfig = {
  gold: {
    label: 'Excelencia',
    borderColor: '#f59e0b',
    gradientFrom: '#fbbf24',
    gradientTo: '#d97706',
    textColor: '#fbbf24',
    bgGlow: 'rgba(245, 158, 11, 0.1)',
    sealText: 'ORO',
  },
  silver: {
    label: 'Distincion',
    borderColor: '#94a3b8',
    gradientFrom: '#cbd5e1',
    gradientTo: '#64748b',
    textColor: '#cbd5e1',
    bgGlow: 'rgba(148, 163, 184, 0.1)',
    sealText: 'PLATA',
  },
  bronze: {
    label: 'Completado',
    borderColor: '#f97316',
    gradientFrom: '#fb923c',
    gradientTo: '#c2410c',
    textColor: '#fb923c',
    bgGlow: 'rgba(249, 115, 22, 0.1)',
    sealText: 'BRONCE',
  },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function CompletionCertificate({
  questTitle,
  userName,
  score,
  maxScore,
  completedAt,
  onClose,
}: CompletionCertificateProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const tier = getScoreTier(score, maxScore);
  const config = tierConfig[tier];
  const pct = Math.round((score / maxScore) * 100);

  const handleDownload = useCallback(() => {
    if (!svgRef.current) return;

    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });

    // Create canvas to convert SVG to PNG
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement('a');
      link.download = `certificado-${questTitle.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    img.src = url;
  }, [questTitle]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Certificado QuestMaster - ${questTitle}`,
          text: `He completado "${questTitle}" con ${pct}% de puntuacion en QuestMaster!`,
          url: window.location.href,
        });
      } catch {
        // User cancelled share
      }
    }
  }, [questTitle, pct]);

  return (
    <div className="space-y-4">
      {/* SVG Certificate */}
      <div className="relative rounded-2xl overflow-hidden shadow-2xl">
        <svg
          ref={svgRef}
          viewBox="0 0 600 420"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          {/* Background */}
          <rect width="600" height="420" fill="#0f172a" />
          <rect x="0" y="0" width="600" height="420" fill={config.bgGlow} />

          {/* Decorative border */}
          <rect
            x="12" y="12" width="576" height="396" rx="16"
            fill="none"
            stroke={config.borderColor}
            strokeWidth="2"
            strokeDasharray="8 4"
            opacity="0.5"
          />
          <rect
            x="20" y="20" width="560" height="380" rx="12"
            fill="none"
            stroke={config.borderColor}
            strokeWidth="1"
            opacity="0.3"
          />

          {/* Corner ornaments */}
          <circle cx="30" cy="30" r="4" fill={config.borderColor} opacity="0.6" />
          <circle cx="570" cy="30" r="4" fill={config.borderColor} opacity="0.6" />
          <circle cx="30" cy="390" r="4" fill={config.borderColor} opacity="0.6" />
          <circle cx="570" cy="390" r="4" fill={config.borderColor} opacity="0.6" />

          {/* Top ornamental line */}
          <line x1="50" y1="60" x2="550" y2="60" stroke={config.borderColor} strokeWidth="0.5" opacity="0.3" />

          {/* QuestMaster logo text */}
          <text x="300" y="50" textAnchor="middle" fill={config.textColor} fontSize="11" fontFamily="system-ui, sans-serif" letterSpacing="4" opacity="0.7">
            QUESTMASTER
          </text>

          {/* Certificate title */}
          <text x="300" y="95" textAnchor="middle" fill="white" fontSize="22" fontFamily="system-ui, sans-serif" fontWeight="bold" letterSpacing="2">
            CERTIFICADO DE {config.label.toUpperCase()}
          </text>

          {/* Divider */}
          <line x1="200" y1="110" x2="400" y2="110" stroke={config.borderColor} strokeWidth="1" opacity="0.4" />

          {/* Presented to */}
          <text x="300" y="145" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="system-ui, sans-serif" letterSpacing="1">
            OTORGADO A
          </text>

          {/* User name */}
          <text x="300" y="178" textAnchor="middle" fill="white" fontSize="28" fontFamily="system-ui, sans-serif" fontWeight="bold">
            {userName}
          </text>

          {/* For completing */}
          <text x="300" y="210" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="system-ui, sans-serif" letterSpacing="1">
            POR COMPLETAR CON EXITO LA AVENTURA
          </text>

          {/* Quest title */}
          <text x="300" y="243" textAnchor="middle" fill={config.textColor} fontSize="20" fontFamily="system-ui, sans-serif" fontWeight="bold" fontStyle="italic">
            &quot;{questTitle}&quot;
          </text>

          {/* Score section */}
          <text x="300" y="280" textAnchor="middle" fill="white" fontSize="32" fontFamily="system-ui, sans-serif" fontWeight="bold">
            {score} / {maxScore}
          </text>
          <text x="300" y="300" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="system-ui, sans-serif" letterSpacing="2">
            PUNTUACION: {pct}%
          </text>

          {/* Divider */}
          <line x1="200" y1="320" x2="400" y2="320" stroke={config.borderColor} strokeWidth="0.5" opacity="0.3" />

          {/* QuestMaster Seal */}
          <circle cx="300" cy="360" r="30" fill="none" stroke={config.borderColor} strokeWidth="2" opacity="0.6" />
          <circle cx="300" cy="360" r="24" fill="none" stroke={config.borderColor} strokeWidth="1" opacity="0.4" />
          <text x="300" y="356" textAnchor="middle" fill={config.textColor} fontSize="8" fontFamily="system-ui, sans-serif" letterSpacing="1" fontWeight="bold">
            {config.sealText}
          </text>
          <text x="300" y="370" textAnchor="middle" fill={config.textColor} fontSize="7" fontFamily="system-ui, sans-serif" opacity="0.8">
            QM
          </text>

          {/* Date */}
          <text x="140" y="365" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="system-ui, sans-serif">
            {formatDate(completedAt)}
          </text>

          {/* Signature line */}
          <line x1="410" y1="370" x2="520" y2="370" stroke="#475569" strokeWidth="0.5" />
          <text x="465" y="385" textAnchor="middle" fill="#64748b" fontSize="8" fontFamily="system-ui, sans-serif">
            QuestMaster Team
          </text>

          {/* Bottom ornamental line */}
          <line x1="50" y1="400" x2="550" y2="400" stroke={config.borderColor} strokeWidth="0.5" opacity="0.3" />
        </svg>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-500/15 text-violet-400 text-sm font-medium hover:bg-violet-500/25 transition-colors border border-violet-500/20"
        >
          <Download size={16} />
          Descargar
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500/15 text-cyan-400 text-sm font-medium hover:bg-cyan-500/25 transition-colors border border-cyan-500/20"
        >
          <Share2 size={16} />
          Compartir
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 text-slate-400 text-sm font-medium hover:bg-white/10 transition-colors border border-white/10"
          >
            <X size={16} />
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}
