import { z } from 'zod';

export const bugsFormSchema = z.object({
    title: z.string().min(1, "Bug title is required"),
    description: z.string().max(1000, 'Bug description can contain at max 1000 characters'),
    priority: z.string(),
    status: z.string(),
    assignedTo: z.string(),
    projectId: z.string(),
    activity: z.array(z.string()).optional()
})

export type BugFormValues = z.infer<typeof bugsFormSchema>;