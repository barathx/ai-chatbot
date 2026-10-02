import { useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const generateResponse = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      const data = await res.json();

      setResponse(data.reply || data.error);
    } catch (error) {
      setResponse("Unable to connect to the server.");
    }

    setLoading(false);
  };

  return (
    <div className="container">
      <div className="card">
        <h1>AI Text Assistant</h1>

        <p className="subtitle">
          Ask anything and get an AI-powered response.
        </p>

        <textarea
          placeholder="Enter your question..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <button onClick={generateResponse} disabled={loading}>
          {loading ? "Generating..." : "Generate"}
        </button>

        {response && (
          <div className="response">
            <h2>AI Response</h2>
            <p>{response}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;