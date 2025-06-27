import React, { useState } from "react";
import Select from "react-select";

export default function DrugEditor() {
  const [data, setData] = useState({
    "68Ga": ["68-Ga PSMA11", "68GA-DOTA-dPNE"],
    "18F": ["18F FAZA", "18F- DCFPyl"],
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [valueKey, setValueKey] = useState("");
  const [editingValue, setEditingValue] = useState(null);
  const [collapsedKeys, setCollapsedKeys] = useState({});
  const [moveDialog, setMoveDialog] = useState(null);
  const [selectedMoveTarget, setSelectedMoveTarget] = useState(null);

  const filteredKeys = Object.entries(data)
    .map(([key, values]) => {
      const matchKey = key.toLowerCase().includes(searchTerm.toLowerCase());
      const filteredValues = values.filter((v) =>
        v.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (matchKey) {
        return [key, values];
      } else if (filteredValues.length > 0) {
        return [key, filteredValues];
      } else {
        return null;
      }
    })
    .filter(Boolean);

  const handleAddKey = () => {
    if (newKey && !data[newKey]) {
      setData({ ...data, [newKey]: [] });
      setNewKey("");
    }
  };

  const handleAddValue = () => {
    if (newValue && valueKey && data[valueKey]) {
      const newData = { ...data };
      if (!newData[valueKey].includes(newValue)) {
        newData[valueKey].push(newValue);
        setData(newData);
      }
      setNewValue("");
    }
  };

  const handleDelete = (key, val) => {
    const newData = { ...data };
    newData[key] = newData[key].filter((v) => v !== val);
    setData(newData);
  };

  const handleEdit = (key, val, newVal) => {
    const newData = { ...data };
    newData[key] = newData[key].map((v) => (v === val ? newVal : v));
    setData(newData);
    setEditingValue(null);
  };

  const handleMove = (fromKey, val) => {
    setMoveDialog({ fromKey, value: val });
    setSelectedMoveTarget(null);
  };

  const confirmMove = () => {
    if (!moveDialog || !selectedMoveTarget) return;
    const { fromKey, value } = moveDialog;
    const toKey = selectedMoveTarget;
    if (fromKey === toKey) {
      setMoveDialog(null);
      return;
    }
    const newData = { ...data };
    newData[fromKey] = newData[fromKey].filter((v) => v !== value);
    if (!newData[toKey].includes(value)) {
      newData[toKey].push(value);
    }
    setData(newData);
    setMoveDialog(null);
  };

  const toggleCollapse = (key) => {
    setCollapsedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div style={{ padding: 20, fontFamily: "Arial", fontSize: 14 }}>
      <h2 style={{ fontSize: 22, fontWeight: "bold", marginBottom: 15 }}>
        Drug Dictionary Editor
      </h2>

      <input
        type="text"
        placeholder="Search keys/values..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: "100%", padding: 8, marginBottom: 20 }}
      />

      {/* Key-Value Collapsible List */}
      <div style={{ marginBottom: 30 }}>
        {filteredKeys.map(([key, values]) => (
          <div
            key={key}
            style={{
              border: "1px solid #ccc",
              marginBottom: 10,
              padding: 10,
              borderRadius: 4,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                cursor: "pointer",
              }}
              onClick={() => toggleCollapse(key)}
            >
              <strong>{key}</strong>
              <span>{collapsedKeys[key] ? "▶️" : "🔽"}</span>
            </div>

            {!collapsedKeys[key] &&
              values.map((val) => (
                <div
                  key={val}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginTop: 6,
                  }}
                >
                  {editingValue?.key === key &&
                    editingValue?.value === val ? (
                    <input
                      type="text"
                      defaultValue={val}
                      onBlur={(e) =>
                        handleEdit(key, val, e.target.value.trim())
                      }
                      autoFocus
                    />
                  ) : (
                    <>
                      <span>{val}</span>
                      <button
                        onClick={() => setEditingValue({ key, value: val })}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleMove(key, val)}
                        title="Move"
                      >
                        🔀
                      </button>
                      <button
                        onClick={() => handleDelete(key, val)}
                        title="Delete"
                      >
                        ❌
                      </button>
                    </>
                  )}
                </div>
              ))}
          </div>
        ))}
      </div>

      {/* Add Key */}
      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="New key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          style={{ padding: 6, marginRight: 10 }}
        />
        <button onClick={handleAddKey} style={{ padding: "6px 10px" }}>
          ➕ Add Key
        </button>
      </div>

      {/* Add Value */}
      <div style={{ marginBottom: 30 }}>
        <input
          type="text"
          placeholder="New value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          style={{ padding: 6, marginRight: 10 }}
        />

        <div style={{ width: 250, display: "inline-block", marginRight: 10 }}>
          <Select
            options={Object.keys(data).map((key) => ({
              value: key,
              label: key,
            }))}
            onChange={(opt) => setValueKey(opt?.value || "")}
            placeholder="Key to add value to"
            isClearable
            value={valueKey ? { value: valueKey, label: valueKey } : null}
          />
        </div>

        <button onClick={handleAddValue} style={{ padding: "6px 10px" }}>
          ➕ Add Value
        </button>
      </div>

      {/* Update on Server */}
      <button
        style={{
          background: "#28a745",
          color: "white",
          padding: "8px 14px",
          border: "none",
          cursor: "pointer",
          borderRadius: 4,
        }}
        onClick={() => {
          console.log("✅ Sending updated data to server...");
          console.log("🧠 Final Data:\n", data);
          // simulate server update here
        }}
      >
        🚀 Update on Server
      </button>

      {/* Move Modal */}
      {moveDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              width: 300,
              boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            }}
          >
            <h3 style={{ marginBottom: 10 }}>Move Value</h3>
            <p>
              Move <strong>{moveDialog.value}</strong> from{" "}
              <strong>{moveDialog.fromKey}</strong> to:
            </p>

            <Select
              options={Object.keys(data)
                .filter((k) => k !== moveDialog.fromKey)
                .map((k) => ({ value: k, label: k }))}
              onChange={(opt) => setSelectedMoveTarget(opt?.value || "")}
              placeholder="Select destination key..."
              isClearable
            />

            <div
              style={{
                marginTop: 20,
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              <button onClick={() => setMoveDialog(null)}>Cancel</button>
              <button
                onClick={confirmMove}
                disabled={!selectedMoveTarget}
                style={{
                  background: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "6px 12px",
                  cursor: "pointer",
                  borderRadius: 4,
                }}
              >
                ✅ Move
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
