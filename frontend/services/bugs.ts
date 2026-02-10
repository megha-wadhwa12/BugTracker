import api from "@/lib/axios";

type CreateBugPayload = {
  title: string;
  description?: string;
  priority: string;
  status: string;
  assignedTo?: string;
  project: string;
};

export const getBugs = async (params?: {
  projectId?: string;
  status?: string;
  priority?: string;
}) => {
  const response = await api.get("/bugs", { params });
  return response.data;
};

export const createBug = async (data: CreateBugPayload) => {
  const response = await api.post("/bugs", data);
  return response.data;
}

export const updateBug = async (  
  id: string,
  data: {
    title?: string;
    description?: string;
    priority?: string;
    status?: string;
    assignedTo?: string;
  }
) => {
  const response = await api.patch(`/bugs/${id}`, data);
  return response.data;
};

export const deleteBug = async (id: string) => {
  const response = await api.delete(`/bugs/${id}`);
  return response.data;
}