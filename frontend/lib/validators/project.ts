import { z } from 'zod'

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
  description: z.string().max(500, 'Project description can contain at max 500 characters'),
  members: z.array(z.string()).default([]),
})

export const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100, "Project name must be less than 100 characters"),
  description: z.string().max(500, 'Project description can contain at max 500 characters'),
})

export type ProjectFormValues = z.infer<typeof projectFormSchema>;
