// src/pages/PurchaseMaster.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Paper, Grid, TextField, Button, Typography,
  MenuItem, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, IconButton, Stack, Pagination
} from "@mui/material";
import { Delete } from "@mui/icons-material";

import { getItems, getParties, getBanks } from "../api/master";
import { createPurchase as addPurchase, getAllPurchases as getPurchases } from "../api/purchase";

const PurchaseMaster = () => {
  const [showView, setShowView] = useState(false);

  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [banks, setBanks] = useState([]);
  const [purchaseList, setPurchaseList] = useState([]);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [formData, setFormData] = useState({
    purchase_number: "",
    purchase_date: new Date().toISOString().split("T")[0],
    supplier_id: "",
    supplier_name: "",
    supplier_contact: "",
    supplier_address: "",
    vehicle_no: "",
    payment_type: "Cash",
    bank_id: "",
    cash_paid: 0,
    online_paid: 0,
    remarks: "",
  });

  const [purchaseItems, setPurchaseItems] = useState([]);

  const [currentItem, setCurrentItem] = useState({
    item_id: "",
    itemName: "",
    unit: "",
    quantity: 1,
    purchase_price: 0,
  });

  const [totals, setTotals] = useState({
    sub_total: 0,
    discount_amount: 0,
    gst_percentage: 0,
    gst_amount: 0,
    final_amount: 0,
  });

  // load masters
  useEffect(() => {
    (async () => {
      try {
        const [itRes, partyRes, bankRes] = await Promise.all([getItems(), getParties(), getBanks()]);
        setItems(itRes?.data?.data || []);
        setSuppliers((partyRes?.data?.data || []).filter(p => p.party_type === "Supplier"));
        setBanks(bankRes?.data?.data || []);
      } catch (err) {
        console.error("Master load failed:", err);
      }
    })();
  }, []);

  // load purchases
  const loadPurchases = async (pageNo = page) => {
    try {
      const res = await getPurchases(pageNo, limit);
      setPurchaseList(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load purchases:", err);
    }
  };

  // totals calc
  useEffect(() => {
    const subTotal = purchaseItems.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.purchase_price || 0), 0);
    const gstAmt = (Number(totals.gst_percentage || 0) / 100) * Number(subTotal || 0);
    const finalAmount = Number(subTotal || 0) - Number(totals.discount_amount || 0) + Number(gstAmt || 0);
    setTotals(prev => ({ ...prev, sub_total: subTotal, gst_amount: gstAmt, final_amount: finalAmount }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [purchaseItems, totals.discount_amount, totals.gst_percentage]);

  const amountPaid = Number(formData.cash_paid || 0) + Number(formData.online_paid || 0);
  const outstanding = Number(totals.final_amount || 0) - amountPaid;

  // input handlers
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "cash_paid" || name === "online_paid") {
      setFormData({ ...formData, [name]: value === "" ? "" : Number(value) });
      return;
    }
    setFormData({ ...formData, [name]: value });
  };

  const handleTotalsChange = (e) => {
    const { name, value } = e.target;
    setTotals({ ...totals, [name]: Number(value || 0) });
  };

  const handleCurrentItemChange = (e) => {
    const { name, value } = e.target;
    if (name === "item_id") {
      const sel = items.find((i) => i.id === value);
      if (sel) {
        setCurrentItem({ item_id: sel.id, itemName: sel.itemName, unit: sel.unit, quantity: 1, purchase_price: sel.price || 0 });
      } else {
        setCurrentItem({ ...currentItem, item_id: value });
      }
      return;
    }
    setCurrentItem({ ...currentItem, [name]: value });
  };

  const addItem = () => {
    if (!currentItem.item_id) return alert("Select an item");
    if (!currentItem.quantity || currentItem.quantity <= 0) return alert("Enter valid quantity");
    setPurchaseItems([...purchaseItems, { ...currentItem, id: Date.now() }]);
    setCurrentItem({ item_id: "", itemName: "", unit: "", quantity: 1, purchase_price: 0 });
  };

  const removeItem = (id) => setPurchaseItems(purchaseItems.filter((it) => it.id !== id));

  // submit purchase
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (purchaseItems.length === 0) return alert("Add items first.");
    if (Number(formData.online_paid || 0) > 0 && !formData.bank_id) return alert("Select bank when online payment is used.");

    const payload = {
      purchase_number: formData.purchase_number,
      purchase_date: formData.purchase_date,
      supplier_id: formData.supplier_id || null,
      supplier_name: formData.supplier_name,
      supplier_contact: formData.supplier_contact,
      supplier_address: formData.supplier_address,
      vehicle_no: formData.vehicle_no,
      sub_total: totals.sub_total,
      discount_amount: totals.discount_amount || 0,
      gst_amount: totals.gst_amount || 0,
      final_amount: totals.final_amount,
      cash_paid: Number(formData.cash_paid || 0),
      online_paid: Number(formData.online_paid || 0),
      bank_id: Number(formData.bank_id) || null,
      amount_paid: amountPaid,
      outstanding: outstanding,
      payment_type: formData.payment_type || "Cash",
      remarks: formData.remarks || "",
      items: purchaseItems.map((it) => ({
        item_id: it.item_id || null,
        item_name: it.itemName,
        unit: it.unit,
        quantity: Number(it.quantity),
        purchase_price: Number(it.purchase_price),
      })),
    };

    try {
      await addPurchase(payload);
      alert("Purchase Saved.");
      // reset
      setFormData({
        purchase_number: "",
        purchase_date: new Date().toISOString().split("T")[0],
        supplier_id: "",
        supplier_name: "",
        supplier_contact: "",
        supplier_address: "",
        vehicle_no: "",
        payment_type: "Cash",
        bank_id: "",
        cash_paid: 0,
        online_paid: 0,
        remarks: "",
      });
      setPurchaseItems([]);
      setTotals({ sub_total: 0, discount_amount: 0, gst_percentage: 0, gst_amount: 0, final_amount: 0 });
      loadPurchases(1);
    } catch (err) {
      console.error("Failed to save purchase", err);
      alert(err?.response?.data?.msg || "Failed to save purchase");
    }
  };

  // when supplier selection changes, auto-fill fields
  useEffect(() => {
    if (!formData.supplier_id) return;
    const s = suppliers.find((sup) => sup.id === formData.supplier_id);
    if (s) {
      setFormData((p) => ({ ...p, supplier_name: s.name, supplier_contact: s.contact || "", supplier_address: s.address || "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.supplier_id]);

  return (
    <Box>
      {/* Toggle buttons */}
      <Box mb={3} display="flex" gap={2}>
        <Button variant={!showView ? "contained" : "outlined"} onClick={() => setShowView(false)}>New Purchase</Button>
        <Button variant={showView ? "contained" : "outlined"} onClick={() => { setShowView(true); loadPurchases(1); }}>View Purchases</Button>
      </Box>

      {/* VIEW PURCHASE LIST */}
      {showView && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" mb={2}>Purchase Records</Typography>
          <TableContainer>
            <Table size="small">
              <TableHead sx={{ bgcolor: "#1976d2" }}>
                <TableRow>
                  <TableCell sx={{ color: "#fff" }}>No</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Supplier</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Contact</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Date</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Amount</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Cash</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Online</TableCell>
                  <TableCell sx={{ color: "#fff" }}>Payment Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {purchaseList.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.purchase_number}</TableCell>
                    <TableCell>{p.supplier_name}</TableCell>
                    <TableCell>{p.supplier_contact}</TableCell>
                    <TableCell>{p.purchase_date}</TableCell>
                    <TableCell>₹{Number(p.final_amount || 0).toFixed(2)}</TableCell>
                    <TableCell>₹{Number(p.cash_paid || 0).toFixed(2)}</TableCell>
                    <TableCell>₹{Number(p.online_paid || 0).toFixed(2)}</TableCell>
                    <TableCell>{p.payment_type}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack spacing={2} sx={{ mt: 2 }} alignItems="center">
            <Pagination count={Math.ceil(total / limit) || 1} page={page} onChange={(e, val) => { setPage(val); loadPurchases(val); }} color="primary" />
          </Stack>
        </Paper>
      )}

      {/* NEW PURCHASE FORM */}
      {!showView && (
        <form onSubmit={handleSubmit}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3}>
                <TextField name="purchase_number" label="KBS No" value={formData.purchase_number} onChange={handleFormChange} fullWidth />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField name="purchase_date" label="Date" type="date" value={formData.purchase_date} onChange={handleFormChange} fullWidth InputLabelProps={{ shrink: true }} />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField name="supplier_id" label="Select Supplier" value={formData.supplier_id} onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })} select fullWidth>
                  {suppliers.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField name="vehicle_no" label="Vehicle No" value={formData.vehicle_no} onChange={handleFormChange} fullWidth />
              </Grid>
    <Grid item xs={12} sx={{ display: "block", width: "100%"}}></Grid>

              <Grid item xs={12} sm={3}>
                <TextField label="Contact" value={formData.supplier_contact} fullWidth disabled />
              </Grid>

              <Grid item xs={12} sm={9}>
                <TextField label="Address" value={formData.supplier_address} fullWidth disabled multiline rows={2} />
              </Grid>
            </Grid>
          </Paper>

          {/* Items section */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" mb={2}>Add Items</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField select label="Item" name="item_id" value={currentItem.item_id} onChange={handleCurrentItemChange} fullWidth>
                  {items.filter(it => it.category === "Purchase").map(it => <MenuItem key={it.id} value={it.id}>{it.itemName} ({it.itemCode})</MenuItem>)}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={2}><TextField label="Unit" value={currentItem.unit} fullWidth disabled /></Grid>
              <Grid item xs={12} sm={2}><TextField label="Qty" name="quantity" type="number" value={currentItem.quantity} onChange={handleCurrentItemChange} fullWidth /></Grid>
              <Grid item xs={12} sm={2}><TextField label="Rate" name="purchase_price" type="number" value={currentItem.purchase_price} onChange={handleCurrentItemChange} fullWidth /></Grid>
              <Grid item xs={12} sm={2}><Button variant="contained" fullWidth onClick={addItem}>Add</Button></Grid>
            </Grid>
          </Paper>

          {/* Items table */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <TableContainer>
              <Table size="small">
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
                  {purchaseItems.map((it) => (
                    <TableRow key={it.id}>
                      <TableCell>{it.itemName}</TableCell>
                      <TableCell>{it.unit}</TableCell>
                      <TableCell>{it.quantity}</TableCell>
                      <TableCell>₹{Number(it.purchase_price).toFixed(2)}</TableCell>
                      <TableCell>₹{(it.quantity * it.purchase_price).toFixed(2)}</TableCell>
                      <TableCell><IconButton color="error" onClick={() => removeItem(it.id)}><Delete /></IconButton></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Totals & Payment */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField select label="Payment Type" name="payment_type" fullWidth value={formData.payment_type} onChange={handleFormChange}>
                  <MenuItem value="Cash">Cash</MenuItem>
                  <MenuItem value="Online">Online</MenuItem>
                  <MenuItem value="Cash/Online">Cash + Online</MenuItem>
                  <MenuItem value="Credit">Credit</MenuItem>
                </TextField>

                {(formData.payment_type === "Online" || formData.payment_type === "Cash/Online" || Number(formData.online_paid || 0) > 0) && (
                  <TextField select label="Select Bank" name="bank_id" fullWidth sx={{ mt: 2 }} value={formData.bank_id} onChange={handleFormChange}>
                    <MenuItem value="">-- Select Bank --</MenuItem>
                    {banks.map((b) => (<MenuItem key={b.id} value={b.id}>{b.bank_name} — {b.account_no}</MenuItem>))}
                  </TextField>
                )}

                <TextField label="Remarks" name="remarks" fullWidth multiline rows={2} sx={{ mt: 2 }} value={formData.remarks} onChange={handleFormChange} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <Box display="flex" justifyContent="space-between" mb={1}><Typography>Sub Total</Typography><Typography>₹{Number(totals.sub_total || 0).toFixed(2)}</Typography></Box>

                <TextField label="Discount (₹)" name="discount_amount" type="number" fullWidth sx={{ mb: 1 }} value={totals.discount_amount || 0} onChange={handleTotalsChange} />

                <TextField label="GST %" name="gst_percentage" type="number" fullWidth sx={{ mb: 1 }} value={totals.gst_percentage || 0} onChange={handleTotalsChange} />

                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}><TextField label="Cash Paid (₹)" name="cash_paid" type="number" fullWidth value={formData.cash_paid} onChange={handleFormChange} /></Grid>
                  <Grid item xs={12} sm={6}><TextField label="Online Paid (₹)" name="online_paid" type="number" fullWidth value={formData.online_paid} onChange={handleFormChange} /></Grid>
                </Grid>

                <Box display="flex" justifyContent="space-between" mt={2}><Typography variant="h6">Paid Amount</Typography><Typography variant="h6">₹{amountPaid.toFixed(2)}</Typography></Box>

                <Box display="flex" justifyContent="space-between" mt={2}><Typography variant="h5">Final Amount</Typography><Typography variant="h5">₹{Number(totals.final_amount || 0).toFixed(2)}</Typography></Box>

                <Box display="flex" justifyContent="space-between" mt={1}><Typography variant="h5">Outstanding</Typography><Typography variant="h5" color={outstanding > 0 ? "error" : "text.primary"}>₹{outstanding.toFixed(2)}</Typography></Box>
              </Grid>
            </Grid>
          </Paper>

          <Button type="submit" variant="contained" color="primary" fullWidth size="large">Save Purchase</Button>
        </form>
      )}
    </Box>
  );
};

export default PurchaseMaster;
