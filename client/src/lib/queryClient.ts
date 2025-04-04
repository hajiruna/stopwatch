import { QueryClient, QueryFunction } from "@tanstack/react-query";

/**
 * Enhanced error handler for API responses
 * Attempts to parse JSON error responses, falls back to text if not JSON
 * Includes status code and URL in error message
 */
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Try to get error message as JSON first
    let errorMessage: string;
    let errorDetails: any = {};
    
    try {
      // Clone the response to avoid consuming it
      const clonedRes = res.clone();
      const jsonData = await clonedRes.json();
      errorMessage = jsonData.message || jsonData.error || res.statusText;
      errorDetails = jsonData;
    } catch (e) {
      // If not JSON, use text
      errorMessage = await res.text() || res.statusText;
    }
    
    const error = new Error(`${res.status}: ${errorMessage}`);
    (error as any).status = res.status;
    (error as any).url = res.url;
    (error as any).details = errorDetails;
    
    console.error(`API Error: ${res.status} at ${res.url}`, errorDetails);
    
    throw error;
  }
}

export async function apiRequest(
  url: string,
  options?: RequestInit,
): Promise<Response> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: (failureCount, error) => {
        // Retry network errors but not API errors
        const isNetworkError = error instanceof Error && 
          (error.message.includes('Failed to fetch') || 
           error.message.includes('Network Error') ||
           (error as any).status === undefined);
           
        // Only retry network errors up to 3 times
        return isNetworkError && failureCount < 3;
      },
    },
    mutations: {
      // For mutations, we'll retry only network errors
      retry: (failureCount, error) => {
        const isNetworkError = error instanceof Error && 
          (error.message.includes('Failed to fetch') || 
           error.message.includes('Network Error') ||
           (error as any).status === undefined);
           
        return isNetworkError && failureCount < 2;
      },
      onError: (error) => {
        console.error('Mutation error:', error);
      }
    },
  },
});
