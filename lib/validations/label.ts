import { z } from 'zod';

const HEX_COLOR_REGEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export const createLabelSchema = z.object({
  name: z
    .string({ required_error: 'Label name is required.' })
    .min(1, 'Label name must be at least 1 character.')
    .max(50, 'Label name cannot exceed 50 characters.')
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, 'Label name cannot be empty.'),
  color: z
    .string()
    .regex(HEX_COLOR_REGEX, 'Color must be a valid hex color code (e.g. #22C55E).')
    .optional()
    .default('#22C55E'),
});

export const updateLabelSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Label name must be at least 1 character.')
      .max(50, 'Label name cannot exceed 50 characters.')
      .transform((s) => s.trim())
      .refine((s) => s.length > 0, 'Label name cannot be empty.')
      .optional(),
    color: z
      .string()
      .regex(HEX_COLOR_REGEX, 'Color must be a valid hex color code (e.g. #22C55E).')
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required to update.',
  });

export type CreateLabelData = z.infer<typeof createLabelSchema>;
export type UpdateLabelData = z.infer<typeof updateLabelSchema>;
