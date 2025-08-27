import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  imageUrl: string;
}

interface HeroSliderProps {
  slides: Slide[];
}

const HeroSlider = ({ slides }: HeroSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const goToSlide = (index: number) => {
    if (isAnimating || index === currentSlide) return;
    setIsAnimating(true);
    setCurrentSlide(index);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
    setTimeout(() => setIsAnimating(false), 600);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
    setTimeout(() => setIsAnimating(false), 600);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 7000);
    return () => clearInterval(interval);
  }, [currentSlide]);

  return (
    <div
      className="mb-8 relative overflow-hidden rounded-lg shadow-lg"
      style={{ height: '300px' }}
    >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-gray-200 bg-opacity-20">
        <div
          className="h-full bg-primary transition-all duration-300 ease-linear"
          style={{
            width: `${((currentSlide + 1) / slides.length) * 100}%`,
          }}
        />
      </div>

      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 z-10 transition-all duration-700 ease-in-out ${
            index === currentSlide
              ? 'opacity-100 translate-x-0'
              : index < currentSlide
              ? 'opacity-0 -translate-x-full'
              : 'opacity-0 translate-x-full'
          }`}
        >
          <img
            src={slide.imageUrl}
            alt={`Banner ${slide.id}`}
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Slide Navigation */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`h-1.5 rounded-full bg-white transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 opacity-100'
                : 'w-4 opacity-50 hover:opacity-75'
            }`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>

      {/* Slide Controls */}
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full flex items-center justify-center z-20 transition-all opacity-70 hover:opacity-100"
        onClick={prevSlide}
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </button>
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black bg-opacity-30 hover:bg-opacity-50 rounded-full flex items-center justify-center z-20 transition-all opacity-70 hover:opacity-100"
        onClick={nextSlide}
      >
        <ChevronRight className="h-6 w-6 text-white" />
      </button>
    </div>
  );
};

export default HeroSlider;
