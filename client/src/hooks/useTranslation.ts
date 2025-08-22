import { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

interface TranslationResult {
  translatedTitle: string;
  originalTitle: string;
  isLoading: boolean;
  error: string | null;
}

export const useTranslation = (originalTitle: string, productId?: string): TranslationResult => {
  const [translatedTitle, setTranslatedTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!originalTitle || originalTitle === 'Unknown Product') {
      setTranslatedTitle(originalTitle);
      return;
    }

    // Check if the title appears to be in Turkish (contains Turkish characters or common Turkish words)
    const turkishPattern = /[çğıöşüÇĞIİÖŞÜ]|erkek|kadın|beyaz|siyah|mavi|kırmızı|yeşil|sarı|pembe|mor|gömlek|pantolon|ayakkabı|çanta|elbise|tişört|sweatshirt|mont|ceket|etek|şort|jean|spor|günlük|klasik|modern|kaliteli|ucuz|indirim|beden|renk|model|marka|ürün|satış|alışveriş/i;
    
    if (!turkishPattern.test(originalTitle)) {
      // If it doesn't look like Turkish, use the original title
      setTranslatedTitle(originalTitle);
      return;
    }

    const translateTitle = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await apiRequest('/api/translate-title', {
          method: 'POST',
          data: { originalTitle, productId },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.translatedTitle) {
          setTranslatedTitle(response.translatedTitle);
        } else {
          setTranslatedTitle(originalTitle); // Fallback to original if translation fails
        }
      } catch (err) {
        console.error('Translation error:', err);
        // Silently fall back to original title when API is rate-limited or unavailable
        setError(null); // Don't show error to user
        setTranslatedTitle(originalTitle); // Use original title as fallback
      } finally {
        setIsLoading(false);
      }
    };

    translateTitle();
  }, [originalTitle]);

  return {
    translatedTitle: translatedTitle || originalTitle,
    originalTitle,
    isLoading,
    error,
  };
};