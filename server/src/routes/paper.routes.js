import express from "express";
import {
  getAllPapers,
  getPaperById,
  createPaper,
  updatePaper,
  deletePaper,
  updateNotes,
  addHighlight,
  deleteHighlight,
} from "../controllers/paper.controller.js";

const router = express.Router();

router.get("/", getAllPapers);
router.post("/", createPaper);
router.get("/:id", getPaperById);
router.patch("/:id", updatePaper);
router.put("/:id", updatePaper);
router.delete("/:id", deletePaper);

// Specialized sub-resources
router.put("/:id/notes", updateNotes);
router.post("/:id/highlights", addHighlight);
router.delete("/:id/highlights/:highlightId", deleteHighlight);

export default router;
