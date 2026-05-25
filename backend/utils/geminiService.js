import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

if (!process.env.GEMINI_API_KEY) {
  console.warn(
    "FATAL ERROR: GEMINI_API_KEY is not defined. Please set it in your environment variables.",
  );
}

/**
 * Generate flashcards from text
 * @param {string} text - Document text
 * @param {number} count - Number of flashcards to generate
 * @return {Promise<Array<{question: string, answer: string, difficulty: string}>>} - Array of flashcards with question and answer
 */
export const generateFlashcards = async (text, count = 10) => {
  const prompt = `Generate exactly ${count} educational flashcards from the following text.
    Format each flashcard as:
    Q: [Clear, specific question]
    A: [Concise, accurate answer]
    D: [Difficulty level: Easy, Medium, or Hard]
    
    Seperate each flashcard with "---"
    
    Text:
    ${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const generatedText = response.text;

    // Parse the generated text into flashcards
    const flashcards = [];
    const cards = generatedText.split("---").filter((card) => card.trim());

    for (const card of cards) {
      const lines = card.trim().split("\n");
      let question = "",
        answer = "",
        difficulty = "medium";
      for (const line of lines) {
        if (line.startsWith("Q:")) {
          question = line.substring(2).trim();
        } else if (line.startsWith("A:")) {
          answer = line.substring(2).trim();
        } else if (line.startsWith("D:")) {
          const diff = line.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && answer) {
        flashcards.push({ question, answer, difficulty });
      }
    }

    return flashcards.slice(0, count); // Ensure we return only the requested number of flashcards
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate flashcards");
  }
};

/**
 * Generate quiz questions from text
 * @param {string} text - Document text
 * @param {number} numQuestions - Number of quiz questions to generate
 * @return {Promise<Array<{question: string, options: Array, correctAnswer: string, explanation: string, difficulty: string}>>} - Array of quiz questions with options and correct answer
 */
export const generateQuiz = async (text, numQuestions = 5) => {
  const prompt = `Generate exactly ${numQuestions} multiple-choice quiz questions from the following text.
    Format each question as:
    Q: [Question]
    O1: [Option 1]
    O2: [Option 2]
    O3: [Option 3]
    O4: [Option 4]
    C: [Correct option - exactly as written above]
    E: [Brief explanation of the correct answer]
    D: [Difficulty level: Easy, Medium, or Hard]
    
    Seperate each question with "---"
    
    Text:
    ${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const generatedText = response.text;

    // Parse the generated text into quiz questions
    const questions = [];
    const questionBlocks = generatedText.split("---").filter((q) => q.trim());

    for (const block of questionBlocks) {
      const lines = block.trim().split("\n");
      let question = "",
        options = [],
        correctAnswer = "",
        explanation = "",
        difficulty = "medium";

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith("Q:")) {
          question = trimmed.substring(2).trim();
        } else if (/^O\d:/.test(trimmed)) {
          options.push(trimmed.substring(3).trim());
        } else if (trimmed.startsWith("C:")) {
          correctAnswer = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("E:")) {
          explanation = trimmed.substring(2).trim();
        } else if (trimmed.startsWith("D:")) {
          const diff = trimmed.substring(2).trim().toLowerCase();
          if (["easy", "medium", "hard"].includes(diff)) {
            difficulty = diff;
          }
        }
      }

      if (question && options.length === 4 && correctAnswer) {
        questions.push({
          question,
          options,
          correctAnswer,
          explanation,
          difficulty,
        });
      }
    }

    return questions.slice(0, numQuestions); // Ensure we return only the requested number of questions
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate quiz questions");
  }
};

/**
 * Generate document summary
 * @param {string} text - Document text
 * @return {Promise<string>} - Generated summary
 */
export const generateSummary = async (text) => {
  const prompt = `Provide a concise summary of the following text, highlighting the key concepts, main ideas and important points.
  Keep the summary clean and structured.

  Text:
  ${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate summary");
  }
};

/**
 * Chat with AI about document content
 * @param {string} question - User's question
 * @param {Array<Object>} chunks - Relevant document chunks
 * @return {Promise<string>} - AI's response
 */
export const chatWithContext = async (question, chunks) => {
  const context = chunks
    .map((chunk, index) => `[Chunk ${index + 1}]\n${chunk.content}`)
    .join("\n\n");

  const prompt = `Based on the following context from a document, Analyze the context and answer the user's questions.
    If the answer is not in the context, say so. Be concise and accurate in your response.

    Context:
    ${context}
    
    Question:
    ${question}
    
    Answer:`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate chat response");
  }
};

/**
 * Explain a concept from the document
 * @param {string} concept - Concept to explain
 * @param {string} context - Relevant document context
 * @return {Promise<string>} - AI's explanation of the concept
 */
export const explainConcept = async (concept, context) => {
  const prompt = `Explain the concept of "${concept}" based on the following context.
    Provide a clear, educational explanation that's easy to understand.
    Include examples if relevant.

    Context:
    ${context.substring(0, 10000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    const generatedText = response.text;
    return generatedText;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate concept explanation");
  }
};
