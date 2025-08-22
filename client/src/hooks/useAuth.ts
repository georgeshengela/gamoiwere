import React, { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  phone?: string;
  address?: string;
  balance_code?: string;
  balance?: number;
  pending_transportation_fees?: number;
  role: string;
  verification_status?: string;
}

export interface LoginCredentials {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function useAuth() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get cached user data if available
  const cachedUserData = localStorage.getItem('userData');
  const cachedUser = cachedUserData ? JSON.parse(cachedUserData) : null;
  
  // Check for Google OAuth success parameter
  const urlParams = new URLSearchParams(window.location.search);
  const loginSuccess = urlParams.get('login') === 'success';
  
  // Track authentication state to prevent unnecessary requests
  const [hasTriedAuth, setHasTriedAuth] = React.useState(false);
  const [isAuthenticated, setIsAuthenticated] = React.useState(
    loginSuccess || !!cachedUser || localStorage.getItem('isAuthenticated') === 'true'
  );

  // Query to get the current logged-in user
  const { 
    data: user, 
    isLoading, 
    isError, 
    error,
    refetch: refetchUser
  } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    retry: false, // Don't retry on auth failures
    initialData: loginSuccess ? null : cachedUser, // Don't use cached data if coming from OAuth
    staleTime: 0, // Always consider data stale to allow fresh fetches
    refetchOnWindowFocus: true, // Enable automatic refetch on window focus
    refetchOnMount: true, // Enable automatic refetch on mount
    refetchOnReconnect: true, // Enable automatic refetch on reconnect
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: true, // Always enable authentication checking
    queryFn: async () => {
      setHasTriedAuth(true);
      const response = await fetch('/api/auth/user', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Silently handle 401 unauthorized responses
      if (response.status === 401) {
        // Clear authentication flags when we get 401
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userData');
        setIsAuthenticated(false);
        return null;
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const userData = await response.json();
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userData', JSON.stringify(userData));
      return userData;
    }
  });
  
  // Handle Google OAuth success
  useEffect(() => {
    if (loginSuccess) {
      // Force refresh the user data when coming from OAuth
      refetchUser().then((result) => {
        if (result.data) {
          // Show success toast for Google OAuth login
          toast({
            title: "Google-ით შესვლა წარმატებულია",
            description: `კეთილი იყოს თქვენი მობრძანება, ${result.data.username}`,
          });
          
          // Update authentication state immediately
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('userData', JSON.stringify(result.data));
          setIsAuthenticated(true);
          
          // Clean up URL parameter
          const url = new URL(window.location.href);
          url.searchParams.delete('login');
          window.history.replaceState({}, '', url.toString());
        }
      });
    }
  }, [loginSuccess, refetchUser, toast]);

  // Update local storage when user data changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('userData', JSON.stringify(user));
      localStorage.setItem('isAuthenticated', 'true');
    } else if (isError) {
      // Clear stored user data if API call fails
      localStorage.removeItem('userData');
      localStorage.removeItem('isAuthenticated');
    }
  }, [user, isError]);
  
  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(credentials),
        });
        
        // Process even error responses first
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || "შესვლა ვერ მოხერხდა");
        }
        
        // Ensure we're getting the complete user data including balance
        if (data && !data.balance) {
          // If balance is missing, fetch complete user data
          const userResponse = await fetch('/api/auth/user', {
            credentials: 'include'
          });
          
          if (userResponse.ok) {
            const fullUserData = await userResponse.json();
            // Preserve the requiresPasswordChange flag from login response
            return {
              ...fullUserData,
              requiresPasswordChange: data.requiresPasswordChange
            };
          }
        }
        
        return data;
      } catch (error) {
        if (error instanceof Error) {
          throw error;
        }
        throw new Error("სერვერთან კავშირის შეცდომა, გთხოვთ სცადოთ მოგვიანებით");
      }
    },
    onSuccess: (userData) => {
      toast({
        title: "შესვლა წარმატებულია",
        description: "კეთილი იყოს თქვენი მობრძანება",
      });
      
      // Check if password change is required BEFORE updating cache
      console.log('Login success - userData:', userData);
      console.log('Login success - requiresPasswordChange:', userData.requiresPasswordChange);
      
      const needsPasswordChange = userData.requiresPasswordChange;
      
      // Cache user data and update auth state immediately
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      
      // Update query cache with new user data
      queryClient.setQueryData(["/api/auth/user"], userData);
      
      // Force refetch to ensure latest data
      refetchUser();
      
      // Trigger password change modal AFTER everything is set up
      if (needsPasswordChange) {
        console.log('Triggering password change modal');
        setTimeout(() => {
          const event = new CustomEvent('passwordChangeRequired', {
            detail: { required: true }
          });
          window.dispatchEvent(event);
        }, 100); // Small delay to ensure UI is ready
      }
      
      // Redirect to home page after login without reload
      const currentPath = window.location.pathname;
      if (currentPath === '/login') {
        setTimeout(() => {
          window.location.replace('/');
        }, 100);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "შესვლა ვერ მოხერხდა",
        description: error.message || "გთხოვთ შეამოწმოთ თქვენი მონაცემები და სცადოთ თავიდან",
        variant: "destructive",
      });
    },
  });
  
  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        try {
          const errorData = await response.json();
          throw new Error(errorData.message || "Registration failed");
        } catch (e) {
          throw new Error("Registration failed: Could not connect to server");
        }
      }
      
      try {
        const data = await response.json();
        
        // After successful registration, get complete user data including balance
        const userResponse = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        
        if (userResponse.ok) {
          const fullUserData = await userResponse.json();
          return fullUserData;
        }
        
        return data;
      } catch (e) {
        throw new Error("Registration failed: Invalid server response");
      }
    },
    onSuccess: (data) => {
      toast({
        title: "რეგისტრაცია წარმატებულია",
        description: "თქვენ წარმატებით დარეგისტრირდით",
      });
      
      // Store complete user data in localStorage for persistence
      localStorage.setItem('userData', JSON.stringify(data));
      localStorage.setItem('isAuthenticated', 'true');
      
      // Invalidate user query to reload user data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Redirect to home page after registration
      setTimeout(() => {
        window.location.replace('/');
      }, 500);
    },
    onError: (error: Error) => {
      toast({
        title: "რეგისტრაცია ვერ მოხერხდა",
        description: error.message || "გთხოვთ შეამოწმოთ თქვენი მონაცემები და სცადოთ თავიდან",
        variant: "destructive",
      });
    },
  });
  
  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error("Logout failed");
      }
      
      const data = await response.json();
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "გამოსვლა",
        description: "თქვენ წარმატებით გამოხვედით სისტემიდან",
      });
      
      // Clear all authentication data
      queryClient.setQueryData(["/api/auth/user"], null);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Remove all session data from localStorage
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userData');
      localStorage.removeItem('sessionId');
      
      // Get current path
      const currentPath = window.location.pathname;
      
      // Redirect based on current page
      if (currentPath.includes('/profile')) {
        window.location.href = '/';
      } else {
        // Force refresh the current page to update UI without manually refreshing
        window.location.reload();
      }
    },
    onError: () => {
      toast({
        title: "გამოსვლა ვერ მოხერხდა",
        description: "დაფიქსირდა შეცდომა, გთხოვთ სცადოთ მოგვიანებით",
        variant: "destructive",
      });
    },
  });
  
  // Login function
  const login = (credentials: LoginCredentials) => {
    return new Promise((resolve, reject) => {
      loginMutation.mutate(credentials, {
        onSuccess: (data) => resolve(data),
        onError: (error) => reject(error)
      });
    });
  };
  
  // Register function
  const register = (credentials: RegisterCredentials) => registerMutation.mutate(credentials);
  
  // Logout function
  const logout = () => logoutMutation.mutate();
  
  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    isError,
    error,
    login,
    loginStatus: loginMutation.status,
    register,
    registerStatus: registerMutation.status,
    logout,
    logoutStatus: logoutMutation.status,
  };
}