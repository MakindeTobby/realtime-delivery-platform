import { api } from '@/lib/axios';

export type CustomerAddress = {
  id: string;
  userId: string;
  label: string;
  address: string;
  city: string;
  latitude: string | null;
  longitude: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SaveAddressPayload = {
  label: string;
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
};

export const addressesApi = {
  async getMine() {
    const { data } = await api.get<CustomerAddress[]>('/addresses/mine');
    return data;
  },
  async create(payload: SaveAddressPayload) {
    const { data } = await api.post<CustomerAddress>('/addresses', payload);
    return data;
  },
  async update(id: string, payload: Partial<SaveAddressPayload>) {
    const { data } = await api.patch<CustomerAddress>(`/addresses/${id}`, payload);
    return data;
  },
  async remove(id: string) {
    const { data } = await api.delete<{ id: string }>(`/addresses/${id}`);
    return data;
  },
};
