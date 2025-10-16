import { useQuery } from "@tanstack/react-query";

export interface CollateralStatusResponse {
  status: 'pending' | 'registered' | 'error' | 'invalid';
  message: string;
  stacksAddress?: string;
  suiAddress?: string;
  estimatedTime?: string;
  collateral?: {
    stxAmount: number;
    borrowPower: number;
    objectId: string;
  };
  error?: string;
}

/**
 * Hook to check collateral registration status on Sui
 * Polls backend until status changes from 'pending' to 'registered'
 * @param stacksAddress - Stacks address to check
 * @param enabled - Whether to enable polling (default: true when stacksAddress exists)
 */
export function useCollateralStatus(
  stacksAddress: string | null | undefined,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["collateral-status", stacksAddress],
    queryFn: async (): Promise<CollateralStatusResponse> => {
      if (!stacksAddress) {
        return {
          status: 'invalid',
          message: 'No Stacks address provided'
        };
      }

      try {
        // Get API base URL from environment or use default
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
        
        const response = await fetch(
          `${apiBaseUrl}/api/collateral-status/${stacksAddress}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return await response.json();
      } catch (error) {
        console.error("Error fetching collateral status:", error);
        return {
          status: 'error',
          message: 'Failed to check collateral status',
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    },
    enabled: !!stacksAddress && enabled,
    // Smart polling with exponential backoff
    refetchInterval: (query) => {
      const data = query.state.data;
      
      // Stop polling once registered
      if (data?.status === 'registered') {
        return false;
      }
      
      // Stop polling on error after a while
      if (data?.status === 'error') {
        return false;
      }
      
      // Poll every 2 seconds while pending
      return 2000;
    },
    // Retry on network errors
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    // Force no cache to always get fresh data
    staleTime: 0,
    gcTime: 0,
  });
}
