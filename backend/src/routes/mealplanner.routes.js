import { Router } from "express";
import {
  getMealplanner,
  getMealplannerEntry,
  patchMealplannerById,
  postMealplannerEntry,
  putMealplannerEntry,
  removeMealplannerEntry
} from "../controllers/mealplanner.controller.js";

const router = Router();

router.get("/", getMealplanner);
router.get("/:id", getMealplannerEntry);
router.post("/", postMealplannerEntry);
router.put("/:id", putMealplannerEntry);
router.patch("/:id", patchMealplannerById);
router.delete("/:id", removeMealplannerEntry);

export default router;
