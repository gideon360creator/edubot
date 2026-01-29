import { z } from "zod";

export const createGradeSchema = z
  .object({
    studentNumber: z.string().optional(),
    student_number: z.string().optional(),
    assessmentId: z.string(),
    score: z.number().min(0),
  })
  .transform((data) => ({
    assessmentId: data.assessmentId,
    score: data.score,
    studentNumber: data.studentNumber || (data as any).student_number || "",
  }))
  .superRefine((data, ctx) => {
    if (!data.studentNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["studentNumber"],
        message: "studentNumber is required",
      });
    }
  });

export type CreateGradeInput = z.infer<typeof createGradeSchema>;

export const gradeIdParamSchema = z.object({
  id: z.string(),
});

export const updateGradeSchema = z.object({
  score: z.number().min(0),
});

export type UpdateGradeInput = z.infer<typeof updateGradeSchema>;
export type GradeIdParamInput = z.infer<typeof gradeIdParamSchema>;
