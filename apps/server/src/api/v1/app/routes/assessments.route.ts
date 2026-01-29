import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createAssessment,
  deleteAssessment,
  listAssessments,
  updateAssessment,
} from "@/api/v1/app/controllers/assessments.controller";
import {
  createAssessmentSchema,
  listAssessmentsQuerySchema,
  updateAssessmentSchema,
} from "@/api/v1/utils/validators/assessments.validator";
import {
  authMiddleware,
  lecturerOnly,
} from "@/api/v1/app/middlewares/auth.middleware";

const router = new Hono();

router.use(authMiddleware);

router.get(
  "/",
  zValidator("query", listAssessmentsQuerySchema),
  listAssessments,
);

router.use(lecturerOnly);

router.post("/", zValidator("json", createAssessmentSchema), createAssessment);
router.patch(
  "/:id",
  zValidator("json", updateAssessmentSchema),
  updateAssessment,
);
router.delete("/:id", deleteAssessment);

export default router;
