import { z } from "zod";

export const createAssessmentSchema = z
  .object({
    subjectId: z.string().optional(),
    subject_id: z.string().optional(),
    name: z.string().min(1).trim(),
    maxScore: z.number().min(0),
    weight: z.number().min(0).max(100),
  })
  .transform((data) => ({
    subjectId: data.subjectId || (data as any).subject_id || "",
    name: data.name,
    maxScore: data.maxScore,
    weight: data.weight,
  }))
  .superRefine((data, ctx) => {
    if (!data.subjectId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["subjectId"],
        message: "subjectId is required",
      });
    }
  });

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;

export const listAssessmentsQuerySchema = z
  .object({
    subjectId: z.string().optional(),
    subject_id: z.string().optional(),
  })
  .transform((data) => ({
    subjectId: data.subjectId || (data as any).subject_id,
  }));

export type ListAssessmentsQueryInput = z.infer<
  typeof listAssessmentsQuerySchema
>;

export const updateAssessmentSchema = z.object({
  name: z.string().min(1).trim().optional(),
  maxScore: z.number().min(0).optional(),
  weight: z.number().min(0).max(100).optional(),
});

export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;
