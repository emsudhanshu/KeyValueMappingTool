import React, {
  useMemo,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
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
  Divider,
} from "@mui/material";
import { Edit, Delete, SwapHoriz } from "@mui/icons-material";
import { VariableSizeList as List } from "react-window";
import debounce from "lodash.debounce";
import useStyles from "./styles";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import drugJson from "../../Data/drug_dictionary.json";
import { removeDuplicatesFromDrugDictionary } from "./utils";

const initialData = removeDuplicatesFromDrugDictionary(drugJson);

export default function DrugEditor() {
  const classes = useStyles();
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [valueKey, setValueKey] = useState("");
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingValue, setEditingValue] = useState(null);
  const [editingKey, setEditingKey] = useState(null);
  const [collapsedKeys, setCollapsedKeys] = useState(() => {
    const allOpen = {};
    Object.keys(initialData).forEach((key) => {
      allOpen[key] = true;
    });
    return allOpen;
  });
  const [moveDialog, setMoveDialog] = useState(null);
  const [selectedMoveTarget, setSelectedMoveTarget] = useState(null);

  const keyInputRef = useRef(null);
  const valueInputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      setTimeout(() => {
        if (
          keyInputRef.current &&
          !keyInputRef.current.contains(event.target)
        ) {
          setEditingKey(null);
        }
        if (
          valueInputRef.current &&
          !valueInputRef.current.contains(event.target)
        ) {
          setEditingValue(null);
        }
      }, 100);
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setCollapsedKeys((prev) => {
        const updated = { ...prev };
        Object.keys(data).forEach((key) => {
          updated[key] = true;
        });
        return updated;
      });
      if (listRef.current) listRef.current.resetAfterIndex(0);
    }
  }, [searchTerm, data]);

  const dropdownOptions = useMemo(
    () => Object.keys(data).map((key) => ({ value: key, label: key })),
    [data]
  );

  const filteredKeys = useMemo(() => {
    return Object.entries(data)
      .map(([key, values]) => {
        const matchKey = key
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const filteredValues = values.filter((v) =>
          v.toLowerCase().includes(searchTerm.toLowerCase())
        );
        if (matchKey) return [key, values];
        if (filteredValues.length > 0) return [key, filteredValues];
        return null;
      })
      .filter(Boolean);
  }, [searchTerm, data]);

  const updateData = (key, updater) => {
    setData((prev) => ({ ...prev, [key]: updater(prev[key]) }));
  };

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
    updateData(key, (vals) => vals.filter((v) => v !== val));
  };

  const handleDeleteKey = (key) => {
    setData((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
  };

  const handleEdit = (key, val, newVal) => {
    updateData(key, (vals) => vals.map((v) => (v === val ? newVal : v)));
    setEditingValue(null);
  };

  const handleEditKey = (oldKey, newKeyName) => {
    if (!newKeyName || newKeyName === oldKey || data[newKeyName]) return;
    setData((prev) => {
      const updated = { ...prev };
      updated[newKeyName] = updated[oldKey];
      delete updated[oldKey];
      return updated;
    });
    setEditingKey(null);
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

  const toggleCollapse = useCallback((key) => {
    setCollapsedKeys((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      return updated;
    });
    setTimeout(() => {
      if (listRef.current) {
        listRef.current.resetAfterIndex(0);
      }
    }, 0);
  }, []);

  const debouncedSearch = useMemo(() => {
    return debounce((value) => {
      setSearchTerm(value);
    }, 300);
  }, []);

  const getItemSize = (index) => {
    const [key, valuesRaw] = filteredKeys[index];
    const isExpanded = collapsedKeys?.[key];
    const headerHeight = 60;
    const valueHeight = 30;
    const len = valuesRaw.length >= 7 ? 7 : valuesRaw.length;
    return isExpanded ? 100 + len * valueHeight : 50;
  };

  const Row = ({ index, style }) => {
    const [key, values] = filteredKeys[index];
    return (
      <div style={style}>
        <Paper elevation={2} sx={classes.paperItem}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={classes.keyHeader}
          >
            <Box style={{ flexGrow: 1, display: "flex", alignItems: "center", marginBottom: '0px' }}>
              {editingKey === key ? (
                <InputBase
                  fullWidth
                  autoFocus
                  defaultValue={key}
                  inputRef={keyInputRef}
                  onBlur={(e) =>
                    handleEditKey(key, e.target.value.trim())
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleEditKey(key, e.target.value.trim());
                    }
                  }}
                  sx={classes.inlineEditInput}
                />
              ) : (
                <Stack direction="row" justifyContent="space-between" sx={{ width: "100%", marginBottom: '0px' }}>
                  <Stack direction="row" alignItems={"center"} sx={{ marginBottom: '0px' }}>
                    <Box
                      onClick={() => toggleCollapse(key)}
                      style={{ cursor: "pointer" }}
                    >
                      <Typography variant="subtitle1" fontWeight="bold">
                        {key}
                      </Typography>
                    </Box>
                    <IconButton
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setEditingKey(key);
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteKey(key)} color="error">
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                  <Stack direction="row" alignItems={"center"}>
                    <IconButton
                      onClick={() => toggleCollapse(key)}
                      style={{ cursor: "pointer" }}
                    >
                      {collapsedKeys[key] ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
                    </IconButton>
                  </Stack>
                </Stack>
              )}
            </Box>
          </Box>

          {collapsedKeys[key] && (
            <Stack
              spacing={1}
              mt={2}
              sx={{
                backgroundColor: "#f5f5f5",
                p: 2,
                borderRadius: 1,
                width: "100%",
                boxSizing: "border-box",
                maxHeight: "250px",
                overflowY: "auto",
              }}
            >
              {values.map((val) => (
                <Grid container spacing={1} alignItems="center" key={val}>
                  <Grid item xs>
                    {editingValue?.key === key && editingValue?.value === val ? (
                      <InputBase
                        fullWidth
                        defaultValue={val}
                        autoFocus
                        inputRef={valueInputRef}
                        onBlur={(e) =>
                          handleEdit(key, val, e.target.value.trim())
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleEdit(key, val, e.target.value.trim());
                          }
                        }}
                        sx={classes.inlineEditInput}
                      />
                    ) : (
                      <Typography>{val}</Typography>
                    )}
                  </Grid>
                  {!editingValue && (
                    <Grid item>
                      <IconButton
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingValue({ key, value: val });
                        }}
                      >
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
      </div>
    );
  };

  return (
    <Box sx={classes.root}>
      <Typography variant="h4" fontWeight="600" align="center" gutterBottom>
        Drug Dictionary Editor
      </Typography>

      <Box sx={classes.tableSearchBox}>
        <InputBase
          fullWidth
          placeholder="Search keys or values..."
          onChange={(e) => debouncedSearch(e.target.value)}
          sx={classes.searchInput}
        />
      </Box>

      <Stack direction="row" justifyContent="space-between" spacing={2} mb={2}>
        <Stack direction='row' spacing={1}>
          <InputBase
            placeholder="New key"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            sx={{ border: "1px solid #ccc", px: 1 }}
          />
          <Button onClick={handleAddKey}>➕ Add Key</Button>
        </Stack>
        <Stack direction='row' spacing={1}>


          <InputBase
            placeholder="New value"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            sx={{ border: "1px solid #ccc", px: 1 }}
          />
          <Box sx={{ width: 200 }}>
            <Select
              options={dropdownOptions}
              onChange={(opt) => setValueKey(opt?.value || "")}
              placeholder="Select key"
              value={valueKey ? { value: valueKey, label: valueKey } : null}
              isClearable
            />
          </Box>
          <Button onClick={handleAddValue}>➕ Add Value</Button>
        </Stack>

      </Stack>

      <List
        ref={listRef}
        height={550}
        itemCount={filteredKeys.length}
        itemSize={getItemSize}
        width="100%"
      >
        {Row}
      </List>

      <Divider />
      <Button
        sx={{ marginTop: '20px' }}
        variant="contained"
        color="primary"
        onClick={() => {
          console.log("✅ Final Data:\n", data);
        }}
      >
        🚀 Upload Changes
      </Button>

      {moveDialog && (
        <Modal open onClose={() => setMoveDialog(null)}>
          <Box sx={classes.modalBox}>
            <Typography mb={2} variant="h6">Move Value</Typography>
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
            <Stack direction="row" justifyContent="flex-end" spacing={1} mt={2}>
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
      )}
    </Box>
  );
}
