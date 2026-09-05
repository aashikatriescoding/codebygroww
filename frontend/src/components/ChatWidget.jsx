import { useState, useRef, useEffect } from "react";
import { askWatchlist } from "../services/chatService";

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Ask me anything about your watchlist — e.g. \"why is MOMO flagged?\" or \"what's up today?\"" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    const question = input.trim();
    if (!question || loading) return;

    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setInput("");
    setLoading(true);

    try {
      const answer = await askWatchlist(question);
      setMessages((prev) => [...prev, { role: "assistant", text: answer }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Something went wrong — try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <span>Watchlist Assistant</span>
            <button onClick={() => setOpen(false)}>✕</button>
          </div>

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-bubble ${m.role}`}>
                {m.text}
              </div>
            ))}
            {loading && <div className="chat-bubble assistant typing">Thinking...</div>}
            <div ref={bottomRef} />
          </div>

          <form className="chat-input-row" onSubmit={handleSend}>
            <input
              type="text"
              placeholder="Ask about your watchlist..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading}>Send</button>
          </form>
        </div>
      )}

      <button className="chat-fab" onClick={() => setOpen((v) => !v)}>
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
};

export default ChatWidget;