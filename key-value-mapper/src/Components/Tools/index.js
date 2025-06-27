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
  const [moveTarget, setMoveTarget] = useState("");

  const filteredKeys = Object.entries(data).filter(([key, values]) => {
    const matchKey = key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchValue = values.some((v) =>
      v.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return matchKey || matchValue;
  });

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
    if (!moveTarget || fromKey === moveTarget) return;
    const newData = { ...data };
    newData[fromKey] = newData[fromKey].filter((v) => v !== val);
    if (!newData[moveTarget].includes(val)) {
      newData[moveTarget].push(val);
    }
    setData(newData);
  };

  const toggleCollapse = (key) => {
    setCollapsedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const dropdownOptions = Object.keys(data).map((key) => ({
    value: key,
    label: key,
  }));

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
                  {editingValue?.key === key && editingValue?.value === val ? (
                    <>
                      <input
                        type="text"
                        defaultValue={val}
                        onBlur={(e) =>
                          handleEdit(key, val, e.target.value.trim())
                        }
                        autoFocus
                      />
                    </>
                  ) : (
                    <>
                      <span>{val}</span>
                      <button
                        onClick={() =>
                          setEditingValue({ key, value: val })
                        }
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

      {/* Move Target Selector */}
      <div style={{ marginBottom: 20 }}>
        <label>
          <strong>Set move target key:</strong>
        </label>
        <div style={{ width: 250, marginTop: 5 }}>
          <Select
            options={dropdownOptions}
            onChange={(opt) => setMoveTarget(opt?.value || "")}
            placeholder="Select target key..."
            isClearable
          />
        </div>
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
        <select
          value={valueKey}
          onChange={(e) => setValueKey(e.target.value)}
          style={{ padding: 6, marginRight: 10 }}
        >
          <option value="">Key to add value to</option>
          {Object.keys(data).map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
        <button onClick={handleAddValue} style={{ padding: "6px 10px" }}>
          ➕ Add Value
        </button>
      </div>

      {/* Print JSON */}
      <button
        style={{
          background: "black",
          color: "white",
          padding: "8px 14px",
          border: "none",
          cursor: "pointer",
        }}
        onClick={() =>
          console.log("Updated JSON:\n", JSON.stringify(data, null, 2))
        }
      >
        🖨️ Print Updated JSON
      </button>
    </div>
  );
}
