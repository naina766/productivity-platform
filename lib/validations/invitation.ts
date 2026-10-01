import { z } from 'zod';

export const createInvitationSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .transform((e) => e.trim().toLowerCase())
    .pipe(z.string().email('Invalid email address')),
  role: z.enum(['ADMIN', 'MEMBER']).default('MEMBER'),
});

export type CreateInvitationData = z.infer<typeof createInvitationSchema>;
