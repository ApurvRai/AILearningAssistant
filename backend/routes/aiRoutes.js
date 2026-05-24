import express from "express";
import {
  generateFlashcards,
  generateSummary,
  generateQuiz,
  chat,
  explainConcept,
  getChatHistory,
} from "../controllers/aiController.js";
import protect from "../middleware/auth.js";

const router = express.Router();

//All routes are protected, user must be authenticated
router.use(protect);

router.post("/generate-flashcards", generateFlashcards);
router.post("/generate-summary", generateSummary);
router.post("/generate-quiz", generateQuiz);
router.post("/chat", chat);
router.post("/explain-concept", explainConcept);
router.get("/chat-history/:documentId", getChatHistory);

export default router;
