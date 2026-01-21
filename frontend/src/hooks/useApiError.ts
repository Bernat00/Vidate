import type { AxiosError } from 'axios';
import { useCallback } from 'react';

export function useApiError() {
  const getErrorMessage = useCallback((error: unknown): string => {
    const axiosErr = error as AxiosError<{ detail?: string | { msg: string }[] }>;
    
    if (axiosErr.response) {
      const data = axiosErr.response.data;
      
      // Handle FastAPI detail as string
      if (typeof data?.detail === 'string') {
        return data.detail;
      }
      
      // Handle FastAPI validation errors
      if (Array.isArray(data?.detail)) {
        return data.detail.map(d => typeof d === 'string' ? d : d.msg).join(', ');
      }

      // Handle common status codes
      switch (axiosErr.response.status) {
        case 401:
          return 'Incorrect email or password.';
        case 403:
          return 'You do not have permission to perform this action.';
        case 404:
          return 'The requested resource was not found.';
        case 422:
          return 'Validation error. Please check your input.';
        case 500:
          return 'Internal server error. Please try again later.';
      }
    } else if (axiosErr.request) {
      return 'No response from server. Please check your internet connection.';
    }

    return 'Something went wrong. Please try again.';
  }, []);

  return { getErrorMessage };
}
