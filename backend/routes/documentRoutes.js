import express from "express";
import {
  uploadDocument,
  getDocuments,
  getDocument,
  deleteDocument,
  updateDocument,
} from "../controllers/documentController.js";
import protect from "../middleware/auth.js";
import upload from "../middleware/upload.js";

const router = express.Router();

//All routes are protected, user must be authenticated
router.use(protect);

router.post("/upload", upload.single("file"), uploadDocument);
router.get("/", getDocuments);
router.get("/:id", getDocument);
router.delete("/:id", deleteDocument);
router.put("/:id", updateDocument);

export default router;
