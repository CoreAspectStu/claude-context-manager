import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Split } from 'lucide-react';

const ConversationHandler = () => {
  const [chunks, setChunks] = useState([]);
  const [currentChunk, setCurrentChunk] = useState(1);

  const handleNewMessage = (content) => {
    // Split message if it's approaching the limit (around 6000 chars)
    if (content.length > 5000) {
      const newChunks = splitIntoChunks(content, 5000);
      setChunks(newChunks);
      setCurrentChunk(1);
    }
  };

  const splitIntoChunks = (text, size) => {
    const chunks = [];
    let index = 0;
    while (index < text.length) {
      chunks.push(text.slice(index, index + size));
      index += size;
    }
    return chunks;
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-4">
      <Card className="bg-white shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Split className="w-5 h-5" />
            <span>Conversation Chunks ({chunks.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {chunks.map((chunk, index) => (
              <div 
                key={index}
                className={`p-2 rounded ${currentChunk === index + 1 ? 'bg-blue-50' : 'bg-gray-50'}`}
              >
                <div className="text-sm font-medium">Chunk {index + 1}</div>
                <div className="text-xs text-gray-500">{chunk.length} characters</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationHandler;