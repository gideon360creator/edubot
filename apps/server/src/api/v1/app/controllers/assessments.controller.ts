import { Context } from "hono";
import AssessmentsService from "@/api/v1/services/assessments/assessments.service";
import { respond } from "@/api/v1/utils/respond";
import {
  CreateAssessmentInput,
  ListAssessmentsQueryInput,
  UpdateAssessmentInput,
} from "@/api/v1/utils/validators/assessments.validator";

export const listAssessments = async (c: Context) => {
  const user = c.get("user");
  const query = (c.req as any).valid("query") as ListAssessmentsQueryInput;
  const assessments = await AssessmentsService.listAll(
    query.subjectId,
    user.role === "lecturer" ? user.id : undefined,
  );
  return respond(c, 200, "Assessments fetched", assessments);
};

export const createAssessment = async (c: Context) => {
  const body = (c.req as any).valid("json") as CreateAssessmentInput;
  const assessment = await AssessmentsService.create(body);
  return respond(c, 201, "Assessment created", assessment);
};

export const deleteAssessment = async (c: Context) => {
  const user = c.get("user");
  const id = c.req.param("id");
  await AssessmentsService.delete(id, user.id);
  return respond(c, 200, "Assessment deleted", null);
};

export const updateAssessment = async (c: Context) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = (c.req as any).valid("json") as UpdateAssessmentInput;
  const assessment = await AssessmentsService.update(id, body, user.id);
  return respond(c, 200, "Assessment updated", assessment);
};
