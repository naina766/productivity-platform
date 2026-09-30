import { z } from 'zod';

const memberRoles = ['ADMIN', 'MEMBER'] as const;

export const addWorkspaceMemberSchema = z.object({
  email: z
    .string({ required_error: 'Email is required.' })
    .trim()
    .email('Please enter a valid email address.')
    .max(255)
    .transform((s) => s.toLowerCase()),
  role: z.enum(memberRoles, { required_error: 'Role is required.' }),
});

export const updateWorkspaceMemberRoleSchema = z.object({
  role: z.enum(memberRoles, { required_error: 'Role is required.' }),
});

export type AddWorkspaceMemberData = z.infer<typeof addWorkspaceMemberSchema>;
export type UpdateWorkspaceMemberRoleData = z.infer<typeof updateWorkspaceMemberRoleSchema>;
