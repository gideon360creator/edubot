import { Context } from "hono";
import UsersService from "@/api/v1/services/users/users.service";
import { respond } from "@/api/v1/utils/respond";
import {
  RegisterInput,
  LoginInput,
  StudentNumberQueryInput,
  IdParamInput,
} from "@/api/v1/utils/validators/users.validator";
import { UserDocument } from "@/api/v1/models/user.model";

// Assumes validation middleware (zValidator) runs in routes and populates c.req.valid(...)

export const registerUser = async (c: Context) => {
  const body = (c.req as any).valid("json") as RegisterInput;
  const { role, password, fullName } = body;

  if (role === "student") {
    const studentNumber =
      body.studentNumber || (body as any).student_number || body.username;
    const user = await UsersService.createStudent({
      studentNumber,
      fullName,
      password,
    });
    return respond(c, 201, "Student registered", user);
  }

  const user = await UsersService.createLecturer({
    username: body.username as string,
    fullName,
    password,
  });
  return respond(c, 201, "Lecturer registered", user);
};

export const loginUser = async (c: Context) => {
  const body = (c.req as any).valid("json") as LoginInput;
  const result = await UsersService.login(body);
  return respond(c, 200, "Login successful", result);
};

export const currentUser = async (c: Context) => {
  const user = c.get("user");
  if (!user) return respond(c, 401, "Unauthorized");
  return respond(c, 200, "Current user", user);
};

export const listUsers = async (c: Context) => {
  const users = await UsersService.listAll();
  return respond(c, 200, "Users fetched", users);
};

export const deleteUser = async (c: Context) => {
  const { id } = (c.req as any).valid("param") as IdParamInput;
  await UsersService.deleteById(id);
  return respond(c, 200, "User deleted");
};

export const verifyStudent = async (c: Context) => {
  const { studentNumber } = (c.req as any).valid(
    "query",
  ) as StudentNumberQueryInput;
  const found = await UsersService.verifyStudentNumber(studentNumber);
  return respond(c, 200, "Student exists", found);
};

export const listEnrolledStudents = async (c: Context) => {
  const user = c.get("user") as UserDocument;
  if (!user || user.role !== "lecturer") {
    return respond(c, 403, "Only lecturers can view enrolled students");
  }

  const subjectId = c.req.query("subjectId") as string | undefined;
  const students = await UsersService.listEnrolledStudents(
    user.id as string,
    subjectId,
  );
  return respond(c, 200, "Enrolled students fetched", students);
};
