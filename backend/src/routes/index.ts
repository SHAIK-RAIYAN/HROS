import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import {
  initiateOffboarding,
  getCases,
  getCaseById,
} from "../controllers/offboarding.controller";
import {
  getPendingTasks,
  completeTask,
} from "../controllers/task.controller";
import {
  getRoles,
  getUsers,
  getEmployees,
} from "../controllers/helper.controller";

const router = Router();

router.get("/roles", getRoles);
router.get("/users", getUsers);
router.get("/employees", getEmployees);

router.post("/offboarding", authMiddleware, initiateOffboarding);
router.post("/offboarding/initiate", authMiddleware, initiateOffboarding);
router.get("/offboarding", authMiddleware, getCases);
router.get("/offboarding/:id", authMiddleware, getCaseById);

router.get("/tasks", authMiddleware, getPendingTasks);
router.post("/tasks/:id/complete", authMiddleware, completeTask);
router.put("/tasks/:id", authMiddleware, completeTask);

export default router;
