// src/pages/CreateSale.jsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Paper,
  Grid,
  TextField,
  Button,
  Typography,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";

import { getItems } from "../api/master.js"; // should return { data: { data: [...] } }
import { getBanks } from "../api/master.js"; // should return { data: { data: [...] } }
import { addSale, getSales } from "../api/sales.js"; // addSale expects sale object
import { getParties } from "../api/master.js";
const CreateSale = () => {
  const [showView, setShowView] = useState(false);
  const [salesList, setSalesList] = useState([]);

  const [items, setItems] = useState([]);
  const [bankList, setBankList] = useState([]);
const [page, setPage] = useState(1);
const [limit] = useState(10);
const [total, setTotal] = useState(0);

  // FORM STATE
  const [formData, setFormData] = useState({
    invoice_number: "",
    sale_date: new Date().toISOString().split("T")[0],
    customer_name: "",
    customer_contact: "",
    vehicle_no: "",
    // legacy single payment type (keeps UI familiarity) - but actual amounts are captured in cash/online fields
    payment_type: "Credit",
    remarks: "",
    bank_id: null, // selected bank id when online payment used
    cash_received: 0,
    online_received: 0,
  });

  // Items on this sale
  const [saleItems, setSaleItems] = useState([]);

  // Item selector
  const [currentItem, setCurrentItem] = useState({
    item_id: "",
    itemName: "",
    unit: "",
    quantity: 1,
    sale_price: 0,
  });

  // Totals
  const [totals, setTotals] = useState({
    sub_total: 0,
    discount_amount: 0,
    gst_amount: 0,
    final_amount: 0,
  });

  // Load dropdowns
  useEffect(() => {
    (async () => {
      try {
        const [itRes, bRes] = await Promise.all([getItems(), getBanks()]);
        setItems(itRes?.data?.data || []);
        setBankList(bRes?.data?.data || []);
      } catch (err) {
        console.error("Dropdown load failed:", err);
      }
    })();
  }, []);

  // Load sales list for view
  const loadSalesList = async (pageNo = page) => {
  try {
    const res = await getSales(pageNo, limit); // <-- backend must accept ?page & ?limit
    setSalesList(res.data.data || []);
    setTotal(res.data.total || 0);
  } catch (err) {
    console.error("Failed to load sales:", err);
  }
};
const [customers, setCustomers] = useState([]);

useEffect(() => {
  (async () => {
    try {
      const partyRes = await getParties(); // your API
      setCustomers(partyRes?.data?.data || []);
    } catch (err) {
      console.error("Failed to load customers:", err);
    }
  })();
}, []);

  // Recalculate totals & final_amount when items or discount/gst change
useEffect(() => {
  const subTotal = saleItems.reduce(
    (acc, it) => acc + Number(it.quantity) * Number(it.sale_price),
    0
  );

  // GST Amount = Subtotal * (GST% / 100)
  const gstAmt =
    (Number(totals.gst_percentage || 0) / 100) * Number(subTotal || 0);

  const finalAmount =
    Number(subTotal || 0) -
    Number(totals.discount_amount || 0) +
    Number(gstAmt || 0);

  setTotals((prev) => ({
    ...prev,
    sub_total: subTotal,
    gst_amount: gstAmt,         // auto calculated
    final_amount: finalAmount,
  }));
}, [saleItems, totals.discount_amount, totals.gst_percentage]);

  // Compute amount received & outstanding derived values
  const amountReceived = Number(formData.cash_received || 0) + Number(formData.online_received || 0);
  const outstanding = Number(totals.final_amount || 0) - amountReceived;

  // Handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    // keep numeric fields as numbers in state
    if (name === "cash_received" || name === "online_received") {
      setFormData({ ...formData, [name]: value === "" ? "" : Number(value) });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleTotalsChange = (e) => {
    const { name, value } = e.target;
    setTotals({ ...totals, [name]: value === "" ? "" : Number(value) });
  };

  const handleCurrentItemChange = (e) => {
    const { name, value } = e.target;
    if (name === "item_id") {
      const selected = items.find((i) => i.id === value);
      if (selected) {
        setCurrentItem({
          item_id: selected.id,
          itemName: selected.itemName,
          unit: selected.unit,
          quantity: 1,
          sale_price: selected.price || 0,
        });
      } else {
        setCurrentItem({ ...currentItem, item_id: value });
      }
      return;
    }
    setCurrentItem({ ...currentItem, [name]: value });
  };

  const handleAddItem = () => {
    if (!currentItem.item_id) return alert("Select item");
    if (!currentItem.quantity || currentItem.quantity <= 0) return alert("Enter valid quantity");
    setSaleItems((s) => [...s, { ...currentItem, id: Date.now() }]);
    setCurrentItem({
      item_id: "",
      itemName: "",
      unit: "",
      quantity: 1,
      sale_price: 0,
    });
  };

  const handleRemoveItem = (id) => setSaleItems((s) => s.filter((it) => it.id !== id));

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saleItems.length === 0) return alert("Add at least one item.");

    // Build payload fields exactly as backend expects:
    const payload = {
      invoice_number: formData.invoice_number,
      sale_date: formData.sale_date,
      customer_name: formData.customer_name,
      customer_contact: formData.customer_contact,
      vehicle_no: formData.vehicle_no,
      sub_total: totals.sub_total,
      discount_amount: totals.discount_amount || 0,
      gst_amount: totals.gst_amount || 0,
      final_amount: totals.final_amount,
      // store both split columns
      cash_received: Number(formData.cash_received || 0),
      online_received: Number(formData.online_received || 0),
      // legacy single field for compatibility (sum of both)
      amount_received: amountReceived,
      // outstanding to store on DB (final - received)
      outstanding: outstanding,
      // record which bank got the online amount (nullable)
      bank_id: Number(formData.bank_id) || null,
      payment_type: formData.payment_type || "Credit",
      remarks: formData.remarks || "",
      // items mapping: backend expects item.item_id, quantity, sale_price
      items: saleItems.map((it) => ({
        item_id: it.item_id || null,
        quantity: Number(it.quantity),
        sale_price: Number(it.sale_price),
      })),
    };

    try {
      await addSale(payload);
      alert("Sale saved successfully.");

      // reset form
      setFormData({
        invoice_number: "",
        sale_date: new Date().toISOString().split("T")[0],
        customer_name: "",
        customer_contact: "",
        vehicle_no: "",
        payment_type: "Credit",
        remarks: "",
        bank_id: null,
        cash_received: 0,
        online_received: 0,
      });
      setSaleItems([]);
      setTotals({ sub_total: 0, discount_amount: 0, gst_amount: 0, final_amount: 0 });
      // optionally refresh list
      loadSalesList();
    } catch (err) {
      console.error("Save failed:", err);
      alert(err?.response?.data?.msg || "Save failed");
    }
  };

  return (
    <Box>
      {/* Toggle */}
      <Box mb={3} display="flex" gap={2}>
        <Button variant={!showView ? "contained" : "outlined"} onClick={() => setShowView(false)}>
          New Sale
        </Button>
        <Button
          variant={showView ? "contained" : "outlined"}
          onClick={() => {
            setShowView(true);
            loadSalesList();
          }}
        >
          View Sales
        </Button>
      </Box>

      {/* VIEW */}
    {/* VIEW */}
{showView && (
  <Paper sx={{ p: 2, mb: 3 }}>
    <Typography variant="h6" mb={2}>
      Sales List
    </Typography>

    <TableContainer>
      <Table>
        <TableHead sx={{ background: "#1976d2" }}>
          <TableRow>
            <TableCell sx={{ color: "#fff" }}>Invoice</TableCell>
            <TableCell sx={{ color: "#fff" }}>Customer</TableCell>
            <TableCell sx={{ color: "#fff" }}>Contact</TableCell>
            <TableCell sx={{ color: "#fff" }}>Amount</TableCell>
            <TableCell sx={{ color: "#fff" }}>Cash</TableCell>
            <TableCell sx={{ color: "#fff" }}>Online</TableCell>
            <TableCell sx={{ color: "#fff" }}>Outstanding</TableCell>
            <TableCell sx={{ color: "#fff" }}>Bill</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {salesList.map((sale) => (
            <TableRow key={sale.id}>
              <TableCell>{sale.invoice_number}</TableCell>
              <TableCell>{sale.customer_name}</TableCell>
              <TableCell>{sale.customer_contact}</TableCell>
              <TableCell>
                ₹{Number(sale.final_amount || 0).toFixed(2)}
              </TableCell>

              <TableCell>
                ₹{Number(sale.cash_received || 0).toFixed(2)}
              </TableCell>

              <TableCell>
                ₹{Number(sale.online_received || 0).toFixed(2)}
              </TableCell>

              <TableCell style={{ color: "red", fontWeight: 600 }}>
                ₹{Number(sale.outstanding || 0).toFixed(2)}
              </TableCell>

              {/* PRINT BILL BTN */}
              <TableCell>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => window.open(`/bill/${sale.id}`, "_blank")}
                >
                  Print Bill
                </Button>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    {/* PAGINATION */}
    <Stack spacing={2} sx={{ mt: 3 }} alignItems="center">
      <Pagination
        count={Math.ceil(total / limit)}
        page={page}
        onChange={(e, val) => {
          setPage(val);
          loadSalesList(val);
        }}
        color="primary"
      />
    </Stack>
  </Paper>
)}

      {/* NEW SALE FORM */}
      {!showView && (
        <form onSubmit={handleSubmit}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField
                  name="invoice_number"
                  label="Invoice No"
                  value={formData.invoice_number}
                  onChange={handleFormChange}
                  fullWidth
                  required
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  name="sale_date"
                  label="Sale Date"
                  type="date"
                  value={formData.sale_date}
                  onChange={handleFormChange}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>

              {/* CUSTOMER NAME DROPDOWN (Only party_type = Customer) */}
{/* CUSTOMER SELECT */}
<Grid item xs={12} sm={3}>
  <TextField
    name="customer_name"
    label="Select Customer"
    value={formData.customer_name}
    onChange={(e) => {
      const name = e.target.value;

      // Find full customer record
      const sel = customers.find(c => c.name === name);

      setFormData({
        ...formData,
        customer_name: name,
        customer_contact: sel?.contact || ""  // <-- AUTO FILL CONTACT
      });
    }}
    select
    fullWidth
  >
    {customers
      ?.filter(c => c.party_type === "Customer")
      .map(c => (
        <MenuItem key={c.id} value={c.name}>
          {c.name}
        </MenuItem>
      ))
    }
  </TextField>
</Grid>

{/* CONTACT FIELD (auto-filled but editable) */}
<Grid item xs={12} sm={3}>
  <TextField
    name="customer_contact"
    label="Contact"
    value={formData.customer_contact}
    onChange={handleFormChange}
    fullWidth
  />
</Grid>


{/* VEHICLE NUMBER (Manual) */}
<Grid item xs={12} sm={3}>
  <TextField
    name="vehicle_no"
    label="Vehicle No"
    value={formData.vehicle_no}
    onChange={handleFormChange}
    fullWidth
  />
</Grid>

            </Grid>
          </Paper>

          {/* Add Item */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" mb={2}>
              Add Item
            </Typography>

            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} sm={4}>
                <TextField
                  name="item_id"
                  label="Select Item"
                  value={currentItem.item_id}
                  onChange={handleCurrentItemChange}
                  select
                  fullWidth
                >
                  {items
  .filter(i => i.category === "Selling")  // ONLY items marked as Selling
  .map(i => (
    <MenuItem key={i.id} value={i.id}>
      {i.itemName} ({i.itemCode})
    </MenuItem>
  ))
}

                </TextField>
              </Grid>

              <Grid item xs={6} sm={2}>
                <TextField label="Unit" value={currentItem.unit} fullWidth disabled />
              </Grid>

              <Grid item xs={6} sm={2}>
                <TextField
                  name="quantity"
                  label="Qty"
                  type="number"
                  value={currentItem.quantity}
                  onChange={handleCurrentItemChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={6} sm={2}>
                <TextField
                  name="sale_price"
                  label="Rate"
                  type="number"
                  value={currentItem.sale_price}
                  onChange={handleCurrentItemChange}
                  fullWidth
                />
              </Grid>

              <Grid item xs={6} sm={2}>
                <Button variant="contained" fullWidth onClick={handleAddItem}>
                  Add Item
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Items Table */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Item</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Qty</TableCell>
                    <TableCell>Rate</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {saleItems.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell>{it.itemName}</TableCell>
                      <TableCell>{it.unit}</TableCell>
                      <TableCell>{it.quantity}</TableCell>
                      <TableCell>₹{Number(it.sale_price).toFixed(2)}</TableCell>
                      <TableCell>₹{(it.quantity * it.sale_price).toFixed(2)}</TableCell>
                      <TableCell>
                        <IconButton color="error" onClick={() => handleRemoveItem(it.id)}>
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Totals & Payments */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  name="payment_type"
                  label="Primary Payment Type"
                  value={formData.payment_type}
                  onChange={handleFormChange}
                  select
                  fullWidth
                >
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Online">Online</MenuItem>
                  <MenuItem value="Online/cash">Online/Cash</MenuItem>
                  <MenuItem value="Credit">Credit</MenuItem>
                </TextField>

                {/* Show bank dropdown if online_received > 0 or payment_type === Online */}
                {(Number(formData.online_received || 0) > 0 || formData.payment_type === "Online" || formData.payment_type === "Online/cash") && (
                  <TextField
                    sx={{ mt: 2 }}
                    name="bank_id"
                    label="Select Bank (for online part)"
                    value={formData.bank_id || ""}
                    onChange={handleFormChange}
                    select
                    fullWidth
                  >
                    <MenuItem value="">-- Select bank --</MenuItem>
                    {bankList.map((b) => (
                      <MenuItem key={b.id} value={b.id}>
                        {b.bank_name} — {b.account_no}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                <TextField
                  sx={{ mt: 2 }}
                  name="remarks"
                  label="Remarks"
                  value={formData.remarks}
                  onChange={handleFormChange}
                  fullWidth
                  multiline
                  rows={2}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography>Sub Total</Typography>
                  <Typography>₹{Number(totals.sub_total || 0).toFixed(2)}</Typography>
                </Box>

                <TextField
                  name="discount_amount"
                  label="Discount (₹)"
                  type="number"
                  value={totals.discount_amount || 0}
                  onChange={handleTotalsChange}
                  fullWidth
                  sx={{ mb: 1 }}
                />

                <TextField
  name="gst_percentage"
  label="GST %"
  type="number"
  value={totals.gst_percentage || 0}
  onChange={handleTotalsChange}
  fullWidth
  sx={{ mb: 1 }}
/>


                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="cash_received"
                      label="Cash Received (₹)"
                      type="number"
                      value={formData.cash_received ?? 0}
                      onChange={handleFormChange}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      name="online_received"
                      label="Online Received (₹)"
                      type="number"
                      value={formData.online_received ?? 0}
                      onChange={handleFormChange}
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="h6">Amount Received</Typography>
                  <Typography variant="h6">₹{amountReceived.toFixed(2)}</Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="h5">Outstanding</Typography>
                  <Typography variant="h5" color={outstanding > 0 ? "error" : "text.primary"}>
                    ₹{outstanding.toFixed(2)}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="space-between" mt={2}>
                  <Typography variant="h5">Final Amount</Typography>
                  <Typography variant="h5">₹{Number(totals.final_amount || 0).toFixed(2)}</Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>

          <Button type="submit" variant="contained" color="primary" fullWidth size="large">
            Save Sale
          </Button>
        </form>
      )}
    </Box>
  );
};

export default CreateSale;
