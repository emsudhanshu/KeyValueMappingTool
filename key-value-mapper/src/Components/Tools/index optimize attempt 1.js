import React, { useEffect, useMemo, useRef, useState } from "react";
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
import useStyles from "./styles";

import drugJson from "../../Data/drug_dictionary.json";
import { removeDuplicatesFromDrugDictionary } from "./utils";



export default function DrugEditor() {
  const classes = useStyles();

  const dataRef = useRef({});
  const [renderTick, setRenderTick] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [valueKey, setValueKey] = useState("");
  const [editingValue, setEditingValue] = useState(null);
  const [collapsedKeys, setCollapsedKeys] = useState({});
  const [moveDialog, setMoveDialog] = useState(null);
  const [selectedMoveTarget, setSelectedMoveTarget] = useState(null);

  useEffect(() => {
    dataRef.current = removeDuplicatesFromDrugDictionary(drugJson);
    alert('data cleaned')
    setRenderTick((t) => t + 1);
  }, []);

  const updateData = (key, updater) => {
    const updatedValues = updater(dataRef.current[key]);
    dataRef.current[key] = updatedValues;
    setRenderTick((t) => t + 1);
  };

  const handleAddKey = () => {
    if (newKey && !dataRef.current[newKey]) {
      dataRef.current[newKey] = [];
      setNewKey("");
      setRenderTick((t) => t + 1);
    }
  };

  const handleAddValue = () => {
    if (newValue && valueKey && dataRef.current[valueKey]) {
      const current = dataRef.current[valueKey];
      if (!current.includes(newValue)) {
        dataRef.current[valueKey].push(newValue);
        setNewValue("");
        setRenderTick((t) => t + 1);
      }
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

  const filteredKeys = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return Object.entries(dataRef.current)
      .map(([key, values]) => {
        const matchKey = key.toLowerCase().includes(term);
        const filteredValues = values.filter((v) =>
          v.toLowerCase().includes(term)
        );
        if (matchKey) return [key, values];
        if (filteredValues.length > 0) return [key, filteredValues];
        return null;
      })
      .filter(Boolean);
  }, [searchTerm, renderTick]);

  const dropdownOptions = useMemo(
    () =>
      Object.keys(dataRef.current).map((key) => ({
        value: key,
        label: key,
      })),
    [renderTick]
  );

  return (
    <Box className={classes.root}>
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Drug Dictionary Editor
      </Typography>

      <InputBase
        fullWidth
        placeholder="Search keys/values..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className={classes.searchInput}
      />

      <Stack spacing={1.5} mb={2}>
        {filteredKeys.map(([key, values]) => (
          <Paper key={key} variant="outlined" sx={{ p: 1 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              onClick={() => toggleCollapse(key)}
              sx={{ cursor: "pointer" }}
            >
              <Typography fontWeight="bold">{key}</Typography>
              <Typography>{collapsedKeys[key] ? "▶️" : "🔽"}</Typography>
            </Box>

            {!collapsedKeys[key] && (
              <Stack spacing={1} mt={1}>
                {values.map((val) => (
                  <Grid container spacing={1} alignItems="center" key={val}>
                    <Grid item xs>
                      {editingValue?.key === key &&
                      editingValue?.value === val ? (
                        <InputBase
                          fullWidth
                          defaultValue={val}
                          autoFocus
                          onBlur={(e) =>
                            handleEdit(key, val, e.target.value.trim())
                          }
                          className={classes.inlineEditInput}
                        />
                      ) : (
                        <Typography>{val}</Typography>
                      )}
                    </Grid>
                    {!editingValue && (
                      <Grid item>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setEditingValue({ key, value: val })
                          }
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleMove(key, val)}
                        >
                          <SwapHoriz fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(key, val)}
                        >
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

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        mb={1.5}
        alignItems="center"
      >
        <InputBase
          placeholder="New key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          className={classes.inputField}
        />
        <Button
          variant="contained"
          size="small"
          onClick={handleAddKey}
          disabled={!newKey.trim()}
        >
          ➕ Add Key
        </Button>
      </Stack>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        mb={2}
        alignItems="center"
      >
        <InputBase
          placeholder="New value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          className={classes.inputField}
        />
        <Box className={classes.selectBox}>
          <Select
            options={dropdownOptions}
            onChange={(opt) => setValueKey(opt?.value || "")}
            placeholder="Key to add value to"
            isClearable
            value={valueKey ? { value: valueKey, label: valueKey } : null}
            classNamePrefix="react-select"
          />
        </Box>
        <Button
          variant="contained"
          size="small"
          onClick={handleAddValue}
          disabled={!newValue.trim() || !valueKey}
        >
          ➕ Add Value
        </Button>
      </Stack>

      <Button
        variant="contained"
        color="success"
        fullWidth
        size="small"
        onClick={() => {
          console.log("✅ Sending updated data to server...");
          console.log("🧠 Final Data:\n", dataRef.current);
        }}
      >
        🚀 Update on Server
      </Button>

      <Modal open={!!moveDialog} onClose={() => setMoveDialog(null)}>
        <Box className={classes.modalBox}>
          <Typography variant="subtitle1" mb={1}>
            Move Value
          </Typography>
          <Typography mb={2}>
            Move <strong>{moveDialog?.value}</strong> from{" "}
            <strong>{moveDialog?.fromKey}</strong> to:
          </Typography>
          <Select
            options={dropdownOptions.filter(
              (opt) => opt.value !== moveDialog?.fromKey
            )}
            onChange={(opt) => setSelectedMoveTarget(opt?.value || "")}
            placeholder="Select destination key..."
            isClearable
            classNamePrefix="react-select"
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
            <Button size="small" onClick={() => setMoveDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="contained"
              size="small"
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
