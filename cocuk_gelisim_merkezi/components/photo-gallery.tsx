"use client"

import { useState, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface PhotoGalleryProps {
  images: string[]
  name: string
}

export function PhotoGallery({ images, name }: PhotoGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  const handleImageError = useCallback((index: number) => {
    setImageErrors((prev) => new Set(prev).add(index))
  }, [])

  const openLightbox = useCallback((index: number) => {
    setSelectedImage(index)
  }, [])

  const closeLightbox = useCallback(() => {
    setSelectedImage(null)
  }, [])

  const nextImage = useCallback(() => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % images.length)
    }
  }, [selectedImage, images.length])

  const prevImage = useCallback(() => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + images.length) % images.length)
    }
  }, [selectedImage, images.length])

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.length === 0 ? (
          <p className="text-muted-foreground col-span-full text-center py-8">Henüz fotoğraf eklenmemiş.</p>
        ) : (
          images.map((image, index) => (
            <button
              key={index}
              onClick={() => openLightbox(index)}
              className="relative aspect-square overflow-hidden rounded-lg hover:opacity-90 transition-opacity"
            >
              {imageErrors.has(index) ? (
                <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                  <span className="text-sm">Fotoğraf yüklenemedi</span>
                </div>
              ) : (
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`${name} - Fotoğraf ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(index)}
                  loading="lazy"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
              )}
            </button>
          ))
        )}
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} fotoğraf galerisi`}
        >
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Kapat"
          >
            <X className="h-6 w-6 text-white" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Önceki"
          >
            <ChevronLeft className="h-6 w-6 text-white" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors"
            aria-label="Sonraki"
          >
            <ChevronRight className="h-6 w-6 text-white" />
          </button>

          <div className="relative max-h-[90vh] max-w-[90vw] w-full h-full">
            <Image
              src={images[selectedImage] || "/placeholder.svg"}
              alt={`${name} - Fotoğraf ${selectedImage + 1}`}
              width={1200}
              height={800}
              className="object-contain max-h-[90vh] max-w-[90vw]"
              priority
              sizes="90vw"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-4 py-2 rounded-full">
            {selectedImage + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  )
}
