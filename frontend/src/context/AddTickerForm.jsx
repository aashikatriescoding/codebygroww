import { useState } from "react";

const AddTickerForm = ({ onAdd }) => {
  const [ticker, setTicker] = useState("");
  const [sensitivity, setSensitivity] = useState("casual");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ticker.trim()) return;

    setError("");
    setSubmitting(true);
    try {
      await onAdd(ticker.trim().toUpperCase(), sensitivity);
      setTicker("");
    } catch (err) {
      setError(err.response?.data?.message || "Could not add ticker");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="add-ticker-form">
      <input
        type="text"
        placeholder="e.g. RELIANCE.NS, TCS.NS, AAPL"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
      />
      <select value={sensitivity} onChange={(e) => setSensitivity(e.target.value)}>
        <option value="casual">Casual</option>
        <option value="core">Core</option>
      </select>
      <button type="submit" disabled={submitting}>
        {submitting ? "Adding..." : "Add"}
      </button>
      {error && <p className="error">{error}</p>}
    </form>
  );
};

export default AddTickerForm;