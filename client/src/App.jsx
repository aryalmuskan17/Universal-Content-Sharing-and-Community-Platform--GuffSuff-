import { useEffect, useState } from 'react';

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch('http://localhost:4000/api/hello')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error("Failed to fetch from backend:", err);
        setMessage("Failed to load message");
      });
  }, []);

  return (
    <>
      <h1>{message}</h1>
    </>
  );
}

export default App;
