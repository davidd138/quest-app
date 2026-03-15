'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Image as ImageIcon, X, ZoomIn, Heart, Download } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
};

interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
  author: string;
  likes: number;
  stageTitle: string;
  takenAt: string;
}

const mockPhotos: GalleryPhoto[] = Array.from({ length: 12 }, (_, i) => ({
  id: `p${i + 1}`,
  url: `/gallery/photo-${i + 1}.jpg`,
  caption: `Amazing view at stage ${(i % 4) + 1}`,
  author: ['Elena V.', 'Marcus C.', 'Sofia R.', 'Liam O.'][i % 4],
  likes: Math.floor(Math.random() * 50) + 5,
  stageTitle: `Stage ${(i % 4) + 1}`,
  takenAt: `2026-03-${15 - (i % 5)}T${10 + i}:00:00Z`,
}));

export default function PageClient({ id }: { id: string }) {
  const questId = id;
  const [selectedPhoto, setSelectedPhoto] = useState<GalleryPhoto | null>(null);

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="max-w-5xl mx-auto space-y-6">
      <motion.div variants={itemVariants}>
        <Link href={`/quests/${questId}`} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Quest
        </Link>
      </motion.div>

      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white flex items-center gap-3">
            <Camera className="w-8 h-8 text-violet-400" />
            Quest Gallery
          </h1>
          <p className="text-slate-400 mt-1">{mockPhotos.length} photos from adventurers</p>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {mockPhotos.map((photo) => (
          <motion.div
            key={photo.id}
            variants={itemVariants}
            onClick={() => setSelectedPhoto(photo)}
            className="aspect-square rounded-xl overflow-hidden glass border border-white/5 cursor-pointer group relative"
          >
            <div className="w-full h-full bg-gradient-to-br from-violet-600/20 via-navy-800 to-emerald-600/10 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-slate-700" />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
              <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
              <p className="text-xs text-white truncate">{photo.caption}</p>
              <p className="text-xs text-slate-400">{photo.author}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass rounded-2xl p-6 max-w-lg w-full border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar name={selectedPhoto.author} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-white">{selectedPhoto.author}</p>
                    <p className="text-xs text-slate-500">{selectedPhoto.stageTitle}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPhoto(null)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-video rounded-xl bg-gradient-to-br from-violet-600/20 via-navy-800 to-emerald-600/10 flex items-center justify-center mb-4">
                <ImageIcon className="w-16 h-16 text-slate-700" />
              </div>
              <p className="text-sm text-slate-300 mb-3">{selectedPhoto.caption}</p>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-rose-400 transition-colors">
                  <Heart className="w-4 h-4" />
                  {selectedPhoto.likes}
                </button>
                <button className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors">
                  <Download className="w-4 h-4" />
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
