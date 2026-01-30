import {
  AssessmentModel,
  type AssessmentDocument,
} from "@/api/v1/models/assessment.model";
import { SubjectModel } from "@/api/v1/models/subject.model";
import { CustomError } from "@/api/v1/utils";
import {
  CreateAssessmentInput,
  UpdateAssessmentInput,
} from "@/api/v1/utils/validators/assessments.validator";

const toJson = (doc: AssessmentDocument | null) => doc?.toJSON();

class AssessmentsServiceImpl {
  async listAll(subjectId?: string, lecturerId?: string) {
    const filter: Record<string, any> = {};
    if (subjectId) {
      filter.subjectId = subjectId;
    }
    if (lecturerId) {
      filter.lecturerId = lecturerId;
    }

    const assessments = await AssessmentModel.find(filter)
      .populate("subjectId")
      .sort({
        createdAt: -1,
      });
    return assessments.map((a) => toJson(a));
  }

  async create(input: CreateAssessmentInput) {
    const { subjectId, name, maxScore, weight } = input;

    const subject = await SubjectModel.findById(subjectId);
    if (!subject) {
      throw new CustomError("Subject not found", 404);
    }

    const existing = await AssessmentModel.findOne({
      subjectId,
      name,
    });
    if (existing) {
      throw new CustomError(
        "Assessment with this name already exists for the subject",
        400,
      );
    }

    // Check total weight
    const allAssessments = await AssessmentModel.find({ subjectId });
    const currentTotalWeight = allAssessments.reduce(
      (acc, a) => acc + a.weight,
      0,
    );

    if (currentTotalWeight + weight > 100) {
      throw new CustomError(
        `Total weight for this subject exceeds 100%. Current total: ${currentTotalWeight}%, Available: ${100 - currentTotalWeight}%`,
        400,
      );
    }

    const created = await AssessmentModel.create({
      subjectId,
      lecturerId: subject.lecturerId,
      name,
      maxScore,
      weight,
    });
    const fresh = await AssessmentModel.findById(created._id);
    return toJson(fresh);
  }

  async delete(id: string, lecturerId?: string) {
    const assessment = await AssessmentModel.findById(id);
    if (!assessment) {
      throw new CustomError("Assessment not found", 404);
    }

    if (lecturerId && assessment.lecturerId.toString() !== lecturerId) {
      throw new CustomError(
        "Unauthorized: You do not own this assessment",
        403,
      );
    }

    await assessment.deleteOne();
    return true;
  }

  async update(id: string, input: UpdateAssessmentInput, lecturerId?: string) {
    const assessment = await AssessmentModel.findById(id);
    if (!assessment) {
      throw new CustomError("Assessment not found", 404);
    }

    if (lecturerId && assessment.lecturerId.toString() !== lecturerId) {
      throw new CustomError(
        "Unauthorized: You do not own this assessment",
        403,
      );
    }

    if (input.weight !== undefined && input.weight !== assessment.weight) {
      const allAssessments = await AssessmentModel.find({
        subjectId: assessment.subjectId,
        _id: { $ne: id },
      });
      const currentTotalWeight = allAssessments.reduce(
        (acc, a) => acc + a.weight,
        0,
      );

      if (currentTotalWeight + input.weight > 100) {
        throw new CustomError(
          `Total weight for this subject exceeds 100%. Current total (excluding this): ${currentTotalWeight}%, Available: ${100 - currentTotalWeight}%`,
          400,
        );
      }
    }

    if (input.name && input.name !== assessment.name) {
      const existing = await AssessmentModel.findOne({
        subjectId: assessment.subjectId,
        name: input.name,
        _id: { $ne: id },
      });
      if (existing) {
        throw new CustomError(
          "Assessment with this name already exists for the subject",
          400,
        );
      }
    }

    Object.assign(assessment, input);
    await assessment.save();

    const fresh = await AssessmentModel.findById(id).populate("subjectId");
    return toJson(fresh);
  }
}

const AssessmentsService = new AssessmentsServiceImpl();
export default AssessmentsService;
