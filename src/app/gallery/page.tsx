'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import BlurFade from "@/components/ui/blur-fade";
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ImageModal from '@/components/ImageModal';

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showWarning, setShowWarning] = useState(false);
  const imagesPerPage = 30;

  useEffect(() => {
    async function fetchImages() {
      const response = await fetch('/api/getImages');
      const images = await response.json();
      setImages(images);
    }
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length === 0) {
      const timer = setTimeout(() => setShowWarning(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [images]);

  const totalPages = Math.ceil(images.length / imagesPerPage);
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = images.slice(indexOfFirstImage, indexOfLastImage);

  return (
    <div className="min-h-screen mx-auto p-8 pb-20 sm:p-20 space-y-12 text-gray-900 dark:text-gray-100">
      {/* Hero Section */}
      <section className="w-full text-center space-y-4">
        <BlurFade>
          <h1 className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">
            Butz Gallery
          </h1>
          <p className="text-xl mt-4">
            A collection of memories from various activities
          </p>
        </BlurFade>
      </section>

      {/* Gallery Grid */}
      {images.length === 0 && showWarning ? (
        <div className="text-center p-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <p className="text-yellow-600 dark:text-yellow-400">
            No images found. Please make sure the /public/media folder contains images.
          </p>
        </div>
      ) : (
        <BlurFade>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-10 gap-4">
            {currentImages.map((image, index) => (
              <BlurFade key={image.src} delay={0.05 * (index + 1)}>
                <div
                  className="relative aspect-square overflow-hidden rounded-lg group cursor-pointer"
                  onClick={() => setSelectedImage(image.src)}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    className="object-cover transition-all duration-300 ease-out 
                              transform group-hover:scale-110 group-hover:rotate-1
                              group-active:scale-105 group-active:rotate-0"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={index < 4}
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                </div>
              </BlurFade>
            ))}
          </div>
        </BlurFade>
      )}

      {selectedImage && (
        <ImageModal src={selectedImage} onClose={() => setSelectedImage(null)} />
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-transparent"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:hover:bg-transparent"
            aria-label="Next page"
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
}
