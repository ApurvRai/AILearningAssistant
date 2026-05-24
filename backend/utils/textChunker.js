/**
 * Split text into chunks for better processing by the AI model. This is especially important for large documents, as it allows us to manage token limits and maintain context.
 * The chunking strategy can be based on paragraphs, sentences, or a fixed number of tokens. For simplicity, we'll use a fixed character count for each chunk.
 * In a production system, you might want to use a more sophisticated approach that considers sentence boundaries and token counts.
 * @param {string} text - The full text to be chunked
 * @param {number} chunkSize - The maximum number of words per chunk
 * @param {number} overlap - The number of words to overlap between chunks (to maintain context)
 * @returns {Array<{content: string, chunkIndex: number, pageNumber: number}>} - An array of text chunks with metadata
 */

export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  if (!text || text.trim().length === 0) return [];

  //Clean text while preserving paragraph structure
  const cleanedText = text
    .replace(/\r\n/g, "\n") // Normalize newlines
    .replace(/\s+/g, " ") // Replace multiple spaces with a single space
    .replace(/\n /g, "\n") // Remove spaces at the end of lines
    .replace(/ \n/g, "\n") // Remove spaces at the beginning of lines
    .trim();

  //Try to split by paragraphs (single or double newlines)
  const paragraphs = cleanedText
    .split(/\n+/)
    .filter((p) => p.trim().length > 0);

  const chunks = [];
  let currentChunk = "";
  let currentChunkWordCount = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.trim().split(/\s+/);
    const paragraphWordCount = paragraphWords.length;

    //If a single paragraph exceeds the chunk size, split it by words
    if (paragraphWordCount > chunkSize) {
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join("\n\n"),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });
        currentChunk = [];
        currentChunkWordCount = 0;
      }

      //Split long paragraph into word-based chunks
      for (let i = 0; i < paragraphWordCount; i += chunkSize - overlap) {
        const chunksWords = paragraphWords.slice(i, i + chunkSize);
        chunks.push({
          content: chunksWords.join(" "),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });

        if (i + chunkSize >= paragraphWordCount) break; //No more chunks needed
      }
      continue; //Move to next paragraph
    }

    //If adding this paragraph exceeds the chunk size, save the current chunk
    if (
      currentChunkWordCount + paragraphWordCount > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        content: currentChunk.join("\n\n"),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      //Create overlap from previous chunk
      const prevChunkText = currentChunk.join(" ");
      const prevWords = prevChunkText.trim().split(/\s+/);
      const overlapText = prevWords
        .slice(-Math.min(overlap, prevWords.length))
        .join(" ");

      currentChunk = [overlapText, paragraph.trim()];
      currentChunkWordCount =
        overlapText.split(/\s+/).length + paragraphWordCount;
    } else {
      //Add paragraph to current chunk
      currentChunk.push(paragraph.trim());
      currentChunkWordCount += paragraphWordCount;
    }
  }

  //Add the last chunk
  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join("\n\n"),
      chunkIndex: chunkIndex,
      pageNumber: 0,
    });
  }

  //Fallback: If no chunks were created, split by words
  if (chunks.length === 0 && cleanedText.length > 0) {
    const allWords = cleanedText.split(/\s+/);
    for (let i = 0; i < allWords.length; i += chunkSize - overlap) {
      const chunkWords = allWords.slice(i, i + chunkSize);
      chunks.push({
        content: chunkWords.join(" "),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      if (i + chunkSize >= allWords.length) break; //No more chunks needed
    }
  }
  return chunks;
};

/**
 * Find relevant chunks based on keyword matching
 * @param {Array<Object>} chunks - The array of text chunks
 * @param {string} query - Search query
 * @param {number} maxChunks - Maximum number of relevant chunks to return
 * @return {Array<Object>}
 */
export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
  if (!chunks || chunks.length === 0 || !query || query.trim().length === 0)
    return [];

  //Common stop words to exclude from matching
  const stopWords = new Set([
    "the",
    "is",
    "at",
    "which",
    "on",
    "a",
    "an",
    "or",
    "but",
    "in",
    "with",
    "to",
    "for",
    "of",
    "as",
    "by",
    "this",
    "that",
    "it",
  ]);

  //Extract and clean query keywords
  const queryKeywords = query
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word)); //Filter out short words and stop words

  if (queryKeywords.length === 0) {
    //Return clean chunk objects without Mongoose metadata
    return chunks.slice(0, maxChunks).map((chunk) => ({
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
    }));
  }

  const scoredChunks = chunks.map((chunk) => {
    const chunkText = chunk.content.toLowerCase();
    const contentWords = content.split(/\s+/).length;
    let score = 0;

    for (const keyword of queryKeywords) {
      //Exact word match (higher score)
      const exactMatches = (
        chunkText.match(new RegExp(`\\b${keyword}\\b`, "g")) || []
      ).length;
      score += exactMatches * 3; //Exact matches get triple points

      //Partial match (Lower score)
      const partialMatches = (chunkText.match(new RegExp(keyword, "g")) || [])
        .length;
      score += Math.max(0, partialMatches - exactMatches) * 1.5; //Partial matches get 1.5 points, but don't double count exact matches
    }

    //Bonus: Multple query words found
    const uniqueWordsFound = queryKeywords.filter((keyword) =>
      chunkText.includes(keyword),
    ).length;
    if (uniqueWordsFound > 1) {
      score += uniqueWordsFound * 2; //Bonus points for multiple query words found
    }

    //Normalize by content length
    const normalizedScore = score / Math.sqrt(contentWords); //Divide by sqrt of content length to prevent bias towards longer chunks

    //Small bonus for earlier chunks
    const positionBonus = 1 - (index / chunks.length) * 0.1; //Up to 10% bonus for earlier chunks

    //Return clean object without Mongoose metadata
    return {
      content: chunk.content,
      chunkIndex: chunk.chunkIndex,
      pageNumber: chunk.pageNumber,
      _id: chunk._id,
      score: normalizedScore * positionBonus, //Final score with position bonus
      rawScore: score, //Raw score before normalization (for debugging)
      matchedWords: uniqueWordsFound, //Number of unique query words found (for debugging)
    };
  });

  return scoredChunks
    .filter((chunk) => chunk.score > 0) //Only return chunks with a positive score
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; //Sort by score descending
      }
      if (b.matchedWords !== a.matchedWords) {
        return b.matchedWords - a.matchedWords; //If scores are equal, sort by number of matched words
      }
      return a.chunkIndex - b.chunkIndex; //If still equal, sort by original chunk order (earlier chunks first)
    })
    .slice(0, maxChunks); //Return top N relevant chunks
};
