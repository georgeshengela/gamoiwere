import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut,
  ChevronUp,
  ChevronDown 
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface ProductImage {
  id: number;
  url: string;
  alt: string;
}

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
  selectedVariationImage?: string; // Optional image from selected attribute variation
}

const ProductImageGallery = ({ images, productName, selectedVariationImage }: ProductImageGalleryProps) => {

  const [activeImage, setActiveImage] = useState(0);
  
  // Create a new images array that includes the selected variation image as the first image when available
  const displayImages = selectedVariationImage 
    ? [
        { 
          id: -1, // Special ID for variation image
          url: selectedVariationImage,
          alt: `${productName} - Selected variation`
        },
        ...images
      ]
    : images;
  const [zoomOpen, setZoomOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  
  const handlePrevImage = () => {
    setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleThumbClick = (index: number) => {
    setActiveImage(index);
  };

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isZoomed) return;
    
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 static lg:sticky lg:top-4">
      {/* Thumbnails - Horizontal on mobile, vertical sidebar on desktop */}
      <div className="order-2 md:order-1 md:w-20 flex flex-row md:flex-col overflow-x-auto md:overflow-y-auto h-20 md:h-[600px] gap-2 pb-2 md:pb-0 md:pr-2 scrollbar-thin">
        {images.length > 1 && images.length > 4 && (
          <>
            <button 
              className="hidden md:flex items-center justify-center p-1 text-gray-400 hover:text-primary bg-white/80 rounded-full shadow-sm"
              onClick={handlePrevImage}
            >
              <ChevronUp className="h-4 w-4" />
            </button>
            
            <button 
              className="md:hidden flex items-center justify-center p-1 text-gray-400 hover:text-primary bg-white/80 rounded-full shadow-sm"
              onClick={handlePrevImage}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        )}
        
        <div className="flex flex-row md:flex-col gap-2 md:max-h-[400px] md:overflow-y-auto md:overflow-x-hidden md:py-2 scrollbar-thin">
          {displayImages.map((image, index) => (
            <div 
              key={image.id}
              className={`flex-shrink-0 w-16 h-16 border rounded cursor-pointer overflow-hidden transition-all ${
                activeImage === index 
                  ? 'border-primary ring-1 ring-primary' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleThumbClick(index)}
            >
              <img 
                src={image.url} 
                alt={`${image.alt} - thumbnail ${index + 1}`}
                className="w-full h-full object-cover" 
              />
            </div>
          ))}
        </div>
        
        {images.length > 1 && images.length > 4 && (
          <>
            <button 
              className="hidden md:flex items-center justify-center p-1 text-gray-400 hover:text-primary bg-white/80 rounded-full shadow-sm"
              onClick={handleNextImage}
            >
              <ChevronDown className="h-4 w-4" />
            </button>
            
            <button 
              className="md:hidden flex items-center justify-center p-1 text-gray-400 hover:text-primary bg-white/80 rounded-full shadow-sm"
              onClick={handleNextImage}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      
      {/* Main Image */}
      <div 
        className="order-1 md:order-2 flex-1 relative bg-neutral-50 rounded-lg overflow-hidden"
        onMouseMove={handleImageMouseMove}
      >
        <div className="aspect-square relative">
          <img 
            src={displayImages[activeImage]?.url} 
            alt={displayImages[activeImage]?.alt || productName}
            className={`w-full h-full object-contain transition-transform duration-200 ${
              isZoomed ? 'cursor-zoom-out scale-150' : 'cursor-zoom-in'
            }`}
            style={
              isZoomed 
                ? { 
                    transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  } 
                : undefined
            }
            onClick={toggleZoom}
          />
          
          {/* Zoom button */}
          <button 
            className="absolute bottom-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
            onClick={() => setZoomOpen(true)}
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          
          {/* Navigation Arrows for Main Image */}
          {images.length > 1 && (
            <>
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-all"
                onClick={handlePrevImage}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-all"
                onClick={handleNextImage}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          
          {/* Image counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-4 px-2 py-1 text-xs bg-black/70 text-white rounded">
              {activeImage + 1} / {images.length}
            </div>
          )}
        </div>
      </div>
      
      {/* Fullscreen Zoom Dialog */}
      <Dialog open={zoomOpen} onOpenChange={setZoomOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] w-auto h-auto p-0 rounded-lg overflow-hidden">
          <div className="relative w-full h-full bg-black/95 flex items-center justify-center">
            <img 
              src={images[activeImage]?.url} 
              alt={images[activeImage]?.alt || productName}
              className="max-w-full max-h-[80vh] object-contain"
            />
            
            <button 
              className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/40 transition-all"
              onClick={() => setZoomOpen(false)}
            >
              <ZoomOut className="h-5 w-5" />
            </button>
            
            {images.length > 1 && (
              <>
                <button 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-all"
                  onClick={handlePrevImage}
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                
                <button 
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/40 transition-all"
                  onClick={handleNextImage}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProductImageGallery;