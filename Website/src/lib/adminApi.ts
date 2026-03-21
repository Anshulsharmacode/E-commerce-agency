import api from "./api";

export const PRODUCT_LIMIT = 50;

type ApiResponse<T> = {
  data?: T;
};

const unwrap = <T>(response: { data?: ApiResponse<T> }) =>
  response.data?.data;

export const adminApi = {
  getProducts: async (limit: number = PRODUCT_LIMIT) => {
    const response = await api.get(`/product/all?limit=${limit}`);
    return unwrap(response);
  },
  createProduct: async (payload: unknown) => api.post("/product/create", payload),
  updateProduct: async (id: string, payload: unknown) =>
    api.patch(`/product/${id}`, payload),
  deleteProduct: async (id: string) => api.delete(`/product/${id}`),

  getCategories: async () => {
    const response = await api.get("/category/all");
    return unwrap(response);
  },
  createCategory: async (payload: unknown) =>
    api.post("/category/create", payload),
  updateCategory: async (id: string, payload: unknown) =>
    api.patch(`/category/${id}`, payload),
  deleteCategory: async (id: string) => api.delete(`/category/${id}`),

  getOffers: async () => {
    const response = await api.get("/offer/all");
    return unwrap(response);
  },
  createOffer: async (payload: unknown) => api.post("/offer/create", payload),
  updateOffer: async (id: string, payload: unknown) =>
    api.patch(`/offer/${id}`, payload),
  deleteOffer: async (id: string) => api.delete(`/offer/${id}`),

  getEmployees: async () => {
    const response = await api.get("/user/employees");
    return unwrap(response);
  },
  createEmployee: async (payload: unknown) =>
    api.post("/user/create-staff", payload),
};
