import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addressesApi, type SaveAddressPayload } from '@/api/addresses';

export const addressQueryKeys = {
  mine: ['addresses', 'mine'] as const,
};

export function useMyAddressesQuery() {
  return useQuery({
    queryKey: addressQueryKeys.mine,
    queryFn: addressesApi.getMine,
    staleTime: 30_000,
  });
}

export function useCreateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: SaveAddressPayload) => addressesApi.create(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressQueryKeys.mine });
    },
  });
}

export function useUpdateAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SaveAddressPayload> }) =>
      addressesApi.update(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressQueryKeys.mine });
    },
  });
}

export function useDeleteAddressMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => addressesApi.remove(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: addressQueryKeys.mine });
    },
  });
}
