import { useState } from 'react';
import Login from './Login';

function App() {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [message, setMessage] = useState('');

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
    setMessage('');
  };

  const fetchAdminData = async () => {
    const token = localStorage.getItem('token');

    try {
      const res = await fetch('http://localhost:5001/api/admin-data', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token
        }
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
      } else {
        setMessage(data.error || 'Access denied');
      }
    } catch (err) {
      console.error('Request to admin endpoint failed:', err);
      setMessage('Request failed. Check network or server connection.');
    }
  };

  return (
    <div>
      {role ? (
        <>
          <h1>Welcome, {role}!</h1>

          {role === 'Admin' && (
            <>
              <button onClick={fetchAdminData}>Get Admin Data</button>
              <p>{message}</p>
            </>
          )}
          
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Login onLogin={setRole} />
      )}
    </div>
  );
}

export default App;