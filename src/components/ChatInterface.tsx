import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { sendMessage } from '../api';
import { ChatHistory } from './ChatHistory';
import { ChatMessage } from './ChatMessage';

interface Message {
  text: string;
  isBot: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export function ChatInterface() {
  const [sessions, setSessions] = useState<ChatSession[]>([
    {
      id: 'default',
      title: 'New Chat',
      messages: [
        {
          text: "Hello! I'm your university assistant. How can I help you today?",
          isBot: true,
        },
      ],
    },
  ]);

  const [currentSessionId, setCurrentSessionId] = useState('default');
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const currentSession = sessions.find(
    (session) => session.id === currentSessionId
  );

  const updateSession = (id: string, changes: Partial<ChatSession>) => {
    setSessions((prev) =>
      prev.map((session) =>
        session.id === id ? { ...session, ...changes } : session
      )
    );
  };

  const handleSend = async () => {
    if (!input.trim() || !currentSession) return;

    const userMessage = input;
    setInput('');
    const updatedMessages = [
      ...currentSession.messages,
      { text: userMessage, isBot: false },
    ];
    updateSession(currentSessionId, { messages: updatedMessages });
    setIsLoading(true);

    try {
      const history = updatedMessages.map((msg) => msg.text);
      const response = await sendMessage(userMessage, history);
      updateSession(currentSessionId, {
        messages: [
          ...updatedMessages,
          { text: response.response, isBot: true },
        ],
      });
    } catch (error) {
      updateSession(currentSessionId, {
        messages: [
          ...updatedMessages,
          {
            text: 'Sorry, I encountered an error. Please try again.',
            isBot: true,
          },
        ],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = () => {
    const newSession = {
      id: `session-${Date.now()}`,
      title: 'New Chat',
      messages: [],
    };
    setSessions((prev) => [...prev, newSession]);
    setCurrentSessionId(newSession.id);
  };

  const deleteChat = (id: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== id));
    if (id === currentSessionId && sessions.length > 1) {
      setCurrentSessionId(sessions[0].id);
    }
  };

  return (
    <div className="flex h-screen">
      <ChatHistory
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onDeleteSession={deleteChat}
        onCreateNewSession={createNewChat}
      />
      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {currentSession?.messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.text}
              isBot={message.isBot}
            />
          ))}
          {isLoading && (
            <div className="flex gap-2 items-center text-gray-500 p-4">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-indigo-500 border-t-transparent" />
              Thinking...
            </div>
          )}
        </div>
        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
