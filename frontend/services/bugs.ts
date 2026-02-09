import api from "@/lib/axios";

export const getBugs = async () => {
  const response = await api.get("/bugs");
  return response.data;
}

export const createBug = async (data: any) => {
  const response = await api.post("/bugs", data);
  return response.data;
}

export const updateBug = async (id: string, data: { name?: string; description?: string; members?: string[] }) => {
  const response = await api.patch(`/bugs/${id}`, data);
  return response.data;
}

export const deleteBug = async (id: string) => {
  const response = await api.delete(`/bugs/${id}`);
  return response.data;
}