import React, { useEffect, useState } from "react";
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

import drugJson from '../../Data/drug_dictionary.json'; // Adjust path based on your file location
import { removeDuplicatesFromDrugDictionary } from "./utils";

var data = removeDuplicatesFromDrugDictionary(drugJson);

console.log(1111, drugJson)

export default function DrugEditor() {
  const classes = useStyles();

  // const [data, setData] = useState({});

  // useEffect(() => {
  //   const cleanedDrugDict = removeDuplicatesFromDrugDictionary(drugJson);
  //   setData(cleanedDrugDict)
  // }, [])

  const [searchTerm, setSearchTerm] = useState("");
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [valueKey, setValueKey] = useState("");
  const [editingValue, setEditingValue] = useState(null);
  const [collapsedKeys, setCollapsedKeys] = useState({});
  const [moveDialog, setMoveDialog] = useState(null);
  const [selectedMoveTarget, setSelectedMoveTarget] = useState(null);

  const [filteredKeys, setFilteredKeys] = useState(Object.entries(data));

  useEffect(()=>{
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
setFilteredKeys(filteredKeys)

  },[
    searchTerm
  ])

  const updateData = (key, updater) => {
    // setData((prevData) => ({ ...prevData, [key]: updater(prevData[key]) }));
  };

  const handleAddKey = () => {
    // if (newKey && !data[newKey]) {
    //   setData((prev) => ({ ...prev, [newKey]: [] }));
    //   setNewKey("");
    // }
  };

  const handleAddValue = () => {
    // if (newValue && valueKey && data[valueKey]) {
    //   updateData(valueKey, (vals) =>
    //     vals.includes(newValue) ? vals : [...vals, newValue]
    //   );
    //   setNewValue("");
    // }
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
    <Box sx={classes.root}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Drug Dictionary Editor
      </Typography>

      <Grid mb={20} p={10} sx={classes.list}>
        <InputBase
          fullWidth
          placeholder="Search keys/values..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={classes.searchInput}
        />

        <Stack spacing={2} mb={20}>
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
                            sx={classes.inlineEditInput}
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
      </Grid>

      <Stack mb={20} p={10} sx={classes.addKey} direction={{ xs: "column" }} spacing={10} alignItems="center">
        <h3>Add New Key</h3>
        <InputBase
          placeholder="New key"
          value={newKey}
          onChange={(e) => setNewKey(e.target.value)}
          sx={classes.inputField}
        />
        <Button variant="contained" onClick={handleAddKey} disabled={!newKey.trim()}>Add Key</Button>
      </Stack>

      <Stack mb={20} p={10} sx={classes.addValue} direction={{ xs: "column" }} spacing={10} alignItems="center">
        <h3>Add New Value</h3>
        <InputBase
          placeholder="New value"
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          sx={classes.inputField}
        />
        <Box sx={classes.selectBox}>
          <Select
            options={dropdownOptions}
            onChange={(opt) => setValueKey(opt?.value || "")}
            placeholder="Key to add value to"
            isClearable
            value={valueKey ? { value: valueKey, label: valueKey } : null}
            classNamePrefix="react-select"
          />
        </Box>
        <Button variant="contained" onClick={handleAddValue} disabled={!newValue.trim() || !valueKey}>Add Value</Button>
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
        <Box sx={classes.modalBox}>
          <Typography mb={15} variant="h6" mb={2}>Move Value</Typography>
          <Typography mb={10}>
            Move <strong>{moveDialog?.value}</strong> from <strong>{moveDialog?.fromKey}</strong> to:
          </Typography>
          <Select
            my={15}
            options={dropdownOptions.filter((opt) => opt.value !== moveDialog?.fromKey)}
            onChange={(opt) => setSelectedMoveTarget(opt?.value || "")}
            placeholder="Select destination key..."
            isClearable
            classNamePrefix="react-select"
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1} mt={10}>
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
