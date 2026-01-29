import { Hono } from "hono";
import usersRouter from "./users.route";
import subjectsRouter from "./subjects.route";
import gradesRouter from "./grades.route";
import assessmentsRouter from "./assessments.route";
import notificationsRouter from "./notifications.route";
import promptsRouter from "./prompts.route";
import chatRouter from "./chat.route";

const router = new Hono();

router.route("/users", usersRouter);
router.route("/subjects", subjectsRouter);
router.route("/grades", gradesRouter);
router.route("/assessments", assessmentsRouter);
router.route("/notifications", notificationsRouter);
router.route("/prompts", promptsRouter);
router.route("/chat", chatRouter);

export default router;
