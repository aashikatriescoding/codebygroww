import { useState, useRef } from "react";

const WatchlistTabs = ({ watchlists, activeId, onSelect, onCreate, onRename, onDelete, onReorder }) => {
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  const startRename = (list) => {
    setEditingId(list._id);
    setEditValue(list.name);
  };

  const commitRename = async (list) => {
    if (editValue.trim() && editValue.trim() !== list.name) {
      await onRename(list._id, editValue.trim());
    }
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      setCreating(false);
      return;
    }
    await onCreate(newName.trim());
    setNewName("");
    setCreating(false);
  };

  const handleDragEnd = () => {
    const from = dragItem.current;
    const to = dragOverItem.current;
    dragItem.current = null;
    dragOverItem.current = null;
    if (from === null || to === null || from === to) return;

    const reordered = [...watchlists];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    onReorder(reordered.map((w) => w._id));
  };

  return (
    <div className="watchlist-tabs">
      {watchlists.map((list, index) => (
        <div
          key={list._id}
          className={`watchlist-tab ${list._id === activeId ? "active" : ""}`}
          draggable
          onDragStart={() => (dragItem.current = index)}
          onDragEnter={() => (dragOverItem.current = index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => e.preventDefault()}
        >
          {editingId === list._id ? (
            <input
              className="tab-rename-input"
              value={editValue}
              autoFocus
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => commitRename(list)}
              onKeyDown={(e) => e.key === "Enter" && commitRename(list)}
            />
          ) : (
            <span onClick={() => onSelect(list._id)} onDoubleClick={() => startRename(list)} title="Double-click to rename">
              {list.name}
            </span>
          )}
          {watchlists.length > 1 && (
            <button className="tab-delete" onClick={() => onDelete(list._id)}>×</button>
          )}
        </div>
      ))}

      {creating ? (
        <input
          className="tab-rename-input"
          placeholder="Watchlist name"
          value={newName}
          autoFocus
          onChange={(e) => setNewName(e.target.value)}
          onBlur={handleCreate}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
      ) : (
        <button className="add-tab-btn" onClick={() => setCreating(true)}>+ New</button>
      )}
    </div>
  );
};

export default WatchlistTabs;