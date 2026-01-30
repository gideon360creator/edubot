import { Context } from "hono";
import GradesService from "@/api/v1/services/grades/grades.service";
import { respond } from "@/api/v1/utils/respond";
import {
  CreateGradeInput,
  GradeIdParamInput,
  UpdateGradeInput,
} from "@/api/v1/utils/validators/grades.validator";

export const listGrades = async (c: Context) => {
  const user = c.get("user");
  const subjectId = c.req.query("subjectId");
  const grades = await GradesService.listAll(
    subjectId,
    user.role === "lecturer" ? user.id : undefined,
  );
  return respond(c, 200, "Grades fetched", grades);
};

export const listMyGrades = async (c: Context) => {
  const user = c.get("user");
  const grades = await GradesService.listForStudent(user.studentNumber);
  return respond(c, 200, "Grades fetched", grades);
};

export const createGrade = async (c: Context) => {
  const body = (c.req as any).valid("json") as CreateGradeInput;
  const grade = await GradesService.create(body);
  return respond(c, 201, "Grade created", grade);
};

export const updateGrade = async (c: Context) => {
  const user = c.get("user");
  const { id } = (c.req as any).valid("param") as GradeIdParamInput;
  const body = (c.req as any).valid("json") as UpdateGradeInput;
  const grade = await GradesService.update(id, body, user.id);
  return respond(c, 200, "Grade updated", grade);
};

export const deleteGrade = async (c: Context) => {
  const user = c.get("user");
  const { id } = (c.req as any).valid("param") as GradeIdParamInput;
  await GradesService.deleteById(id, user.id);
  return respond(c, 200, "Grade deleted");
};

export const myGpa = async (c: Context) => {
  const user = c.get("user");
  const gpa = await GradesService.computeGpa(user.studentNumber);
  return respond(c, 200, "GPA calculated", gpa);
};
