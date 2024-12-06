import React, {useState} from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/auth/LoginForm';
import { ChatInterface } from './components/chat/ChatInterface';
import { ChatHistory } from './components/ChatHistory';
import { useAuthStore } from './store/authStore';
import { sendMessage } from './api';


interface Message {
  text: string;
  isBot: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

// ProtectedRoute ensures that only authenticated users can access certain routes.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user); // Access user from zustand store
  if (!user) return <Navigate to="/" replace />; // Redirect to login if not authenticated
  return <>{children}</>;
}



function App() {

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
    <BrowserRouter>
      <Routes>
        {/* Public Login Route */}
        <Route path="/" element={<LoginForm />} />

        {/* Protected Chat Route */}

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <div className='flex flex-row'>

            <ChatHistory
              sessions={sessions}
              currentSessionId={currentSessionId}
              onSelectSession={setCurrentSessionId}
              onDeleteSession={deleteChat}
              onCreateNewSession={createNewChat}
              />
              <ChatInterface />
              </div>
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
