import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createGrade,
  deleteGrade,
  listGrades,
  listMyGrades,
  myGpa,
  updateGrade,
} from "@/api/v1/app/controllers/grades.controller";
import {
  createGradeSchema,
  gradeIdParamSchema,
  updateGradeSchema,
} from "@/api/v1/utils/validators/grades.validator";
import {
  authMiddleware,
  lecturerOnly,
  studentOnly,
} from "@/api/v1/app/middlewares/auth.middleware";

const router = new Hono();

router.use(authMiddleware);

router.get("/me", studentOnly, listMyGrades);
router.get("/me/gpa", studentOnly, myGpa);

router.use(lecturerOnly);

router.get("/", listGrades);
router.post("/", zValidator("json", createGradeSchema), createGrade);
router.patch(
  "/:id",
  zValidator("param", gradeIdParamSchema),
  zValidator("json", updateGradeSchema),
  updateGrade,
);
router.delete("/:id", zValidator("param", gradeIdParamSchema), deleteGrade);

export default router;
