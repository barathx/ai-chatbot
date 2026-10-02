import { useState } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const generateResponse = async () => {
    if (!message.trim()) return;

    setLoading(true);
    setResponse("");

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong.");
      }

      setResponse(data.reply || "No response received.");
    } catch (error) {
      console.error("API Error:", error);
      setResponse(
        error.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
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