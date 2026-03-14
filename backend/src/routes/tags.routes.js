import { Router } from "express";
import {
  getTag,
  getTags,
  patchTagById,
  postTag,
  putTag,
  removeTag
} from "../controllers/tags.controller.js";

const router = Router();

router.get("/", getTags);
router.get("/:id", getTag);
router.post("/", postTag);
router.put("/:id", putTag);
router.patch("/:id", patchTagById);
router.delete("/:id", removeTag);

export default router;
