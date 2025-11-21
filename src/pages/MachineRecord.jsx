import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  MenuItem,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  TableBody,
  Pagination,
} from "@mui/material";

import { addMachineryRecord, getMachinery, getMachineryRecords } from "../api/machinery";

const MachineryRecord = () => {
  const [machines, setMachines] = useState([]);
  const [records, setRecords] = useState([]);

  const [showForm, setShowForm] = useState(false);

  const [page, setPage] = useState(1);
  const rowsPerPage = 5;

  const [form, setForm] = useState({
    date: "",
    machinery_id: "",
    start_time: "",
    end_time: "",
    fuel_intake: "",
    units: "",
    remark: "",
  });

  useEffect(() => {
    loadMachines();
    loadRecords();
  }, []);

  const loadMachines = async () => {
    try {
      const res = await getMachinery();
      setMachines(res.data.data || []);
    } catch (err) {
      console.error("Failed to load machinery list", err);
    }
  };

  const loadRecords = async () => {
    try {
      const res = await getMachineryRecords();
      setRecords(res.data.data || []);
    } catch (err) {
      console.error("Failed to load records", err);
    }
  };

  // 🔥 Calculate hours difference
  const calculateHours = (start, end) => {
    if (!start || !end) return 0;

    const s = new Date(`2000-01-01T${start}`);
    const e = new Date(`2000-01-01T${end}`);

    let diff = (e - s) / (1000 * 60 * 60);

    return diff > 0 ? diff.toFixed(2) : 0;
  };

  const submitForm = async () => {
    try {
      const total_hours = calculateHours(form.start_time, form.end_time);

      const payload = {
        ...form,
        total_hours
      };

      await addMachineryRecord(payload);
      alert("Record Saved Successfully!");

      setForm({
        date: "",
        machinery_id: "",
        start_time: "",
        end_time: "",
        fuel_intake: "",
        units: "",
        remark: "",
      });

      loadRecords();
      setShowForm(false);

    } catch (err) {
      console.error("Save failed", err);
      alert("Failed to save record");
    }
  };

  // Pagination
  const startIndex = (page - 1) * rowsPerPage;
  const paginatedRows = records.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(records.length / rowsPerPage);

  return (
    <Box sx={{ p: 3 }}>

      {/* Switch buttons */}
      <Box display="flex" gap={2} mb={3}>
        <Button
          variant={showForm ? "outlined" : "contained"}
          onClick={() => setShowForm(false)}
        >
          View Records
        </Button>

        <Button
          variant={showForm ? "contained" : "outlined"}
          onClick={() => setShowForm(true)}
        >
          Add New Record
        </Button>
      </Box>

      {/* FORM */}
      {showForm && (
        <Paper sx={{ p: 3, maxWidth: 600, mx: "auto", mb: 3 }}>
          <Typography variant="h5" mb={2}>Add Machinery Usage</Typography>

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
            select
            label="Select Machinery"
            value={form.machinery_id}
            onChange={(e) => setForm({ ...form, machinery_id: e.target.value })}
            sx={{ mb: 2 }}
          >
            {machines.map((m) => (
              <MenuItem key={m.id} value={m.id}>
                {m.machinery_name} ({m.machinery_no})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            label="Start Time"
            type="time"
            value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="End Time"
            type="time"
            value={form.end_time}
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Fuel Intake (Litres)"
            value={form.fuel_intake}
            onChange={(e) => setForm({ ...form, fuel_intake: e.target.value })}
            sx={{ mb: 2 }}
          />


          <TextField
            fullWidth
            label="Remark"
            value={form.remark}
            onChange={(e) => setForm({ ...form, remark: e.target.value })}
            sx={{ mb: 2 }}
          />

          <Button variant="contained" fullWidth onClick={submitForm}>
            Save Record
          </Button>
        </Paper>
      )}

      {/* TABLE */}
      {!showForm && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>Machinery Usage Records</Typography>

          <TableContainer>
            <Table>
              <TableHead sx={{ background: "#1976d2" }}>
                <TableRow>
                  <TableCell sx={{ color: "white" }}>Date</TableCell>
                  <TableCell sx={{ color: "white" }}>Machine</TableCell>
                  <TableCell sx={{ color: "white" }}>Start</TableCell>
                  <TableCell sx={{ color: "white" }}>End</TableCell>
                  <TableCell sx={{ color: "white" }}>Hours</TableCell>
                  <TableCell sx={{ color: "white" }}>Fuel</TableCell>
                  <TableCell sx={{ color: "white" }}>Remark</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paginatedRows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.date}</TableCell>
                    <TableCell>{r.machinery_name}</TableCell>
                    <TableCell>{r.start_time}</TableCell>
                    <TableCell>{r.end_time}</TableCell>
                    <TableCell>{r.total_hours}</TableCell>
                    <TableCell>{r.fuel_intake}</TableCell>
                    <TableCell>{r.remark}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box mt={2} display="flex" justifyContent="center">
            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, val) => setPage(val)}
            />
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default MachineryRecord;
