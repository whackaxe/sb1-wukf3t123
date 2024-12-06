import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from './components/auth/LoginForm';
import { ChatInterface } from './components/chat/ChatInterface';
import { useAuthStore } from './store/authStore';

// ProtectedRoute ensures that only authenticated users can access certain routes.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((state) => state.user); // Access user from zustand store
  if (!user) return <Navigate to="/" replace />; // Redirect to login if not authenticated
  return <>{children}</>;
}

function App() {
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
              <ChatInterface />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
