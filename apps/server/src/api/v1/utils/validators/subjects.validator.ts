import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(1).trim(),
  code: z.string().min(1).trim().transform((val) => val.toUpperCase()),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;

export const updateSubjectSchema = z
  .object({
    name: z.string().min(1).trim().optional(),
    code: z
      .string()
      .min(1)
      .trim()
      .transform((val) => val.toUpperCase())
      .optional(),
  })
  .refine((data) => data.name || data.code, {
    message: "name or code is required",
  });

export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;

export const subjectIdParamSchema = z.object({
  id: z.string(),
});

export type SubjectIdParamInput = z.infer<typeof subjectIdParamSchema>;
