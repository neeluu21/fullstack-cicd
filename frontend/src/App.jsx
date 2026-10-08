import { useEffect, useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [value, setValue] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [saved, setSaved] = useState(null); // null = not tried yet
  const [error, setError] = useState("");
  const [configs, setConfigs] = useState([]);

  const loadConfigs = () => {
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => setConfigs(Array.isArray(data) ? data : []))
      .catch(() => setConfigs([]));
  };

  useEffect(() => {
    loadConfigs();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, value, enabled }),
      });
      const data = await res.json();
      setSaved(data.saved === true);
      if (data.saved) {
        setName("");
        setValue("");
        setEnabled(true);
        loadConfigs();
      } else {
        setError(data.error || "Save failed");
      }
    } catch {
      setSaved(false);
      setError("Backend not reachable");
    }
  };

  const handleDelete = async (id) => {
    await fetch(`/api/config/${id}`, { method: "DELETE" });
    loadConfigs();
  };

  const box = { padding: 8, fontSize: 16, marginBottom: 10, width: 280 };

  return (
    <div style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1>Config Manager</h1>

      <form onSubmit={handleSave}>
        <div>
          <input
            style={box}
            placeholder="Config name (e.g. APP_MODE)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <input
            style={box}
            placeholder="Config value (e.g. production)"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </div>
        <label style={{ display: "block", marginBottom: 10 }}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />{" "}
          Enabled
        </label>
        <button type="submit" style={{ padding: "10px 20px", fontSize: 16 }}>
          Save to Database
        </button>
      </form>

      {saved !== null && (
        <h3 style={{ color: saved ? "green" : "red" }}>
          Saved in database: {String(saved)}
        </h3>
      )}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <h2>Stored in MongoDB ({configs.length})</h2>
      {configs.length === 0 ? (
        <p>No configs saved yet.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Value</th>
              <th>Enabled</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {configs.map((c) => (
              <tr key={c._id}>
                <td>{c.name}</td>
                <td>{c.value}</td>
                <td>{String(c.enabled)}</td>
                <td>
                  <button onClick={() => handleDelete(c._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;