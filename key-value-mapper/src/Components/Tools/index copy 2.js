import React, { useState } from "react";
import Select from "react-select";
import {
  Box,
  Button,
  Grid,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Typography,
  Modal,
} from "@mui/material";
import { Edit, Delete, SwapHoriz } from "@mui/icons-material";

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
      if (matchKey) return [key, values];
      if (filteredValues.length > 0) return [key, filteredValues];
      return null;
    })
    .filter(Boolean);

  const updateData = (key, updater) => {
    setData((prevData) => ({ ...prevData, [key]: updater(prevData[key]) }));
  };

  const handleAddKey = () => {
    if (newKey && !data[newKey]) {
      setData((prev) => ({ ...prev, [newKey]: [] }));
      setNewKey("");
    }
  };

  const handleAddValue = () => {
    if (newValue && valueKey && data[valueKey]) {
      updateData(valueKey, (vals) =>
        vals.includes(newValue) ? vals : [...vals, newValue]
      );
      setNewValue("");
    }
  };

  const handleDelete = (key, val) => {
    updateData(key, (vals) => vals.filter((v) => v !== val));
  };

  const handleEdit = (key, val, newVal) => {
    updateData(key, (vals) => vals.map((v) => (v === val ? newVal : v)));
    setEditingValue(null);
  };

  const handleMove = (fromKey, val) => {
    setMoveDialog({ fromKey, value: val });
    setSelectedMoveTarget(null);
  };

  const confirmMove = () => {
    const { fromKey, value } = moveDialog;
    if (selectedMoveTarget && fromKey !== selectedMoveTarget) {
      updateData(fromKey, (vals) => vals.filter((v) => v !== value));
      updateData(selectedMoveTarget, (vals) =>
        vals.includes(value) ? vals : [...vals, value]
      );
    }
    setMoveDialog(null);
  };

  const toggleCollapse = (key) => {
    setCollapsedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const dropdownOptions = Object.keys(data).map((key) => ({ value: key, label: key }));
  return (
    <Box sx={{ p: 2, maxWidth: 700, mx: "auto" ,'& .react-select__control': {minHeight: '52px !important'}}}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Drug Dictionary Editor
      </Typography>

      <InputBase
        fullWidth
        placeholder="Search keys/values..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 3, px: 2, py: 1, border: "1px solid #ccc", borderRadius: 1 }}
      />

      <Stack spacing={2} mb={3}>
        {filteredKeys.map(([key, values]) => (
          <Paper key={key} variant="outlined" sx={{ p: 2 }}>
            <Box display="flex" justifyContent="space-between" onClick={() => toggleCollapse(key)} sx={{ cursor: "pointer" }}>
              <Typography fontWeight="bold">{key}</Typography>
              <Typography>{collapsedKeys[key] ? "▶️" : "🔽"}</Typography>
            </Box>

            {!collapsedKeys[key] && (
              <Stack spacing={1} mt={2}>
                {values.map((val) => (
                  <Grid container spacing={1} alignItems="center" key={val}>
                    <Grid item xs>
                      {editingValue?.key === key && editingValue?.value === val ? (
                        <InputBase
                          fullWidth
                          defaultValue={val}
                          autoFocus
                          onBlur={(e) => handleEdit(key, val, e.target.value.trim())}
                          sx={{ border: "1px solid #ccc", px: 1, borderRadius: 1 }}
                        />
                      ) : (
                        <Typography>{val}</Typography>
                      )}
                    </Grid>
                    {!editingValue && (
                      <Grid item>
                        <IconButton onClick={() => setEditingValue({ key, value: val })}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleMove(key, val)}>
                          <SwapHoriz fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => handleDelete(key, val)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </Grid>
                    )}
                  </Grid>
                ))}
              </Stack>
            )}
          </Paper>
        ))}
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={2} alignItems="center">
        <InputBase
          placeholder="New key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          sx={{ px: 2, py: 1.1, border: "1px solid #ccc", borderRadius: 1, flex: 1 }}
        />
        <Button variant="contained" onClick={handleAddKey} disabled={!newKey.trim()}>➕ Add Key</Button>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3} alignItems="center">
        <InputBase
          placeholder="New value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          sx={{ px: 2, py: 1.1, border: "1px solid #ccc", borderRadius: 1, flex: 1 }}
        />
        <Box sx={{ flex: 1, '& .react-select__control': { minHeight: 42 } }}>
          <Select
            options={dropdownOptions}
            onChange={(opt) => setValueKey(opt?.value || "")}
            placeholder="Key to add value to"
            isClearable
            value={valueKey ? { value: valueKey, label: valueKey } : null}
            classNamePrefix="react-select"
          />
        </Box>
        <Button variant="contained" onClick={handleAddValue} disabled={!newValue.trim() || !valueKey}>➕ Add Value</Button>
      </Stack>

      <Button
        variant="contained"
        color="success"
        fullWidth
        onClick={() => {
          console.log("✅ Sending updated data to server...");
          console.log("🧠 Final Data:\n", data);
        }}
      >
        🚀 Update on Server
      </Button>

      <Modal open={!!moveDialog} onClose={() => setMoveDialog(null)}>
        <Box
          sx={{
            '& .react-select__control': {minHeight: '52px !important'},
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 300,
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" mb={2}>Move Value</Typography>
          <Typography mb={2}>
            Move <strong>{moveDialog?.value}</strong> from <strong>{moveDialog?.fromKey}</strong> to:
          </Typography>
          <Select
            options={dropdownOptions.filter((opt) => opt.value !== moveDialog?.fromKey)}
            onChange={(opt) => setSelectedMoveTarget(opt?.value || "")}
            placeholder="Select destination key..."
            isClearable
            classNamePrefix="react-select"
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={3}>
            <Button onClick={() => setMoveDialog(null)}>Cancel</Button>
            <Button
              variant="contained"
              disabled={!selectedMoveTarget}
              onClick={confirmMove}
            >
              ✅ Move
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}
