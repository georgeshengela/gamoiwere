import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

// Guest favorites using localStorage
const GUEST_FAVORITES_KEY = 'gamoiwere_guest_favorites';

interface GuestFavorite {
  productId: string;
  productTitle: string;
  productImage?: string;
  productPrice?: number;
  productUrl?: string;
  addedAt: string;
}

// Guest favorites functions
export const getGuestFavorites = (): GuestFavorite[] => {
  try {
    const favorites = localStorage.getItem(GUEST_FAVORITES_KEY);
    return favorites ? JSON.parse(favorites) : [];
  } catch {
    return [];
  }
};

export const addGuestFavorite = (product: Omit<GuestFavorite, 'addedAt'>): void => {
  const favorites = getGuestFavorites();
  const newFavorite = { ...product, addedAt: new Date().toISOString() };
  const updatedFavorites = favorites.filter(f => f.productId !== product.productId);
  updatedFavorites.unshift(newFavorite);
  localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(updatedFavorites));
};

export const removeGuestFavorite = (productId: string): void => {
  const favorites = getGuestFavorites();
  const updatedFavorites = favorites.filter(f => f.productId !== productId);
  localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(updatedFavorites));
};

export const isGuestFavorite = (productId: string): boolean => {
  const favorites = getGuestFavorites();
  return favorites.some(f => f.productId === productId);
};

// Hook for managing favorites
export const useFavorites = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Check if user is authenticated
  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
  });
  
  const isGuest = !user;

  // Fetch favorites for logged-in users
  const { data: userFavorites = [], isLoading } = useQuery({
    queryKey: ['/api/favorites'],
    enabled: !isGuest,
    retry: false,
  });

  // Add to favorites mutation
  const addToFavoritesMutation = useMutation({
    mutationFn: async (product: {
      productId: string;
      productTitle: string;
      productImage?: string;
      productPrice?: number;
      productUrl?: string;
    }) => {
      if (isGuest) {
        addGuestFavorite(product);
        return product;
      } else {
        const response = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });
        if (!response.ok) throw new Error('Failed to add to favorites');
        return response.json();
      }
    },
    onSuccess: () => {
      if (!isGuest) {
        queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      }
      toast({
        title: "რჩეულებში დაემატა",
        description: "პროდუქტი წარმატებით დაემატა რჩეულებში",
      });
    },
    onError: () => {
      toast({
        title: "შეცდომა",
        description: "რჩეულებში დამატება ვერ მოხერხდა",
        variant: "destructive",
      });
    },
  });

  // Remove from favorites mutation
  const removeFromFavoritesMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (isGuest) {
        removeGuestFavorite(productId);
        return { productId };
      } else {
        const response = await fetch(`/api/favorites/${productId}`, {
          method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to remove from favorites');
        return response.json();
      }
    },
    onSuccess: () => {
      if (!isGuest) {
        queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      }
      toast({
        title: "რჩეულებიდან მოიშალა",
        description: "პროდუქტი წარმატებით მოიშალა რჩეულებიდან",
      });
    },
    onError: () => {
      toast({
        title: "შეცდომა",
        description: "რჩეულებიდან მოშლა ვერ მოხერხდა",
        variant: "destructive",
      });
    },
  });

  // Check if product is favorite
  const isFavorite = (productId: string): boolean => {
    if (isGuest) {
      return isGuestFavorite(productId);
    } else {
      return userFavorites.some((f: any) => f.productId === productId);
    }
  };

  // Get all favorites
  const getAllFavorites = () => {
    if (isGuest) {
      return getGuestFavorites();
    } else {
      return userFavorites;
    }
  };

  return {
    favorites: getAllFavorites(),
    isLoading: isGuest ? false : isLoading,
    isFavorite,
    addToFavorites: addToFavoritesMutation.mutate,
    removeFromFavorites: removeFromFavoritesMutation.mutate,
    isAddingToFavorites: addToFavoritesMutation.isPending,
    isRemovingFromFavorites: removeFromFavoritesMutation.isPending,
  };
};