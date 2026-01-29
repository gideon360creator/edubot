import { z } from "zod";

export const registerSchema = z
  .object({
    username: z.string().optional(),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    password: z.string().min(6),
    role: z.enum(["student", "lecturer"]),
    studentNumber: z.string().optional(),
    // allow snake_case payloads from legacy clients
    student_number: z.string().optional(),
  })
  .transform((data) => ({
    ...data,
    studentNumber: data.studentNumber || (data as any).student_number,
  }))
  .superRefine((data, ctx) => {
    if (data.role === "student" && !data.studentNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["studentNumber"],
        message: "studentNumber is required for students",
      });
    }
    if (data.role === "lecturer" && !data.username) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["username"],
        message: "username is required for lecturers",
      });
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z
  .object({
    identifier: z.string().optional(),
    username: z.string().optional(),
    studentNumber: z.string().optional(),
    student_number: z.string().optional(),
    password: z.string(),
  })
  .transform((data) => ({
    identifier:
      data.identifier ||
      data.username ||
      data.studentNumber ||
      (data as any).student_number,
    password: data.password,
  }))
  .superRefine((data, ctx) => {
    if (!data.identifier) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["identifier"],
        message: "identifier (username or studentNumber) is required",
      });
    }
  });

export type LoginInput = z.infer<typeof loginSchema>;

export const idParamSchema = z.object({
  id: z.string(),
});

export type IdParamInput = z.infer<typeof idParamSchema>;

export const studentNumberQuerySchema = z.object({
  studentNumber: z.string(),
});

export type StudentNumberQueryInput = z.infer<typeof studentNumberQuerySchema>;
