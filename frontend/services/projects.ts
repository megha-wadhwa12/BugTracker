import api from "@/lib/axios";

export const getProjects = async () => {
  const response = await api.get("/projects");
  return response.data;
}

export const createProject = async (data: { name: string; description?: string; members?: string[] }) => {
  const response = await api.post("/projects", data);
  return response.data;
}

export const updateProject = async (id: string, data: { name?: string; description?: string; members?: string[] }) => {
  const response = await api.patch(`/projects/${id}`, data);
  return response.data;
}

export const deleteProject = async (id: string) => {
  const response = await api.delete(`/projects/${id}`);
  return response.data;
}

export const archiveProject = async (id: string, isArchived: boolean) => {
  const response = await api.patch(`/projects/${id}/archive`, { isArchived });
  return response.data;
}
