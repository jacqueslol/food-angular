import { Router } from "express";
import {
  getRecipe,
  getRecipes,
  patchRecipeById,
  postRecipe,
  putRecipe,
  removeRecipe
} from "../controllers/recipes.controller.js";

const router = Router();

router.get("/", getRecipes);
router.get("/:id", getRecipe);
router.post("/", postRecipe);
router.put("/:id", putRecipe);
router.patch("/:id", patchRecipeById);
router.delete("/:id", removeRecipe);

export default router;
