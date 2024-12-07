import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageCircle, Book, ExternalLink, Minimize, Maximize, BrainCircuit, Power, Database } from 'lucide-react';
import { queryRag, extractKeywords } from '../utils/ragIntegration';

const STORAGE_CONFIG = {
  path: 'c:/github_repository/context-storage/context.json'
};

const INITIAL_CONTEXT = {
  concepts: [],
  topics: [],
  ragEntries: [],
  currentChat: {
    content: '',
    lastUpdate: null
  },
  settings: {
    isActive: true,
    isCompact: false,
    autoUpdate: true,
    useRag: true
  }
};

const ContextManager = () => {
  const [context, setContext] = useState(INITIAL_CONTEXT);
  const [status, setStatus] = useState('initializing');
  const [isCompact, setIsCompact] = useState(false);
  const [ragStatus, setRagStatus] = useState('ready');

  // Save context helper
  const saveContext = useCallback(async (newContext) => {
    try {
      await write_file(STORAGE_CONFIG.path, JSON.stringify(newContext, null, 2));
      return true;
    } catch (error) {
      setStatus(`Error saving context: ${error.message}`);
      return false;
    }
  }, []);

  // Enhanced updateCurrentChat with RAG
  const updateCurrentChat = useCallback(async (chatContent) => {
    if (!context.settings?.isActive) return;

    const newContext = {
      ...context,
      currentChat: {
        content: chatContent,
        lastUpdate: new Date().toISOString()
      }
    };

    // Extract concepts and topics
    const keywords = extractKeywords(chatContent);
    newContext.concepts = [...new Set([...context.concepts, ...keywords.concepts])];
    newContext.topics = [...new Set([...context.topics, ...keywords.topics])];

    // RAG enhancement if enabled
    if (context.settings.useRag) {
      const ragResults = await queryRag(chatContent);
      if (ragResults) {
        newContext.ragEntries = [
          ...context.ragEntries,
          {
            timestamp: new Date().toISOString(),
            query: chatContent,
            results: ragResults
          }
        ].slice(-5); // Keep last 5 entries
      }
    }

    setContext(newContext);
    await saveContext(newContext);
  }, [context, saveContext]);

  // Watch for chat updates
  useEffect(() => {
    let timeoutId;
    const chatObserver = new MutationObserver((mutations) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const chatContent = document.querySelector('.chat-content')?.textContent;
        if (chatContent) {
          updateCurrentChat(chatContent);
        }
      }, 1000); // 1 second debounce
    });

    const chatElement = document.querySelector('.chat-container');
    if (chatElement) {
      chatObserver.observe(chatElement, { 
        childList: true, 
        subtree: true, 
        characterData: true 
      });
    }

    return () => {
      clearTimeout(timeoutId);
      chatObserver.disconnect();
    };
  }, [updateCurrentChat]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card className="bg-white shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5" />
            <span>Context Manager {isCompact ? '(Compact)' : ''}</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setContext(prev => ({
                ...prev,
                settings: { ...prev.settings, useRag: !prev.settings.useRag }
              }))}
              className={`p-2 rounded ${context.settings?.useRag ? 'text-purple-500 hover:bg-purple-50' : 'text-gray-400 hover:bg-gray-50'}`}
              title={context.settings?.useRag ? 'Disable RAG' : 'Enable RAG'}
            >
              <Database className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsCompact(!isCompact)}
              className="p-2 hover:bg-gray-100 rounded"
              title={isCompact ? 'Expand View' : 'Compact View'}
            >
              {isCompact ? <Maximize className="w-4 h-4" /> : <Minimize className="w-4 h-4" />}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className={status.includes('Error') ? 'bg-red-50' : 'bg-blue-50'}>
              <AlertDescription>{status}</AlertDescription>
            </Alert>

            {!isCompact && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center">
                    <Book className="w-4 h-4 mr-2" />
                    Topics ({context.topics?.length || 0})
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg max-h-48 overflow-y-auto">
                    {context.topics?.map((topic, idx) => (
                      <div key={idx} className="text-sm py-1 border-b border-gray-100 last:border-0">
                        {topic}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Concepts ({context.concepts?.length || 0})
                  </h3>
                  <div className="bg-gray-50 p-3 rounded-lg max-h-48 overflow-y-auto">
                    {context.concepts?.map((concept, idx) => (
                      <div key={idx} className="text-sm py-1 border-b border-gray-100 last:border-0">
                        {concept}
                      </div>
                    ))}
                  </div>
                </div>

                {context.settings.useRag && (
                  <div className="col-span-full">
                    <h3 className="text-sm font-semibold flex items-center mb-2">
                      <Database className="w-4 h-4 mr-2" />
                      RAG Insights
                    </h3>
                    <div className="bg-purple-50 p-3 rounded-lg max-h-48 overflow-y-auto">
                      {context.ragEntries.map((entry, idx) => (
                        <div key={idx} className="mb-2 last:mb-0">
                          <div className="text-xs text-gray-500">
                            {new Date(entry.timestamp).toLocaleString()}
                          </div>
                          <div className="text-sm">{entry.results.answer}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContextManager;