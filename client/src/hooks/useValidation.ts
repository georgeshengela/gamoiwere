import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';

interface ValidationResult {
  available: boolean;
  message: string;
  isLoading: boolean;
  hasChecked: boolean;
}

export function useUsernameValidation(username: string) {
  const [hasChecked, setHasChecked] = useState(false);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['check-username', username],
    queryFn: async () => {
      if (!username || username.trim().length === 0) {
        return null;
      }
      
      const response = await fetch(`/api/auth/check-username/${encodeURIComponent(username.trim())}`);
      const result = await response.json();
      
      if (!response.ok && response.status >= 500) {
        throw new Error(result.message || 'შეცდომა მომხმარებლის სახელის შემოწმებისას');
      }
      
      return result;
    },
    enabled: Boolean(username && username.trim().length > 0),
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: false,
  });

  const checkUsername = useCallback(() => {
    if (username && username.trim().length > 0) {
      setHasChecked(true);
    }
  }, [username]);

  return {
    available: data?.available || false,
    message: error?.message || data?.message || '',
    isLoading,
    hasChecked: hasChecked && Boolean(username && username.trim().length > 0),
    checkUsername,
  };
}

export function useEmailValidation(email: string) {
  const [hasChecked, setHasChecked] = useState(false);
  
  const { data, isLoading, error } = useQuery({
    queryKey: ['check-email', email],
    queryFn: async () => {
      if (!email || email.trim().length === 0) {
        return null;
      }
      
      const response = await fetch(`/api/auth/check-email/${encodeURIComponent(email.trim())}`);
      const result = await response.json();
      
      if (!response.ok && response.status >= 500) {
        throw new Error(result.message || 'შეცდომა ელ. ფოსტის შემოწმებისას');
      }
      
      return result;
    },
    enabled: Boolean(email && email.trim().length > 0),
    staleTime: 30000, // Consider data fresh for 30 seconds
    retry: false,
  });

  const checkEmail = useCallback(() => {
    if (email && email.trim().length > 0) {
      setHasChecked(true);
    }
  }, [email]);

  return {
    available: data?.available || false,
    message: error?.message || data?.message || '',
    isLoading,
    hasChecked: hasChecked && Boolean(email && email.trim().length > 0),
    checkEmail,
  };
}