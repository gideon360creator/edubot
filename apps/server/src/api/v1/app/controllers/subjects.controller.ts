import { Context } from "hono";
import SubjectsService from "@/api/v1/services/subjects/subjects.service";
import { respond } from "@/api/v1/utils/respond";
import {
  CreateSubjectInput,
  UpdateSubjectInput,
  SubjectIdParamInput,
} from "@/api/v1/utils/validators/subjects.validator";

export const listSubjects = async (c: Context) => {
  const user = c.get("user");
  const subjects = await SubjectsService.listAll(
    user.role === "lecturer" ? user.id : undefined,
  );
  return respond(c, 200, "Subjects fetched", subjects);
};

export const createSubject = async (c: Context) => {
  const user = c.get("user");
  const body = (c.req as any).valid("json") as CreateSubjectInput;
  const subject = await SubjectsService.create({
    ...body,
    lecturerId: user.id,
  });
  return respond(c, 201, "Subject created", subject);
};

export const updateSubject = async (c: Context) => {
  const user = c.get("user");
  const { id } = (c.req as any).valid("param") as SubjectIdParamInput;
  const body = (c.req as any).valid("json") as UpdateSubjectInput;
  const subject = await SubjectsService.update(id, body, user.id);
  return respond(c, 200, "Subject updated", subject);
};

export const deleteSubject = async (c: Context) => {
  const user = c.get("user");
  const { id } = (c.req as any).valid("param") as SubjectIdParamInput;
  await SubjectsService.deleteById(id, user.id);
  return respond(c, 200, "Subject deleted");
};

export const registerForSubject = async (c: Context) => {
  const user = c.get("user");
  const { id } = (c.req as any).valid("param") as SubjectIdParamInput;
  const enrollment = await SubjectsService.registerStudent(user.id, id);
  return respond(c, 201, "Registered for subject", enrollment);
};

export const listMyEnrollments = async (c: Context) => {
  const user = c.get("user");
  const enrollments = await SubjectsService.getStudentEnrollments(user.id);
  return respond(c, 200, "Enrollments fetched", enrollments);
};
