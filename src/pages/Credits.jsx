import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  TableBody,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  TextField,
  MenuItem,
  Divider,
} from "@mui/material";

import {
  getSalesOutstanding,
  getPurchaseOutstanding,
  updateSaleOutstanding,
  updatePurchaseOutstanding,
} from "../api/payments";

import { getBanks } from "../api/master";

const Payments = () => {
  const [customers, setCustomers] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [banks, setBanks] = useState([]);

  const [open, setOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  const [type, setType] = useState("customer"); // customer | supplier

  const [payment, setPayment] = useState({
    amount: "",
    payment_type: "Cash",
    bank_id: "",
  });

  useEffect(() => {
    loadCustomers();
    loadSuppliers();
    loadBanks();
  }, []);

  const loadCustomers = async () => {
    const res = await getSalesOutstanding();
    setCustomers(res.data.data || []);
  };

  const loadSuppliers = async () => {
    const res = await getPurchaseOutstanding();
    setSuppliers(res.data.data || []);
  };

  const loadBanks = async () => {
    const res = await getBanks();
    setBanks(res.data.data || []);
  };

  const handleOpen = (row, t) => {
    setType(t);
    setSelectedParty(row);
    setPayment({ amount: "", payment_type: "Cash", bank_id: "" });
    setOpen(true);
  };

  const submitPayment = async () => {
    try {
      const payload = {
        amount: Number(payment.amount),
        payment_type: payment.payment_type,
        bank_id:
          payment.payment_type === "Online"
            ? Number(payment.bank_id)
            : null,
      };

      if (type === "customer") {
        payload.customer_name = selectedParty.customer_name;
        await updateSaleOutstanding(payload);
        loadCustomers();
      } else {
        payload.supplier_name = selectedParty.supplier_name;
        await updatePurchaseOutstanding(payload);
        loadSuppliers();
      }

      setOpen(false);
    } catch (err) {
      alert(err?.response?.data?.msg || "Payment update failed");
    }
  };

  return (
    <Box p={3}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Payments & Ledgers
      </Typography>

      {/* CUSTOMER TABLE */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6">Customer Outstanding</Typography>
        <Divider sx={{ my: 2 }} />

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f1f3f5" }}>
              <TableRow>
                <TableCell><b>Customer</b></TableCell>
                <TableCell><b>Total Sale</b></TableCell>
                <TableCell><b>Outstanding</b></TableCell>
                <TableCell><b>Action</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {customers.map((c) => (
                <TableRow key={c.customer_name}>
                  <TableCell>{c.customer_name}</TableCell>
                  <TableCell>₹{c.total_sale}</TableCell>
                  <TableCell sx={{ color: "red", fontWeight: 700 }}>
                    ₹{c.outstanding}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      onClick={() => handleOpen(c, "customer")}
                    >
                      Receive
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {!customers.length && (
                <TableRow>
                  <TableCell colSpan={4} align="center">No outstanding</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* SUPPLIER TABLE */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6">Supplier Outstanding</Typography>
        <Divider sx={{ my: 2 }} />

        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "#f1f3f5" }}>
              <TableRow>
                <TableCell><b>Supplier</b></TableCell>
                <TableCell><b>Total Purchase</b></TableCell>
                <TableCell><b>Outstanding</b></TableCell>
                <TableCell><b>Action</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {suppliers.map((s) => (
                <TableRow key={s.supplier_name}>
                  <TableCell>{s.supplier_name}</TableCell>
                  <TableCell>₹{s.total_purchase}</TableCell>
                  <TableCell sx={{ color: "red", fontWeight: 700 }}>
                    ₹{s.outstanding}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      onClick={() => handleOpen(s, "supplier")}
                    >
                      Pay
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {!suppliers.length && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No outstanding
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 700 }}>
          {type === "customer" ? "Receive Customer Payment" : "Pay Supplier"}
        </DialogTitle>

        <DialogContent>
          <Typography>
            <b>Name:</b>{" "}
            {type === "customer"
              ? selectedParty?.customer_name
              : selectedParty?.supplier_name}
          </Typography>

          <Typography mb={2}>
            <b>Outstanding:</b>{" "}
            <span style={{ color: "red", fontWeight: 700 }}>
              ₹
              {type === "customer"
                ? selectedParty?.outstanding
                : selectedParty?.outstanding}
            </span>
          </Typography>

          <TextField
            label="Amount"
            type="number"
            fullWidth
            sx={{ mb: 2 }}
            value={payment.amount}
            onChange={(e) =>
              setPayment({ ...payment, amount: e.target.value })
            }
          />

          <TextField
            label="Payment Type"
            fullWidth
            select
            sx={{ mb: 2 }}
            value={payment.payment_type}
            onChange={(e) =>
              setPayment({ ...payment, payment_type: e.target.value })
            }
          >
            <MenuItem value="Cash">Cash</MenuItem>
            <MenuItem value="Online">Online</MenuItem>
          </TextField>

          {payment.payment_type === "Online" && (
            <TextField
              label="Select Bank"
              select
              fullWidth
              sx={{ mb: 2 }}
              value={payment.bank_id}
              onChange={(e) =>
                setPayment({ ...payment, bank_id: e.target.value })
              }
            >
              {banks.map((b) => (
                <MenuItem key={b.id} value={b.id}>
                  {b.bank_name} — {b.account_no}
                </MenuItem>
              ))}
            </TextField>
          )}

          <Button
            fullWidth
            variant="contained"
            sx={{ py: 1.2 }}
            onClick={submitPayment}
          >
            Save Payment
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Payments;
