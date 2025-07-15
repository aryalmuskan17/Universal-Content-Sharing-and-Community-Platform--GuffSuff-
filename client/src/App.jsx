import { useState } from 'react';
import Login from './Login';

function App() {
  const [role, setRole] = useState(localStorage.getItem('role'));

  const handleLogout = () => {
    localStorage.clear();
    setRole(null);
  };

  return (
    <div>
      {role ? (
        <>
          <h1>Welcome, {role}!</h1>

          {/* Example buttons based on role */}
          {role === 'Admin' && <button>Admin Panel</button>}
          {role === 'Editor' && <button>Edit Content</button>}
          <button onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <Login onLogin={setRole} />
      )}
    </div>
  );
}

export default App;
