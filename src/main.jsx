import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import HabitSheet from './HabitSheet.jsx';
import Login from './components/auth/Login.jsx';
import { getSession, onAuthChange } from './lib/auth.js';
import { C } from './theme.js';

function App() {
  const [session, setSession] = useState(undefined); // undefined = still checking

  useEffect(() => {
    getSession().then(setSession);
    return onAuthChange(setSession);
  }, []);

  if (session === undefined) {
    return <div style={{ minHeight: '100vh', background: C.bg }} />; // avoid a login-screen flash
  }
  return session ? <HabitSheet /> : <Login />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
