// Utility functions for Georgian text processing

/**
 * Normalizes Georgian text to use consistent lowercase Georgian letters
 * @param text - The Georgian text to normalize
 * @returns The text with normalized Georgian letters
 */
export const normalizeGeorgian = (text: string): string => {
  if (!text || text.length === 0) return text;
  
  // Georgian alphabet normalization - convert all to lowercase
  const georgianNormalizationMap: { [key: string]: string } = {
    // Normalize any uppercase or variant forms to standard lowercase
    'ა': 'ა', 'ბ': 'ბ', 'გ': 'გ', 'დ': 'დ', 'ე': 'ე', 'ვ': 'ვ', 'ზ': 'ზ', 'თ': 'თ', 'ი': 'ი',
    'კ': 'კ', 'ლ': 'ლ', 'მ': 'მ', 'ნ': 'ნ', 'ო': 'ო', 'პ': 'პ', 'ჟ': 'ჟ', 'რ': 'რ', 'ს': 'ს',
    'ტ': 'ტ', 'უ': 'უ', 'ფ': 'ფ', 'ქ': 'ქ', 'ღ': 'ღ', 'ყ': 'ყ', 'შ': 'შ', 'ჩ': 'ჩ', 'ც': 'ც',
    'ძ': 'ძ', 'წ': 'წ', 'ჭ': 'ჭ', 'ხ': 'ხ', 'ჯ': 'ჯ', 'ჰ': 'ჰ',
    // Handle any uppercase variants that might exist
    'Ა': 'ა', 'Ბ': 'ბ', 'Გ': 'გ', 'Დ': 'დ', 'Ე': 'ე', 'Ვ': 'ვ', 'Ზ': 'ზ', 'Თ': 'თ', 'Ი': 'ი',
    'Კ': 'კ', 'Ლ': 'ლ', 'Მ': 'მ', 'Ნ': 'ნ', 'Ო': 'ო', 'Პ': 'პ', 'Ჟ': 'ჟ', 'Რ': 'რ', 'Ს': 'ს',
    'Ტ': 'ტ', 'Უ': 'უ', 'Ფ': 'ფ', 'Ქ': 'ქ', 'Ღ': 'ღ', 'Ყ': 'ყ', 'Შ': 'შ', 'Ჩ': 'ჩ', 'Ც': 'ც',
    'Ძ': 'ძ', 'Წ': 'წ', 'Ჭ': 'ჭ', 'Ხ': 'ხ', 'Ჯ': 'ჯ', 'Ჰ': 'ჰ'
  };
  
  // Normalize each character
  return text.split('').map(char => georgianNormalizationMap[char] || char).join('');
};

// Keep the old function name for backward compatibility
export const capitalizeGeorgian = normalizeGeorgian;