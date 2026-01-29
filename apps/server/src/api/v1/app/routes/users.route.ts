import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import {
  currentUser,
  deleteUser,
  listUsers,
  loginUser,
  registerUser,
  verifyStudent,
  listEnrolledStudents,
} from "@/api/v1/app/controllers/users.controller";
import {
  idParamSchema,
  loginSchema,
  registerSchema,
  studentNumberQuerySchema,
} from "@/api/v1/utils/validators/users.validator";
import {
  authMiddleware,
  lecturerOnly,
} from "@/api/v1/app/middlewares/auth.middleware";

const router = new Hono();

router.post("/auth/register", zValidator("json", registerSchema), registerUser);
router.post("/auth/login", zValidator("json", loginSchema), loginUser);

router.use(authMiddleware);

router.get("/me", currentUser);

// Lecturer-only routes
router.use(lecturerOnly);

router.get("/", listUsers);
router.get(
  "/verify",
  zValidator("query", studentNumberQuerySchema),
  verifyStudent,
);
router.get("/enrolled-students", listEnrolledStudents);
router.delete("/:id", zValidator("param", idParamSchema), deleteUser);

export default router;
