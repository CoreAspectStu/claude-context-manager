import React, { useState, useEffect, useContext } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Split, ArrowLeft, ArrowRight } from 'lucide-react';
import { createConversationManager } from '../utils/conversationBridge';

const ConversationHandler = ({ contextManager }) => {
  const [conversationState, setConversationState] = useState(null);
  const [currentChunk, setCurrentChunk] = useState(null);
  
  useEffect(() => {
    const manager = createConversationManager(contextManager);
    setConversationState(manager);
  }, [contextManager]);

  const handleNewContent = (content) => {
    if (conversationState) {
      conversationState.addContent(content);
      setCurrentChunk(conversationState.getState().getCurrentChunk());
    }
  };

  const navigateChunks = (direction) => {
    if (!conversationState) return;

    const newChunk = direction === 'next' 
      ? conversationState.nextChunk()
      : conversationState.previousChunk();
    
    setCurrentChunk(newChunk);
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-4">
      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Split className="w-5 h-5" />
            <span>Conversation Flow</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateChunks('previous')}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
              disabled={!currentChunk || conversationState?.getState().currentChunk === 0}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateChunks('next')}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
              disabled={!currentChunk || 
                conversationState?.getState().currentChunk === 
                conversationState?.getState().chunks.length - 1}
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {currentChunk && (
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Chunk {conversationState.getState().currentChunk + 1} of {conversationState.getState().chunks.length}</span>
                <span>{new Date(currentChunk.timestamp).toLocaleString()}</span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm">{currentChunk.content}</div>
              </div>
              {currentChunk.contextKeys.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {currentChunk.contextKeys.map((key, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 rounded-full text-xs">
                      {key}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationHandler;