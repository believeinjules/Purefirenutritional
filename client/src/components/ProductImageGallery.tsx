import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  altText?: string;
}

export default function ProductImageGallery({
  images,
  productName,
  altText,
}: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // If no images provided, show placeholder
  if (!images || images.length === 0) {
    return (
      <div className="w-full aspect-square bg-gradient-to-br from-orange-100 to-pink-100 rounded-lg flex items-center justify-center">
        <span className="text-gray-400 text-lg">No image available</span>
      </div>
    );
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative w-full aspect-square bg-white rounded-lg overflow-hidden border border-gray-200 group">
        <img
          src={images[currentIndex]}
          alt={altText || `${productName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-contain p-4"
          loading="lazy"
        />

        {/* Navigation Arrows - Only show if multiple images */}
        {images.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Next image"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail Gallery - Only show if multiple images */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={cn(
                "relative aspect-square rounded-md overflow-hidden border-2 transition-all hover:scale-105",
                currentIndex === index
                  ? "border-orange-500 ring-2 ring-orange-200"
                  : "border-gray-200 hover:border-gray-300"
              )}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image}
                alt={`${productName} thumbnail ${index + 1}`}
                className="w-full h-full object-contain p-1 bg-white"
                loading="lazy"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
