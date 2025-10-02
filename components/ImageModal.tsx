'use client';

import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { createPortal } from 'react-dom';

interface ImageModalProps {
  src: string;
  onClose: () => void;
}

export default function ImageModal({ src, onClose }: ImageModalProps) {
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] backdrop-blur-xl bg-black/70 
                 animate-[fadeIn_0.2s_ease-out_forwards]
                 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button 
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full
                   transition-all duration-200 hover:scale-110 active:scale-95"
        onClick={onClose}
      >
        <XMarkIcon className="w-6 h-6" />
      </button>
      <div className="relative w-full max-w-6xl aspect-[16/9] 
                    animate-[scaleIn_0.3s_cubic-bezier(0.34,1.56,0.64,1)_forwards]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={src}
          alt="Enlarged view"
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>
    </div>,
    document.body
  );
}
