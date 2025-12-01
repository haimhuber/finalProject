import { useEffect, useState } from "react";
import "./Setting.css";
import configJson from "../../config.json";
import type { AuditTrail } from "../../Types/AuditTrail";

interface Breaker {
  name: string;
  type: string;
  load: string;
}

export const Setting = () => {
  const [breakers, setBreakers] = useState<Breaker[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Breaker>({
    name: "",
    type: "",
    load: "",
  });

  const [breakerConfig, setBreakerConfig] = useState(false);
  const [auditTrail, setAuditTrail] = useState(false);
  const [auditData, setAuditData] = useState<AuditTrail[]>([]);

  // AUTH
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  // LOAD BREAKERS
  useEffect(() => {
    if (Array.isArray(configJson.breakers)) {
      setBreakers(configJson.breakers);
    }
  }, []);

  // DELETE BREAKER
  const handleDelete = (index: number) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${breakers[index].name}?`
    );
    if (confirmDelete) {
      setBreakers((prev) => prev.filter((_, i) => i !== index));
    }
  };

  // START EDITING
  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValues({ ...breakers[index] });
  };

  // SAVE EDIT
  const handleSave = () => {
    if (editingIndex === null) return;

    const updated = [...breakers];
    updated[editingIndex] = { ...editValues };

    setBreakers(updated);
    setEditingIndex(null);
  };

  // SHOW SECTION
  const toggleBreakers = () => {
    setBreakerConfig((prev) => !prev);
    setAuditTrail(() => false);
  }
  const toggleAudit = () => {
    setAuditTrail((prev) => !prev);
    setBreakerConfig(() => false);
  }

  // GET AUDIT TRAIL
  useEffect(() => {
    async function fetchData() {
      try {
        const req = await fetch("/api/audit");
        const response = await req.json();
        setAuditData(response.data || []);
      } catch (err) {
        console.error("Error fetching audit:", err);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="abb-container">

      <h1 className="abb-title">System Configuration</h1>

      <div className="abb-buttons">
        <button className="abb-btn" onClick={toggleBreakers}>
          {breakerConfig ? "Hide Breakers" : "Show Breakers"}
        </button>

        <button className="abb-btn" onClick={toggleAudit}>
          {auditTrail ? "Hide Audit Trail" : "Show Audit Trail"}
        </button>
      </div>

      {/* BREAKERS SECTION */}
      {breakerConfig && (
        <div className="breaker-grid">
          {breakers.map((breaker, index) => (
            <div key={index} className="breaker-card-abb">
              {editingIndex === index ? (
                <>
                  <input
                    className="abb-input"
                    type="text"
                    value={editValues.name}
                    onChange={(e) =>
                      setEditValues({ ...editValues, name: e.target.value })
                    }
                  />
                  <input
                    className="abb-input"
                    type="text"
                    value={editValues.type}
                    onChange={(e) =>
                      setEditValues({ ...editValues, type: e.target.value })
                    }
                  />
                  <input
                    className="abb-input"
                    type="text"
                    value={editValues.load}
                    onChange={(e) =>
                      setEditValues({ ...editValues, load: e.target.value })
                    }
                  />

                  <button className="abb-btn-small" onClick={handleSave}>
                    Save
                  </button>
                  <button
                    className="abb-btn-small abb-btn-danger"
                    onClick={() => setEditingIndex(null)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <h3 className="breaker-title">{breaker.name}</h3>
                  <p className="breaker-info">Type: {breaker.type}</p>
                  <p className="breaker-info">Load: {breaker.load}</p>

                  <button
                    className="abb-btn-small"
                    onClick={() => handleEdit(index)}
                  >
                    Update
                  </button>

                  <button
                    className="abb-btn-small abb-btn-danger"
                    onClick={() => handleDelete(index)}
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* AUDIT TRAIL */}
      {auditTrail && (
        <div className="audit-table-wrapper">
          <h2 className="audit-title">Audit Trail</h2>

          <table className="audit-table-abb">
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>Action</th>
                <th>Timestamp</th>
              </tr>
            </thead>

            <tbody>
              {auditData.map((row, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td>{row.userName}</td>
                  <td>{row.type}</td>
                  <td>{row.timestamp}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
