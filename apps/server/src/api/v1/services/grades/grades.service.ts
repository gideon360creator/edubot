import { AssessmentModel } from "@/api/v1/models/assessment.model";
import { GradeModel, type GradeDocument } from "@/api/v1/models/grade.model";
import { UserModel } from "@/api/v1/models/user.model";
import { CustomError } from "@/api/v1/utils";
import { CreateGradeInput } from "@/api/v1/utils/validators/grades.validator";
import { publishGradeCreated } from "@/api/v1/notifications/sse";

const toJson = (doc: GradeDocument | null) => doc?.toJSON();

class GradesServiceImpl {
  async create(input: CreateGradeInput) {
    const { assessmentId, studentNumber, score } = input;

    const student = await UserModel.findOne({
      studentNumber,
      role: "student",
    });
    if (!student) {
      throw new CustomError("Student not found", 404);
    }
    const studentNumberValue = student.studentNumber || student.username;
    if (!studentNumberValue) {
      throw new CustomError("Student record missing student number", 400);
    }

    const assessment = await AssessmentModel.findById(assessmentId);
    if (!assessment) {
      throw new CustomError("Assessment not found", 404);
    }

    if (score > assessment.maxScore) {
      throw new CustomError("Score exceeds assessment maxScore", 400);
    }

    const exists = await GradeModel.findOne({
      assessmentId: assessment._id,
      studentId: student._id,
    });
    if (exists) {
      throw new CustomError("Grade already exists for this assessment", 400);
    }

    const created = await GradeModel.create({
      assessmentId: assessment._id,
      studentId: student._id,
      studentNumber: studentNumberValue,
      score,
    });

    // refetch with population to match listAll format
    const fresh = await GradeModel.findById(created._id)
      .populate("studentId", "fullName studentNumber username")
      .populate({
        path: "assessmentId",
        select: "name maxScore weight subjectId",
        populate: {
          path: "subjectId",
          select: "name code",
        },
      });

    // Broadcast to connected students listening for grade updates
    if (studentNumberValue) {
      await publishGradeCreated(studentNumberValue);
    }

    if (!fresh) return null;
    const json = fresh.toJSON() as any;
    return {
      ...json,
      student: json.studentId,
      assessment: json.assessmentId,
    };
  }

  async listAll(subjectId?: string) {
    let query: any = {};

    if (subjectId) {
      // Find all assessments for this subject
      const assessments = await AssessmentModel.find({ subjectId }).select(
        "_id",
      );
      const assessmentIds = assessments.map((a) => a._id);
      query = { assessmentId: { $in: assessmentIds } };
    }

    const grades = await GradeModel.find(query)
      .populate("studentId", "fullName studentNumber username")
      .populate({
        path: "assessmentId",
        select: "name maxScore weight subjectId",
        populate: {
          path: "subjectId",
          select: "name code",
        },
      })
      .sort({ createdAt: -1 });

    return grades.map((g) => {
      const json = g.toJSON() as any;
      return {
        ...json,
        student: json.studentId,
        assessment: json.assessmentId,
      };
    });
  }

  async update(id: string, input: Partial<CreateGradeInput>) {
    const { score } = input;
    const grade = await GradeModel.findById(id);
    if (!grade) {
      throw new CustomError("Grade not found", 404);
    }

    if (score !== undefined) {
      const assessment = await AssessmentModel.findById(grade.assessmentId);
      if (!assessment) {
        throw new CustomError("Assessment not found", 404);
      }
      if (score > assessment.maxScore) {
        throw new CustomError("Score exceeds assessment maxScore", 400);
      }
      grade.score = score;
    }

    await grade.save();

    const fresh = await GradeModel.findById(grade._id)
      .populate("studentId", "fullName studentNumber username")
      .populate({
        path: "assessmentId",
        select: "name maxScore weight subjectId",
        populate: {
          path: "subjectId",
          select: "name code",
        },
      });

    // Broadcast update
    if (grade.studentNumber) {
      await publishGradeCreated(grade.studentNumber);
    }

    if (!fresh) return null;
    const json = fresh.toJSON() as any;
    return {
      ...json,
      student: json.studentId,
      assessment: json.assessmentId,
    };
  }

  async listForStudent(studentNumber: string) {
    const grades = await GradeModel.find({ studentNumber })
      .populate("studentId", "fullName studentNumber username")
      .populate({
        path: "assessmentId",
        select: "name maxScore weight subjectId",
        populate: {
          path: "subjectId",
          select: "name code",
        },
      })
      .sort({ createdAt: -1 });

    return grades.map((g) => {
      const json = g.toJSON() as any;
      return {
        ...json,
        student: json.studentId,
        assessment: json.assessmentId,
      };
    });
  }

  async deleteById(id: string) {
    const grade = await GradeModel.findById(id);
    if (!grade) {
      throw new CustomError("Grade not found", 404);
    }
    await grade.deleteOne();
    return true;
  }

  async computeGpa(studentNumber: string) {
    const grades = await GradeModel.find({ studentNumber }).lean();
    if (!grades.length) {
      return {
        gpa: 0,
        percentage: 0,
        recorded_weight: 0,
        graded_assessments: 0,
      };
    }

    const assessmentIds = grades.map((g) => g.assessmentId);
    const assessments = await AssessmentModel.find({
      _id: { $in: assessmentIds },
    }).lean();
    const assessmentMap = new Map(
      assessments.map((a) => [a._id.toString(), a]),
    );

    let totalWeight = 0;
    let weightedScore = 0;
    const ratios: number[] = [];

    for (const grade of grades) {
      const meta = assessmentMap.get(grade.assessmentId.toString());
      const weight = meta?.weight ?? 0;
      const maxScore = meta?.maxScore ?? 0;
      const ratio = maxScore > 0 ? grade.score / maxScore : 0;
      ratios.push(ratio);
      if (weight > 0) {
        totalWeight += weight;
        weightedScore += ratio * weight;
      }
    }

    let percentage = 0;
    if (totalWeight > 0) {
      percentage = (weightedScore / totalWeight) * 100;
    } else {
      const avgRatio =
        ratios.reduce((sum, r) => sum + r, 0) / (ratios.length || 1);
      percentage = avgRatio * 100;
    }

    const gpa = percentage / 20; // scale 0-5

    return {
      gpa,
      percentage,
      recorded_weight: totalWeight,
      graded_assessments: grades.length,
    };
  }
}

const GradesService = new GradesServiceImpl();
export default GradesService;
