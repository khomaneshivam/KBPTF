// src/pages/ExpenseMaster.jsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Box, Paper, Grid, TextField, Button, Typography,
  MenuItem, Table, TableContainer, TableRow, TableHead,
  TableCell, TableBody, IconButton, TablePagination, CircularProgress
} from "@mui/material";
import { Delete } from "@mui/icons-material";

import { addExpense, getExpenses, deleteExpense } from "../../api/expense";
import { getBanks } from "../../api/master";

const ExpenseMaster = () => {
  const [showView, setShowView] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const [expenses, setExpenses] = useState([]);
  const [banks, setBanks] = useState([]);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const categories = [
    "Rent & Utilities","Fuel","Transport","Salary","Bank Charges",
    "Maintenance","Marketing","Software / SaaS","Purchase Related","Misc"
  ];

  const [formData, setFormData] = useState({
    expense_name: "",
    expense_category: "",
    amount: "",
    expense_date: new Date().toISOString().split("T")[0],
    payment_type: "Cash",
    vendor_name: "",
    invoice_number: "",
    remarks: "",
    bank_id: "",
  });

  // Load Banks dropdown (important)
  useEffect(() => {
    (async () => {
      try {
        const res = await getBanks();
        setBanks(res.data.data || []);
      } catch (err) {
        console.error("Bank load failed:", err);
      }
    })();
  }, []);

  /** PARSER — makes API response stable regardless of backend shape */
  const parseExpenseResponse = (res) => {
    try {
      if (!res || !res.data) return { records: [], total: 0 };

      if (res.data.data?.records) {
        return { records: res.data.data.records, total: res.data.data.total };
      }

      if (Array.isArray(res.data.data)) {
        return { records: res.data.data, total: res.data.data.length };
      }

      if (res.data.records) {
        return { records: res.data.records, total: res.data.total };
      }

      if (Array.isArray(res.data)) {
        return { records: res.data, total: res.data.length };
      }

      return { records: [], total: 0 };
    } catch (e) {
      console.error("parseExpenseResponse error:", e);
      return { records: [], total: 0 };
    }
  };

  /** FETCH EXPENSES */
  const loadExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getExpenses(page, rowsPerPage);
      const { records, total } = parseExpenseResponse(res);
      setExpenses(records || []);
      setTotal(total || 0);
    } catch (err) {
      setErrorMsg(err?.response?.data?.msg || "Failed to fetch expenses");
    }
    setLoading(false);
  }, [page, rowsPerPage]);

  useEffect(() => {
    if (showView) loadExpenses();
  }, [showView, page, rowsPerPage, loadExpenses]);

  /** HANDLERS */
  const handleChange = (e) => {
    let { name, value } = e.target;

    if (name === "amount") value = Number(value) || "";
    setFormData({ ...formData, [name]: value });
  };

  /** SUBMIT */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.payment_type === "Online" && !formData.bank_id) {
      return alert("Select bank for online payment");
    }

    try {
      await addExpense(formData);
      alert("Expense added");

      setFormData({
        expense_name: "",
        expense_category: "",
        amount: "",
        expense_date: new Date().toISOString().split("T")[0],
        payment_type: "Cash",
        vendor_name: "",
        invoice_number: "",
        remarks: "",
        bank_id: "",
      });

      setPage(0);
      if (showView) loadExpenses();
    } catch (err) {
      alert(err?.response?.data?.msg || "Failed to add expense");
    }
  };

  return (
    <Box>
      {/* TOGGLE */}
      <Box mb={3} display="flex" gap={2}>
        <Button
          variant={!showView ? "contained" : "outlined"}
          onClick={() => setShowView(false)}
        >
          New Expense
        </Button>

        <Button
          variant={showView ? "contained" : "outlined"}
          onClick={() => {
            setShowView(true);
            setPage(0);
          }}
        >
          View Expenses
        </Button>
      </Box>

      {/* VIEW MODE */}
      {showView ? (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" mb={2}>Expense List</Typography>

          {loading ? (
            <Box py={6} display="flex" justifyContent="center">
              <CircularProgress />
            </Box>
          ) : errorMsg ? (
            <Typography color="error">{errorMsg}</Typography>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead sx={{ bgcolor: "#1976d2" }}>
                    <TableRow>
                      <TableCell sx={{ color: "#fff" }}>Name</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Category</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Amount</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Date</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Vendor</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Payment</TableCell>
                      <TableCell sx={{ color: "#fff" }}>Action</TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {expenses.map((ex) => (
                      <TableRow key={ex.id} hover>
                        <TableCell>{ex.expense_name}</TableCell>
                        <TableCell>{ex.expense_category}</TableCell>
                        <TableCell>₹{ex.amount}</TableCell>
                        <TableCell>{ex.expense_date}</TableCell>
                        <TableCell>{ex.vendor_name || "-"}</TableCell>
                        <TableCell>{ex.payment_type}</TableCell>

                        <TableCell>
                          <IconButton
                            color="error"
                            onClick={async () => {
                              await deleteExpense(ex.id);
                              loadExpenses();
                            }}
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <TablePagination
                component="div"
                count={total}
                page={page}
                rowsPerPage={rowsPerPage}
                onPageChange={(e, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </>
          )}
        </Paper>
      ) : (
        /* NEW EXPENSE FORM */
        <form onSubmit={handleSubmit}>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField label="Date" name="expense_date" type="date" value={formData.expense_date} onChange={handleChange} fullWidth InputLabelProps={{ shrink: true }} required />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField label="Expense Name" name="expense_name" value={formData.expense_name} onChange={handleChange} fullWidth required />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField label="Category" name="expense_category" select value={formData.expense_category} onChange={handleChange} fullWidth required>
                  {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField label="Amount (₹)" name="amount" type="number" value={formData.amount} onChange={handleChange} fullWidth required />
              </Grid>
    <Grid item xs={12} sx={{ display: "block", width: "100%"}}></Grid>

              

              <Grid item xs={12} sm={4}>
                <TextField name="payment_type" label="Payment Type" select value={formData.payment_type} onChange={handleChange} fullWidth>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Online">Online</MenuItem>
                  <MenuItem value="Credit">Credit</MenuItem>
                </TextField>
              </Grid>

              {/* BANK DROPDOWN ONLY WHEN ONLINE */}
              {formData.payment_type === "Online" && (
                <Grid item xs={12} sm={4}>
                  <TextField label="Select Bank" name="bank_id" select value={formData.bank_id} onChange={handleChange} fullWidth required>
                    <MenuItem value="">-- Select Bank --</MenuItem>
                    {banks.map(b => (
                      <MenuItem key={b.id} value={b.id}>
                        {b.bank_name} — {b.account_no}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}

              <Grid item xs={12} sm={4}>
                <TextField label="Vendor Name" name="vendor_name" value={formData.vendor_name} onChange={handleChange} fullWidth />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField label="Invoice Number" name="invoice_number" value={formData.invoice_number} onChange={handleChange} fullWidth />
              </Grid>

              <Grid item xs={12}>
                <TextField label="Remarks" name="remarks" value={formData.remarks} onChange={handleChange} fullWidth multiline rows={2} />
              </Grid>
            </Grid>

            <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
              Save Expense
            </Button>
          </Paper>
        </form>
      )}
    </Box>
  );
};

export default ExpenseMaster;
