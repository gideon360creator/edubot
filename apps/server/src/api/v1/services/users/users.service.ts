import { signToken } from "@/api/v1/utils/jwt";
import { CustomError } from "@/api/v1/utils";
import { UserDocument, UserModel, UserRole } from "@/api/v1/models/user.model";
import { SubjectModel } from "@/api/v1/models/subject.model";
import { EnrollmentModel } from "@/api/v1/models/enrollment.model";
import { Types } from "mongoose";

type CreateStudentInput = {
  fullName: string;
  studentNumber: string;
  password: string;
};

type CreateLecturerInput = {
  fullName: string;
  username: string;
  password: string;
};

type LoginInput = {
  identifier: string; // username or studentNumber
  password: string;
};

type PublicUser = {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  studentNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

const toPublicUser = (user: UserDocument | null): PublicUser | null => {
  if (!user) return null;
  const { id, username, fullName, role, studentNumber, createdAt, updatedAt } =
    user.toJSON() as any;
  return { id, username, fullName, role, studentNumber, createdAt, updatedAt };
};

const publicSelect = "-hashedPassword";

class UsersServiceImpl {
  async createStudent(input: CreateStudentInput) {
    const { fullName, studentNumber, password } = input;
    const exists = await UserModel.findOne({
      $or: [{ username: studentNumber }, { studentNumber }],
    });
    if (exists) {
      throw new CustomError("Student already exists", 400);
    }
    const hashedPassword = await Bun.password.hash(password);
    const user = await UserModel.create({
      username: studentNumber,
      fullName,
      studentNumber,
      role: "student" as UserRole,
      hashedPassword,
    });
    const fresh = await UserModel.findById(user._id).select(publicSelect);
    return toPublicUser(fresh) as PublicUser;
  }

  async createLecturer(input: CreateLecturerInput) {
    const { fullName, username, password } = input;
    const exists = await UserModel.findOne({ username });
    if (exists) {
      throw new CustomError("Username already exists", 400);
    }
    const hashedPassword = await Bun.password.hash(password);
    const user = await UserModel.create({
      username,
      fullName,
      role: "lecturer" as UserRole,
      hashedPassword,
    });
    const fresh = await UserModel.findById(user._id).select(publicSelect);
    return toPublicUser(fresh) as PublicUser;
  }

  async login(input: LoginInput) {
    const { identifier, password } = input;
    const user =
      (await UserModel.findOne({ username: identifier }).select(
        "+hashedPassword",
      )) ||
      (await UserModel.findOne({ studentNumber: identifier }).select(
        "+hashedPassword",
      ));

    if (!user) {
      throw new CustomError("Invalid credentials", 401);
    }

    const ok = await Bun.password.verify(password, user.hashedPassword);
    if (!ok) {
      throw new CustomError("Invalid credentials", 401);
    }

    const token = await signToken({ sub: user.username, role: user.role });
    // refetch without hashedPassword (since we selected it above)
    const safe = await UserModel.findById(user._id).select(publicSelect);
    return { token, user: toPublicUser(safe) as PublicUser };
  }

  async findByUsername(username: string) {
    const user = await UserModel.findOne({ username }).select(publicSelect);
    return toPublicUser(user);
  }

  async findById(id: string) {
    const user = await UserModel.findById(id).select(publicSelect);
    return toPublicUser(user);
  }

  async listAll() {
    const users = await UserModel.find()
      .select(publicSelect)
      .sort({ createdAt: -1 });
    return users.map((u) => toPublicUser(u) as PublicUser);
  }

  async deleteById(id: string) {
    await UserModel.findByIdAndDelete(id);
    return true;
  }

  async verifyStudentNumber(studentNumber: string) {
    const user = await UserModel.findOne({ studentNumber, role: "student" });

    if (!user) {
      throw new CustomError("Student not found", 404);
    }

    return !!user;
  }

  async listEnrolledStudents(lecturerId: string, subjectId?: string) {
    const lId = new Types.ObjectId(lecturerId);

    let query: any = {
      $or: [{ lecturerId: lId }],
    };

    // 1. Find all subjects belonging to this lecturer to catch old enrollments or for broader filtering
    const subjects = await SubjectModel.find({
      lecturerId: lId,
    }).select("_id");
    const subjectIds = subjects.map((s) => s._id);

    if (subjectId) {
      // If subjectId is provided, filter specifically for it
      query = { subjectId: new Types.ObjectId(subjectId) };
    } else {
      // Otherwise, find enrollments belonging to the lecturer's subjects
      query.$or.push({ subjectId: { $in: subjectIds } });
    }

    const enrollments = await EnrollmentModel.find(query)
      .populate("userId", publicSelect)
      .populate("subjectId", "name code");

    // 2. Format the data
    return enrollments.map((e) => {
      const json = e.toJSON() as any;
      return {
        id: json.id,
        student: json.userId,
        subject: json.subjectId,
        enrolledAt: json.createdAt,
      };
    });
  }
}

const UsersService = new UsersServiceImpl();
export default UsersService;
