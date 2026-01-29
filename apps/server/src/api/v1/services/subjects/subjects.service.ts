import { AssessmentModel } from "@/api/v1/models/assessment.model";
import { GradeModel } from "@/api/v1/models/grade.model";
import {
  SubjectModel,
  type SubjectDocument,
} from "@/api/v1/models/subject.model";
import { EnrollmentModel } from "@/api/v1/models/enrollment.model";
import { CustomError } from "@/api/v1/utils";
import { Types } from "mongoose";

export type CreateSubjectInput = {
  name: string;
  code: string;
  lecturerId: string;
};

export type UpdateSubjectInput = {
  name?: string;
  code?: string;
};

const toJson = (doc: SubjectDocument | null) => doc?.toJSON();

class SubjectsServiceImpl {
  async listAll(lecturerId?: string) {
    const filter = lecturerId ? { lecturerId } : {};
    const subjects = await SubjectModel.find(filter).sort({ createdAt: -1 });
    return subjects.map((s) => toJson(s));
  }

  async create(input: CreateSubjectInput) {
    const { name, code, lecturerId } = input;
    const existing = await SubjectModel.findOne({ code });
    if (existing) {
      throw new CustomError("Subject code already exists", 400);
    }
    const created = await SubjectModel.create({
      name,
      code,
      lecturerId: new Types.ObjectId(lecturerId),
    });
    const fresh = await SubjectModel.findById(created._id);
    return toJson(fresh);
  }

  async update(id: string, input: UpdateSubjectInput, lecturerId?: string) {
    const subject = await SubjectModel.findById(id);
    if (!subject) {
      throw new CustomError("Subject not found", 404);
    }

    if (lecturerId && subject.lecturerId.toString() !== lecturerId) {
      throw new CustomError("Unauthorized: You do not own this subject", 403);
    }

    if (input.code) {
      const conflict = await SubjectModel.findOne({
        code: input.code,
        _id: { $ne: id },
      });
      if (conflict) {
        throw new CustomError("Subject code already exists", 400);
      }
      subject.code = input.code;
    }

    if (input.name) {
      subject.name = input.name;
    }

    await subject.save();
    return toJson(subject);
  }

  async deleteById(id: string, lecturerId?: string) {
    const subject = await SubjectModel.findById(id);
    if (!subject) {
      throw new CustomError("Subject not found", 404);
    }

    if (lecturerId && subject.lecturerId.toString() !== lecturerId) {
      throw new CustomError("Unauthorized: You do not own this subject", 403);
    }

    const assessmentIds = await AssessmentModel.find({
      subjectId: subject._id,
    }).distinct("_id");

    if (assessmentIds.length > 0) {
      await GradeModel.deleteMany({ assessmentId: { $in: assessmentIds } });
    }

    await AssessmentModel.deleteMany({ subjectId: subject._id });
    await EnrollmentModel.deleteMany({ subjectId: subject._id });
    await subject.deleteOne();
    return true;
  }

  async registerStudent(userId: string, subjectId: string) {
    const subject = await SubjectModel.findById(subjectId);
    if (!subject) {
      throw new CustomError("Subject not found", 404);
    }

    const existing = await EnrollmentModel.findOne({ userId, subjectId });
    if (existing) {
      throw new CustomError("You are already registered for this subject", 400);
    }

    const enrollment = await EnrollmentModel.create({
      userId: new Types.ObjectId(userId),
      subjectId: new Types.ObjectId(subjectId),
      lecturerId: subject.lecturerId,
    });

    return enrollment.toJSON();
  }

  async getStudentEnrollments(userId: string) {
    const enrollments = await EnrollmentModel.find({ userId }).populate(
      "subjectId",
    );
    return enrollments.map((e) => {
      const json = e.toJSON() as any;
      if (json.subjectId && typeof json.subjectId === "object") {
        json.subject = json.subjectId;
        delete json.subjectId;
      }
      return json;
    });
  }
}

const SubjectsService = new SubjectsServiceImpl();
export default SubjectsService;
