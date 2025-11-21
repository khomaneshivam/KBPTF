import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";

import {
  addMachinery,
  getMachinery,
 
} from "../../api/machinery";

const MachineryMaster = () => {
  const [showView, setShowView] = useState(false);
  const [machineries, setMachineries] = useState([]);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    machinery_name: "",
    machinery_no: "",
    machinery_type: "Own",
    remark: "",
  });

  // LOAD DATA
  const loadData = async () => {
    const res = await getMachinery();
    setMachineries(res.data.data || []);
  };

  useEffect(() => {
    if (showView) loadData();
  }, [showView]);

  // FORM SUBMIT
  const submitForm = async () => {
    if (!form.machinery_name || !form.machinery_no) {
      alert("Machinery Name & Number required!");
      return;
    }

    await addMachinery(form);
    alert("Machinery Saved!");

    setForm({
      date: new Date().toISOString().split("T")[0],
      machinery_name: "",
      machinery_no: "",
      machinery_type: "Own",
      remark: "",
    });
  };

  return (
    <Box>

      {/* Toggle Buttons */}
      <Box mb={3} display="flex" gap={2}>
        <Button
          variant={!showView ? "contained" : "outlined"}
          onClick={() => setShowView(false)}
        >
          New Machinery
        </Button>

        <Button
          variant={showView ? "contained" : "outlined"}
          onClick={() => setShowView(true)}
        >
          View Machinery
        </Button>
      </Box>

      {/* VIEW MACHINERY LIST */}
      {showView && (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" mb={2} fontWeight={600}>
            Machinery List
          </Typography>

          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: "#1976d2" }}>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Date</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Name</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Number</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Type</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Remark</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Action</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {machineries.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>{m.date}</TableCell>
                    <TableCell>{m.machinery_name}</TableCell>
                    <TableCell>{m.machinery_no}</TableCell>
                    <TableCell>{m.machinery_type}</TableCell>
                    <TableCell>{m.remark}</TableCell>

                    
                  </TableRow>
                ))}

                {machineries.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      No machinery found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>

            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ADD NEW MACHINERY FORM */}
      {!showView && (
        <Paper sx={{ p: 3, maxWidth: 600, borderRadius: 3 }}>
          <Typography variant="h5" mb={2}>
            Machinery Master
          </Typography>

          <TextField
            fullWidth
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Machinery Name"
            value={form.machinery_name}
            onChange={(e) =>
              setForm({ ...form, machinery_name: e.target.value })
            }
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            label="Machinery No."
            value={form.machinery_no}
            onChange={(e) =>
              setForm({ ...form, machinery_no: e.target.value })
            }
            sx={{ mb: 2 }}
            required
          />

          <TextField
            fullWidth
            select
            label="Machinery Type"
            value={form.machinery_type}
            onChange={(e) =>
              setForm({ ...form, machinery_type: e.target.value })
            }
            sx={{ mb: 2 }}
          >
            <MenuItem value="Own">Own</MenuItem>
            <MenuItem value="Rented">Rented</MenuItem>
          </TextField>

          <TextField
            fullWidth
            label="Remark"
            value={form.remark}
            onChange={(e) => setForm({ ...form, remark: e.target.value })}
            sx={{ mb: 2 }}
          />

          <Button variant="contained" fullWidth onClick={submitForm}>
            Save
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default MachineryMaster;
