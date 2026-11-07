import express from "express";
import { createPaper,getAllPapers } from "../controllers/paper.controller.js";

const router = express.Router();

router.post("/", createPaper);
router.get("/", getAllPapers);

export default router;