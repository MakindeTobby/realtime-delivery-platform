import { api } from "@/lib/axios";

export type MenuCategory = {
  id: string;
  restaurantId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

export type MenuItem = {
  id: string;
  restaurantId: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
};

const menuPath = (restaurantId: string) => `/restaurants/${restaurantId}/menu`;

export const menuApi = {
  async getCategories(restaurantId: string) {
    const { data } = await api.get<MenuCategory[]>(`${menuPath(restaurantId)}/categories`);
    return data;
  },
  async createCategory(restaurantId: string, name: string) {
    const { data } = await api.post<MenuCategory>(`${menuPath(restaurantId)}/categories`, { name });
    return data;
  },
  async updateCategory(restaurantId: string, id: string, name: string) {
    const { data } = await api.patch<MenuCategory>(`${menuPath(restaurantId)}/categories/${id}`, { name });
    return data;
  },
  async deleteCategory(restaurantId: string, id: string) {
    const { data } = await api.delete(`${menuPath(restaurantId)}/categories/${id}`);
    return data;
  },
  async getItems(restaurantId: string) {
    const { data } = await api.get<MenuItem[]>(`${menuPath(restaurantId)}/items`);
    return data;
  },
  async createItem(
    restaurantId: string,
    input: Pick<MenuItem, "categoryId" | "name" | "price"> &
      Partial<Pick<MenuItem, "description" | "imageUrl">>,
  ) {
    const { data } = await api.post<MenuItem>(`${menuPath(restaurantId)}/items`, input);
    return data;
  },
  async updateItem(restaurantId: string, id: string, input: Partial<MenuItem>) {
    const { data } = await api.patch<MenuItem>(`${menuPath(restaurantId)}/items/${id}`, input);
    return data;
  },
  async deleteItem(restaurantId: string, id: string) {
    const { data } = await api.delete(`${menuPath(restaurantId)}/items/${id}`);
    return data;
  },
};
