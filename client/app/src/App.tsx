import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(''); // Feedback messages

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:8000/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        setMessage(`✅ ${data.message || 'Login successful'}`);
      } else {
        console.error('Login failed:', data);
        setMessage(`❌ ${data.error || 'Login failed'}`);
      }
    } catch (err) {
      console.error('Error connecting to server:', err);
      setMessage('❌ Server error');
    }
  };

  return (
    <div className="login-container">
      <div className="logo-container">
        <img src={viteLogo} className="logo" alt="Vite logo" />
        <img src={reactLogo} className="logo react" alt="React logo" />
      </div>

      <h1>Sign In</h1>

      {message && (
        <p style={{ color: message.includes('✅') ? 'green' : 'red' }}>
          {message}
        </p>
      )}

      <form onSubmit={handleLogin} className="login-form">
        <div className="input-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default App;
