/**
 * RAG integration utilities
 */

// Query the RAG system
export const queryRag = async (query) => {
  try {
    const response = await fetch('http://localhost:3000/api/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    
    return await response.json();
  } catch (error) {
    console.error('RAG query error:', error);
    return null;
  }
};

// Extract keywords from text
export const extractKeywords = (text) => {
  if (!text) return { concepts: [], topics: [] };
  
  const sentences = text.split(/[.!?]+/).filter(Boolean);
  const words = text.toLowerCase().split(/\W+/).filter(w => w.length > 4);
  
  const wordFrequency = {};
  words.forEach(word => {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1;
  });
  
  const concepts = Object.entries(wordFrequency)
    .filter(([word, freq]) => freq > 1 && word.length > 6)
    .map(([word]) => word)
    .slice(0, 5);

  const topics = sentences
    .filter(s => s.length > 30 && s.length < 100)
    .map(s => s.trim())
    .slice(0, 3);

  return { concepts, topics };
};
