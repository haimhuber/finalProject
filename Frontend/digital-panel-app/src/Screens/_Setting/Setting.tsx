import { useEffect, useState } from 'react';
import './Setting.css';
import configJson from '../../config.json';

interface Breaker {
  name: string;
  type: string;
  load: string;
}

export const Setting = () => {
  const [breakers, setBreakers] = useState<Breaker[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<Breaker>({ name: '', type: '', load: '' });

  useEffect(() => {
    if (configJson.breakers && Array.isArray(configJson.breakers)) {
      setBreakers(configJson.breakers);
    }
  }, []);

  // Delete item
  const handleDelete = (index: number) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${breakers[index].name}?`);
    if (confirmDelete) {
      setBreakers(prev => prev.filter((_, i) => i !== index));
      // TODO: call backend API to update JSON file
    }
  };

  // Start editing
  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditValues({ ...breakers[index] });
  };

  // Save updated item
  const handleSave = () => {
    if (editingIndex === null) return;
    const updatedBreakers = [...breakers];
    updatedBreakers[editingIndex] = { ...editValues };
    setBreakers(updatedBreakers);
    setEditingIndex(null);
    // TODO: call backend API to persist changes
  };

  return (
    <div className="setting-container">
      <h2>Breakers Configuration</h2>
      <div className="cards-wrapper">
        {breakers.length === 0 && <p>No breakers found.</p>}
        {breakers.map((breaker, index) => (
          <div key={index} className="breaker-card">
            {editingIndex === index ? (
              <>
                <input
                  type="text"
                  value={editValues.name}
                  onChange={e => setEditValues({ ...editValues, name: e.target.value })}
                />
                <input
                  type="text"
                  value={editValues.type}
                  onChange={e => setEditValues({ ...editValues, type: e.target.value })}
                />
                <input
                  type="text"
                  value={editValues.load}
                  onChange={e => setEditValues({ ...editValues, load: e.target.value })}
                />
                <button onClick={handleSave}>Save</button>
                <button onClick={() => setEditingIndex(null)}>Cancel</button>
              </>
            ) : (
              <>
                <h3>{breaker.name}</h3>
                <p>Type: {breaker.type}</p>
                <p>Load: {breaker.load}</p>
                <button onClick={() => handleEdit(index)}>Update</button>
                <button onClick={() => handleDelete(index)}>Delete</button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
