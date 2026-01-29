import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  createSubject,
  deleteSubject,
  listSubjects,
  updateSubject,
  registerForSubject,
  listMyEnrollments,
} from "@/api/v1/app/controllers/subjects.controller";
import {
  createSubjectSchema,
  subjectIdParamSchema,
  updateSubjectSchema,
} from "@/api/v1/utils/validators/subjects.validator";
import {
  authMiddleware,
  lecturerOnly,
} from "@/api/v1/app/middlewares/auth.middleware";

const router = new Hono();

router.use(authMiddleware);

router.get("/", listSubjects);

router.post(
  "/register/:id",
  zValidator("param", subjectIdParamSchema),
  registerForSubject,
);

router.get("/enrolled", listMyEnrollments);

router.use(lecturerOnly);

router.post("/", zValidator("json", createSubjectSchema), createSubject);
router.put(
  "/:id",
  zValidator("param", subjectIdParamSchema),
  zValidator("json", updateSubjectSchema),
  updateSubject,
);
router.delete("/:id", zValidator("param", subjectIdParamSchema), deleteSubject);

export default router;
