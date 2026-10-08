import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failures, err: any) => {
        const status = err?.response?.status;
        if (status && status < 500) return false;
        return failures < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      staleTime: 60_000,
    },
    mutations: { retry: 0 },
  },
});
