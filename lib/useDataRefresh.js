// lib/useDataRefresh.js - Custom hook for automatic data refresh
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Custom hook to manage data fetching with automatic refresh capability
 * @param {Function} fetchFunction - Async function that fetches data
 * @param {Array} dependencies - Dependencies to trigger re-fetch (optional)
 * @returns {Object} - { data, loading, error, refresh, mutate }
 */
export function useDataRefresh(fetchFunction, dependencies = []) {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetchFunction();
      setData(result);
      return result;
    } catch (err) {
      console.error('Data fetch error:', err);
      setError(err.message || 'Failed to fetch data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, ...dependencies]);

  // Optimistic update function
  const mutate = useCallback((newData) => {
    setData(newData);
  }, []);

  // Force refresh
  const refresh = useCallback(async () => {
    router.refresh(); // Next.js router refresh for server components
    return await fetchData();
  }, [router, fetchData]);

  return { 
    data, 
    loading, 
    error, 
    refresh, 
    mutate,
    fetchData 
  };
}

/**
 * Hook for mutation operations (create, update, delete)
 * @param {Function} mutationFn - Async function that performs mutation
 * @param {Function} onSuccess - Callback on successful mutation
 * @returns {Object} - { mutate, loading, error }
 */
export function useMutation(mutationFn, { onSuccess, onError } = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await mutationFn(...args);
      
      if (onSuccess) {
        await onSuccess(result);
      }
      
      return result;
    } catch (err) {
      console.error('Mutation error:', err);
      setError(err.message || 'Operation failed');
      
      if (onError) {
        onError(err);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, onSuccess, onError]);

  return { mutate, loading, error };
}

/**
 * Hook for automatic polling/real-time updates
 * @param {Function} fetchFunction - Function to poll
 * @param {Number} interval - Polling interval in ms (default: 30000)
 * @param {Boolean} enabled - Whether polling is enabled (default: true)
 */
export function usePolling(fetchFunction, interval = 30000, enabled = true) {
  const { data, loading, error, fetchData } = useDataRefresh(fetchFunction);

  useState(() => {
    if (!enabled) return;

    const intervalId = setInterval(() => {
      fetchData();
    }, interval);

    // Initial fetch
    fetchData();

    return () => clearInterval(intervalId);
  }, [enabled, interval, fetchData]);

  return { data, loading, error, refresh: fetchData };
}
