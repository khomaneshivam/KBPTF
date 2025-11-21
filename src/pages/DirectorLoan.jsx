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
  TableBody,
  TableContainer,
} from "@mui/material";

import { addDirectorLoan, getDirectorLoans as getDirectorLoanList } from "../api/directorLoan";
import { getBanks } from "../api/master";

const DirectorLoan = () => {
  const [showView, setShowView] = useState(false);

  const [banks, setBanks] = useState([]);
  const [loanList, setLoanList] = useState([]);

  const [form, setForm] = useState({
    loan_date: new Date().toISOString().split("T")[0],
    director_name: "",
    amount: "",
    payment_type: "Cash",
    bank_id: "",
    transaction_type: "Received",
    remark: "",
  });

  useEffect(() => {
    loadBanks();
  }, []);

  const loadBanks = async () => {
    const res = await getBanks();
    setBanks(res.data.data || []);
  };

  const loadLoans = async () => {
    const res = await getDirectorLoanList();
    setLoanList(res.data.data || []);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const submitForm = async () => {
    if (form.payment_type === "Online" && !form.bank_id) {
      return alert("Select bank for online payment");
    }

    await addDirectorLoan(form);
    alert("Saved Successfully");

    setForm({
      loan_date: new Date().toISOString().split("T")[0],
      director_name: "",
      amount: "",
      payment_type: "Cash",
      bank_id: "",
      transaction_type: "Received",
      remark: "",
    });
  };

  return (
    <Box>

      {/* Toggle */}
      <Box mb={3} display="flex" gap={2}>
        <Button
          variant={!showView ? "contained" : "outlined"}
          onClick={() => setShowView(false)}
        >
          New Entry
        </Button>

        <Button
          variant={showView ? "contained" : "outlined"}
          onClick={() => {
            setShowView(true);
            loadLoans();
          }}
        >
          View Records
        </Button>
      </Box>

      {/* ========================= VIEW RECORDS ========================= */}
      {showView && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>
            Director Loan Records
          </Typography>

          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#1976d2" }}>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>Date</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Director</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Amount</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Type</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Payment</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Bank</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Remark</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loanList.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.loan_date}</TableCell>
                    <TableCell>{l.director_name}</TableCell>
                    <TableCell>₹{l.amount}</TableCell>
                    <TableCell>{l.transaction_type}</TableCell>
                    <TableCell>{l.payment_type}</TableCell>
                    <TableCell>
                      {l.bank_name ? `${l.bank_name} (${l.account_no})` : "-"}
                    </TableCell>
                    <TableCell>{l.remark}</TableCell>
                  </TableRow>
                ))}

                {loanList.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      No records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* ========================= NEW ENTRY FORM ========================= */}
      {!showView && (
        <Paper sx={{ p: 3, maxWidth: 550 }}>
          <Typography variant="h5" mb={2}>
            Director Loan
          </Typography>

          <TextField
            label="Date"
            type="date"
            name="loan_date"
            value={form.loan_date}
            onChange={handleChange}
            fullWidth
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Director Name"
            name="director_name"
            value={form.director_name}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            label="Amount"
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          />

          <TextField
            select
            label="Transaction Type"
            name="transaction_type"
            value={form.transaction_type}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="Received">Received From Director</MenuItem>
            <MenuItem value="Given">Given To Director</MenuItem>
          </TextField>

          <TextField
            select
            label="Payment Type"
            name="payment_type"
            value={form.payment_type}
            onChange={handleChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Online">Online</MenuItem>
          </TextField>

          {form.payment_type === "Online" && (
            <TextField
              select
              label="Select Bank"
              name="bank_id"
              value={form.bank_id}
              onChange={handleChange}
              fullWidth
              sx={{ mb: 2 }}
            >
              {banks.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.bank_name} — {b.account_no}
                </MenuItem>
              ))}
            </TextField>
          )}

          <TextField
            label="Remark"
            name="remark"
            value={form.remark}
            onChange={handleChange}
            fullWidth
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

export default DirectorLoan;
