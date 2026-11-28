import express from "express";
import {
  getAllCollections,
  createCollection,
} from "../controllers/collection.controller.js";

const router = express.Router();

router.get("/", getAllCollections);
router.post("/", createCollection);

export default router;
