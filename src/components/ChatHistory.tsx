import React from 'react';

interface Message {
  text: string;
  isBot: boolean;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

interface ChatHistoryProps {
  sessions: ChatSession[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
  onCreateNewSession: () => void;
}

export function ChatHistory({
  sessions,
  currentSessionId,
  onSelectSession,
  onDeleteSession,
  onCreateNewSession,
}: ChatHistoryProps) {
  const currentSession = sessions.find((s) => s.id === currentSessionId);

  return (
    <div className="w-64 border-r bg-gray-100 p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg">Chats</h2>
        <button
          className="text-indigo-600 hover:underline"
          onClick={onCreateNewSession}
        >
          New
        </button>
      </div>

      <ul className="space-y-2 flex-1 overflow-auto">
        {sessions.map((session) => (
          <li
            key={session.id}
            className={`p-2 rounded-lg cursor-pointer flex justify-between items-center ${
              session.id === currentSessionId
                ? 'bg-indigo-600 text-white'
                : 'hover:bg-gray-200'
            }`}
            onClick={() => onSelectSession(session.id)}
          >
            <span>{session.title}</span>
            <button
              className="ml-2 text-red-500 hover:underline text-sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteSession(session.id);
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      {currentSession && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Messages:</h3>
          <div className="max-h-64 overflow-auto bg-white border rounded p-2">
            {currentSession.messages.length === 0 && (
              <div className="text-gray-500 italic">No messages yet.</div>
            )}
            {currentSession.messages.map((m, i) => (
              <div key={i} className="mb-2">
                <span className="font-bold">{m.isBot ? 'Bot:' : 'You:'} </span>
                <span>{m.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
