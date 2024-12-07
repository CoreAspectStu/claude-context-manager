/**
 * Bridge between Context Manager and Conversation Handler
 */

export const MAX_CHUNK_SIZE = 5000;

// Track conversation state
export class ConversationState {
  constructor() {
    this.chunks = [];
    this.currentChunk = 0;
    this.contextKeys = new Set();
    this.pendingContent = '';
  }

  addChunk(content) {
    this.chunks.push({
      id: this.chunks.length + 1,
      content,
      timestamp: new Date().toISOString(),
      contextKeys: Array.from(this.contextKeys)
    });
    return this.chunks.length;
  }

  getCurrentChunk() {
    return this.chunks[this.currentChunk];
  }

  addContextKey(key) {
    this.contextKeys.add(key);
  }
}

// Split content while preserving context
export const splitWithContext = (content, contextKeys = []) => {
  const chunks = [];
  let currentChunk = '';
  const sentences = content.split(/(?<=[.!?])\s+/);

  sentences.forEach(sentence => {
    if ((currentChunk + sentence).length > MAX_CHUNK_SIZE) {
      if (currentChunk) chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence;
    }
  });

  if (currentChunk) chunks.push(currentChunk.trim());
  return chunks;
};

// Manage conversation flow
export const createConversationManager = (contextManager) => {
  const state = new ConversationState();
  
  return {
    addContent: (content) => {
      if (content.length > MAX_CHUNK_SIZE) {
        const chunks = splitWithContext(content);
        chunks.forEach(chunk => state.addChunk(chunk));
      } else {
        state.addChunk(content);
      }
      contextManager.updateContext(state.getCurrentChunk());
    },

    nextChunk: () => {
      if (state.currentChunk < state.chunks.length - 1) {
        state.currentChunk++;
        contextManager.updateContext(state.getCurrentChunk());
      }
      return state.getCurrentChunk();
    },

    previousChunk: () => {
      if (state.currentChunk > 0) {
        state.currentChunk--;
        contextManager.updateContext(state.getCurrentChunk());
      }
      return state.getCurrentChunk();
    },

    getState: () => state
  };
};
